import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BRAND, type Tone } from '../brand';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/** Cuenta de 0 → target con easing cuando `run` es true. */
export function useCountUp(target: number, durationMs = 1100, run = true, decimals = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    if (!run) { setVal(0); return; }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      setVal(decimals ? Number(v.toFixed(decimals)) : Math.round(v));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, durationMs, run, decimals]);
  return val;
}

export function useInView<T extends HTMLElement>(threshold = 0.25): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------
const groupThousands = (intStr: string) => intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const fmtNum = (n: number, decimals = 0) => {
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  return (neg ? '-' : '') + groupThousands(int) + (dec ? ',' + dec : '');
};

export const fmtEur = (n: number) => fmtNum(Math.round(n), 0);

interface AnimatedNumberProps {
  value: number; run?: boolean; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string;
}
export function AnimatedNumber({ value, run = true, prefix = '', suffix = '', decimals = 0, duration = 1100, className }: AnimatedNumberProps) {
  const v = useCountUp(value, duration, run, decimals);
  return <span className={`tabular-nums ${className ?? ''}`}>{prefix}{fmtNum(v, decimals)}{suffix}</span>;
}

// ---------------------------------------------------------------------------
// Tone helpers
// ---------------------------------------------------------------------------
export const TONE: Record<Tone, { text: string; bg: string; border: string; ring: string; solid: string; soft: string }> = {
  red:     { text: 'text-primary-600', bg: 'bg-primary-50',  border: 'border-primary-200', ring: 'ring-primary-500/30', solid: 'bg-primary-600', soft: 'text-primary-700' },
  emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', ring: 'ring-emerald-500/30', solid: 'bg-emerald-600', soft: 'text-emerald-700' },
  amber:   { text: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200',   ring: 'ring-amber-500/30',   solid: 'bg-amber-500',   soft: 'text-amber-700' },
  blue:    { text: 'text-sky-600',     bg: 'bg-sky-50',      border: 'border-sky-200',     ring: 'ring-sky-500/30',     solid: 'bg-sky-600',     soft: 'text-sky-700' },
  violet:  { text: 'text-violet-600',  bg: 'bg-violet-50',   border: 'border-violet-200',  ring: 'ring-violet-500/30',  solid: 'bg-violet-600',  soft: 'text-violet-700' },
  slate:   { text: 'text-slate-600',   bg: 'bg-slate-50',    border: 'border-slate-200',   ring: 'ring-slate-500/30',   solid: 'bg-slate-600',   soft: 'text-slate-700' },
};

// ---------------------------------------------------------------------------
// Visual primitives
// ---------------------------------------------------------------------------
export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(11,18,32,0.04),0_8px_24px_-12px_rgba(11,18,32,0.08)] ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Chip({ children, tone = 'slate', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  const t = TONE[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${t.bg} ${t.border} ${t.soft} ${className}`}>
      {children}
    </span>
  );
}

/** Anillo de progreso circular SVG. */
export function ProgressRing({ value, size = 120, stroke = 10, run = true, color = '#0D9488', track = '#F1F5F9', children }: {
  value: number; size?: number; stroke?: number; run?: boolean; color?: string; track?: string; children?: ReactNode;
}) {
  const animated = useCountUp(value, 1300, run, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (animated / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Sparkline SVG sencillo. */
export function Sparkline({ points, w = 120, h = 36, color = '#0D9488', fill = true }: { points: number[]; w?: number; h?: number; color?: string; fill?: boolean }) {
  const max = Math.max(...points), min = Math.min(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - ((p - min) / span) * (h - 6) - 3]);
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  const id = `spark-${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r={2.6} fill={color} />
    </svg>
  );
}

/** Barra de progreso lineal con shimmer opcional. */
export function Bar({ value, color = '#0D9488', track = '#F1F5F9', height = 8, run = true, shimmer = false }: {
  value: number; color?: string; track?: string; height?: number; run?: boolean; shimmer?: boolean;
}) {
  const v = useCountUp(value, 1100, run, 0);
  return (
    <div className="relative w-full overflow-hidden rounded-full" style={{ height, background: track }}>
      <div className="relative h-full rounded-full" style={{ width: `${v}%`, background: color, transition: 'width 0.1s linear' }}>
        {shimmer && <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand logos
// ---------------------------------------------------------------------------
export function BrandLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return <img src={BRAND.logoUrl} alt={BRAND.logoAlt} className={className} />;
}
export function MicrosoftLogo({ withWordmark = true, className = '' }: { withWordmark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
      {withWordmark && <span className="text-sm font-semibold text-slate-700">Microsoft</span>}
    </span>
  );
}
