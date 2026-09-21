import { memo, type CSSProperties } from 'react';

/** A streetlamp. It switches on shortly after the city loads. */
function LampBase({ x, groundY, index }: { x: number; groundY: number; index: number }) {
  const style = { left: x - 60, top: groundY - 190, width: 120, height: 190, '--i': index } as CSSProperties;
  return (
    <div className="pointer-events-none absolute" style={style} aria-hidden="true">
      <div
        className="lamp-glow absolute"
        style={{
          left: -17,
          top: -40,
          width: 200,
          height: 250,
          background:
            'radial-gradient(ellipse at 50% 16%, rgba(255,181,71,0.5), rgba(255,181,71,0.12) 42%, transparent 70%)',
        }}
      />
      <svg width="120" height="190" viewBox="0 0 120 190" style={{ position: 'relative' }}>
        <rect x="58" y="24" width="5" height="166" fill="#3A4080" />
        <path d="M60 30 Q60 12 80 12" fill="none" stroke="#3A4080" strokeWidth="5" strokeLinecap="round" />
        <rect x="72" y="10" width="24" height="8" rx="4" fill="#3A4080" />
        <ellipse className="lamp-glow" cx="84" cy="21" rx="9" ry="4" fill="#FFB547" />
      </svg>
    </div>
  );
}

export default memo(LampBase);
