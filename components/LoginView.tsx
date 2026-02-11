
import React, { useState } from 'react';
import { GROUPS } from '../constants';
import { StudentInfo, LeaderboardEntry } from '../types';

interface LoginViewProps {
  onLogin: (info: StudentInfo) => void;
  leaderboard: LeaderboardEntry[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, leaderboard }) => {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId && studentName && selectedGroup) {
      onLogin({ student_id: studentId, student_name: studentName, group: selectedGroup });
    }
  };

  const getGroupIcon = (groupId: string) => {
    return GROUPS.find(g => g.id === groupId)?.icon || '👥';
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-stretch py-8">
        
        {/* Form Section */}
        <div className="lg:col-span-5 glass-panel rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12 relative animate-pop-in order-1">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-xl animate-float">⚛️</div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Học Viện Nguyên Tử</h1>
            <p className="text-slate-400 font-medium mb-8">Chào mừng nhà khoa học nhí! 👋</p>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              <div className="space-y-4">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Hồ sơ cá nhân</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Mã số học sinh..."
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 outline-none rounded-2xl font-bold transition-all text-white placeholder:text-slate-600"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tên của bạn là gì?"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 outline-none rounded-2xl font-bold transition-all text-white placeholder:text-slate-600"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Chọn đội của bạn</label>
                <div className="grid grid-cols-2 gap-3">
                  {GROUPS.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroup(group.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 items-start relative group overflow-hidden ${
                        selectedGroup === group.id 
                        ? `border-indigo-500 bg-indigo-500/10 shadow-lg` 
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{group.icon}</span>
                      <div className="text-left">
                        <div className={`font-black text-[11px] leading-tight ${selectedGroup === group.id ? 'text-white' : 'text-slate-300'}`}>{group.name}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">{group.id}</div>
                      </div>
                      {selectedGroup === group.id && <div className="absolute top-2 right-2 text-indigo-500 text-xs">✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!studentId || !studentName || !selectedGroup}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                VÀO LAB NGAY 🚀
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phát triển bởi GV Minh Trang - THCS Nam Trung Yên</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="lg:col-span-7 flex flex-col gap-6 animate-fade-in-up order-2">
          <div className="glass-panel rounded-[3rem] p-8 md:p-10 shadow-2xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span className="text-yellow-400">✨</span> Bảng Vinh Danh
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Gặp gỡ những nhà khoa học dẫn đầu.</p>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[450px]">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-white shadow-lg rotate-3' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 -rotate-2' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-white rotate-1' : 
                        'bg-white/5 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-black text-white text-base mb-0.5 group-hover:text-indigo-300 transition-colors">{entry.student_name}</div>
                        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">
                          {getGroupIcon(entry.group)} {entry.group} • {entry.elementName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-400">{entry.score}%</div>
                      <div className="text-[10px] text-slate-600 font-black uppercase mt-0.5">{entry.timeTaken}s</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-12 opacity-30">
                  <div className="text-6xl mb-6">🔭</div>
                  <p className="text-slate-400 font-bold">Lab đang chờ đón người đầu tiên!</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🧪', val: '118', label: 'Nguyên tố' },
              { icon: '🧠', val: 'AI', label: 'Cố vấn' },
              { icon: '🚀', val: '7th', label: 'Khối' }
            ].map(item => (
              <div key={item.label} className="glass-panel p-6 rounded-[2rem] text-center border-white/5 group hover:bg-white/10 transition-all cursor-default">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-white font-black text-xl leading-none">{item.val}</div>
                <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
