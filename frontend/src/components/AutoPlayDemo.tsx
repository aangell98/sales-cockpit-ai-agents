import { useEffect, useReducer, useRef, useState } from 'react';
import {
  X, Play, Pause, SkipForward, SkipBack, RotateCcw, Sparkles, Sunrise, Target,
  MessagesSquare, Trophy, Flame, Crown, CheckCircle2, FileText, TrendingUp, Phone, Euro,
} from 'lucide-react';
import { AnimatedNumber, ProgressRing, BrandLogo, useCountUp } from '../lib/ui';
import { NEXT_BEST_ACTIONS, LIVE_TICKER, BANKER } from '../data/cockpit';

interface Props { open: boolean; onClose: () => void; }

const HERO_NBA = NEXT_BEST_ACTIONS[0]; // Carlos Méndez · Hogar · hot

// ── Confetti -----------------------------------------------------------------
function Confetti({ run }: { run: boolean }) {
  const pieces = useRef(
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      dur: 2.4 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 220,
      rot: (Math.random() - 0.5) * 900,
      color: ['#0D9488', '#FF6B5B', '#FFB347', '#10B981', '#7C3AED', '#FFD24C'][i % 6],
      size: 6 + Math.random() * 7,
    })),
  ).current;
  if (!run) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti-fall absolute top-0"
          style={{
            left: `${p.left}%`, width: p.size, height: p.size * 0.6, background: p.color,
            borderRadius: 2,
            ['--confetti-drift' as string]: `${p.drift}px`,
            ['--confetti-rotate' as string]: `${p.rot}deg`,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Scene 1: intro -----------------------------------------------------------
function SceneIntro({ active }: { active: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className={`mb-7 flex items-center gap-4 ${active ? 'animate-fade-in' : ''}`}>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-2xl"><BrandLogo className="h-7 w-auto" /></div>
        <span className="text-2xl text-white/30">×</span>
        <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <img src="/microsoft.svg" alt="" className="h-6 w-6" /><span className="text-lg font-semibold text-white">Microsoft</span>
        </span>
      </div>
      <div className={`inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-1.5 text-sm font-semibold text-primary-200 ${active ? 'animate-pop-in' : ''}`}>
        <Sparkles size={15} /> Cockpit comercial
      </div>
      <h1 className={`mt-6 text-5xl font-black tracking-tight text-white sm:text-7xl ${active ? 'animate-slide-in' : ''}`}>
        Un día con <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Copilot</span>
      </h1>
      <p className={`mt-4 max-w-xl text-balance text-lg text-white/60 ${active ? 'animate-fade-in' : ''}`}>
        Acompaña a {BANKER.name}, gestora de banca comercial, mientras la IA convierte datos en ventas.
      </p>
    </div>
  );
}

// ── Scene 2: briefing --------------------------------------------------------
function SceneBriefing({ active }: { active: boolean }) {
  const lines = [
    { icon: Target, text: '9 acciones priorizadas para hoy — 3 calientes', d: 0.2 },
    { icon: Euro, text: 'Comisión potencial del pipeline: €4.820', d: 0.9 },
    { icon: TrendingUp, text: 'Vas al 78% del objetivo, 11 pts por delante de tu ritmo', d: 1.6 },
    { icon: Flame, text: 'Racha de 12 días — no la rompas 😉', d: 2.3 },
  ];
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center">
      <div className={`mb-6 flex items-center gap-3 ${active ? 'animate-slide-in' : ''}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-primary-500 shadow-lg"><Sunrise size={24} className="text-white" /></div>
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-primary-300">Briefing matutino · 08:45</div>
          <h2 className="text-2xl font-black text-white">Buenos días, {BANKER.name.split(' ')[0]}</h2>
        </div>
      </div>
      <div className="space-y-3">
        {lines.map((l, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur"
            style={{ animation: active ? `slideInRight 0.6s ease-out ${l.d}s both` : undefined }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-200"><l.icon size={20} /></div>
            <span className="text-lg font-medium text-white/90">{l.text}</span>
          </div>
        ))}
      </div>
      <div className={`mt-6 flex items-center gap-2 text-sm text-white/40 ${active ? 'animate-fade-in' : ''}`}>
        <img src="/logos/copilot.svg" alt="" className="h-4 w-4" /> Resumen generado por Microsoft 365 Copilot
      </div>
    </div>
  );
}

// ── Scene 3: NBA spotlight ---------------------------------------------------
function SceneNba({ active }: { active: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) { setShown(0); return; }
    const timers = HERO_NBA.signals.map((_, i) => setTimeout(() => setShown((s) => Math.max(s, i + 1)), 900 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="mx-auto grid h-full w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
      {/* izquierda: cliente + gauge */}
      <div className={active ? 'animate-slide-in-left' : ''}>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/15 px-3 py-1 text-xs font-bold text-primary-200">
          <Target size={13} /> NEXT BEST ACTION · #1 del día
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-xl font-black text-white">{HERO_NBA.initials}</div>
          <div>
            <h2 className="text-3xl font-black text-white">{HERO_NBA.client}</h2>
            <div className="text-white/50">{HERO_NBA.segment} · seguro de {HERO_NBA.product}</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-6">
          <ProgressRing value={HERO_NBA.propensity} size={132} stroke={12} run={active} color="#0D9488" track="rgba(255,255,255,0.1)">
            <div className="text-3xl font-black text-white"><AnimatedNumber value={HERO_NBA.propensity} run={active} suffix="%" /></div>
            <div className="text-[10px] font-semibold uppercase text-white/45">propensión</div>
          </ProgressRing>
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3">
              <div className="text-xs font-semibold uppercase text-emerald-300">Comisión potencial</div>
              <div className="text-3xl font-black text-emerald-300">€<AnimatedNumber value={HERO_NBA.commission} run={active} /></div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-2.5">
              <div className="text-xs text-white/50">Trigger</div>
              <div className="font-semibold text-white">{HERO_NBA.trigger}</div>
            </div>
          </div>
        </div>
      </div>

      {/* derecha: razonamiento + señales */}
      <div className={active ? 'animate-slide-in-right' : ''}>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-bold text-primary-200"><Sparkles size={15} /> Razonamiento del agente</div>
          <p className="mt-2 text-lg leading-relaxed text-white/85">{HERO_NBA.reason}</p>
          <div className="mt-5 text-xs font-bold uppercase tracking-wide text-white/40">Señales cruzadas en tiempo real</div>
          <div className="mt-2 space-y-2">
            {HERO_NBA.signals.map((s, i) => (
              <div key={s} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-500 ${i < shown ? 'border-emerald-400/30 bg-emerald-500/10 opacity-100' : 'border-white/5 bg-white/[0.02] opacity-30'}`}>
                <CheckCircle2 size={16} className={i < shown ? 'text-emerald-400' : 'text-white/20'} />
                <span className="text-sm font-medium text-white/85">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scene 4: Teams answer ----------------------------------------------------
function SceneTeams({ active }: { active: boolean }) {
  const full = 'Sí. La cobertura de Daños por Agua del Hogar Acme cubre los daños que una fuga del vecino cause en tu vivienda, incluida la localización de la avería. Franquicia 0 € en Confort y Premium.';
  const [txt, setTxt] = useState('');
  useEffect(() => {
    if (!active) { setTxt(''); return; }
    let i = 0;
    const start = setTimeout(() => {
      const id = setInterval(() => { i += 2; setTxt(full.slice(0, i)); if (i >= full.length) clearInterval(id); }, 22);
    }, 1400);
    return () => clearTimeout(start);
  }, [active]);
  const done = txt.length >= full.length;

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center">
      <div className={`mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-300 ${active ? 'animate-fade-in' : ''}`}>
        <img src="/logos/teams.svg" alt="" className="h-5 w-5" /> En mitad de una visita · pregunta en Teams
      </div>

      {/* pregunta */}
      <div className={`flex justify-end ${active ? 'animate-slide-in-right' : ''}`}>
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary-600 px-5 py-3 text-white shadow-lg">
          ¿El Hogar cubre daños por una fuga del vecino de arriba?
        </div>
      </div>

      {/* respuesta */}
      <div className="mt-4 flex">
        <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 bg-white px-5 py-4 shadow-2xl">
          <div className="mb-2 flex items-center gap-2">
            <img src="/logos/copilot.svg" alt="" className="h-5 w-5" />
            <span className="text-sm font-bold text-slate-800">Copilot · Asistente Seguros</span>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-700">
            {txt}{!done && active && <span className="ml-0.5 inline-block h-4 w-1.5 animate-blink bg-primary-500 align-middle" />}
          </p>
          {done && (
            <div className="mt-3 animate-fade-in space-y-1.5 border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400"><FileText size={11} /> Fuentes</div>
              {[['Condicionado Hogar Acme', 'Cláusula 4.2'], ['Guía de coberturas 2026', 'pág. 18']].map(([s, r], i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-700">{i + 1}</span>
                  <span className="text-xs font-medium text-slate-700">{s}</span><span className="text-[11px] text-slate-400">· {r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {done && <div className="mt-4 text-center text-sm text-white/45 animate-fade-in">Respuesta con fuentes en <strong className="text-white/80">4 segundos</strong> — sin interrumpir la visita</div>}
    </div>
  );
}

// ── Scene 5: the close -------------------------------------------------------
function SceneClose({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0); // 0 idle, 1 confetti+points, 2 rank climb
  useEffect(() => {
    if (!active) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);
  const commission = useCountUp(410, 1400, phase >= 1);

  return (
    <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center text-center">
      <Confetti run={phase >= 1} />
      <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl ${active ? 'animate-pop-in' : ''}`}>
        <CheckCircle2 size={44} className="text-white" />
      </div>
      <h2 className={`mt-6 text-4xl font-black text-white sm:text-5xl ${active ? 'animate-slide-in' : ''}`}>¡Póliza de Hogar firmada! 🎉</h2>
      <p className="mt-2 text-lg text-white/60">{HERO_NBA.client} · prima €540/año</p>

      {/* tarjetas de recompensa */}
      <div className="mt-8 grid w-full grid-cols-3 gap-4">
        <div className={`rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-5 ${phase >= 1 ? 'animate-pop-in' : 'opacity-0'}`}>
          <Euro className="mx-auto mb-1 text-emerald-300" size={22} />
          <div className="text-3xl font-black text-emerald-300">€{commission}</div>
          <div className="text-xs text-white/50">comisión</div>
        </div>
        <div className={`relative rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-5 ${phase >= 1 ? 'animate-pop-in' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
          <Trophy className="mx-auto mb-1 text-amber-300" size={22} />
          <div className="text-3xl font-black text-amber-300">+120</div>
          <div className="text-xs text-white/50">puntos</div>
          {phase >= 1 && <span className="animate-rise-points absolute left-1/2 top-2 -translate-x-1/2 text-sm font-black text-amber-300">+120</span>}
        </div>
        <div className={`rounded-2xl border border-primary-400/30 bg-primary-500/10 px-4 py-5 ${phase >= 1 ? 'animate-pop-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <Flame className="mx-auto mb-1 text-primary-300" size={22} />
          <div className="text-3xl font-black text-primary-300">13</div>
          <div className="text-xs text-white/50">días de racha</div>
        </div>
      </div>

      {/* subida de ranking */}
      <div className={`mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-3.5 backdrop-blur transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <Crown size={22} className="text-amber-300" />
        <span className="text-lg font-bold text-white">Ranking territorial:</span>
        <span className="text-white/40 line-through">#3</span>
        <TrendingUp size={20} className="text-emerald-400" />
        <span className="text-2xl font-black text-emerald-400">#2</span>
        <span className="text-sm text-white/50">de 214 🚀</span>
      </div>
    </div>
  );
}

// ── Scene 6: summary ---------------------------------------------------------
function SceneSummary({ active }: { active: boolean }) {
  const stats = [
    { icon: Target, value: 9, label: 'acciones IA completadas', suffix: '' },
    { icon: Euro, value: 1840, label: 'comisión generada hoy', prefix: '€' },
    { icon: Phone, value: 7, label: 'clientes contactados', suffix: '' },
    { icon: MessagesSquare, value: 14, label: 'dudas resueltas por Copilot', suffix: '' },
  ];
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center text-center">
      <div className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/80 ${active ? 'animate-fade-in' : ''}`}>
        <Sparkles size={15} className="text-primary-300" /> Resumen del día
      </div>
      <h2 className={`mt-5 text-4xl font-black text-white sm:text-5xl ${active ? 'animate-slide-in' : ''}`}>Un gran día, {BANKER.name.split(' ')[0]}</h2>
      <div className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur" style={{ animation: active ? `popIn 0.5s ease-out ${0.12 * i}s both` : undefined }}>
            <s.icon className="mx-auto mb-2 text-primary-300" size={22} />
            <div className="text-3xl font-black text-white"><AnimatedNumber value={s.value} run={active} prefix={s.prefix} suffix={s.suffix} /></div>
            <div className="mt-1 text-xs text-white/50">{s.label}</div>
          </div>
        ))}
      </div>
      <div className={`mt-9 flex items-center gap-3 ${active ? 'animate-fade-in' : ''}`}>
        <div className="rounded-xl bg-white px-3 py-2 shadow-lg"><BrandLogo className="h-5 w-auto" /></div>
        <span className="text-white/30">×</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70"><img src="/microsoft.svg" alt="" className="h-5 w-5" /> Microsoft</span>
      </div>
      <p className="mt-3 text-sm text-white/40">Cockpit Comercial + Copilot para Banqueros · gobernado y auditable</p>
    </div>
  );
}

// ── Engine -------------------------------------------------------------------
const STEPS = [
  { id: 'intro', label: 'Intro', dur: 4200, render: (a: boolean) => <SceneIntro active={a} /> },
  { id: 'briefing', label: 'Briefing matutino', dur: 6500, render: (a: boolean) => <SceneBriefing active={a} /> },
  { id: 'nba', label: 'Next Best Action', dur: 9000, render: (a: boolean) => <SceneNba active={a} /> },
  { id: 'teams', label: 'Copilot en Teams', dur: 8500, render: (a: boolean) => <SceneTeams active={a} /> },
  { id: 'close', label: 'El cierre', dur: 8000, render: (a: boolean) => <SceneClose active={a} /> },
  { id: 'summary', label: 'Resumen', dur: 7000, render: (a: boolean) => <SceneSummary active={a} /> },
];

type State = { idx: number; progress: number; playing: boolean };
type Action = { type: 'tick'; dt: number } | { type: 'play' } | { type: 'pause' } | { type: 'next' } | { type: 'prev' } | { type: 'goto'; idx: number } | { type: 'restart' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'play': return { ...s, playing: true };
    case 'pause': return { ...s, playing: false };
    case 'next': return { idx: Math.min(STEPS.length - 1, s.idx + 1), progress: 0, playing: s.idx + 1 < STEPS.length };
    case 'prev': return { idx: Math.max(0, s.idx - 1), progress: 0, playing: true };
    case 'goto': return { idx: a.idx, progress: 0, playing: true };
    case 'restart': return { idx: 0, progress: 0, playing: true };
    case 'tick': {
      if (!s.playing) return s;
      const total = STEPS[s.idx].dur;
      const p = s.progress + a.dt;
      if (p >= total) {
        if (s.idx >= STEPS.length - 1) return { ...s, progress: total, playing: false };
        return { idx: s.idx + 1, progress: 0, playing: true };
      }
      return { ...s, progress: p };
    }
    default: return s;
  }
}

export default function AutoPlayDemo({ open, onClose }: Props) {
  const [state, dispatch] = useReducer(reducer, { idx: 0, progress: 0, playing: true });
  const last = useRef<number>(performance.now());

  // reset on open
  useEffect(() => { if (open) dispatch({ type: 'restart' }); }, [open]);

  // animation loop
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    last.current = performance.now();
    const loop = (now: number) => {
      const dt = now - last.current; last.current = now;
      dispatch({ type: 'tick', dt });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') dispatch({ type: 'next' });
      if (e.key === 'ArrowLeft') dispatch({ type: 'prev' });
      if (e.key === ' ') { e.preventDefault(); dispatch({ type: state.playing ? 'pause' : 'play' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, state.playing, onClose]);

  // ticker rotation
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick((t) => (t + 1) % LIVE_TICKER.length), 3200);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;
  const step = STEPS[state.idx];
  const finished = state.idx === STEPS.length - 1 && !state.playing;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-surface-950">
      {/* fondo */}
      <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-50" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[34rem] w-[34rem] rounded-full bg-primary-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[34rem] w-[34rem] rounded-full bg-cyan-600/10 blur-[120px]" />

      {/* top bar: progress segments */}
      <div className="relative z-10 flex items-center gap-2 px-6 pt-5">
        {STEPS.map((st, i) => (
          <button key={st.id} onClick={() => dispatch({ type: 'goto', idx: i })} className="group flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary-500" style={{ width: i < state.idx ? '100%' : i === state.idx ? `${(state.progress / step.dur) * 100}%` : '0%', transition: i === state.idx ? 'none' : 'width 0.3s' }} />
            </div>
            <div className={`mt-1.5 hidden text-left text-[10px] font-semibold sm:block ${i === state.idx ? 'text-white' : 'text-white/30'}`}>{st.label}</div>
          </button>
        ))}
        <button onClick={onClose} className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* scene area */}
      <div className="relative z-10 flex-1 overflow-hidden px-6 py-4">
        {step.render(true)}
      </div>

      {/* live ticker */}
      <div className="relative z-10 mx-6 mb-3 flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur">
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary-500" /> En vivo
        </span>
        <div className="relative h-5 flex-1 overflow-hidden">
          <div key={tick} className="absolute inset-0 flex items-center text-sm text-white/70 animate-slide-in-right">{LIVE_TICKER[tick]}</div>
        </div>
      </div>

      {/* controls */}
      <div className="relative z-10 flex items-center justify-center gap-3 pb-6">
        <button onClick={() => dispatch({ type: 'prev' })} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"><SkipBack size={17} /></button>
        {finished ? (
          <button onClick={() => dispatch({ type: 'restart' })} className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 font-bold text-white transition hover:bg-primary-500"><RotateCcw size={17} /> Repetir</button>
        ) : (
          <button onClick={() => dispatch({ type: state.playing ? 'pause' : 'play' })} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-500">
            {state.playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
        )}
        <button onClick={() => dispatch({ type: 'next' })} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"><SkipForward size={17} /></button>
      </div>
    </div>
  );
}
