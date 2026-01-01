import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Calendar, Target, TrendingUp, Clock, Mic } from 'lucide-react';
import { formatDate } from '../utils';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, sessions } = useApp();

  // Prepare chart data
  const chartData = sessions.slice().reverse().map(s => ({
    name: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: s.overallScore
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-2">
            {user.streak > 0 
              ? `You're on a ${user.streak} day streak! Keep it up.` 
              : "Ready to start your communication journey?"}
          </p>
        </div>
        <Link to="/coach" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
          <Mic size={20} />
          Start Practice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Target size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Avg. Score</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / sessions.length) : '-'}/100
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Practice Time</p>
          <h3 className="text-2xl font-bold text-slate-800">
             {Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)} mins
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Current Level</p>
          <h3 className="text-2xl font-bold text-slate-800">{user.level}</h3>
        </div>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center text-slate-400">
                    <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No performance data yet. Start your first session!</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Sessions</h3>
          <div className="space-y-4">
            {sessions.slice(0, 4).map((session) => (
              <div key={session.id} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {session.type === 'Assessment' ? 'A' : 'P'}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800">{session.topic}</h4>
                  <p className="text-xs text-slate-500">{formatDate(session.date)}</p>
                </div>
                <span className={`text-sm font-bold ${
                    session.overallScore >= 80 ? 'text-green-600' :
                    session.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                    {session.overallScore}
                </span>
              </div>
            ))}
            {sessions.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">No sessions yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;