import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Video, MessageSquare, Briefcase, Zap, Star, ArrowRight } from 'lucide-react';
import { RoleplayScenario } from '../types';

const PracticeHub = () => {
  const navigate = useNavigate();

  const handleStartModule = (scenarioId?: RoleplayScenario) => {
    if (scenarioId) {
        navigate('/coach', { state: { scenarioId } });
    }
  };

  const modules = [
    {
      title: "Job Interview Prep",
      description: "Practice answering common HR and technical questions.",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
      difficulty: "Medium",
      scenarioId: RoleplayScenario.Interview
    },
    {
      title: "Difficult Conversations",
      description: "Roleplay conflict resolution and feedback delivery.",
      icon: MessageSquare,
      color: "bg-red-100 text-red-600",
      difficulty: "Expert",
      scenarioId: RoleplayScenario.DifficultConversation
    },
    {
      title: "Sales Pitch / Persuasion",
      description: "Convince a skeptical client to buy your solution.",
      icon: Zap,
      color: "bg-amber-100 text-amber-600",
      difficulty: "Hard",
      scenarioId: RoleplayScenario.SalesPitch
    },
    {
      title: "Small Talk & Networking",
      description: "Master the art of casual conversation starters.",
      icon: Mic,
      color: "bg-emerald-100 text-emerald-600",
      difficulty: "Easy",
      scenarioId: RoleplayScenario.CasualChat
    },
    {
      title: "Presentation Skills",
      description: "Learn to structure hooks, stories, and closings.",
      icon: Video,
      color: "bg-purple-100 text-purple-600",
      difficulty: "Hard",
      scenarioId: RoleplayScenario.PublicSpeaking // Assuming you might add this scenario later, or map to closest
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Practice Hub</h1>
        <p className="text-slate-500 mt-2">Select a module to sharpen your skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <div 
            key={idx} 
            onClick={() => handleStartModule(mod.scenarioId)}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${mod.color}`}>
                    <mod.icon size={24} />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{mod.difficulty}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{mod.title}</h3>
            <p className="text-sm text-slate-500 mb-12">{mod.description}</p>
            
            <div className="absolute bottom-6 left-6 flex items-center text-sm font-bold text-indigo-600">
                Start Module <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
        
        {/* Coming Soon */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-75">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-400 mb-4">
                <Star size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">More Coming Soon</h3>
            <p className="text-sm text-slate-500">New scenarios added weekly.</p>
        </div>
      </div>
    </div>
  );
};

export default PracticeHub;