import { useState } from 'react';
import {
  ChevronDown, Phone, MessageCircle, Calendar, Sparkles, TrendingUp, Target,
  Zap, CheckCircle2, Wand2, Trophy, ChevronRight, Coins, ArrowRight, Send, Sunrise, Clock,
} from 'lucide-react';
import {
  BANKER, KPIS, NEXT_BEST_ACTIONS, INCENTIVE, DAY_PLAN, DAY_TIME_SAVED_H,
  type NextBestAction, type Kpi, type DayTask,
} from '../data/cockpit';
import { AnimatedNumber, Card, Bar, fmtEur, useInView } from '../lib/ui';

// El scoring del lead es lo único que lleva color en el número: alta propensión
// (acciona ya) en color de marca, el resto en neutro. Sin etiquetas frío/caliente.
function scoreColor(p: number): string {
  if (p >= 85) return 'text-primary-600';
  if (p >= 70) return 'text-slate-800';
  return 'text-slate-400';
}

// ── Cabecera compacta: identidad + único objetivo del mes + acceso a ranking ──
function CockpitHeader({ run, onOpenRanking }: { run: boolean; onOpenRanking?: () => void }) {
  const objPct = 78;
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-black text-white shadow-md">{BANKER.initials}</div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">{BANKER.name}</h2>
            <p className="text-sm text-slate-500">{BANKER.role} · {BANKER.office}</p>
            <button onClick={onOpenRanking} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 transition hover:text-primary-700">
              <Trophy size={12} /> #{BANKER.rankRegion} de {BANKER.rankRegionTotal} en tu territorio <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="sm:w-80">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Objetivo del mes</span>
            <span className="text-sm font-black text-slate-900">{objPct}%</span>
          </div>
          <Bar value={objPct} run={run} height={9} shimmer />
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-500">€312k <span className="text-slate-300">/</span> €400k en prima</span>
            <span className="font-semibold text-emerald-600">+11 pts sobre tu ritmo</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── KPI homogéneo: número en neutro salvo la comisión (impacto económico) ─────
function KpiCard({ kpi, run }: { kpi: Kpi; run: boolean }) {
  const isMoney = kpi.id === 'commission';
  return (
    <Card className="p-5" hover>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500">
          <TrendingUp size={11} className="text-emerald-500" />{kpi.delta}
        </span>
      </div>
      <div className={`mt-3 text-3xl font-black tracking-tight ${isMoney ? 'text-emerald-600' : 'text-slate-900'}`}>
        <AnimatedNumber value={kpi.value} run={run} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{kpi.sub}</div>
    </Card>
  );
}

function NbaCard({ nba, index, run }: { nba: NextBestAction; index: number; run: boolean }) {
  const [open, setOpen] = useState(index === 0);
  const [done, setDone] = useState(false);
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
          {nba.heat === 'hot' && <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-primary-500 ring-2 ring-white animate-pulse-soft" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold text-slate-900">{nba.client}</span>
            {nba.heat === 'hot' && <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700">Prioritaria</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">{nba.product}</span>
            <span className="text-slate-300">·</span>
            <span className="truncate">{nba.trigger}</span>
          </div>
        </div>

        {/* propensión — el scoring, color solo en el número */}
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Propensión</div>
          <div className={`text-lg font-black ${scoreColor(nba.propensity)}`}>{nba.propensity}%</div>
        </div>

        {/* comisión — impacto económico */}
        <div className="shrink-0 text-right">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Comisión</div>
          <div className="text-base font-black text-emerald-600">€{nba.commission}</div>
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

const NBA_BY_ID: Record<string, NextBestAction> = Object.fromEntries(NEXT_BEST_ACTIONS.map((n) => [n.id, n]));

// ── Camino a tu bonus: el agente entiende los tramos de incentivo y te dice
//    exactamente qué cerrar para alcanzar el siguiente (con su comisión). ──────
function IncentivePathCard({ run }: { run: boolean }) {
  const { monthCommission: cur, tiers, pathActionIds } = INCENTIVE;
  const maxT = tiers[tiers.length - 1].threshold;
  const scale = Math.round(maxT * 1.05);
  const nextTier = tiers.find((t) => cur < t.threshold) ?? null;
  const pathActions = pathActionIds.map((id) => NBA_BY_ID[id]).filter(Boolean) as NextBestAction[];
  const pathSum = pathActions.reduce((s, n) => s + n.commission, 0);
  const projected = Math.min(cur + pathSum, maxT);
  const gap = nextTier ? Math.max(nextTier.threshold - cur, 0) : 0;
  const pct = (v: number) => `${(v / scale) * 100}%`;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white"><Coins size={15} /></span>
            Camino a tu bonus
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700"><Sparkles size={12} /> La IA te guía</span>
        </div>
        <div className="flex items-end gap-2 pb-4 pt-2">
          <span className="text-3xl font-black text-emerald-600">€{fmtEur(cur)}</span>
          <span className="mb-1 text-xs text-slate-400">comisión acumulada este mes</span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        {/* barra de tramos de incentivo */}
        <div className="relative mx-2 h-20">
          {tiers.map((t) => {
            const reached = cur >= t.threshold;
            const projReached = projected >= t.threshold && !reached;
            return (
              <div key={t.name} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: pct(t.threshold), bottom: 16 }}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className={`mt-0.5 text-[11px] font-black ${reached ? 'text-emerald-600' : projReached ? 'text-primary-600' : 'text-slate-400'}`}>{t.name}</span>
                <span className="text-[9px] text-slate-400">€{fmtEur(t.threshold)}</span>
                <span className={`mt-0.5 h-3 w-0.5 ${reached ? 'bg-emerald-500' : projReached ? 'bg-primary-500' : 'bg-slate-300'}`} />
              </div>
            );
          })}
          <div className="absolute inset-x-0 bottom-0 h-3 overflow-visible rounded-full bg-slate-100">
            {/* comisión ya conseguida */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: run ? pct(cur) : '0%', transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
            {/* proyección de la IA hasta el siguiente tramo */}
            <div className="absolute inset-y-0 overflow-hidden rounded-r-full bg-primary-300"
              style={{ left: pct(cur), width: run ? `calc(${pct(projected)} - ${pct(cur)})` : '0%', transition: 'width 1s ease 0.7s' }}>
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
            </div>
          </div>
        </div>

        {nextTier && (
          <div className="mt-2 rounded-xl border border-primary-100 bg-primary-50/50 p-3.5">
            <p className="text-sm text-slate-700">
              Te faltan <strong className="text-slate-900">€{fmtEur(gap)}</strong> para el tramo <strong>{nextTier.name}</strong>
              <span className="text-slate-500"> (+€{fmtEur(nextTier.bonus)} de bonus)</span>.
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary-600">
              <Wand2 size={13} /> La IA te lleva ahí
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {pathActions.map((n) => (
                <span key={n.id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[9px] font-bold text-white">{n.initials}</span>
                  <span className="font-semibold text-slate-700">{n.client.split(' ')[0]}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{n.product}</span>
                  <span className="font-black text-emerald-600">+€{n.commission}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-700"><ArrowRight size={13} /> desbloqueas {nextTier.name}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Tu día: el agente organiza la jornada y redacta los mensajes ────────────
function DayRow({ task, index, run }: { task: DayTask; index: number; run: boolean }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const Icon = task.channel === 'WhatsApp Business' ? MessageCircle : task.channel === 'Reunión' ? Calendar : Phone;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      style={{ animation: run ? `slideIn 0.5s ease-out ${0.06 * index}s both` : undefined }}>
      <div className={`flex items-center gap-3 px-3 py-2.5 ${done ? 'opacity-60' : ''}`}>
        <div className="w-11 shrink-0 text-center text-xs font-black text-slate-900">{task.time}</div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-bold text-white">{task.initials}</div>
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm font-bold text-slate-800 ${done ? 'line-through' : ''}`}>{task.client}</div>
          <div className="truncate text-[11px] text-slate-500">{task.action} · {task.product}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[9px] font-semibold uppercase text-slate-400">Comisión</div>
          <div className="text-sm font-black text-emerald-600">+€{task.commission}</div>
        </div>
        {done ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white"><CheckCircle2 size={14} /> Hecho</span>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Wand2 size={13} /> Redactar</button>
            <button onClick={() => setDone(true)} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-primary-700"><Icon size={13} /> {task.action.split(' ')[0]}</button>
          </div>
        )}
      </div>
      {open && !done && (
        <div className="animate-fade-in border-t border-slate-100 bg-slate-50/60 px-3 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary-600"><Sparkles size={11} /> Mensaje redactado por la IA</div>
          <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm italic leading-relaxed text-slate-700">{task.draft}</p>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100">Editar</button>
            <button onClick={() => { setDone(true); setOpen(false); }} className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-700"><Send size={12} /> Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DayPlanCard({ run }: { run: boolean }) {
  const pipeline = DAY_PLAN.reduce((s, t) => s + t.commission, 0);
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-surface-900 via-surface-850 to-primary-900 px-5 py-4 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur"><Sunrise size={22} className="text-accent-400" /></span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/50">Tu día</div>
              <h3 className="text-base font-black leading-tight">Buenos días, {BANKER.name.split(' ')[0]}</h3>
              <p className="text-xs text-white/70">Te he priorizado {DAY_PLAN.length} acciones · <strong className="text-white">€{fmtEur(pipeline)}</strong> en comisión potencial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold backdrop-blur"><Sparkles size={11} className="text-accent-400" /> Plan IA</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300"><Clock size={11} /> ~{DAY_TIME_SAVED_H}h ahorradas</span>
          </div>
        </div>
      </div>
      <div className="space-y-2 p-4">
        {DAY_PLAN.map((t, i) => <DayRow key={t.id} task={t} index={i} run={run} />)}
      </div>
    </Card>
  );
}

export default function CockpitView({ onOpenRanking }: { onOpenRanking?: () => void }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.05);
  const kpis = KPIS.filter((k) => k.id !== 'target');

  return (
    <div ref={ref} className="space-y-6">
      <CockpitHeader run={seen} onOpenRanking={onOpenRanking} />

      {/* Camino a tu bonus — el agente entiende los incentivos y te ayuda a llegar */}
      <IncentivePathCard run={seen} />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => <KpiCard key={k.id} kpi={k} run={seen} />)}
      </div>

      {/* Tu día — el agente organiza la jornada y redacta por ti */}
      <DayPlanCard run={seen} />

      {/* Próximas mejores acciones — el corazón del cockpit, a todo el ancho */}
      <div>
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
    </div>
  );
}
