import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mic, BookOpen, BarChart2, Settings, Award } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Mic, label: 'Live Coach', path: '/coach' },
    { icon: BookOpen, label: 'Practice Hub', path: '/practice' },
    { icon: BarChart2, label: 'Assessment', path: '/assessment' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-slate-800">CommuniCoach</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-amber-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Pro Plan</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">Unlock advanced AI analytics.</p>
            <button className="w-full bg-slate-900 text-white text-xs py-2 rounded-lg hover:bg-slate-800 transition-colors">
                Upgrade Now
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
