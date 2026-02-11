
import React, { useState, useEffect, useMemo } from 'react';
import { ELEMENTS } from '../constants';
import { StudentInfo, ElementData, BuildingResult } from '../types';
import { getStabilityAnalysis, getFunFact } from '../services/geminiService';
import AtomCanvas from './AtomCanvas';
import Atom3DViewer from './Atom3DViewer';

interface BuilderViewProps {
  student: StudentInfo;
  onFinish: (result: BuildingResult) => void;
  onLogout: () => void;
}

const BuilderView: React.FC<BuilderViewProps> = ({ student, onFinish, onLogout }) => {
  // Key for local storage persistence
  const STORAGE_KEY = `atom_builder_state_${student.student_id}`;

  const [selectedElement, setSelectedElement] = useState<ElementData>(ELEMENTS[0]);
  const [protons, setProtons] = useState(0);
  const [neutrons, setNeutrons] = useState(0);
  const [electrons, setElectrons] = useState(0);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [funFact, setFunFact] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [startTime] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showElementsList, setShowElementsList] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const element = ELEMENTS.find(e => e.z === parsed.selectedElementZ) || ELEMENTS[0];
        setSelectedElement(element);
        setProtons(parsed.protons || 0);
        setNeutrons(parsed.neutrons || 0);
        setElectrons(parsed.electrons || 0);
      } catch (e) {
        console.error("Failed to parse saved atom state", e);
      }
    }

    const hasSeenTutorial = localStorage.getItem('atom_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, [STORAGE_KEY]);

  // Save state to localStorage whenever configuration changes
  useEffect(() => {
    const stateToSave = {
      selectedElementZ: selectedElement.z,
      protons,
      neutrons,
      electrons
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedElement, protons, neutrons, electrons, STORAGE_KEY]);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('atom_tutorial_seen', 'true');
  };

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.z.toString() === searchTerm
    );
  }, [searchTerm]);

  const updateAiInsight = async () => {
    if (protons === 0 && neutrons === 0) return;
    setLoadingAi(true);
    const insight = await getStabilityAnalysis(protons, neutrons, selectedElement.name);
    setAiInsight(insight || '');
    setLoadingAi(false);
  };

  useEffect(() => {
    const fetchFact = async () => {
      const fact = await getFunFact(selectedElement.symbol);
      setFunFact(fact || '');
    };
    fetchFact();
    setAiInsight('');
  }, [selectedElement]);

  const handleFinish = () => {
    const pScore = protons === selectedElement.z ? 33.33 : 0;
    const nScore = neutrons === selectedElement.neutrons ? 33.33 : 0;
    const eScore = electrons === selectedElement.z ? 33.34 : 0;
    
    localStorage.removeItem(STORAGE_KEY);

    onFinish({
      protons, neutrons, electrons,
      score: Math.round(pScore + nScore + eScore),
      timeTaken: Math.floor((Date.now() - startTime) / 1000),
      elementName: selectedElement.name
    });
  };

  const addParticle = (type: 'proton' | 'neutron' | 'electron') => {
    if (type === 'proton') setProtons(p => p + 1);
    else if (type === 'neutron') setNeutrons(n => n + 1);
    else setElectrons(e => e + 1);
  };

  const removeParticle = (type: 'proton' | 'neutron' | 'electron') => {
    if (type === 'proton') setProtons(p => Math.max(0, p - 1));
    else if (type === 'neutron') setNeutrons(n => Math.max(0, n - 1));
    else setElectrons(e => Math.max(0, e - 1));
  };

  const resetAtom = () => {
    setProtons(0);
    setNeutrons(0);
    setElectrons(0);
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden text-slate-200">
      {/* Header */}
      <header className="glass-panel border-b border-white/5 px-4 md:px-8 py-4 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowElementsList(true)} className="lg:hidden w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white transition-transform active:scale-90">☰</button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">⚛️</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-white text-lg leading-none tracking-tight">Học Viện Nguyên Tử</h1>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{student.student_name} • Nhóm: {student.group}</p>
                 <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                 <p className="text-[9px] text-slate-500 font-medium">GV: Minh Trang - THCS Nam Trung Yên</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
             <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Độ chính xác</div>
             <div className="w-32 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700" 
                  style={{ width: `${((protons === selectedElement.z ? 1 : 0) + (neutrons === selectedElement.neutrons ? 1 : 0) + (electrons === selectedElement.z ? 1 : 0)) / 3 * 100}%` }}
                ></div>
             </div>
          </div>
          <button onClick={handleFinish} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95">XONG RỒI ✅</button>
          <button onClick={onLogout} className="text-slate-500 hover:text-rose-400 transition-colors text-[10px] font-black uppercase tracking-widest">Rời đi</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 glass-panel lg:relative lg:bg-transparent border-r border-white/5 flex flex-col transition-transform duration-500 ease-out ${showElementsList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
              <input type="text" placeholder="Tìm kiếm..." className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-sm focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 custom-scrollbar">
            {filteredElements.map(el => (
              <button key={el.z} onClick={() => { setSelectedElement(el); if (window.innerWidth < 1024) setShowElementsList(false); }} className={`w-full p-5 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${selectedElement.z === el.z ? 'border-indigo-500 bg-indigo-500/10 shadow-lg' : 'border-white/5 hover:bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center font-black text-xl rounded-2xl transition-all ${selectedElement.z === el.z ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{el.symbol}</div>
                  <div className="text-left">
                    <div className="text-sm font-black text-white">{el.name}</div>
                    <div className="text-[10px] text-slate-500 font-bold">Z: {el.z} • {el.category}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {showElementsList && <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowElementsList(false)}></div>}

        <main className="flex-1 relative flex flex-col bg-slate-900/40 overflow-hidden">
           {/* HUD Target Stats */}
           <div className="absolute top-6 left-6 z-10 w-[180px] lg:w-[240px] animate-fade-in-up">
              <div className="glass-panel p-6 rounded-[2.5rem] shadow-2xl border-white/5">
                <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Thông số mục tiêu</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Protons', val: protons, target: selectedElement.z, color: 'bg-rose-500' },
                    { label: 'Neutrons', val: neutrons, target: selectedElement.neutrons, color: 'bg-slate-400' },
                    { label: 'Electrons', val: electrons, target: selectedElement.z, color: 'bg-emerald-500' },
                  ].map(stat => (
                    <div key={stat.label}>
                       <div className="flex justify-between items-end mb-1.5 px-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{stat.label}</span>
                          <span className={`text-xs font-black ${stat.val === stat.target ? 'text-emerald-400' : 'text-slate-300'}`}>{stat.val} / {stat.target}</span>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${Math.min(100, (stat.val / stat.target) * 100)}%` }}></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>

           {/* Canvas */}
           <AtomCanvas 
             protons={protons} 
             neutrons={neutrons} 
             electrons={electrons} 
             onRemoveElectron={() => removeParticle('electron')}
             onRemoveNucleus={(type) => removeParticle(type)}
           />

           {/* Interactive Live Status & Controls */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-full px-6 flex flex-col items-center gap-4">
              
              {/* Live Count Display */}
              <div className="flex items-center gap-6 px-8 py-3 glass-panel rounded-full border-white/10 shadow-xl animate-fade-in-up">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Proton:</span>
                  <span className="text-sm font-black text-white">{protons}</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_#94a3b8]"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Neutron:</span>
                  <span className="text-sm font-black text-white">{neutrons}</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Electron:</span>
                  <span className="text-sm font-black text-white">{electrons}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <div className="glass-panel p-3 rounded-[3rem] flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/10">
                  <button onClick={() => addParticle('proton')} className="w-14 h-14 md:w-20 md:h-20 rounded-[2rem] bg-rose-500 hover:bg-rose-400 text-white flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 border-b-4 border-rose-700">
                    <span className="text-xl md:text-2xl font-black">+P</span>
                  </button>
                  <button onClick={() => addParticle('neutron')} className="w-14 h-14 md:w-20 md:h-20 rounded-[2rem] bg-slate-500 hover:bg-slate-400 text-white flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 border-b-4 border-slate-700">
                    <span className="text-xl md:text-2xl font-black">+N</span>
                  </button>
                  <button onClick={() => addParticle('electron')} className="w-14 h-14 md:w-20 md:h-20 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-white flex flex-col items-center justify-center transition-all shadow-lg active:scale-90 border-b-4 border-emerald-700">
                    <span className="text-xl md:text-2xl font-black">+E</span>
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setShow3DViewer(true)}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center transition-all shadow-xl active:scale-90 group relative"
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">🧊</span>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[8px] font-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Xem 3D</span>
                  </button>
                  <button onClick={updateAiInsight} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-xl active:scale-90 group relative">
                    {loadingAi ? <span className="animate-spin text-xl">⏳</span> : <span className="text-xl group-hover:scale-125 transition-transform">🧠</span>}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[8px] font-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">AI Phân tích</span>
                  </button>
                </div>
              </div>
           </div>

           {aiInsight && (
             <div className="absolute top-6 right-6 z-10 w-[280px] lg:w-[320px] animate-pop-in">
               <div className="glass-panel p-6 rounded-[2.5rem] shadow-2xl border-indigo-500/30 bg-indigo-950/40">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span> Cố vấn Lab
                    </h3>
                    <button onClick={() => setAiInsight('')} className="text-slate-500 hover:text-white transition-colors p-1">✕</button>
                 </div>
                 <div className="text-[11px] leading-relaxed text-slate-200 font-medium custom-scrollbar max-h-[300px] overflow-y-auto pr-2">
                    {aiInsight}
                 </div>
               </div>
             </div>
           )}
        </main>
      </div>

      {show3DViewer && (
        <Atom3DViewer 
            protons={protons} 
            neutrons={neutrons} 
            electrons={electrons} 
            onClose={() => setShow3DViewer(false)} 
        />
      )}

      {/* Tutorial Overlay - Updated Content */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel p-10 rounded-[3rem] text-center animate-pop-in border-indigo-500/50 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
            <div className="text-6xl mb-6 animate-float">🎓</div>
            <h2 className="text-2xl font-black text-white mb-4">Hướng Dẫn Thực Hành</h2>
            <div className="space-y-4 text-slate-400 text-sm font-medium mb-8 text-left px-4">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">1</span>
                <p>Chọn nguyên tố mục tiêu từ bảng danh sách bên trái màn hình.</p>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
                <p>Dùng các nút <span className="text-rose-400">+P</span>, <span className="text-slate-200">+N</span>, <span className="text-emerald-400">+E</span> để thêm các hạt vào nguyên tử.</p>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
                <p>Nhấn vào biểu tượng <span className="text-indigo-400">🧠 AI</span> để nhận giải thích về cấu trúc bạn vừa xây dựng.</p>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">4</span>
                <p>Nhấn <span className="text-purple-400">🧊 Xem 3D</span> để khám phá nguyên tử trong không gian 3 chiều.</p>
              </div>
            </div>
            <button onClick={closeTutorial} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95">SẴN SÀNG THÍ NGHIỆM!</button>
            <p className="mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest">Phát triển bởi GV Minh Trang - THCS Nam Trung Yên</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderView;
