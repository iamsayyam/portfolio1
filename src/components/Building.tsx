import { memo, useMemo } from 'react';
import { hash, mulberry32 } from './rng';

export type Roof = 'gable' | 'flat' | 'tower' | 'dome';

type Props = {
  id: string;
  x: number; // door centre in world units
  w: number;
  h: number;
  roof: Roof;
  tone: string;
  sign: string;
  groundY: number;
  lit: boolean; // visited: every window on
  near: boolean; // player is at the door
  onClick: () => void;
};

const ROOF_H: Record<Roof, number> = { gable: 74, flat: 30, tower: 130, dome: 60 };
const DARK = '#12163A';
const ROOF = '#1A1F55';
const LAMP = '#FFB547';

function BuildingBase({ id, x, w, h, roof, tone, sign, groundY, lit, near, onClick }: Props) {
  const roofH = ROOF_H[roof];
  const H = h + roofH;

  const windows = useMemo(() => {
    const rand = mulberry32(hash(id));
    const cols = Math.max(2, Math.floor((w - 40) / 64));
    const rows = Math.max(1, Math.floor((h - 150) / 74));
    const gap = (w - cols * 28) / (cols + 1);
    const list: { x: number; y: number; ambient: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push({
          x: gap + c * (28 + gap),
          y: roofH + 28 + r * 74,
          ambient: rand() < 0.22,
        });
      }
    }
    return list;
  }, [id, w, h, roofH]);

  const doorX = w / 2 - 24;
  const doorY = H - 88;
  const signW = Math.max(110, sign.length * 15 + 36);

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{ left: x - w / 2, top: groundY - H, width: w, height: H }}
    >
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} style={{ overflow: 'visible', display: 'block' }} aria-hidden="true">
        {/* roof */}
        {roof === 'gable' && <polygon points={`-12,${roofH} ${w / 2},0 ${w + 12},${roofH}`} fill={ROOF} />}
        {roof === 'flat' && (
          <>
            <rect x={-8} y={roofH - 14} width={w + 16} height={14} fill={ROOF} />
            <line x1={w * 0.78} y1={roofH - 14} x2={w * 0.78} y2={2} stroke="#3A4080" strokeWidth="3" />
            <circle cx={w * 0.78} cy={4} r="4" fill={LAMP} />
          </>
        )}
        {roof === 'tower' && (
          <>
            <polygon points={`${w * 0.12},${roofH} ${w / 2},0 ${w * 0.88},${roofH}`} fill={ROOF} />
            <rect x={-6} y={roofH - 10} width={w + 12} height={10} fill={ROOF} />
          </>
        )}
        {roof === 'dome' && (
          <>
            <path d={`M ${w * 0.1} ${roofH} A ${w * 0.4} ${roofH} 0 0 1 ${w * 0.9} ${roofH} Z`} fill={ROOF} />
            <rect x={-6} y={roofH - 8} width={w + 12} height={8} fill={ROOF} />
          </>
        )}

        {/* body */}
        <rect x="0" y={roofH} width={w} height={h} fill={tone} />
        <rect x="0" y={roofH} width="6" height={h} fill="#000" opacity="0.14" />

        {/* windows */}
        {windows.map((win, i) => (
          <rect
            key={i}
            x={win.x}
            y={win.y}
            width="28"
            height="40"
            rx="3"
            fill={lit || win.ambient ? LAMP : DARK}
            opacity={lit ? 1 : win.ambient ? 0.8 : 1}
            style={{ transition: 'fill 0.5s ease', transitionDelay: lit ? `${i * 70}ms` : '0ms' }}
          />
        ))}

        {/* light spilling from the door */}
        <ellipse
          cx={w / 2}
          cy={H + 2}
          rx="64"
          ry="9"
          fill={LAMP}
          style={{ opacity: near ? 0.42 : 0, transition: 'opacity 0.25s ease' }}
        />

        {/* door */}
        <rect x={doorX} y={doorY} width="48" height="88" rx="24" ry="24" fill={near || lit ? LAMP : DARK} style={{ transition: 'fill 0.25s ease' }} />
        <rect x={doorX} y={doorY + 24} width="48" height="64" fill={near || lit ? LAMP : DARK} style={{ transition: 'fill 0.25s ease' }} />

        {/* sign */}
        <rect x={w / 2 - signW / 2} y={doorY - 50} width={signW} height="34" rx="6" fill={DARK} stroke={LAMP} strokeWidth="2" />
        <text
          x={w / 2}
          y={doorY - 27}
          textAnchor="middle"
          fill="#EEEAF7"
          fontSize="19"
          fontWeight="600"
          style={{ fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif' }}
        >
          {sign}
        </text>
      </svg>
    </div>
  );
}

export default memo(BuildingBase);
