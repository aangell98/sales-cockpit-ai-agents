import { ArrowRight, PlayCircle, Sparkles, Trophy, Target, MessagesSquare, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { AnimatedNumber, BrandLogo, useInView } from '../lib/ui';
import { MS_STACK } from '../brand';

interface Props {
  onStartDemo: () => void;
  onExplore: () => void;
}

const HERO_METRICS = [
  { icon: TrendingUp, value: 34, suffix: '%', label: 'Conversión next best action', sub: 'vs. 25% media de la red' },
  { icon: Zap, value: 1284, suffix: '', label: 'Consultas resueltas hoy', sub: 'Copilot en Teams' },
  { icon: Target, value: 312, prefix: '€', suffix: 'k', label: 'Prima del mes', sub: '78% del objetivo' },
  { icon: Trophy, value: 41, suffix: '%', label: 'Retención de fugas', sub: 'Playbook IA de retención' },
];

const PILLARS = [
  { icon: Target, title: 'Next Best Action', text: 'La IA prioriza a qué cliente llamar, con qué producto y por qué — con la comisión potencial calculada.' },
  { icon: Trophy, title: 'Gamificación', title2: '', text: 'Ranking territorial, retos, logros y racha. La red comercial compite y se engancha.' },
  { icon: MessagesSquare, title: 'Copilot en Teams', text: 'Un agente que responde dudas de producto, coberturas, comisiones y procesos al instante y con fuentes.' },
];

export default function HeroView({ onStartDemo, onExplore }: Props) {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);

  return (
    <div ref={ref} className="space-y-10">
      {/* ===== Hero principal ===== */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-900 text-white">
        {/* fondo */}
        <div className="absolute inset-0 bg-grid-dark opacity-60" />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl animate-pulse-slow" />

        <div className="relative px-7 py-12 sm:px-12 sm:py-16">
          {/* co-branding */}
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-xl bg-white px-3 py-2 shadow-lg">
              <BrandLogo className="h-6 w-auto" />
            </div>
            <span className="text-white/30">×</span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur">
              <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
              <span className="text-sm font-semibold text-white/90">Microsoft</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-200">
            <Sparkles size={13} /> Cockpit comercial · IA agéntica
          </div>

          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            El <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">copiloto comercial</span><br className="hidden sm:block" /> de los banqueros de Acme
          </h1>

          <p className="mt-5 max-w-2xl text-balance text-lg text-white/70">
            Un cockpit que convierte datos en <strong className="text-white">acciones</strong>: a quién llamar, con qué producto,
            cuánto vas a ganar — y un agente en Teams que resuelve cualquier duda al instante.
            Gobernado, auditable y construido sobre Microsoft.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartDemo}
              className="group inline-flex items-center gap-2.5 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-bold shadow-xl shadow-primary-900/40 transition hover:bg-primary-500 hover:scale-[1.02]"
            >
              <PlayCircle size={20} />
              Ver demo automática
              <span className="ml-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">45&quot;</span>
            </button>
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-base font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              Explorar el cockpit <ArrowRight size={17} />
            </button>
          </div>

          {/* métricas */}
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HERO_METRICS.map((m, i) => (
              <div
                key={m.label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                style={{ animation: seen ? `fadeInSoft 0.6s ease-out ${0.15 * i}s both` : undefined }}
              >
                <m.icon className="mb-3 h-5 w-5 text-primary-300" />
                <div className="text-3xl font-black tracking-tight">
                  <AnimatedNumber value={m.value} run={seen} prefix={m.prefix} suffix={m.suffix} duration={1400} />
                </div>
                <div className="mt-1 text-sm font-semibold text-white/80">{m.label}</div>
                <div className="text-xs text-white/45">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tres pilares ===== */}
      <section className="grid gap-5 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <div
            key={p.title}
            className="card-hover group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6"
            style={{ animation: seen ? `slideIn 0.6s ease-out ${0.1 * i}s both` : undefined }}
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-50 transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-900/20">
                <p.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ===== Banda de tecnología Microsoft ===== */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck size={16} className="text-primary-600" />
            Construido sobre la nube y la IA de Microsoft
          </div>
          <span className="hidden text-xs text-slate-400 sm:block">Gobernado · Auditable · Empresarial</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MS_STACK.slice(0, 8).map((t) => (
            <div key={t.name} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <img src={t.logo} alt={t.name} className="h-5 w-5 shrink-0" />
              <span className="truncate text-xs font-semibold text-slate-700">{t.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
