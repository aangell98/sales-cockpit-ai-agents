import { useState } from 'react';
import {
  ChevronDown, Phone, MessageCircle, Calendar, Sparkles, TrendingUp, Target,
  Zap, CheckCircle2, Wand2, Trophy, ChevronRight,
} from 'lucide-react';
import { BANKER, KPIS, NEXT_BEST_ACTIONS, type NextBestAction, type Kpi } from '../data/cockpit';
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

export default function CockpitView({ onOpenRanking }: { onOpenRanking?: () => void }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.05);
  const kpis = KPIS.filter((k) => k.id !== 'target');

  return (
    <div ref={ref} className="space-y-6">
      <CockpitHeader run={seen} onOpenRanking={onOpenRanking} />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => <KpiCard key={k.id} kpi={k} run={seen} />)}
      </div>

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
