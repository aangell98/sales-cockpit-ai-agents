import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Phone, MessageCircle, Users, Building2, Smartphone, Mail,
  Zap, Clock, Euro, Target, Radar, ArrowRight, Gauge, Quote, Loader2,
} from 'lucide-react';
import { ProgressRing, Card, Chip, AnimatedNumber, fmtEur, TONE } from '../lib/ui';
import type { Tone } from '../brand';
import {
  getClients, streamNba, connectLiveFeed,
  type ClientLite, type Nba, type LiveSignal, type Health,
} from './api';

const CHANNEL_ICON: Record<string, React.ElementType> = {
  'Llamada': Phone,
  'WhatsApp Business': MessageCircle,
  'Reunión': Users,
  'Oficina': Building2,
  'Push app': Smartphone,
  'Email': Mail,
};

const HEAT: Record<string, { tone: Tone; label: string }> = {
  hot: { tone: 'red', label: 'Caliente' },
  warm: { tone: 'amber', label: 'Templada' },
  cool: { tone: 'blue', label: 'Fría' },
};

export default function LiveCockpit({ health }: { health: Health | null }) {
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [nba, setNba] = useState<Nba | null>(null);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<string>('');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const reasonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const cs = await getClients();
        if (active && cs.length) { setClients(cs); return true; }
      } catch { /* reintenta mientras el entorno se activa */ }
      return false;
    };
    load();
    const id = setInterval(async () => { if (await load()) clearInterval(id); }, 3000);
    const stop = connectLiveFeed((s) => setSignals((prev) => [s, ...prev].slice(0, 7)));
    return () => { active = false; clearInterval(id); stop(); };
  }, []);

  useEffect(() => {
    reasonRef.current?.scrollTo({ top: reasonRef.current.scrollHeight, behavior: 'smooth' });
  }, [reasoning]);

  const generate = async (clientId: string) => {
    if (generating) return;
    setSelected(clientId);
    setReasoning('');
    setNba(null);
    setMode('');
    setElapsed(null);
    setTokens(null);
    setGenerating(true);
    try {
      await streamNba(clientId, {
        onReasoning: (t) => setReasoning((r) => r + t),
        onDone: (info) => { setNba(info.nba); setMode(info.mode); setTokens(info.usage?.completion_tokens ?? null); },
        onEnd: (ms) => { setElapsed(ms); setGenerating(false); },
        onError: () => setGenerating(false),
      });
    } catch {
      setGenerating(false);
      setReasoning('El entorno se está activando. Inténtalo de nuevo en unos segundos.');
    }
  };

  const selectedClient = clients.find((c) => c.id === selected);
  const ChannelIcon = nba ? (CHANNEL_ICON[nba.best_channel] ?? Phone) : Phone;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">Next Best Action, generada en directo</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">Elige un cliente y observa cómo la IA <strong>razona en tiempo real</strong> sobre sus señales y decide la mejor acción comercial. Sin guion: {health?.deployment ?? 'el modelo'} decide aquí y ahora.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* selector de clientes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Target size={13} /> Clientes priorizados
          </div>
          {clients.length === 0 && (
            <Card className="flex items-center gap-2 p-4 text-sm text-slate-500"><Loader2 size={15} className="animate-spin text-indigo-500" /> Activando entorno en vivo…</Card>
          )}
          {clients.map((c) => (
            <button key={c.id} onClick={() => generate(c.id)} disabled={generating}
              className={`w-full rounded-2xl border p-3.5 text-left transition disabled:cursor-not-allowed ${selected === c.id ? 'border-primary-300 bg-primary-50/50 ring-2 ring-primary-500/20' : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">{c.initials}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-800">{c.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{c.segment}</div>
                </div>
                {selected === c.id && generating
                  ? <Loader2 size={16} className="shrink-0 animate-spin text-primary-500" />
                  : <ArrowRight size={15} className="shrink-0 text-slate-300" />}
              </div>
              <div className="mt-2 line-clamp-1 text-[11px] text-slate-500">{c.signals[0]}</div>
            </button>
          ))}
        </div>

        {/* workspace NBA */}
        <div className="lg:col-span-2">
          {!selected && !generating && (
            <Card className="flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg animate-float">
                <Sparkles size={30} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Selecciona un cliente</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">La IA analizará sus señales en directo y generará la mejor acción comercial, con propensión, canal, momento y guion.</p>
            </Card>
          )}

          {(selected || generating) && (
            <div className="space-y-4">
              {/* razonamiento en vivo */}
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500"><Sparkles size={13} className="text-white" /></div>
                  <span className="text-xs font-bold text-slate-700">Razonamiento del agente</span>
                  {generating && !nba && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" /> pensando…</span>}
                  <div className="ml-auto flex items-center gap-2">
                    {mode === 'live' && <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700"><Zap size={9} /> en vivo</span>}
                    {mode === 'mock' && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700">simulado</span>}
                  </div>
                </div>
                <div ref={reasonRef} className="max-h-40 overflow-y-auto px-4 py-3 scrollbar-clean">
                  {reasoning
                    ? <p className="text-sm leading-relaxed text-slate-600">{reasoning}{generating && !nba && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-violet-500 align-middle" />}</p>
                    : <p className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={14} className="animate-spin" /> Cruzando señales de CRM, transaccionales y de comportamiento…</p>}
                </div>
              </Card>

              {/* tarjeta NBA */}
              {nba && (
                <Card className="overflow-hidden animate-pop-in">
                  <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ProgressRing value={nba.propensity} size={128} stroke={11} run color="#0D9488">
                        <div className="text-center">
                          <div className="text-3xl font-black text-slate-900"><AnimatedNumber value={nba.propensity} suffix="%" /></div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">propensión</div>
                        </div>
                      </ProgressRing>
                      <Chip tone="red"><Zap size={11} /> {nba.product}</Chip>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Cliente</div>
                          <div className="text-lg font-black text-slate-900">{selectedClient?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-emerald-600"><Euro size={15} /><span className="text-xl font-black"><AnimatedNumber value={nba.commission_eur} /></span></div>
                          <div className="text-[10px] font-semibold text-slate-400">comisión · prima {fmtEur(nba.premium_eur)} €/año</div>
                        </div>
                      </div>

                      <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-600">{nba.reason}</p>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-xl border border-slate-200 px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400"><ChannelIcon size={12} /> Canal óptimo</div>
                          <div className="mt-0.5 text-sm font-bold text-slate-800">{nba.best_channel}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400"><Clock size={12} /> Momento</div>
                          <div className="mt-0.5 text-sm font-bold text-slate-800">{nba.best_time}</div>
                        </div>
                      </div>

                      {nba.signals_used?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {nba.signals_used.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-3.5 py-2.5">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-violet-600"><Quote size={11} /> Guion sugerido por IA</div>
                        <p className="text-sm italic leading-relaxed text-slate-700">“{nba.script}”</p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        {elapsed != null && <span className="inline-flex items-center gap-1"><Gauge size={11} /> {(elapsed / 1000).toFixed(1)} s</span>}
                        {tokens != null && <span>· {tokens} tokens</span>}
                        <span className="ml-auto inline-flex items-center gap-1"><img src="/microsoft.svg" alt="" className="h-3 w-3" /> {health?.deployment ?? 'IA'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* radar de oportunidades en vivo (WebSocket) */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <Radar size={15} className="text-primary-600" />
          <span className="text-sm font-bold text-slate-700">Radar de oportunidades · en vivo</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
            streaming
          </span>
          <span className="ml-auto text-[11px] text-slate-400">señales entrantes del journey</span>
        </div>
        <div className="divide-y divide-slate-100">
          {signals.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">Esperando señales en tiempo real…</div>
          )}
          {signals.map((s) => {
            const h = HEAT[s.heat] ?? HEAT.cool;
            const t = TONE[h.tone];
            return (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 animate-slide-in-left">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.bg} ${t.text}`}><Zap size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{s.client}</div>
                  <div className="truncate text-[12px] text-slate-500">{s.signal}</div>
                </div>
                <Chip tone={h.tone}>{s.product}</Chip>
                <span className={`hidden shrink-0 text-[10px] font-bold uppercase sm:inline ${t.text}`}>{h.label}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
