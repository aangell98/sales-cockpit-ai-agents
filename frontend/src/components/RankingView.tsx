import { useState } from 'react';
import {
  Trophy, Crown, Flame, Star, Zap, Target, TrendingUp, TrendingDown, Minus,
  CheckCircle2, Award, ShieldCheck, Timer, Swords, ListChecks, Gift, Activity, ChevronUp, Circle,
} from 'lucide-react';
import {
  BANKER, LEADERBOARD, BADGES, RAMO_PROGRESS, LEAGUE, WEEKLY_CHALLENGE,
  WEEK_ACTIONS, XP_TREND, XP_TREND_DELTA, RANK_DELTA, DAILY_MISSIONS,
  OFFICE_VS_NETWORK, NEXT_REWARDS, type RankRow,
} from '../data/cockpit';
import { Card, Bar, Sparkline, useInView } from '../lib/ui';

const initialsOf = (n: string) =>
  n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// ── Hero: identidad gamificada (nivel · XP · racha · rango) ──────────────────
function HeroBand({ run }: { run: boolean }) {
  const xpPct = Math.round((BANKER.points / BANKER.pointsToNext) * 100);
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-surface-900 via-surface-850 to-primary-900 px-6 py-7 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-primary-400/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-black text-primary-600 shadow-xl">{BANKER.initials}</div>
            <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-gold-500 text-xs font-black text-surface-900 shadow-lg ring-2 ring-surface-900">{BANKER.level}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">{BANKER.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-400/15 px-2.5 py-0.5 text-xs font-bold text-accent-400 ring-1 ring-accent-400/30">
                <Star size={12} className="fill-accent-400" /> Nivel {BANKER.level} · {BANKER.levelName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-300/30">
                <ChevronUp size={12} /> +{RANK_DELTA} puestos esta semana
              </span>
            </div>
            <div className="mt-1 text-sm text-white/60">{BANKER.office} · {BANKER.region}</div>

            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-[11px] text-white/55">
                <span>{BANKER.points.toLocaleString('es-ES')} XP</span>
                <span>Nivel {BANKER.level + 1}: {BANKER.pointsToNext.toLocaleString('es-ES')} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="relative h-full rounded-full bg-gradient-to-r from-accent-400 to-primary-400"
                  style={{ width: run ? `${xpPct}%` : '0%', transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }}>
                  <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center backdrop-blur">
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-accent-400"><Flame size={20} className="fill-accent-400" />{BANKER.streakDays}</div>
              <div className="text-[10px] font-semibold uppercase text-white/55">días de racha</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center backdrop-blur">
              <div className="flex items-center justify-center gap-1 text-2xl font-black text-white"><Crown size={18} className="text-accent-400" />#{BANKER.rankRegion}</div>
              <div className="text-[10px] font-semibold uppercase text-white/55">de {BANKER.rankRegionTotal}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Podio territorial (top-3 animado) ───────────────────────────────────────
const PODIUM = [
  { idx: 1, h: 'h-24', grad: 'from-slate-300 to-slate-400', medal: '🥈', ring: 'ring-slate-300' },
  { idx: 0, h: 'h-32', grad: 'from-accent-400 to-gold-500', medal: '🥇', ring: 'ring-accent-400' },
  { idx: 2, h: 'h-20', grad: 'from-primary-400 to-primary-600', medal: '🥉', ring: 'ring-primary-300' },
];

function Podium({ run }: { run: boolean }) {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {PODIUM.map((p, i) => {
        const r = LEADERBOARD[p.idx];
        if (!r) return null;
        return (
          <div key={r.pos} className="flex w-24 flex-col items-center sm:w-28"
            style={{ animation: run ? `slideIn 0.5s ease-out ${0.12 * i}s both` : undefined }}>
            {r.pos === 1 && <Crown size={22} className="mb-1 text-accent-500" />}
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-base font-black text-slate-700 shadow ring-2 ${r.isYou ? 'ring-primary-500' : p.ring}`}>{initialsOf(r.name)}</div>
            <div className="mt-2 w-full truncate text-center text-xs font-bold text-slate-800">{r.name.split(' ')[0]} {r.name.split(' ')[1]?.[0]}.</div>
            <div className="text-[11px] font-semibold text-slate-400">{(r.points / 1000).toFixed(1)}k XP</div>
            <div className={`mt-2 flex w-full ${p.h} flex-col items-center rounded-t-xl bg-gradient-to-b ${p.grad} pt-2`}>
              <span className="text-2xl drop-shadow">{p.medal}</span>
              <span className="mt-0.5 text-lg font-black text-white/90">{r.pos}º</span>
              {r.isYou && <span className="mt-auto mb-2 rounded bg-white/85 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary-700">Tú</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderRow({ r }: { r: RankRow }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.isYou ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-slate-50'}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">{r.pos}</span>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold text-white">{initialsOf(r.name)}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">{r.name}</div>
        <div className="truncate text-[11px] text-slate-400">{r.office}</div>
      </div>
      <div className="text-sm font-black text-slate-700">{(r.points / 1000).toFixed(1)}k</div>
      {r.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" />
        : r.trend === 'down' ? <TrendingDown size={14} className="text-slate-300" />
        : <Minus size={14} className="text-slate-300" />}
    </div>
  );
}

// ── Liga / división con zona de ascenso ─────────────────────────────────────
function LeagueCard({ run }: { run: boolean }) {
  const promoting = LEAGUE.position <= LEAGUE.promoteTop;
  const youPct = ((LEAGUE.position - 0.5) / LEAGUE.total) * 100;
  const zonePct = (LEAGUE.promoteTop / LEAGUE.total) * 100;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck size={16} className="text-primary-600" /> {LEAGUE.name}</h3>
        <span className="text-2xl">{LEAGUE.icon}</span>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-4xl font-black text-slate-900">#{LEAGUE.position}</span>
        <span className="mb-1 text-sm text-slate-400">de {LEAGUE.total} en tu división</span>
      </div>
      <div className="mt-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="absolute inset-y-0 left-0 bg-emerald-200/80" style={{ width: `${zonePct}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary-600 shadow"
            style={{ left: run ? `${youPct}%` : '0%', transition: 'left 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
          <span className="text-emerald-600">Zona de ascenso · top {LEAGUE.promoteTop}</span>
          <span>{LEAGUE.total}º</span>
        </div>
      </div>
      <div className={`mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold ${promoting ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>
        {promoting
          ? <>En zona de ascenso a <strong>{LEAGUE.nextTier}</strong> · te quedan <strong>{LEAGUE.pointsToSecure.toLocaleString('es-ES')} XP</strong> para asegurarlo</>
          : <>A <strong>{LEAGUE.pointsToSecure.toLocaleString('es-ES')} XP</strong> de la zona de ascenso</>}
      </div>
    </Card>
  );
}

// ── Reto semanal con cuenta atrás ───────────────────────────────────────────
function WeeklyChallengeCard({ run }: { run: boolean }) {
  const c = WEEKLY_CHALLENGE;
  const pct = Math.round((c.current / c.goal) * 100);
  const d = Math.floor(c.endsInHours / 24);
  const h = c.endsInHours % 24;
  return (
    <Card className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-4 text-white">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold"><Zap size={16} className="fill-white" /> Reto de la semana</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold"><Timer size={11} /> {d}d {h}h</span>
        </div>
        <div className="relative mt-2 text-lg font-black">{c.title}</div>
        <div className="relative text-xs text-white/70">{c.desc}</div>
      </div>
      <div className="p-5">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">{c.current} / {c.goal} {c.unit}</span>
          <span className="font-black text-primary-600">{pct}%</span>
        </div>
        <Bar value={pct} run={run} shimmer height={9} />
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-400/10 px-3 py-2 text-xs">
          <span className="text-lg">{c.rewardBadge}</span>
          <span className="font-semibold text-slate-700">Recompensa: <strong>+{c.rewardPts} XP</strong> e insignia exclusiva</span>
        </div>
      </div>
    </Card>
  );
}

// ── Logros / insignias ──────────────────────────────────────────────────────
function BadgesGrid({ run }: { run: boolean }) {
  const earned = BADGES.filter((b) => b.earned).length;
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Award size={16} className="text-primary-600" /> Logros</h3>
        <span className="text-xs text-slate-400">{earned}/{BADGES.length} desbloqueados</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((b, i) => (
          <div key={b.id}
            className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border p-4 text-center transition ${b.earned ? 'border-primary-200 bg-gradient-to-b from-primary-50/70 to-white' : 'border-slate-200 bg-slate-50'}`}
            style={{ animation: run ? `slideIn 0.45s ease-out ${0.05 * i}s both` : undefined }}>
            {b.earned && <span className="pointer-events-none absolute inset-0 -translate-x-full animate-badge-shine bg-gradient-to-r from-transparent via-white/55 to-transparent" />}
            <span className={`text-3xl ${b.earned ? '' : 'opacity-40 grayscale'}`}>{b.emoji}</span>
            <span className="mt-2 text-xs font-bold leading-tight text-slate-800">{b.name}</span>
            <span className="mt-0.5 text-[10px] leading-tight text-slate-400">{b.desc}</span>
            {b.earned
              ? <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[9px] font-black uppercase text-primary-700"><CheckCircle2 size={9} /> Logrado</span>
              : b.progress != null && (
                <div className="mt-2 w-full">
                  <Bar value={b.progress} run={run} height={5} />
                  <span className="mt-1 block text-[9px] font-semibold text-slate-400">{b.progress}%</span>
                </div>
              )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Reto multiproducto (mix de cartera por ramo) ────────────────────────────
function RamoMixCard({ run }: { run: boolean }) {
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Target size={16} className="text-primary-600" /> Reto multiproducto</h3>
      <p className="mb-3 mt-0.5 text-xs text-slate-400">Pólizas cerradas por ramo este trimestre</p>
      <div className="space-y-3">
        {RAMO_PROGRESS.map((r) => (
          <div key={r.ramo}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{r.ramo}</span>
              <span className="text-slate-400">{r.sold}/{r.goal}</span>
            </div>
            <Bar value={Math.round((r.sold / r.goal) * 100)} color={r.color} run={run} height={7} />
          </div>
        ))}
      </div>
    </Card>
  );
}

const brandHex = () => {
  const fallback = '#64748B';
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--brand');
  const m = v.match(/\d+/g);
  if (!m || m.length < 3) return fallback;
  return '#' + m.slice(0, 3).map((x) => Number(x).toString(16).padStart(2, '0')).join('');
};

// ── Tu semana en acción: barras por día + momentum de XP ────────────────────
function WeekActivityCard({ run }: { run: boolean }) {
  const max = Math.max(...WEEK_ACTIONS.map((d) => d.actions));
  const total = WEEK_ACTIONS.reduce((s, d) => s + d.actions, 0);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Activity size={16} className="text-primary-600" /> Tu semana en acción</h3>
          <p className="mt-0.5 text-xs text-slate-400">Acciones IA completadas cada día</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-sm font-black text-emerald-600"><TrendingUp size={13} /> +{XP_TREND_DELTA}%</div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">XP vs. semana previa</div>
          </div>
          <Sparkline points={XP_TREND} color={brandHex()} w={120} h={34} />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-2 sm:gap-4">
        {WEEK_ACTIONS.map((d, i) => {
          const isToday = i === WEEK_ACTIONS.length - 1;
          const h = Math.round((d.actions / max) * 100);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className={`text-xs font-black ${isToday ? 'text-primary-600' : 'text-slate-600'}`}>{d.actions}</span>
              <div className="flex h-28 w-full items-end">
                <div className={`w-full rounded-lg ${isToday ? 'bg-gradient-to-t from-primary-600 to-primary-400 shadow-sm' : 'bg-primary-200'}`}
                  style={{ height: run ? `${h}%` : '0%', transition: `height 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s` }} />
              </div>
              <span className={`text-[11px] font-semibold ${isToday ? 'text-primary-600' : 'text-slate-400'}`}>{isToday ? 'Hoy' : d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700"><Flame size={14} className="text-primary-600" /> {BANKER.streakDays} días de racha</span>
        <span className="text-xs text-slate-500"><strong className="text-slate-900">{total}</strong> acciones esta semana</span>
      </div>
    </Card>
  );
}

// ── Tu oficina vs la red ────────────────────────────────────────────────────
function OfficeVsNetwork({ run }: { run: boolean }) {
  const o = OFFICE_VS_NETWORK;
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Swords size={16} className="text-primary-600" /> Tu oficina vs la red</h3>
      <p className="mt-0.5 text-xs text-slate-400">{o.office} comparada con la media de la red comercial</p>
      <div className="mt-4 space-y-4">
        {o.metrics.map((m) => {
          const base = m.suffix === '%' ? 100 : Math.max(m.office, m.network);
          const ow = Math.round((m.office / base) * 100);
          const nw = Math.round((m.network / base) * 100);
          return (
            <div key={m.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{m.label}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><TrendingUp size={10} /> +{m.office - m.network}{m.suffix} vs red</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-[10px] font-bold uppercase text-primary-600">Oficina</span>
                <div className="flex-1"><Bar value={run ? ow : 0} run={run} height={8} /></div>
                <span className="w-10 shrink-0 text-right text-xs font-black text-slate-800">{m.office}{m.suffix}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="w-12 shrink-0 text-[10px] font-bold uppercase text-slate-400">Red</span>
                <div className="flex-1"><Bar value={run ? nw : 0} color="#CBD5E1" run={run} height={8} /></div>
                <span className="w-10 shrink-0 text-right text-xs font-black text-slate-400">{m.network}{m.suffix}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Misiones diarias (interactivas) ─────────────────────────────────────────
function DailyMissions({ run }: { run: boolean }) {
  const [done, setDone] = useState<Record<string, boolean>>(
    Object.fromEntries(DAILY_MISSIONS.map((m) => [m.id, m.done])),
  );
  const total = DAILY_MISSIONS.reduce((s, m) => s + m.xp, 0);
  const earned = DAILY_MISSIONS.filter((m) => done[m.id]).reduce((s, m) => s + m.xp, 0);
  const pct = Math.round((earned / total) * 100);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ListChecks size={16} className="text-primary-600" /> Misiones diarias</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500"><Timer size={11} /> 9h</span>
      </div>
      <div className="mt-3 space-y-2">
        {DAILY_MISSIONS.map((m) => {
          const isDone = done[m.id];
          return (
            <button key={m.id} onClick={() => setDone((d) => ({ ...d, [m.id]: !d[m.id] }))}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${isDone ? 'border-primary-200 bg-primary-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              {isDone ? <CheckCircle2 size={18} className="shrink-0 text-primary-600" /> : <Circle size={18} className="shrink-0 text-slate-300" />}
              <span className={`flex-1 text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{m.title}</span>
              <span className={`shrink-0 text-xs font-black ${isDone ? 'text-primary-600' : 'text-slate-400'}`}>+{m.xp}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">{earned} / {total} XP de hoy</span>
          <span className="font-black text-primary-600">{pct}%</span>
        </div>
        <Bar value={pct} run={run} height={7} />
      </div>
    </Card>
  );
}

// ── Próximas recompensas / hitos ────────────────────────────────────────────
function NextRewards({ run }: { run: boolean }) {
  return (
    <Card className="p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Gift size={16} className="text-primary-600" /> Próximas recompensas</h3>
      <div className="mt-3 space-y-3">
        {NEXT_REWARDS.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-slate-800">{r.label}</span>
                <span className="shrink-0 text-[11px] font-black text-primary-600">{r.pct}%</span>
              </div>
              <div className="mt-1"><Bar value={r.pct} run={run} height={5} /></div>
              <div className="mt-0.5 text-[10px] text-slate-400">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function RankingView() {
  const [ref, seen] = useInView<HTMLDivElement>(0.05);
  return (
    <div ref={ref} className="space-y-6">
      <HeroBand run={seen} />
      <WeekActivityCard run={seen} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Trophy size={16} className="text-accent-500" /> Podio territorial · Madrid</h3>
              <span className="text-xs text-slate-400">214 gestores</span>
            </div>
            <Podium run={seen} />
            <div className="mt-6 space-y-1.5 border-t border-slate-100 pt-4">
              {LEADERBOARD.slice(3).map((r) => <LeaderRow key={r.pos} r={r} />)}
            </div>
          </Card>

          <OfficeVsNetwork run={seen} />
          <BadgesGrid run={seen} />
        </div>

        <div className="space-y-6">
          <LeagueCard run={seen} />
          <DailyMissions run={seen} />
          <WeeklyChallengeCard run={seen} />
          <NextRewards run={seen} />
          <RamoMixCard run={seen} />
        </div>
      </div>
    </div>
  );
}
