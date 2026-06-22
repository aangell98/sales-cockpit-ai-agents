import { useState } from 'react';
import {
  Flame, Trophy, Star, ChevronDown, Phone, MessageCircle, Calendar, Building2,
  Sparkles, TrendingUp, TrendingDown, Minus, Crown, Target, Zap, CheckCircle2, Wand2, Award,
} from 'lucide-react';
import {
  BANKER, KPIS, NEXT_BEST_ACTIONS, LEADERBOARD, BADGES, RAMO_PROGRESS,
  type NextBestAction, type Kpi,
} from '../data/cockpit';
import {
  AnimatedNumber, Card, Chip, ProgressRing, Bar, TONE, fmtEur, useInView,
} from '../lib/ui';
import type { Tone } from '../brand';

const HEAT: Record<NextBestAction['heat'], { label: string; tone: Tone; dot: string }> = {
  hot:  { label: 'Caliente', tone: 'red',     dot: 'bg-primary-500' },
  warm: { label: 'Templado', tone: 'amber',   dot: 'bg-amber-500' },
  cool: { label: 'Frío',     tone: 'blue',    dot: 'bg-sky-500' },
};

function KpiCard({ kpi, run }: { kpi: Kpi; run: boolean }) {
  const t = TONE[kpi.tone];
  return (
    <Card className="p-5" hover>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${kpi.deltaUp ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'}`}>
          {kpi.deltaUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{kpi.delta}
        </span>
      </div>
      <div className={`mt-3 text-3xl font-black tracking-tight ${t.text}`}>
        <AnimatedNumber value={kpi.value} run={run} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{kpi.sub}</div>
    </Card>
  );
}

function NbaCard({ nba, index, run }: { nba: NextBestAction; index: number; run: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const [done, setDone] = useState(false);
  const heat = HEAT[nba.heat];
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition-all ${open ? 'border-primary-200 shadow-[0_8px_30px_-12px_rgba(13,148,136,0.25)]' : 'border-slate-200'}`}
      style={{ animation: run ? `slideIn 0.5s ease-out ${0.07 * index}s both` : undefined }}
    >
      {/* fila principal */}
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left">
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white">
            {nba.initials}
          </div>
          {nba.heat === 'hot' && <span className={`absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full ${heat.dot} ring-2 ring-white animate-pulse-soft`} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-slate-900">{nba.client}</span>
            <Chip tone={heat.tone} className="shrink-0">
              <span className={`h-1.5 w-1.5 rounded-full ${heat.dot}`} />{heat.label}
            </Chip>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">{nba.product}</span>
            <span className="text-slate-300">·</span>
            <span className="truncate">{nba.trigger}</span>
          </div>
        </div>

        {/* propensión */}
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Propensión</div>
          <div className="text-lg font-black text-slate-900">{nba.propensity}%</div>
        </div>

        {/* comisión */}
        <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-1.5 text-right">
          <div className="text-[10px] font-semibold uppercase text-emerald-600">Comisión</div>
          <div className="text-base font-black text-emerald-700">€{nba.commission}</div>
        </div>

        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* detalle expandible */}
      {open && (
        <div className="animate-fade-in border-t border-slate-100 bg-slate-50/40 px-4 py-4">
          <div className="grid gap-4 lg:grid-cols-5">
            {/* razonamiento */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary-600">
                <Sparkles size={13} /> Por qué la IA lo recomienda
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{nba.reason}</p>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Zap size={13} /> Señales cruzadas
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {nba.signals.map((s) => (
                  <span key={s} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">{s}</span>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-primary-100 bg-primary-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-600">
                  <Wand2 size={12} /> Apertura sugerida
                </div>
                <p className="mt-1 text-sm italic text-slate-700">“{nba.scriptHint}”</p>
              </div>
            </div>

            {/* recomendación de contacto */}
            <div className="space-y-2.5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Canal óptimo</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-800">{nba.bestChannel}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[10px] font-semibold uppercase text-slate-400">Mejor momento</div>
                  <div className="mt-0.5 text-sm font-bold text-slate-800">{nba.bestTime}</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Prima anual estimada</span>
                  <span className="font-bold text-slate-800">€{fmtEur(nba.premium)}</span>
                </div>
                <div className="mt-2"><Bar value={nba.propensity} run={open} /></div>
                <div className="mt-1 text-right text-[10px] text-slate-400">Confianza del modelo: {nba.propensity}%</div>
              </div>

              {done ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white animate-pop-in">
                  <CheckCircle2 size={16} /> Acción registrada · +120 pts
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setDone(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700">
                    {nba.bestChannel === 'WhatsApp Business' ? <MessageCircle size={15} /> : nba.bestChannel === 'Reunión' || nba.bestChannel === 'Oficina' ? <Calendar size={15} /> : <Phone size={15} />}
                    Contactar
                  </button>
                  <button onClick={() => setDone(true)} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Wand2 size={15} /> Propuesta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Trophy size={16} className="text-amber-500" /> Ranking territorial</h3>
        <span className="text-xs text-slate-400">Madrid · 214 gestores</span>
      </div>
      <div className="space-y-1.5">
        {LEADERBOARD.map((r) => (
          <div key={r.pos} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.isYou ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-slate-50'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${r.pos === 1 ? 'bg-amber-100 text-amber-700' : r.isYou ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{r.pos}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`truncate text-sm font-semibold ${r.isYou ? 'text-primary-700' : 'text-slate-800'}`}>{r.name}</span>
                {r.badge && <span className="text-sm">{r.badge}</span>}
                {r.isYou && <span className="rounded bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Tú</span>}
              </div>
              <div className="truncate text-[11px] text-slate-400">{r.office}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-800">{(r.points / 1000).toFixed(1)}k</div>
            </div>
            {r.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> : r.trend === 'down' ? <TrendingDown size={14} className="text-primary-400" /> : <Minus size={14} className="text-slate-300" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CockpitView() {
  const [ref, seen] = useInView<HTMLDivElement>(0.05);
  const targetPct = Math.round((BANKER.points / BANKER.pointsToNext) * 100);

  return (
    <div ref={ref} className="space-y-6">
      {/* ===== Cabecera del banquero ===== */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-r from-surface-900 via-surface-850 to-primary-900 px-6 py-6 text-white">
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-primary-600 shadow-xl">{BANKER.initials}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight">{BANKER.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
                  <Star size={12} className="fill-amber-300 text-amber-300" /> Nivel {BANKER.level} · {BANKER.levelName}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/65">
                <span className="inline-flex items-center gap-1"><Building2 size={13} /> {BANKER.office}</span>
                <span className="text-white/25">·</span>
                <span>{BANKER.role}</span>
              </div>
            </div>
            {/* racha + rank */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-center backdrop-blur">
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-300"><Flame size={20} className="fill-amber-400 text-amber-400" />{BANKER.streakDays}</div>
                <div className="text-[10px] font-semibold uppercase text-white/55">días de racha</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-center backdrop-blur">
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-white"><Crown size={18} className="text-amber-300" />#{BANKER.rankRegion}</div>
                <div className="text-[10px] font-semibold uppercase text-white/55">de {BANKER.rankRegionTotal}</div>
              </div>
            </div>
          </div>

          {/* barra de nivel */}
          <div className="relative mt-5">
            <div className="mb-1 flex items-center justify-between text-xs text-white/60">
              <span>{BANKER.points.toLocaleString('es-ES')} pts</span>
              <span>Siguiente nivel: {BANKER.pointsToNext.toLocaleString('es-ES')} pts</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="relative h-full rounded-full bg-gradient-to-r from-amber-400 to-primary-400" style={{ width: seen ? `${targetPct}%` : '0%', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }}>
                <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => <KpiCard key={k.id} kpi={k} run={seen} />)}
      </div>

      {/* ===== NBA + columna derecha ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* lista NBA */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white"><Target size={15} /></span>
              Próximas mejores acciones
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
              <Sparkles size={12} /> Priorizado por IA
            </span>
          </div>
          <div className="space-y-2.5">
            {NEXT_BEST_ACTIONS.map((n, i) => <NbaCard key={n.id} nba={n} index={i} run={seen} />)}
          </div>
        </div>

        {/* columna derecha */}
        <div className="space-y-6">
          {/* objetivo mensual */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><Target size={16} className="text-primary-600" /> Objetivo del mes</h3>
            <div className="flex items-center gap-5">
              <ProgressRing value={78} size={108} stroke={11} run={seen}>
                <div className="text-2xl font-black text-slate-900">78%</div>
                <div className="text-[10px] font-semibold uppercase text-slate-400">logrado</div>
              </ProgressRing>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Prima captada</span><span className="font-bold text-slate-800">€312k</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Objetivo</span><span className="font-bold text-slate-800">€400k</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Faltan</span><span className="font-bold text-primary-600">€88k</span></div>
                <div className="mt-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-center text-xs font-semibold text-emerald-700">Vas 11 pts por delante de tu ritmo</div>
              </div>
            </div>
          </Card>

          {/* progreso por ramo */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><Award size={16} className="text-primary-600" /> Reto multiproducto</h3>
            <div className="space-y-3">
              {RAMO_PROGRESS.map((r) => (
                <div key={r.ramo}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{r.ramo}</span>
                    <span className="text-slate-400">{r.sold}/{r.goal}</span>
                  </div>
                  <Bar value={Math.round((r.sold / r.goal) * 100)} color={r.color} run={seen} height={7} />
                </div>
              ))}
            </div>
          </Card>

          <Leaderboard />

          {/* logros */}
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900"><Trophy size={16} className="text-amber-500" /> Logros</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {BADGES.map((b) => (
                <div key={b.id} className={`group relative flex flex-col items-center rounded-xl border p-2.5 text-center ${b.earned ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50 opacity-70'}`} title={b.desc}>
                  <span className={`text-2xl ${b.earned ? '' : 'grayscale'}`}>{b.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold leading-tight text-slate-700">{b.name}</span>
                  {!b.earned && b.progress != null && (
                    <div className="mt-1 w-full"><Bar value={b.progress} color="#94A3B8" run={seen} height={4} /></div>
                  )}
                  {b.earned && <CheckCircle2 size={12} className="absolute right-1 top-1 text-amber-500" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
