import { Zap, WifiOff, Cpu, Loader2 } from 'lucide-react';
import type { Health, LiveStatus } from './api';

/** Renderiza **negritas** dentro de un texto. */
export function renderRich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>,
  );
}

export function LiveBadge({ health, status }: { health: Health | null; status: LiveStatus }) {
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
        <Loader2 size={12} className="animate-spin" /> Activando entorno…
      </span>
    );
  }
  if (status === 'offline') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        <WifiOff size={12} /> Sin conexión
      </span>
    );
  }
  const live = health?.mode === 'live';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${live ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full ${live ? 'bg-emerald-400' : 'bg-sky-400'} opacity-75 animate-ping`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-500' : 'bg-sky-500'}`} />
      </span>
      {live ? <>EN VIVO · Azure OpenAI</> : <>Modo simulado</>}
    </span>
  );
}

export function ModelChip({ health }: { health: Health | null }) {
  const name = health?.deployment || 'simulado';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
      <Cpu size={11} className="text-violet-500" /> {name}
    </span>
  );
}

export function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
      <Zap size={10} className="fill-white" /> Live
    </span>
  );
}
