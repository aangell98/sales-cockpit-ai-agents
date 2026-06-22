import { useEffect, useRef, useState } from 'react';
import {
  Send, Sparkles, FileText, ChevronRight, Bot, Paperclip, Smile,
  Search, Bell, MoreHorizontal, Hash, Video, Phone,
} from 'lucide-react';
import { TEAMS_FAQ, type FaqAnswer } from '../data/cockpit';
import { BANKER } from '../data/cockpit';

interface Msg {
  id: string;
  who: 'banker' | 'agent';
  text: string;
  answer?: FaqAnswer;
  typing?: boolean;
}

function useTypewriter(full: string, on: boolean, speed = 12) {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (!on) { setOut(full); return; }
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setOut(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [full, on, speed]);
  return out;
}

function renderRich(text: string) {
  // negritas **...**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>,
  );
}

function AgentBubble({ answer, animate }: { answer: FaqAnswer; animate: boolean }) {
  const typed = useTypewriter(answer.a, animate);
  const done = typed.length >= answer.a.length;
  return (
    <div className="max-w-[80%] space-y-2.5">
      <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mb-1.5 flex items-center gap-1.5">
          <img src="/logos/copilot.svg" alt="" className="h-4 w-4" />
          <span className="text-xs font-bold text-slate-700">Copilot · Asistente Seguros</span>
          <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-violet-700">IA</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">{renderRich(typed)}{!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-primary-500 align-middle" />}</p>

        {done && (
          <div className="animate-fade-in">
            {/* citas */}
            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"><FileText size={11} /> Fuentes verificadas</div>
              {answer.citations.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-700">{i + 1}</span>
                  <span className="text-xs font-medium text-slate-700">{c.source}</span>
                  <span className="text-[11px] text-slate-400">· {c.ref}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamsCopilot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const ask = (faq: FaqAnswer) => {
    setUsedQuestions((s) => new Set(s).add(faq.q));
    const bMsg: Msg = { id: `b-${Date.now()}`, who: 'banker', text: faq.q };
    setMessages((m) => [...m, bMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, who: 'agent', text: faq.a, answer: faq, typing: true }]);
    }, 1100);
  };

  const onSend = () => {
    const match = TEAMS_FAQ.find((f) => f.q.toLowerCase().includes(input.toLowerCase().slice(0, 8))) ?? TEAMS_FAQ[0];
    if (input.trim()) ask(match);
  };

  const suggestions = TEAMS_FAQ.filter((f) => !usedQuestions.has(f.q));
  const lastAnswer = [...messages].reverse().find((m) => m.who === 'agent')?.answer;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* barra de título estilo Teams */}
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

      <div className="flex h-[560px]">
        {/* rail izquierdo */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-[#faf9fb] sm:flex">
          <div className="px-3 py-3">
            <div className="px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Chat</div>
          </div>
          <div className="space-y-0.5 px-2">
            <div className="flex items-center gap-2.5 rounded-lg bg-white px-2.5 py-2 shadow-sm ring-1 ring-violet-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500">
                <img src="/logos/copilot.svg" alt="" className="h-4 w-4 brightness-0 invert" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-800">Asistente Seguros</div>
                <div className="truncate text-[11px] text-slate-400">Copilot · siempre disponible</div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            {['Equipo Oficina 2847', 'Dirección Territorial', 'Producto · Hogar', 'Soporte Suscripción'].map((c) => (
              <div key={c} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-500"><Hash size={14} /></div>
                <span className="truncate text-sm text-slate-600">{c}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* área de chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* cabecera del chat */}
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-sky-500">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">Asistente Seguros <Sparkles size={13} className="text-violet-500" /></div>
              <div className="text-[11px] text-emerald-600">● Disponible · responde en segundos</div>
            </div>
            <Video size={16} className="text-slate-400" />
            <Phone size={16} className="text-slate-400" />
            <MoreHorizontal size={16} className="text-slate-400" />
          </div>

          {/* mensajes */}
          <div ref={scrollRef} className="scrollbar-clean flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg animate-float">
                  <img src="/logos/copilot.svg" alt="" className="h-8 w-8 brightness-0 invert" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Hola {BANKER.name.split(' ')[0]} 👋</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Pregúntame sobre coberturas, carencias, comisiones, retención o cualquier proceso. Respondo al instante y con las fuentes oficiales.</p>
              </div>
            )}

            {messages.map((m) =>
              m.who === 'banker' ? (
                <div key={m.id} className="flex justify-end animate-slide-in-right">
                  <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="flex animate-slide-in-left">
                  <AgentBubble answer={m.answer!} animate={!!m.typing} />
                </div>
              ),
            )}

            {thinking && (
              <div className="flex animate-fade-in">
                <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <img src="/logos/copilot.svg" alt="" className="h-4 w-4" />
                    <span className="text-xs font-semibold text-slate-500">Consultando base de conocimiento</span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '160ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-soft" style={{ animationDelay: '320ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* follow-ups del último mensaje */}
            {lastAnswer && !thinking && (
              <div className="flex flex-wrap gap-2 pl-1 animate-fade-in">
                {lastAnswer.followups.map((f) => (
                  <button key={f} onClick={() => { const match = TEAMS_FAQ.find((x) => x.q === f); if (match) ask(match); else { setMessages((m) => [...m, { id: `b-${Date.now()}`, who: 'banker', text: f }]); setThinking(true); setTimeout(() => { setThinking(false); setMessages((mm) => [...mm, { id: `a-${Date.now()}`, who: 'agent', text: TEAMS_FAQ[3].a, answer: TEAMS_FAQ[3], typing: true }]); }, 1000); } }}
                    className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                    <Sparkles size={11} /> {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* sugerencias rápidas */}
          {suggestions.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400"><Sparkles size={11} /> Preguntas frecuentes</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((f) => (
                  <button key={f.q} onClick={() => ask(f)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-600 transition hover:border-primary-200 hover:bg-primary-50/40 hover:text-primary-700">
                    {f.q} <ChevronRight size={12} className="shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* input */}
          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500/30">
              <Paperclip size={16} className="text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                placeholder="Escribe tu pregunta al asistente…"
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <Smile size={16} className="text-slate-400" />
              <button onClick={onSend} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700">
                <Send size={15} />
              </button>
            </div>
            <div className="mt-1.5 px-1 text-center text-[10px] text-slate-400">Respuestas generadas por IA sobre la base de conocimiento de Acme · verifica antes de comunicar al cliente</div>
          </div>
        </div>
      </div>
    </div>
  );
}
