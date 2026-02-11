
import React from 'react';

interface AtomCanvasProps {
  protons: number;
  neutrons: number;
  electrons: number;
  onRemoveElectron: () => void;
  onRemoveNucleus: (type: 'proton' | 'neutron') => void;
}

const AtomCanvas: React.FC<AtomCanvasProps> = ({ protons, neutrons, electrons, onRemoveElectron, onRemoveNucleus }) => {
  const shellRadii = [60, 100, 140, 180];
  const capacities = [2, 8, 18, 32];

  const getElectronDistribution = () => {
    let remaining = electrons;
    const distribution: number[] = [];
    for (let cap of capacities) {
      if (remaining > cap) {
        distribution.push(cap);
        remaining -= cap;
      } else {
        distribution.push(remaining);
        remaining = 0;
        break;
      }
    }
    return distribution;
  };

  const electronDistribution = getElectronDistribution();

  // Tinh chỉnh khoảng cách hạt nhân cho số lượng lớn hạt (tới Z=36)
  const nucleusParticles = Array.from({ length: protons + neutrons }).map((_, i) => {
    const isProton = i < protons;
    // Sử dụng thuật toán xoắn ốc Fermat để phân bổ hạt đồng đều
    const angle = i * 2.4; 
    const dist = Math.sqrt(i) * 5.2; // Giảm khoảng cách giữa các hạt một chút để tránh tràn khỏi tâm
    return {
      x: 250 + dist * Math.cos(angle),
      y: 250 + dist * Math.sin(angle),
      type: isProton ? 'proton' : 'neutron'
    };
  });

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-10 cursor-default select-none overflow-hidden h-full w-full">
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full max-w-[90vw] max-h-[60vh] md:max-h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          <radialGradient id="nucleusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="250" cy="250" r="120" fill="url(#nucleusGlow)" />

        {shellRadii.map((r, i) => (
          <circle
            key={i}
            cx="250"
            cy="250"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeDasharray="8,8"
          />
        ))}

        {nucleusParticles.map((p, i) => (
          <g key={i} className="cursor-pointer hover:brightness-150 transition-all" onClick={() => onRemoveNucleus(p.type as any)}>
            <circle
              cx={p.x}
              cy={p.y}
              r="6.5" // Giảm kích thước hạt một chút khi danh sách nguyên tố dài hơn
              fill={p.type === 'proton' ? '#f43f5e' : '#94a3b8'}
              stroke={p.type === 'proton' ? '#fb7185' : '#cbd5e1'}
              strokeWidth="1"
              filter="url(#glow)"
            />
            <text x={p.x} y={p.y + 2} fontSize="6" textAnchor="middle" fill="white" fontWeight="900" style={{ pointerEvents: 'none' }}>
              {p.type === 'proton' ? '+' : 'n'}
            </text>
          </g>
        ))}

        {electronDistribution.map((count, shellIdx) => {
          const radius = shellRadii[shellIdx];
          return Array.from({ length: count }).map((_, eIdx) => {
            const angle = (eIdx / count) * 2 * Math.PI;
            const ex = 250 + radius * Math.cos(angle);
            const ey = 250 + radius * Math.sin(angle);
            return (
              <g key={`s${shellIdx}-e${eIdx}`} className="cursor-pointer" onClick={onRemoveElectron}>
                <circle
                  cx={ex}
                  cy={ey}
                  r="5.5"
                  fill="#10b981"
                  stroke="#34d399"
                  strokeWidth="2"
                  filter="url(#glow)"
                >
                    <animateTransform 
                        attributeName="transform"
                        type="rotate"
                        from="0 250 250"
                        to="360 250 250"
                        dur={`${(shellIdx + 1) * 8}s`}
                        repeatCount="indefinite"
                    />
                </circle>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
};

export default AtomCanvas;
