'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { places, site, type PlaceId } from '@/data/site';
import Building, { type Roof } from './Building';
import Lamp from './Lamp';
import Panel from './Panel';
import Skyline from './Skyline';
import Walker from './Walker';
import { mulberry32 } from './rng';

const WORLD_W = 3400; // width of the street, in world units
const STAGE_H = 700; // height of the scene, in world units
const GROUND_Y = 590; // where the street starts, measured from the top of the scene
const SPEED = 400; // world units per second
const DOOR_RANGE = 90; // how close counts as "at the door"
const PLAYER_W = 48;
const PLAYER_H = 100;

const LAYOUT: Record<PlaceId, { x: number; w: number; h: number; roof: Roof; tone: string }> = {
  about: { x: 720, w: 300, h: 250, roof: 'gable', tone: '#2B3170' },
  projects: { x: 1360, w: 360, h: 320, roof: 'flat', tone: '#33306E' },
  skills: { x: 2020, w: 280, h: 400, roof: 'tower', tone: '#27366F' },
  contact: { x: 2680, w: 320, h: 240, roof: 'dome', tone: '#3A2F6B' },
};
const LAMP_X = [260, 1030, 1710, 2340, 3080];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Stars are the same on every render.
const STARS = (() => {
  const rand = mulberry32(7);
  return Array.from({ length: 70 }, () => ({
    x: rand() * 1600,
    y: rand() * 380,
    r: 0.6 + rand() * 1.4,
    o: 0.35 + rand() * 0.55,
  }));
})();

type State = {
  x: number;
  facing: 1 | -1;
  left: boolean;
  right: boolean;
  target: { x: number; id: PlaceId } | null;
  locked: boolean;
  near: PlaceId | null;
  walking: boolean;
  moved: boolean;
  scale: number;
  vw: number;
  vh: number;
};

type Props = { ready: boolean; onLeave: () => void };

export default function City({ ready, onLeave }: Props) {
  const [view, setView] = useState({ w: 0, h: 0 });
  const [near, setNear] = useState<PlaceId | null>(null);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [open, setOpen] = useState<PlaceId | null>(null);
  const [visited, setVisited] = useState<PlaceId[]>([]);
  const [moved, setMoved] = useState(false);
  const [coarse, setCoarse] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const st = useRef<State>({
    x: 300,
    facing: 1,
    left: false,
    right: false,
    target: null,
    locked: false,
    near: null,
    walking: false,
    moved: false,
    scale: 1,
    vw: 0,
    vh: 0,
  });

  // Phones stay at 1x; wide screens zoom in so the street doesn't look tiny.
  const scale = clamp(view.h / STAGE_H, 0.5, Math.max(1, view.w / 900));
  const offsetY = Math.max(0, view.h - STAGE_H * scale);
  const groundPx = offsetY + GROUND_Y * scale;
  const viewWorld = view.w / scale;

  // Track the window size and the kind of pointer.
  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    st.current.scale = scale;
    st.current.vw = view.w;
    st.current.vh = view.h;
  }, [scale, view.w, view.h]);

  const openPlace = useCallback((id: PlaceId) => {
    const s = st.current;
    s.locked = true;
    s.left = false;
    s.right = false;
    s.target = null;
    setOpen(id);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
  }, []);

  const closePanel = useCallback(() => {
    st.current.locked = false;
    setOpen(null);
  }, []);

  const goTo = useCallback((id: PlaceId) => {
    const s = st.current;
    if (s.locked) return;
    s.target = { x: LAYOUT[id].x, id };
  }, []);

  // Keyboard controls.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const s = st.current;
      const k = e.key.toLowerCase();
      if (k === 'escape' && s.locked) {
        closePanel();
        return;
      }
      if (s.locked) return;
      const onControl = (e.target as HTMLElement | null)?.closest?.('button, a, input, textarea');
      if (k === 'arrowleft' || k === 'a') {
        s.left = true;
        e.preventDefault();
      } else if (k === 'arrowright' || k === 'd') {
        s.right = true;
        e.preventDefault();
      } else if ((k === 'enter' || k === 'e') && !onControl && s.near) {
        e.preventDefault();
        openPlace(s.near);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') st.current.left = false;
      if (k === 'arrowright' || k === 'd') st.current.right = false;
    };
    const release = () => {
      st.current.left = false;
      st.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', release);
    };
  }, [closePanel, openPlace]);

  // The game loop: move, follow with the camera, and notice doors.
  const running = view.w > 0;
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      const step = SPEED * dt;

      let dir = 0;
      if (!s.locked) {
        if (s.left) dir -= 1;
        if (s.right) dir += 1;
        if (dir !== 0) {
          s.target = null;
        } else if (s.target) {
          const d = s.target.x - s.x;
          if (Math.abs(d) <= step) {
            s.x = s.target.x;
            const id = s.target.id;
            s.target = null;
            openPlace(id);
          } else {
            dir = Math.sign(d);
          }
        }
      }

      if (dir !== 0) {
        s.x = clamp(s.x + dir * step, 80, WORLD_W - 80);
        if (dir !== s.facing) {
          s.facing = dir as 1 | -1;
          setFacing(s.facing);
        }
        if (!s.moved) {
          s.moved = true;
          setMoved(true);
        }
      }

      const isWalking = dir !== 0;
      if (isWalking !== s.walking) {
        s.walking = isWalking;
        setWalking(isWalking);
      }

      let nearest: PlaceId | null = null;
      for (const p of places) {
        if (Math.abs(LAYOUT[p.id].x - s.x) < DOOR_RANGE) nearest = p.id;
      }
      if (nearest !== s.near) {
        s.near = nearest;
        setNear(nearest);
      }

      // Camera
      const viewW = s.vw / s.scale;
      const camX = clamp(s.x - viewW / 2, 0, Math.max(0, WORLD_W - viewW));
      const oy = Math.max(0, s.vh - STAGE_H * s.scale);
      if (stageRef.current) {
        stageRef.current.style.transform = `translate3d(${-camX * s.scale}px, ${oy}px, 0) scale(${s.scale})`;
      }
      if (playerRef.current) {
        playerRef.current.style.transform = `translate3d(${s.x - PLAYER_W / 2}px, ${GROUND_Y - PLAYER_H + 8}px, 0)`;
      }
      const layers = layersRef.current?.children;
      if (layers) {
        for (let i = 0; i < layers.length; i++) {
          const el = layers[i] as HTMLElement;
          const f = Number(el.dataset.f || 0);
          el.style.transform = `translate3d(${-camX * s.scale * f}px, 0, 0)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, openPlace]);

  const hold = (side: 'left' | 'right', down: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (down) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    if (!st.current.locked) st.current[side] = down;
  };

  const layerW = (f: number) => Math.ceil((WORLD_W * f + viewWorld + 200) / 200) * 200;
  const farW = useMemo(() => layerW(0.25), [viewWorld]); // eslint-disable-line react-hooks/exhaustive-deps
  const midW = useMemo(() => layerW(0.55), [viewWorld]); // eslint-disable-line react-hooks/exhaustive-deps

  const hint = coarse
    ? 'Hold the arrows to walk, or tap a building.'
    : 'Walk with ← → or A and D. Press Enter at a door.';

  return (
    <div
      data-city
      className={`fixed inset-0 overflow-hidden select-none ${ready ? 'lamps-on' : ''}`}
      style={{ background: 'linear-gradient(to bottom, #080B22 0%, #131847 52%, #2A2F66 100%)' }}
    >
      {/* sky */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 700"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EEEAF7" opacity={s.o} />
        ))}
      </svg>

      <div
        aria-hidden="true"
        className="absolute right-[14%] top-[15%] h-16 w-16 rounded-full bg-chalk/90 sm:h-20 sm:w-20"
        style={{ boxShadow: '0 0 0 40px rgba(255,181,71,0.05), 0 0 90px 30px rgba(255,181,71,0.12)' }}
      />

      {/* distant skylines */}
      {view.w > 0 && (
        <div ref={layersRef} aria-hidden="true">
          <div className="absolute left-0" data-f="0.25" style={{ top: groundPx - 300 * scale, willChange: 'transform' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              <Skyline width={farW} height={300} seed={11} fill="#1B2058" minW={70} maxW={150} minH={110} maxH={290} />
            </div>
          </div>
          <div className="absolute left-0" data-f="0.55" style={{ top: groundPx - 230 * scale, willChange: 'transform' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}>
              <Skyline width={midW} height={230} seed={23} fill="#222866" minW={60} maxW={120} minH={80} maxH={220} windowChance={0.09} />
            </div>
          </div>
        </div>
      )}

      {/* the street */}
      <div
        ref={stageRef}
        className={walking ? 'walking' : ''}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: WORLD_W,
          height: STAGE_H,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        <div
          className="absolute left-0"
          style={{
            top: GROUND_Y,
            width: WORLD_W + 4000,
            height: STAGE_H - GROUND_Y,
            background: '#161B42',
            borderTop: '3px solid #2E357A',
          }}
        >
          <div
            className="absolute left-0 right-0"
            style={{
              top: 78,
              height: 3,
              backgroundImage: 'repeating-linear-gradient(90deg, #2E357A 0 36px, transparent 36px 80px)',
            }}
          />
        </div>

        {LAMP_X.map((x, i) => (
          <Lamp key={x} x={x} groundY={GROUND_Y} index={i} />
        ))}

        {places.map((p) => {
          const L = LAYOUT[p.id];
          return (
            <Building
              key={p.id}
              id={p.id}
              x={L.x}
              w={L.w}
              h={L.h}
              roof={L.roof}
              tone={L.tone}
              sign={p.name}
              groundY={GROUND_Y}
              lit={visited.includes(p.id)}
              near={near === p.id}
              onClick={() => goTo(p.id)}
            />
          );
        })}

        {near && !open && (
          <div
            className="pop absolute z-10"
            style={{ left: LAYOUT[near].x, top: GROUND_Y - 196 }}
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={() => openPlace(near)}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-lamp px-4 py-2 font-display text-sm font-semibold text-night"
            >
              Go in
              {!coarse && (
                <kbd className="rounded bg-night/15 px-1.5 py-0.5 font-display text-xs font-semibold">Enter</kbd>
              )}
            </button>
          </div>
        )}

        <div ref={playerRef} className="absolute left-0 top-0 z-10" style={{ width: PLAYER_W, height: PLAYER_H, willChange: 'transform' }}>
          <Walker facing={facing} />
        </div>
      </div>

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
        <div>
          <p className="font-display text-lg font-semibold leading-tight sm:text-xl">{site.name}</p>
          <p className="font-display text-sm text-mist">{site.role}</p>
          <p
            className="mt-3 max-w-[34ch] font-display text-sm text-chalk/80 transition-opacity duration-500"
            style={{ opacity: moved ? 0 : 1 }}
            aria-hidden={moved}
          >
            {hint}
          </p>
        </div>
        <button
          type="button"
          onClick={onLeave}
          className="pointer-events-auto whitespace-nowrap font-display text-sm text-lamp underline underline-offset-4"
        >
          Read as a page
        </button>
      </header>

      {/* places: click to walk there. Also the keyboard route around the city. */}
      <nav
        aria-label="Places"
        className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5 px-3 pb-[env(safe-area-inset-bottom)] sm:gap-2"
      >
        {places.map((p) => {
          const isVisited = visited.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => goTo(p.id)}
              aria-current={near === p.id ? 'location' : undefined}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 font-display text-[13px] font-medium transition-colors max-[359px]:px-2.5 sm:gap-2 sm:px-4 sm:text-sm ${
                near === p.id
                  ? 'border-lamp bg-lamp text-night'
                  : 'border-dusk bg-night/70 text-chalk hover:border-mist'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full max-[359px]:hidden"
                style={{ background: near === p.id ? '#0E1230' : isVisited ? '#FFB547' : '#3A4080', boxShadow: isVisited && near !== p.id ? '0 0 0 2px rgba(255,181,71,.3)' : 'none' }}
              />
              {p.name}
              {isVisited && <span className="sr-only">(visited)</span>}
            </button>
          );
        })}
      </nav>

      {/* touch controls */}
      {coarse && !open && (
        <>
          <button
            type="button"
            aria-label="Walk left"
            onPointerDown={hold('left', true)}
            onPointerUp={hold('left', false)}
            onPointerCancel={hold('left', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute bottom-[84px] left-4 z-10 grid h-16 w-16 touch-none place-items-center rounded-full border border-dusk bg-night/70 text-chalk active:bg-dusk"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M14 3L6 11l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button
            type="button"
            aria-label="Walk right"
            onPointerDown={hold('right', true)}
            onPointerUp={hold('right', false)}
            onPointerCancel={hold('right', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute bottom-[84px] right-4 z-10 grid h-16 w-16 touch-none place-items-center rounded-full border border-dusk bg-night/70 text-chalk active:bg-dusk"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M8 3l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </>
      )}

      {open && <Panel id={open} onClose={closePanel} />}

      {/* loading cover */}
      <div
        className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-night transition-opacity duration-700"
        style={{ opacity: ready && view.w > 0 ? 0 : 1 }}
        aria-hidden={ready}
      >
        <p className="font-display text-lg text-mist">Lighting the streetlamps</p>
      </div>
    </div>
  );
}
