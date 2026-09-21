import { memo, useMemo } from 'react';
import { mulberry32 } from './rng';

type Props = {
  width: number;
  height: number;
  seed: number;
  fill: string;
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  windowChance?: number;
};

/** A row of far-away buildings drawn as one SVG. Deterministic, so server and client match. */
function SkylineBase({ width, height, seed, fill, minW, maxW, minH, maxH, windowChance = 0 }: Props) {
  const shapes = useMemo(() => {
    const rand = mulberry32(seed);
    const rects: { x: number; y: number; w: number; h: number }[] = [];
    const lights: { x: number; y: number }[] = [];
    let x = 0;
    while (x < width) {
      const w = minW + rand() * (maxW - minW);
      const h = minH + rand() * (maxH - minH);
      rects.push({ x, y: height - h, w, h });
      if (windowChance > 0) {
        for (let cx = x + 8; cx < x + w - 8; cx += 14) {
          for (let cy = height - h + 12; cy < height - 10; cy += 18) {
            if (rand() < windowChance) lights.push({ x: cx, y: cy });
          }
        }
      }
      x += w + (rand() < 0.35 ? rand() * 24 : 0);
    }
    return { rects, lights };
  }, [width, height, seed, minW, maxW, minH, maxH, windowChance]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {shapes.rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={fill} />
      ))}
      {shapes.lights.map((l, i) => (
        <rect key={i} x={l.x} y={l.y} width="5" height="7" fill="#FFB547" opacity="0.55" />
      ))}
    </svg>
  );
}

export default memo(SkylineBase);
