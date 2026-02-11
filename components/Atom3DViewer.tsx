
import React, { useRef, useEffect, useState } from 'react';

interface Atom3DViewerProps {
  protons: number;
  neutrons: number;
  electrons: number;
  onClose: () => void;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  type: 'proton' | 'neutron' | 'electron';
  shellIndex?: number;
  angle?: number;
}

const Atom3DViewer: React.FC<Atom3DViewerProps> = ({ protons, neutrons, electrons, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const particles = useRef<Particle3D[]>([]);

  // Khởi tạo các hạt trong không gian 3D
  useEffect(() => {
    const newParticles: Particle3D[] = [];
    
    // Tạo hạt nhân (Protons & Neutrons) - Phân bổ hình cầu
    const totalNucleus = protons + neutrons;
    for (let i = 0; i < totalNucleus; i++) {
      const phi = Math.acos(-1 + (2 * i) / totalNucleus);
      const theta = Math.sqrt(totalNucleus * Math.PI) * phi;
      const radius = 15 + Math.random() * 5;
      newParticles.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        type: i < protons ? 'proton' : 'neutron'
      });
    }

    // Tạo Electrons - Phân bổ theo lớp vỏ (Shells)
    const capacities = [2, 8, 18, 32];
    const shellRadii = [60, 100, 150, 210];
    let remainingElectrons = electrons;

    capacities.forEach((cap, shellIdx) => {
      const count = Math.min(remainingElectrons, cap);
      if (count <= 0) return;
      
      // Mỗi lớp vỏ có một mặt phẳng nghiêng khác nhau để trông "3D" hơn
      const tiltX = (Math.PI / 4) * shellIdx;
      const tiltZ = (Math.PI / 6) * shellIdx;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        newParticles.push({
          x: shellRadii[shellIdx] * Math.cos(angle),
          y: shellRadii[shellIdx] * Math.sin(angle),
          z: 0,
          type: 'electron',
          shellIndex: shellIdx,
          angle: angle
        });
      }
      remainingElectrons -= count;
    });

    particles.current = newParticles;
  }, [protons, neutrons, electrons]);

  // Vòng lặp vẽ animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let autoRotation = 0;

    const render = () => {
      autoRotation += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentRotX = rotation.x;
      const currentRotY = rotation.y + autoRotation;

      // Vẽ các đường quỹ đạo trước
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      const shellRadii = [60, 100, 150, 210];
      shellRadii.forEach((r, idx) => {
          ctx.beginPath();
          // Đơn giản hóa quỹ đạo 3D bằng cách vẽ ellipse dựa trên góc xoay
          ctx.arc(centerX, centerY, r * zoom, 0, Math.PI * 2);
          ctx.stroke();
      });

      // Sắp xếp hạt theo chiều sâu (Z) để vẽ đúng thứ tự đè lên nhau
      const projected = particles.current.map(p => {
        let x = p.x;
        let y = p.y;
        let z = p.z;

        // Xoay quanh trục Y (ngang)
        let x1 = x * Math.cos(currentRotY) - z * Math.sin(currentRotY);
        let z1 = x * Math.sin(currentRotY) + z * Math.cos(currentRotY);
        
        // Xoay quanh trục X (dọc)
        let y2 = y * Math.cos(currentRotX) - z1 * Math.sin(currentRotX);
        let z2 = y * Math.sin(currentRotX) + z1 * Math.cos(currentRotX);

        // Phép chiếu perspective đơn giản
        const scale = 600 / (600 - z2);
        return {
          px: centerX + x1 * scale * zoom,
          py: centerY + y2 * scale * zoom,
          pz: z2,
          type: p.type,
          size: (p.type === 'electron' ? 4 : 6) * scale * zoom
        };
      }).sort((a, b) => a.pz - b.pz);

      // Vẽ các hạt
      projected.forEach(p => {
        const opacity = Math.max(0.2, (p.pz + 250) / 500);
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
        
        let color = '';
        if (p.type === 'proton') color = `rgba(244, 63, 94, ${opacity})`;
        else if (p.type === 'neutron') color = `rgba(148, 163, 184, ${opacity})`;
        else color = `rgba(16, 185, 129, ${opacity})`;

        ctx.fillStyle = color;
        ctx.fill();

        // Thêm hiệu ứng phát sáng cho hạt
        if (opacity > 0.6) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotation, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-pop-in">
      <div className="absolute top-8 right-8 flex gap-4">
        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-xs font-black text-slate-400 uppercase tracking-widest hidden md:block">
          Dùng chuột để xoay & cuộn để thu phóng
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-400 rounded-2xl flex items-center justify-center transition-all border border-white/10"
        >
          ✕
        </button>
      </div>

      <div className="text-center mb-8 pointer-events-none">
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Mô Hình 3D Nâng Cao</h2>
          <div className="flex gap-4 justify-center">
              <span className="text-rose-400 text-[10px] font-black uppercase">● Proton: {protons}</span>
              <span className="text-slate-400 text-[10px] font-black uppercase">● Neutron: {neutrons}</span>
              <span className="text-emerald-400 text-[10px] font-black uppercase">● Electron: {electrons}</span>
          </div>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight * 0.7}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="cursor-grab active:cursor-grabbing w-full max-w-5xl"
      />

      <div className="mt-8 flex gap-3">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="px-6 py-3 bg-white/5 rounded-xl text-white font-black hover:bg-white/10 transition-all">+</button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="px-6 py-3 bg-white/5 rounded-xl text-white font-black hover:bg-white/10 transition-all">-</button>
          <button onClick={() => {setRotation({x:0, y:0}); setZoom(1);}} className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-black hover:bg-indigo-500 transition-all">ĐẶT LẠI GÓC NHÌN</button>
      </div>
    </div>
  );
};

export default Atom3DViewer;
