import {
  ShieldCheck, ArrowRight, Cpu, Database, MessagesSquare, Users,
  GitBranch, Lock, Activity, CheckCircle2,
} from 'lucide-react';
import { Card, useInView } from '../lib/ui';
import { MS_STACK } from '../brand';

const FLOW = [
  { logo: '/logos/teams.svg', title: 'Banquero en Teams', text: 'Hace su pregunta o recibe la next best action en su flujo de trabajo habitual.' },
  { logo: '/logos/copilot.svg', title: 'Microsoft 365 Copilot', text: 'Interpreta la intención y selecciona la herramienta o agente adecuado.' },
  { logo: '/logos/foundry.svg', title: 'Agentes en AI Foundry', text: 'Microsoft Agent Framework orquesta los agentes: NBA, Conocimiento, Retención.' },
  { logo: '/logos/azure-openai.svg', title: 'Azure OpenAI', text: 'Razona sobre señales, calcula propensión y genera el argumentario con fuentes.' },
  { logo: '/logos/cosmos-db.svg', title: 'Datos gobernados', text: 'Cosmos DB + Fabric: señales de cliente, propensión, pipeline y KPIs comerciales.' },
];

const GOVERNANCE = [
  { icon: Lock, title: 'Entra ID', text: 'Identidad corporativa, roles por perfil (gestor, director) y acceso condicional.' },
  { icon: ShieldCheck, title: 'AI Gateway (APIM)', text: 'Toda llamada al modelo pasa por políticas de seguridad, límites de tokens y auditoría.' },
  { icon: GitBranch, title: 'Gobierno con GitHub', text: 'CODEOWNERS por dominio y eval gate automatizado contra dataset dorado en cada cambio.' },
  { icon: Activity, title: 'Observabilidad', text: 'App Insights traza cada decisión, latencia y coste por interacción de extremo a extremo.' },
];

function FlowNode({ logo, title, text, i, run }: { logo: string; title: string; text: string; i: number; run: boolean }) {
  return (
    <div className="flex items-stretch gap-3">
      <div
        className="relative flex w-44 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        style={{ animation: run ? `slideIn 0.5s ease-out ${0.12 * i}s both` : undefined }}
      >
        <img src={logo} alt="" className="mb-2 h-7 w-7" />
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="mt-1 text-[11px] leading-snug text-slate-500">{text}</div>
      </div>
      {i < FLOW.length - 1 && (
        <div className="flex items-center self-center text-primary-400">
          <ArrowRight size={20} className="animate-pulse-soft" />
        </div>
      )}
    </div>
  );
}

export default function TechView() {
  const [ref, seen] = useInView<HTMLDivElement>(0.05);
  return (
    <div ref={ref} className="space-y-8">
      {/* intro */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white">
          <Cpu size={13} /> La tecnología detrás del cockpit
        </div>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Agentes gobernados sobre Microsoft</h2>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-slate-600">
          Lo que el banquero vive como “magia” es una arquitectura empresarial: multi-agente, segura,
          auditable y desplegada sobre la nube de Microsoft.
        </p>
      </div>

      {/* flujo extremo a extremo */}
      <Card className="overflow-hidden p-6">
        <h3 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900"><MessagesSquare size={16} className="text-primary-600" /> Flujo de una interacción</h3>
        <div className="scrollbar-clean overflow-x-auto pb-2">
          <div className="flex min-w-max items-stretch gap-3">
            {FLOW.map((f, i) => <FlowNode key={f.title} {...f} i={i} run={seen} />)}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 size={16} /> <span><strong>Respuesta o acción</strong> devuelta al banquero en segundos, con fuentes citadas y registro de auditoría completo.</span>
        </div>
      </Card>

      {/* stack completo */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Database size={18} className="text-primary-600" /> Stack tecnológico</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MS_STACK.map((t, i) => (
            <Card key={t.name} className="p-5" hover>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100" style={{ animation: seen ? `popIn 0.5s ease-out ${0.06 * i}s both` : undefined }}>
                <img src={t.logo} alt={t.name} className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">{t.name}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-500">{t.role}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* gobernanza */}
      <Card className="bg-gradient-to-br from-surface-900 to-surface-850 p-6 text-white">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold"><ShieldCheck size={18} className="text-primary-400" /> Gobierno y confianza</h3>
        <p className="mb-5 text-sm text-white/60">Los seguros son un sector regulado. Cada capa está diseñada para el control y la trazabilidad.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOVERNANCE.map((g) => (
            <div key={g.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <g.icon size={20} className="mb-2.5 text-primary-300" />
              <div className="text-sm font-bold">{g.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-white/55">{g.text}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* impacto */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, big: '+34%', label: 'conversión de acciones comerciales', tone: 'text-primary-600' },
          { icon: MessagesSquare, big: '< 5 s', label: 'respuesta media del agente en Teams', tone: 'text-emerald-600' },
          { icon: Activity, big: '100%', label: 'decisiones trazables y auditables', tone: 'text-violet-600' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50"><s.icon size={22} className={s.tone} /></div>
            <div>
              <div className={`text-2xl font-black ${s.tone}`}>{s.big}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
