
import React from 'react';
import { StudentInfo, BuildingResult } from '../types';

interface ResultsViewProps {
  student: StudentInfo;
  result: BuildingResult;
  onRestart: () => void;
  onLogout: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ student, result, onRestart, onLogout }) => {
  const isPerfect = result.score >= 95;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full glass-panel rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-pop-in">
        <div className={`p-12 text-center text-white relative ${isPerfect ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : 'bg-gradient-to-br from-indigo-600 to-purple-800'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 science-pattern"></div>
          <div className="text-8xl mb-8 relative z-10 animate-float">{isPerfect ? '🏆' : '✨'}</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3 relative z-10">Xuất Sắc Quá!</h2>
          <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-xs relative z-10">Báo cáo kết quả thí nghiệm</p>
        </div>
        
        <div className="p-10 md:p-14 space-y-10">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 p-8 rounded-[2.5rem] text-center border border-white/5 group hover:bg-white/10 transition-all">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Độ chính xác</div>
              <div className={`text-6xl font-black tracking-tighter ${isPerfect ? 'text-emerald-400' : 'text-indigo-400'}`}>{result.score}%</div>
            </div>
            <div className="bg-white/5 p-8 rounded-[2.5rem] text-center border border-white/5 group hover:bg-white/10 transition-all">
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Thời gian lab</div>
              <div className="text-6xl font-black text-white tracking-tighter">{result.timeTaken}<span className="text-xs font-bold text-slate-500 ml-1">giây</span></div>
            </div>
          </div>

          <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5">
            <h3 className="text-[11px] font-black text-indigo-400 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
               <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span> Cấu trúc: {result.elementName}
            </h3>
            <div className="space-y-6">
               {[
                 { label: 'Protons', val: result.protons, color: 'bg-rose-500' },
                 { label: 'Neutrons', val: result.neutrons, color: 'bg-slate-500' },
                 { label: 'Electrons', val: result.electrons, color: 'bg-emerald-500' }
               ].map(item => (
                 <div key={item.label} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px] shadow-current`}></div>
                      <span className="text-slate-300 font-bold text-lg">{item.label}</span>
                    </div>
                    <span className="font-black text-2xl text-white group-hover:scale-125 transition-transform">{item.val}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={onRestart} className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg">
              🔄 KHÁM PHÁ NGUYÊN TỐ MỚI
            </button>
            <button onClick={onLogout} className="w-full py-5 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">Về trang chủ</button>
          </div>
        </div>

        <div className="p-6 bg-white/5 text-center border-t border-white/5">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
            Phát triển bởi GV Minh Trang - THCS Nam Trung Yên
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
