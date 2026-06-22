import { useEffect, useRef, useState } from 'react';
import {
  Send, Sparkles, FileText, Bot, Paperclip, Smile, Search, Bell,
  MoreHorizontal, Hash, Video, Phone, Zap, Gauge,
} from 'lucide-react';
import { BANKER } from '../data/cockpit';
import { streamChat, type Citation, type Health } from './api';
import { renderRich } from './LiveBadge';

interface Msg {
  id: string;
  who: 'banker' | 'agent';
  text: string;
  citations?: Citation[];
  followups?: string[];
  streaming?: boolean;
  latencyMs?: number;
  tokens?: number;
  mode?: string;
}

const STARTERS = [
  '¿El seguro de Hogar cubre daños por una fuga del vecino de arriba?',
  '¿Hay carencia en el seguro de Salud para una cirugía programada?',
  '¿Qué comisión me llevo por una póliza de Vida-Ahorro?',
  'Un cliente quiere dar de baja el Auto, ¿cómo lo retengo?',
];

export default function LiveCopilot({ health }: { health: Health | null }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const update = (id: string, patch: Partial<Msg>) =>
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setBusy(true);
    setUsed((s) => new Set(s).add(question));
    const history = messages.map((m) => ({ who: m.who, text: m.text }));
    const bId = `b-${Date.now()}`;
    const aId = `a-${Date.now()}`;
    setMessages((m) => [...m, { id: bId, who: 'banker', text: question }]);
    setInput('');
    setThinking(true);

    let firstSeen = false;
    try {
      await streamChat(question, history, {
        onFirstToken: (lat) => {
          firstSeen = true;
          setThinking(false);
          setMessages((m) => [...m, { id: aId, who: 'agent', text: '', streaming: true, latencyMs: lat }]);
        },
        onToken: (t) => {
          if (!firstSeen) {
            firstSeen = true;
            setThinking(false);
            setMessages((m) => [...m, { id: aId, who: 'agent', text: t, streaming: true }]);
          } else {
            setMessages((m) => m.map((x) => (x.id === aId ? { ...x, text: x.text + t } : x)));
          }
        },
        onDone: (info) => update(aId, { citations: info.citations, followups: info.followups, mode: info.mode, tokens: info.usage?.completion_tokens }),
        onEnd: () => { update(aId, { streaming: false }); setThinking(false); setBusy(false); },
        onError: () => {
          setThinking(false);
          setMessages((m) => [...m, { id: aId, who: 'agent', text: 'El asistente se está activando, inténtalo de nuevo en unos segundos.', streaming: false }]);
          setBusy(false);
        },
      });
    } catch {
      setThinking(false);
      setBusy(false);
      setMessages((m) => [...m, { id: `err-${Date.now()}`, who: 'agent', text: 'El asistente se está activando, inténtalo de nuevo en unos segundos.', streaming: false }]);
    }
  };

  const starters = STARTERS.filter((q) => !used.has(q));
  const lastAgent = [...messages].reverse().find((m) => m.who === 'agent' && !m.streaming);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* barra Teams */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-[#f5f5f7] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <img src="/logos/teams.svg" alt="Teams" className="h-5 w-5" />
          <span className="text-sm font-bold text-slate-700">Microsoft Teams</span>
        </div>
        <div className="ml-2 flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-200">
          <Search size={13} /> Buscar
        </div>
        <Bell size={15} className="text-slate-400" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{BANKER.initials}</div>
      </div>

      <div className="flex h-[600px]">
        {/* rail */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-[#faf9fb] sm:flex">
          <div className="px-3 py-3"><div className="px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Chat</div></div>
          <div className="space-y-0.5 px-2">
            <div className="flex items-center gap-2.5 rounded-lg bg-white px-2.5 py-2 shadow-sm ring-1 ring-violet-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500">
                <img src="/logos/copilot.svg" alt="" className="h-4 w-4 brightness-0 invert" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-800">Asistente Seguros</div>
                <div className="truncate text-[11px] text-emerald-600">● en vivo</div>
              </div>
            </div>
            {['Equipo Oficina 2847', 'Dirección Territorial', 'Producto · Hogar', 'Soporte Suscripción'].map((c) => (
              <div key={c} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-500"><Hash size={14} /></div>
                <span className="truncate text-sm text-slate-600">{c}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto m-2 rounded-xl border border-violet-100 bg-violet-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700"><Sparkles size={12} /> Respuestas reales</div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Generadas por {health?.deployment ?? 'IA'} sobre la base de conocimiento, con fuentes citadas.</p>
          </div>
        </aside>

        {/* chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500"><Bot size={18} className="text-white" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">Asistente Seguros <Sparkles size={13} className="text-violet-500" /></div>
              <div className="text-[11px] text-emerald-600">● Disponible · responde en tiempo real</div>
            </div>
            <Video size={16} className="text-slate-400" />
            <Phone size={16} className="text-slate-400" />
            <MoreHorizontal size={16} className="text-slate-400" />
          </div>

          <div ref={scrollRef} className="scrollbar-clean flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg animate-float">
                  <img src="/logos/copilot.svg" alt="" className="h-8 w-8 brightness-0 invert" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Hola {BANKER.name.split(' ')[0]} 👋</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Pregúntame lo que quieras. Mis respuestas se generan <strong>en directo</strong> con Azure OpenAI y citan las fuentes oficiales.</p>
              </div>
            )}

            {messages.map((m) =>
              m.who === 'banker' ? (
                <div key={m.id} className="flex justify-end animate-slide-in-right">
                  <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="flex animate-slide-in-left">
                  <div className="max-w-[82%] space-y-2.5">
                    <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <img src="/logos/copilot.svg" alt="" className="h-4 w-4" />
                        <span className="text-xs font-bold text-slate-700">Copilot · Asistente Seguros</span>
                        {m.mode === 'live'
                          ? <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700"><Zap size={9} /> en vivo</span>
                          : m.mode === 'mock'
                            ? <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700">simulado</span>
                            : <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700">IA</span>}
                        {m.latencyMs != null && !m.streaming && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-400"><Gauge size={10} /> {m.latencyMs} ms</span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {renderRich(m.text)}
                        {m.streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-primary-500 align-middle" />}
                      </p>

                      {!m.streaming && m.citations && m.citations.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5 animate-fade-in">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"><FileText size={11} /> Fuentes verificadas</div>
                          {m.citations.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-700">{i + 1}</span>
                              <span className="text-xs font-medium text-slate-700">{c.source}</span>
                              <span className="text-[11px] text-slate-400">· {c.ref}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}

            {thinking && (
              <div className="flex animate-fade-in">
                <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <img src="/logos/copilot.svg" alt="" className="h-4 w-4" />
                    <span className="text-xs font-semibold text-slate-500">Razonando sobre la base de conocimiento</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '160ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '320ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {lastAgent?.followups && lastAgent.followups.length > 0 && !busy && (
              <div className="flex flex-wrap gap-2 pl-1 animate-fade-in">
                {lastAgent.followups.map((f) => (
                  <button key={f} onClick={() => ask(f)} className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                    <Sparkles size={11} /> {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {starters.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"><Sparkles size={11} /> Preguntas sugeridas</div>
              <div className="flex flex-wrap gap-2">
                {starters.slice(0, 3).map((f) => (
                  <button key={f} disabled={busy} onClick={() => ask(f)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-600 transition hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-700 disabled:opacity-50">
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/30">
              <Paperclip size={16} className="text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask(input)}
                placeholder="Escribe tu pregunta al asistente…"
                disabled={busy}
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              <Smile size={16} className="text-slate-400" />
              <button onClick={() => ask(input)} disabled={busy || !input.trim()} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40">
                <Send size={15} />
              </button>
            </div>
            <div className="mt-1.5 px-1 text-center text-[10px] text-slate-400">Respuestas generadas en directo por IA · verifica antes de comunicar al cliente</div>
          </div>
        </div>
      </div>
    </div>
  );
}
