import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Mic, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserLevel } from '../types';

const goalsList = [
  "Ace Job Interviews",
  "Improve Public Speaking",
  "Confident Socializing",
  "Better Workplace Communication",
  "Reduce Filler Words",
  "Native-like Fluency"
];

const Assessment = () => {
  const { updateUserGoals, updateUserLevel } = useApp();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selfLevel, setSelfLevel] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = () => {
    updateUserGoals(selectedGoals);
    // Simple mapping for the demo
    const levelMap: Record<string, UserLevel> = {
      'Beginner': UserLevel.Beginner,
      'Intermediate': UserLevel.Intermediate,
      'Advanced': UserLevel.Advanced,
      'Pro': UserLevel.Expert
    };
    if (selfLevel && levelMap[selfLevel]) {
        updateUserLevel(levelMap[selfLevel]);
    }
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Assessment Complete!</h2>
            <p className="text-slate-500 max-w-md">
                We've customized your learning path based on your goals: <br/>
                <span className="font-semibold text-indigo-600">{selectedGoals.join(', ')}</span>.
            </p>
            <div className="flex gap-4">
                 <button onClick={() => window.location.hash = '#/'} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium">Go Dashboard</button>
                 <button onClick={() => window.location.hash = '#/coach'} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-200">Start Training</button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full mb-12">
        <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-900">What are your main goals?</h2>
          <p className="text-slate-500">Select all that apply. This helps AI tailor your scenarios.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {goalsList.map(goal => (
              <div 
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedGoals.includes(goal) 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200'
                }`}
              >
                <span className="font-medium">{goal}</span>
                {selectedGoals.includes(goal) ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-slate-300"/>}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <button 
                onClick={() => setStep(2)}
                disabled={selectedGoals.length === 0}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
                Next <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
           <h2 className="text-3xl font-bold text-slate-900">How would you rate your current skills?</h2>
           <p className="text-slate-500">Be honest! We use this to set the difficulty.</p>

           <div className="space-y-4 mt-6">
                {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map((level) => (
                    <div 
                        key={level}
                        onClick={() => setSelfLevel(level)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                            selfLevel === level
                            ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                            : 'border-slate-100 bg-white hover:border-indigo-200'
                        }`}
                    >
                        <h3 className={`font-bold text-lg ${selfLevel === level ? 'text-indigo-700' : 'text-slate-800'}`}>{level}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {level === 'Beginner' && 'I struggle to find words and construct sentences.'}
                            {level === 'Intermediate' && 'I can hold a conversation but make grammar mistakes.'}
                            {level === 'Advanced' && 'I am fluent but want to polish my professional tone.'}
                            {level === 'Pro' && 'I am a native/expert speaker looking for mastery.'}
                        </p>
                    </div>
                ))}
           </div>

           <div className="flex justify-between mt-8">
                <button 
                    onClick={() => setStep(1)}
                    className="text-slate-500 font-medium px-4 py-2 hover:text-slate-800"
                >
                    Back
                </button>
                <button 
                    onClick={() => setStep(3)}
                    disabled={!selfLevel}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                >
                    Next <ArrowRight size={18} />
                </button>
            </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-900">Baseline Check</h2>
            <p className="text-slate-500">Normally we'd do a quick recording here, but for now, we'll skip to get you started.</p>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Mic size={32} />
                </div>
                <h3 className="text-lg font-semibold">Microphone Permission</h3>
                <p className="text-sm text-slate-500">We need access to your microphone for the AI Coach sessions.</p>
            </div>

            <div className="flex justify-between mt-8">
                <button 
                    onClick={() => setStep(2)}
                    className="text-slate-500 font-medium px-4 py-2 hover:text-slate-800"
                >
                    Back
                </button>
                <button 
                    onClick={handleComplete}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors"
                >
                    Finish Setup <CheckCircle2 size={18} />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
