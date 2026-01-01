import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Square, User, Bot, AlertCircle, Loader2, Key } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LiveCoachSession, generateAssessmentFeedback } from '../services/geminiService';
import { RoleplayScenario, SessionResult } from '../types';
import { useApp } from '../context/AppContext';

const scenarios = [
  { 
    id: RoleplayScenario.Interview, 
    title: "Job Interview", 
    instruction: "You are a hiring manager for a tech company. Ask me behavioral and technical questions. Be professional but slightly demanding. After 5 turns, wrap up." 
  },
  { 
    id: RoleplayScenario.DifficultConversation, 
    title: "Asking for a Raise", 
    instruction: "You are my skeptical boss. I am asking for a raise. Challenge my reasons politely but firmly. Make me justify my value." 
  },
  { 
    id: RoleplayScenario.CasualChat, 
    title: "Small Talk at a Party", 
    instruction: "You are a friendly stranger at a networking event. Initiate small talk, ask about my hobbies, and try to keep the conversation flowing naturally." 
  },
  {
    id: RoleplayScenario.SalesPitch,
    title: "Sales Pitch",
    instruction: "You are a potential client interested in buying software. You have budget concerns and need convincing on ROI. I am the salesperson."
  },
  {
    id: RoleplayScenario.PublicSpeaking,
    title: "Public Speaking Prep",
    instruction: "You are a public speaking coach. I will deliver a short speech. Listen to me and give feedback on my tone, pace, and clarity. Interject only if I pause for too long."
  }
];

const LiveCoach = () => {
  const { addSession } = useApp();
  const location = useLocation();
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isTalking, setIsTalking] = useState<'user' | 'ai' | 'idle'>('idle');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const liveSessionRef = useRef<LiveCoachSession | null>(null);
  const timerRef = useRef<number | null>(null);

  // Auto-select scenario from navigation state
  useEffect(() => {
    if (location.state?.scenarioId) {
        const preSelected = scenarios.find(s => s.id === location.state.scenarioId);
        if (preSelected) {
            setSelectedScenario(preSelected);
        }
    }
  }, [location.state]);

  // Check for API Key
  useEffect(() => {
    const checkKey = async () => {
        if (process.env.API_KEY) {
            setHasApiKey(true);
            return;
        }
        const aistudio = (window as any).aistudio;
        if (aistudio) {
            const selected = await aistudio.hasSelectedApiKey();
            setHasApiKey(selected);
        }
    };
    checkKey();
  }, []);

  useEffect(() => {
    return () => {
        // Cleanup if component unmounts
        if (liveSessionRef.current) {
            liveSessionRef.current.disconnect();
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = async () => {
    if (!hasApiKey) {
        const aistudio = (window as any).aistudio;
        if (aistudio) {
            try {
                await aistudio.openSelectKey();
                // Assume success after dialog close as per pattern
                setHasApiKey(true);
                setError(null);
            } catch (e) {
                console.error(e);
                setError("Failed to select API Key.");
            }
        } else {
            setError("API Key is missing. Please check your configuration.");
        }
        return;
    }
    startSession();
  };

  const startSession = async () => {
    setError(null);
    liveSessionRef.current = new LiveCoachSession({
      onConnect: () => {
        setIsConnected(true);
        startTimer();
      },
      onDisconnect: () => {
        setIsConnected(false);
        stopTimer();
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
        stopTimer();
      },
      onAudioData: () => {
        setIsTalking('ai');
      },
      onInterrupted: () => {
         setIsTalking('idle');
      },
      onTurnComplete: () => {
         setIsTalking('idle'); 
      }
    });

    await liveSessionRef.current.connect(selectedScenario.instruction);
  };

  const stopSession = async () => {
    let transcript = "";
    if (liveSessionRef.current) {
      transcript = liveSessionRef.current.getTranscript();
      liveSessionRef.current.disconnect();
      liveSessionRef.current = null;
    }
    
    setIsConnected(false);
    stopTimer();

    // Only generate report if session had some length
    if (sessionDuration > 5) {
        setIsGeneratingReport(true);
        try {
            const feedback = await generateAssessmentFeedback(transcript, selectedScenario.instruction);
            
            const newSession: SessionResult = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'Roleplay',
                topic: selectedScenario.title,
                durationSeconds: sessionDuration,
                overallScore: feedback.overallScore,
                metrics: feedback.metrics,
                improvementTips: feedback.improvementTips,
                transcript: transcript // Optional: save transcript if you want
            };
            
            addSession(newSession);
        } catch (e) {
            setError("Failed to generate session report.");
            console.error(e);
        } finally {
            setIsGeneratingReport(false);
            setSessionDuration(0);
        }
    } else {
        setSessionDuration(0);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Live AI Coach</h1>
            <p className="text-slate-500 mt-2">Real-time voice practice with instant feedback.</p>
        </div>

        {/* Scenario Selector */}
        {!isConnected && !isGeneratingReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                {scenarios.map(sc => (
                    <div 
                        key={sc.id}
                        onClick={() => setSelectedScenario(sc)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                            selectedScenario.id === sc.id 
                            ? 'border-indigo-600 bg-white ring-2 ring-indigo-100' 
                            : 'border-slate-100 bg-white hover:border-indigo-200'
                        }`}
                    >
                        <h3 className="font-bold text-slate-800">{sc.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{sc.instruction}</p>
                    </div>
                ))}
            </div>
        )}

        {/* Main Interface */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col">
            {/* Visualizer Area */}
            <div className="flex-1 flex items-center justify-center bg-slate-900 relative">
                
                {isGeneratingReport && (
                    <div className="absolute inset-0 z-20 bg-slate-900/90 flex flex-col items-center justify-center text-white">
                        <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                        <h2 className="text-xl font-bold">Generating Feedback...</h2>
                        <p className="text-slate-400">Analyzing your tone, pace, and clarity.</p>
                    </div>
                )}

                {/* Status Indicator */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                    <span className="text-white text-sm font-medium">{isConnected ? 'Live Session' : 'Ready to Start'}</span>
                </div>

                <div className="absolute top-6 right-6 text-white font-mono text-lg">
                    {formatTime(sessionDuration)}
                </div>

                {/* Central Visual */}
                <div className="relative z-10 text-center">
                    {isConnected ? (
                        <div className="space-y-8">
                             <div className="flex justify-center items-center gap-12">
                                <div className={`flex flex-col items-center gap-4 transition-opacity ${isTalking === 'ai' ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                                        <User size={40} />
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">You</span>
                                </div>
                                
                                <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                                     {/* Audio activity line */}
                                     {(isTalking === 'user' || isTalking === 'ai') && (
                                         <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
                                     )}
                                </div>

                                <div className={`flex flex-col items-center gap-4 transition-opacity ${isTalking === 'user' ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all ${
                                        isTalking === 'ai' 
                                        ? 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-110' 
                                        : 'bg-slate-700'
                                    }`}>
                                        <Bot size={40} />
                                    </div>
                                    <span className="text-slate-400 text-sm font-medium">AI Coach</span>
                                </div>
                             </div>
                             
                             <p className="text-slate-300 text-lg max-w-md mx-auto h-8">
                                {isTalking === 'ai' ? 'Speaking...' : isTalking === 'user' ? 'Listening...' : '...'}
                             </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-full bg-slate-800 mx-auto mb-6 flex items-center justify-center text-slate-600">
                                <Mic size={48} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedScenario.title}</h2>
                            <p className="text-slate-400 max-w-sm mx-auto">Click Start to begin the roleplay. Make sure your microphone is ready.</p>
                        </div>
                    )}
                </div>

                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 opacity-50"></div>
            </div>

            {/* Controls */}
            <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-center items-center gap-6">
                {!isConnected ? (
                    <button 
                        onClick={handleStart}
                        disabled={isGeneratingReport}
                        className={`flex items-center gap-3 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            hasApiKey 
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            : 'bg-slate-700 hover:bg-slate-800 shadow-slate-300'
                        }`}
                    >
                         {!hasApiKey ? <Key size={20} /> : <Play fill="currentColor" />}
                         {!hasApiKey ? 'Select API Key' : 'Start Session'}
                    </button>
                ) : (
                    <>
                        <button className="p-4 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
                            <MicOff size={24} />
                        </button>
                        <button 
                            onClick={stopSession}
                            className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-red-200 transition-all"
                        >
                            <Square fill="currentColor" /> End Session
                        </button>
                    </>
                )}
            </div>
            
             {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-md">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveCoach;