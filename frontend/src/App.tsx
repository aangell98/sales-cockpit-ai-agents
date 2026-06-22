import { useState } from 'react';
import { Sparkles, LayoutDashboard, MessagesSquare, Cpu, PlayCircle, Menu, X, Zap, Radio, Loader2 } from 'lucide-react';
import { BRAND } from './brand';
import { BrandLogo } from './lib/ui';
import HeroView from './components/HeroView';
import CockpitView from './components/CockpitView';
import TeamsCopilot from './components/TeamsCopilot';
import TechView from './components/TechView';
import AutoPlayDemo from './components/AutoPlayDemo';
import { LIVE_TICKER } from './data/cockpit';
import { useHealth } from './live/api';
import { LiveBadge, ModelChip } from './live/LiveBadge';
import LiveCopilot from './live/LiveCopilot';
import LiveCockpit from './live/LiveCockpit';

type Mode = 'intro' | 'live';
type Tab = 'inicio' | 'cockpit' | 'copilot' | 'tecnologia';
type LiveTab = 'cockpit' | 'copilot' | 'tecnologia';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'inicio', label: 'Inicio', icon: Sparkles },
  { id: 'cockpit', label: 'Cockpit', icon: LayoutDashboard },
  { id: 'copilot', label: 'Copilot Teams', icon: MessagesSquare },
  { id: 'tecnologia', label: 'Tecnología', icon: Cpu },
];

const LIVE_TABS: { id: LiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'cockpit', label: 'Cockpit en vivo', icon: LayoutDashboard },
  { id: 'copilot', label: 'Copilot en vivo', icon: MessagesSquare },
  { id: 'tecnologia', label: 'Tecnología', icon: Cpu },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('intro');
  const [tab, setTab] = useState<Tab>('inicio');
  const [liveTab, setLiveTab] = useState<LiveTab>('cockpit');
  const [demo, setDemo] = useState(false);
  const [menu, setMenu] = useState(false);
  const { health, status } = useHealth();

  const nav = mode === 'intro' ? TABS : LIVE_TABS;
  const current = mode === 'intro' ? tab : liveTab;
  const setCurrent = (id: string) => (mode === 'intro' ? setTab(id as Tab) : setLiveTab(id as LiveTab));

  const ModeToggle = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-100 p-0.5 ${className}`}>
      <button onClick={() => setMode('intro')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${mode === 'intro' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
        <Sparkles size={14} /> Intro
      </button>
      <button onClick={() => setMode('live')}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition ${mode === 'live' ? 'bg-primary-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
        <Zap size={14} className={mode === 'live' ? 'fill-white' : ''} /> EN VIVO
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* ===== Ticker superior ===== */}
      <div className="overflow-hidden border-b border-slate-200 bg-surface-900 py-1.5">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap text-xs text-white/60">
          {[...LIVE_TICKER, ...LIVE_TICKER].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" />{t}</span>
          ))}
        </div>
      </div>

      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-7 w-auto" />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold leading-tight text-slate-900">{BRAND.product} <span className="text-primary-600">{BRAND.productAccent}</span></h1>
              <p className="text-[10px] text-slate-400">{BRAND.unit} · gobernado por Microsoft</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setCurrent(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${current === id ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle className="hidden sm:flex" />
            {mode === 'intro' ? (
              <button onClick={() => setDemo(true)} className="hidden items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700 xl:flex">
                <PlayCircle size={16} /> Demo automática
              </button>
            ) : (
              <div className="hidden items-center gap-2 xl:flex">
                <LiveBadge health={health} status={status} />
                <ModelChip health={health} />
              </div>
            )}
            <button onClick={() => setMenu(!menu)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden">
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* nav móvil */}
        {menu && (
          <div className="border-t border-slate-100 px-5 py-2 lg:hidden">
            <ModeToggle className="mb-2 w-full" />
            {nav.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setCurrent(id); setMenu(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${current === id ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
            {mode === 'intro' && (
              <button onClick={() => { setDemo(true); setMenu(false); }} className="mt-1 flex w-full items-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-bold text-white">
                <PlayCircle size={16} /> Demo automática
              </button>
            )}
          </div>
        )}
      </header>

      {/* ===== Main ===== */}
      <main className="mx-auto max-w-7xl px-5 py-8">
        {mode === 'intro' && (
          <>
            {tab === 'inicio' && <HeroView onStartDemo={() => setDemo(true)} onExplore={() => setTab('cockpit')} />}
            {tab === 'cockpit' && <CockpitView />}
            {tab === 'copilot' && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Copilot para banqueros, dentro de Teams</h2>
                  <p className="mx-auto mt-2 max-w-2xl text-slate-600">El agente vive donde trabaja el banquero. Pregúntale sobre coberturas, carencias, comisiones o retención — responde al instante y con fuentes.</p>
                </div>
                <TeamsCopilot />
              </div>
            )}
            {tab === 'tecnologia' && <TechView />}
          </>
        )}

        {mode === 'live' && (
          <div className="space-y-5">
            <LiveBanner status={status} />
            {liveTab === 'cockpit' && <LiveCockpit health={health} />}
            {liveTab === 'copilot' && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Copilot para banqueros · en tiempo real</h2>
                  <p className="mx-auto mt-2 max-w-2xl text-slate-600">Mismo Teams, ahora <strong>de verdad</strong>: cada respuesta se genera en directo con Azure OpenAI y cita las fuentes. Pregúntale lo que quieras.</p>
                </div>
                <LiveCopilot health={health} />
              </div>
            )}
            {liveTab === 'tecnologia' && <TechView />}
          </div>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 text-center">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-6 w-auto" />
            <span className="text-slate-300">×</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600"><img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" /> Microsoft</span>
          </div>
          <p className="max-w-xl text-xs text-slate-400">
            Caso de uso {BRAND.caseId} «{BRAND.caseTitle}». La pestaña <strong>Intro</strong> es la demo guiada; <strong>EN VIVO</strong> habla de verdad con Azure OpenAI.
            Construido con Microsoft Agent Framework · Azure AI Foundry · Microsoft 365 Copilot · Entra ID · Cosmos DB · API Management.
          </p>
        </div>
      </footer>

      <AutoPlayDemo open={demo} onClose={() => setDemo(false)} />
    </div>
  );
}

function LiveBanner({ status }: { status: 'connecting' | 'online' | 'offline' }) {
  if (status === 'online') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Radio size={18} /></span>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">Estás en modo EN VIVO</div>
          <div className="text-[12px] text-slate-500">Las respuestas y recomendaciones se generan en tiempo real con Azure OpenAI. Pruébalo tú mismo.</div>
        </div>
      </div>
    );
  }
  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"><Loader2 size={18} className="animate-spin" /></span>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">Activando el entorno en vivo…</div>
          <div className="text-[12px] text-slate-500">Preparando los agentes y el modelo de Azure OpenAI. La primera vez puede tardar unos segundos.</div>
        </div>
        <div className="hidden gap-1 sm:flex">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-indigo-400" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-indigo-400" style={{ animationDelay: '160ms' }} />
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-indigo-400" style={{ animationDelay: '320ms' }} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Radio size={18} /></span>
      <div className="flex-1">
        <div className="text-sm font-bold text-slate-800">Reconectando con el entorno en vivo…</div>
        <div className="text-[12px] text-slate-500">Si no se restablece, en local arranca el backend: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">cd live-backend; .\run.ps1</code>.</div>
      </div>
    </div>
  );
}
