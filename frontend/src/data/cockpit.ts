// =============================================================================
// Datos simulados del Cockpit Comercial de Acme.
// Todo es ficticio y orientado a demo. Cifras y nombres son ilustrativos.
// =============================================================================
import type { Tone } from '../brand';

export interface Banker {
  name: string;
  initials: string;
  role: string;
  office: string;
  officeCode: string;
  region: string;
  tenure: string;
  level: number;
  levelName: string;
  points: number;
  pointsToNext: number;
  streakDays: number;
  rankRegion: number;
  rankRegionTotal: number;
}

export const BANKER: Banker = {
  name: 'María Lozano',
  initials: 'ML',
  role: 'Gestora de Banca Comercial',
  office: 'Oficina Madrid · Castellana 89',
  officeCode: '2847',
  region: 'Dirección Territorial Madrid',
  tenure: '6 años en Acme',
  level: 7,
  levelName: 'Embajadora Seguros',
  points: 18430,
  pointsToNext: 21000,
  streakDays: 12,
  rankRegion: 3,
  rankRegionTotal: 214,
};

// --- KPIs de cabecera del cockpit ------------------------------------------
export interface Kpi {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: string;
  deltaUp: boolean;
  sub: string;
  tone: Tone;
}

export const KPIS: Kpi[] = [
  { id: 'target', label: 'Objetivo mensual', value: 78, suffix: '%', delta: '+11 pts', deltaUp: true, sub: '€312k de €400k en prima', tone: 'red' },
  { id: 'commission', label: 'Comisión potencial', value: 4820, prefix: '€', delta: '+€1.240', deltaUp: true, sub: 'Pipeline IA priorizado', tone: 'emerald' },
  { id: 'nba', label: 'Acciones IA hoy', value: 9, suffix: '', delta: '3 prioritarias', deltaUp: true, sub: 'Next best action', tone: 'amber' },
  { id: 'conv', label: 'Conversión NBA', value: 34, suffix: '%', delta: '+9 pts', deltaUp: true, sub: 'vs. 25% media red', tone: 'violet' },
];

// --- Next Best Actions (clientes priorizados por IA) -----------------------
export type Product = 'Hogar' | 'Auto' | 'Vida' | 'Salud' | 'Decesos' | 'Protección Pagos' | 'Mascotas';

export interface NextBestAction {
  id: string;
  client: string;
  initials: string;
  segment: string;
  product: Product;
  propensity: number;       // 0-100
  commission: number;       // € potencial
  premium: number;          // € prima anual
  heat: 'hot' | 'warm' | 'cool';
  trigger: string;          // evento que dispara la acción
  reason: string;           // por qué la IA lo recomienda
  signals: string[];        // señales que cruzó la IA
  bestChannel: string;
  bestTime: string;
  scriptHint: string;
}

export const NEXT_BEST_ACTIONS: NextBestAction[] = [
  {
    id: 'nba-1',
    client: 'Carlos Méndez Ruiz',
    initials: 'CM',
    segment: 'Particular · Select',
    product: 'Hogar',
    propensity: 92,
    commission: 410,
    premium: 540,
    heat: 'hot',
    trigger: 'Firmó hipoteca hace 9 días',
    reason: 'Nueva hipoteca sin seguro de hogar vinculado. Ventana óptima de venta cruzada en los primeros 15 días.',
    signals: ['Hipoteca formalizada (€185k)', 'Sin póliza Hogar activa', 'Abrió la app 4 veces esta semana', 'Cliente Select desde 2019'],
    bestChannel: 'Llamada',
    bestTime: 'Hoy 11:30–12:30',
    scriptHint: 'Enhorabuena por la nueva vivienda. Tu hipoteca incluye condiciones preferentes en el seguro de Hogar…',
  },
  {
    id: 'nba-2',
    client: 'Lucía Fernández Gil',
    initials: 'LF',
    segment: 'Particular · Premium',
    product: 'Salud',
    propensity: 87,
    commission: 520,
    premium: 1180,
    heat: 'hot',
    trigger: 'Nacimiento de hija (dato CRM)',
    reason: 'Evento vital de alta intención. Familias con recién nacido triplican la contratación de Salud familiar.',
    signals: ['Alta de beneficiario reciente', 'Búsquedas de "cuadro médico" en web', 'Sin Salud familiar', 'Ingresos estables 24 meses'],
    bestChannel: 'WhatsApp Business',
    bestTime: 'Hoy 18:00–19:00',
    scriptHint: 'Felicidades por la llegada de la peque. Tenemos un plan de Salud familiar con pediatría sin esperas…',
  },
  {
    id: 'nba-3',
    client: 'Grupo Talleres Vega S.L.',
    initials: 'TV',
    segment: 'Empresa · Pyme',
    product: 'Auto',
    propensity: 81,
    commission: 690,
    premium: 3400,
    heat: 'hot',
    trigger: 'Renovación flota en 21 días',
    reason: 'Flota de 6 vehículos próxima a renovar. Competidor envió oferta — riesgo de fuga detectado en señales.',
    signals: ['Renovación flota T-21d', 'Consulta de baja parcial', 'Sin multirriesgo comercio', 'Antigüedad 8 años'],
    bestChannel: 'Reunión',
    bestTime: 'Mañana 09:30',
    scriptHint: 'Antes de la renovación, repasamos juntos la flota y un pack que mejora cobertura y precio…',
  },
  {
    id: 'nba-4',
    client: 'Javier Ortega Soto',
    initials: 'JO',
    segment: 'Particular · Estándar',
    product: 'Vida',
    propensity: 74,
    commission: 360,
    premium: 720,
    heat: 'warm',
    trigger: 'Aumento de nómina domiciliada',
    reason: 'Subida de ingresos del 18% y edad 38. Perfil idóneo para Vida-Ahorro con fiscalidad favorable.',
    signals: ['Nómina +18% (3 meses)', 'Edad 38, sin Vida', 'Plan de pensiones activo', 'Simulador Vida visitado'],
    bestChannel: 'Llamada',
    bestTime: 'Jueves 12:00',
    scriptHint: 'Con tu nueva situación, un seguro de Vida-Ahorro te protege y optimiza fiscalidad…',
  },
  {
    id: 'nba-5',
    client: 'Ana Belén Crespo',
    initials: 'AC',
    segment: 'Particular · Select',
    product: 'Decesos',
    propensity: 69,
    commission: 240,
    premium: 380,
    heat: 'warm',
    trigger: 'Cumple 60 años este mes',
    reason: 'Tramo de edad con máxima contratación de Decesos. Cliente vinculada con 3 productos.',
    signals: ['Cumpleaños 60', 'Alta vinculación (3 productos)', 'Sin Decesos', 'Reside con cónyuge'],
    bestChannel: 'Oficina',
    bestTime: 'Cita pendiente',
    scriptHint: 'Aprovechando tu visita, te explico el plan de Decesos que da tranquilidad a toda la familia…',
  },
  {
    id: 'nba-6',
    client: 'Roberto Salas Marín',
    initials: 'RS',
    segment: 'Particular · Premium',
    product: 'Protección Pagos',
    propensity: 64,
    commission: 180,
    premium: 290,
    heat: 'warm',
    trigger: 'Nuevo préstamo personal',
    reason: 'Préstamo reciente sin protección de pagos. Reduce morosidad y aporta tranquilidad al cliente.',
    signals: ['Préstamo €24k a 60 meses', 'Sin CPI', 'Autónomo', 'Buen histórico de pagos'],
    bestChannel: 'WhatsApp Business',
    bestTime: 'Hoy 16:00',
    scriptHint: 'Tu nuevo préstamo puede ir con Protección de Pagos por muy poco al mes…',
  },
  {
    id: 'nba-7',
    client: 'Familia Núñez Pardo',
    initials: 'NP',
    segment: 'Particular · Estándar',
    product: 'Mascotas',
    propensity: 58,
    commission: 95,
    premium: 240,
    heat: 'cool',
    trigger: 'Compra en clínica veterinaria (PFM)',
    reason: 'Gasto recurrente en veterinario detectado. Buen gancho de entrada y fidelización joven.',
    signals: ['3 pagos a veterinario', 'Cliente <35 años', 'Sin seguro Mascotas', 'Alta actividad en app'],
    bestChannel: 'Push app',
    bestTime: 'Fin de semana',
    scriptHint: 'Vemos que cuidas mucho a tu mascota — tenemos un seguro que cubre sus imprevistos…',
  },
];

// --- Ranking / leaderboard (gamificación) ----------------------------------
export interface RankRow {
  pos: number;
  name: string;
  office: string;
  points: number;
  isYou?: boolean;
  trend: 'up' | 'down' | 'flat';
  badge?: string;
}

export const LEADERBOARD: RankRow[] = [
  { pos: 1, name: 'Diego Romero',  office: 'Salamanca 12',   points: 21640, trend: 'flat', badge: '👑' },
  { pos: 2, name: 'Nuria Vidal',   office: 'Chamberí 3',     points: 19920, trend: 'up' },
  { pos: 3, name: 'María Lozano',  office: 'Castellana 89',  points: 18430, isYou: true, trend: 'up', badge: '🔥' },
  { pos: 4, name: 'Pablo Durán',   office: 'Goya 45',        points: 17880, trend: 'down' },
  { pos: 5, name: 'Sara Méndez',   office: 'Retiro 8',       points: 16210, trend: 'up' },
  { pos: 6, name: 'Tomás Ferrer',  office: 'Tetuán 21',      points: 15640, trend: 'flat' },
];

// --- Logros / badges -------------------------------------------------------
export interface Badge {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
  progress?: number; // 0-100 si no earned
}

export const BADGES: Badge[] = [
  { id: 'b1', emoji: '🔥', name: 'Racha imparable', desc: '12 días seguidos cumpliendo acciones IA', earned: true },
  { id: 'b2', emoji: '🏠', name: 'Maestra del Hogar', desc: '20 pólizas de Hogar este trimestre', earned: true },
  { id: 'b3', emoji: '⚡', name: 'Cierre relámpago', desc: 'Venta cruzada en <24h tras NBA', earned: true },
  { id: 'b4', emoji: '🎯', name: 'Francotiradora', desc: 'Conversión NBA > 30%', earned: true },
  { id: 'b5', emoji: '💎', name: 'Club Diamante', desc: 'Top 1% de la red comercial', earned: false, progress: 72 },
  { id: 'b6', emoji: '🚀', name: 'Multiproducto', desc: '5 ramos distintos en un mes', earned: false, progress: 80 },
];

// --- Mix de cartera / progreso por ramo ------------------------------------
export interface RamoProgress {
  ramo: Product;
  sold: number;
  goal: number;
  color: string;
}

export const RAMO_PROGRESS: RamoProgress[] = [
  { ramo: 'Hogar',            sold: 24, goal: 28, color: '#0F766E' },
  { ramo: 'Salud',           sold: 17, goal: 22, color: '#0D9488' },
  { ramo: 'Auto',            sold: 13, goal: 20, color: '#14B8A6' },
  { ramo: 'Vida',            sold: 9,  goal: 16, color: '#2DD4BF' },
  { ramo: 'Decesos',         sold: 6,  goal: 12, color: '#94A3B8' },
];

// --- Liga / división (gamificación) ----------------------------------------
export interface League {
  name: string;
  icon: string;          // emoji de la división
  position: number;      // posición dentro de la división
  total: number;         // gestores en la división
  promoteTop: number;    // top N asciende
  nextTier: string;      // división superior
  pointsToSecure: number;// XP para asegurar el ascenso
}

export const LEAGUE: League = {
  name: 'División Oro',
  icon: '🥇',
  position: 3,
  total: 24,
  promoteTop: 3,
  nextTier: 'División Élite',
  pointsToSecure: 2570,
};

// --- Reto semanal ----------------------------------------------------------
export interface WeeklyChallenge {
  title: string;
  desc: string;
  current: number;
  goal: number;
  unit: string;
  rewardPts: number;
  rewardBadge: string;   // emoji
  endsInHours: number;
}

export const WEEKLY_CHALLENGE: WeeklyChallenge = {
  title: 'Semana multiproducto',
  desc: 'Cierra venta cruzada en 4 ramos distintos',
  current: 3,
  goal: 4,
  unit: 'ramos',
  rewardPts: 500,
  rewardBadge: '⚡',
  endsInHours: 62,
};

// --- Mapa de calor de actividad (últimas 10 semanas · 0-4) ------------------
export const ACTIVITY_HEATMAP: number[] = [
  1, 2, 2, 1, 3, 0, 0,  2, 1, 3, 2, 2, 1, 0,  0, 2, 2, 3, 1, 0, 1,  2, 3, 2, 2, 3, 1, 0,
  1, 2, 3, 3, 2, 0, 0,  3, 2, 3, 2, 4, 1, 0,  2, 3, 3, 4, 3, 1, 1,  3, 4, 3, 3, 4, 2, 0,
  4, 3, 4, 4, 3, 2, 1,  4, 4, 3, 4, 4, 2, 1,
];

// --- Evolución de XP (últimas 8 semanas) y momentum -------------------------
export const XP_TREND: number[] = [820, 940, 760, 1180, 1020, 1340, 1260, 1620];
export const XP_TREND_DELTA = 28; // % vs. semana anterior
export const RANK_DELTA = 2;      // puestos ganados esta semana

// --- Misiones diarias ------------------------------------------------------
export interface Mission { id: string; title: string; xp: number; done: boolean; }

export const DAILY_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Ejecuta 3 Next Best Action', xp: 60, done: true },
  { id: 'm2', title: 'Resuelve 5 consultas con Copilot', xp: 40, done: true },
  { id: 'm3', title: 'Cierra una venta cruzada', xp: 120, done: false },
  { id: 'm4', title: 'Recupera un cliente en riesgo de fuga', xp: 90, done: false },
];

// --- Oficina vs Red (comparativa) ------------------------------------------
export interface VersusMetric { label: string; office: number; network: number; suffix: string; }

export const OFFICE_VS_NETWORK: { office: string; metrics: VersusMetric[] } = {
  office: 'Castellana 89',
  metrics: [
    { label: 'Conversión NBA', office: 34, network: 25, suffix: '%' },
    { label: 'Retención de fugas', office: 41, network: 33, suffix: '%' },
    { label: 'Venta cruzada / gestor', office: 18, network: 12, suffix: '' },
  ],
};

// --- Próximas recompensas / hitos ------------------------------------------
export interface Reward { icon: string; label: string; sub: string; pct: number; }

export const NEXT_REWARDS: Reward[] = [
  { icon: '⭐', label: 'Nivel 8 · Embajadora Élite', sub: 'Faltan 2.570 XP', pct: 88 },
  { icon: '💎', label: 'Insignia Club Diamante', sub: 'Top 1% de la red', pct: 72 },
  { icon: '🏅', label: 'Ascenso a División Élite', sub: 'Mantén el top 3', pct: 82 },
];

// --- FAQ / Copilot Teams (preguntas frecuentes del banquero) ---------------
export interface Citation { source: string; ref: string; }
export interface FaqAnswer {
  q: string;
  a: string;
  citations: Citation[];
  followups: string[];
}

export const TEAMS_FAQ: FaqAnswer[] = [
  {
    q: '¿El seguro de Hogar cubre daños por una fuga del vecino de arriba?',
    a: 'Sí. La cobertura de **Daños por Agua** del seguro de Hogar Acme cubre los daños que una fuga procedente de una vivienda colindante cause en el continente y contenido del asegurado, incluida la localización de la avería. La reparación en origen (en casa del vecino) corre a cargo de SU póliza. Franquicia: 0 € en la modalidad Confort y Premium.',
    citations: [
      { source: 'Condicionado Hogar Acme', ref: 'Cláusula 4.2 · Daños por Agua' },
      { source: 'Guía de coberturas 2026', ref: 'pág. 18' },
    ],
    followups: ['¿Qué documentación pido al cliente?', '¿Cubre también la reposición de mobiliario?'],
  },
  {
    q: '¿Hay periodo de carencia en el seguro de Salud para una operación?',
    a: 'Depende del tipo de intervención. **Urgencias y accidentes: sin carencia** desde el día 1. Cirugía programada: **6 meses** de carencia. Parto: **8 meses**. La carencia se puede eliminar aportando el certificado de la póliza anterior si el cliente venía de otra compañía (continuidad de coberturas).',
    citations: [
      { source: 'Condicionado Salud Acme', ref: 'Anexo II · Carencias' },
      { source: 'Política continuidad de coberturas', ref: 'v3.1' },
    ],
    followups: ['¿Cómo tramito la eliminación de carencias?', '¿Qué incluye el cuadro médico en Madrid?'],
  },
  {
    q: '¿Qué comisión me llevo por una póliza de Vida-Ahorro?',
    a: 'La retribución comercial de **Vida-Ahorro** es del **50% de la prima del primer año** como incentivo de captación, más un **3% recurrente** sobre primas sucesivas mientras la póliza siga activa. Para una prima de 720 €/año, la comisión potencial del primer año es de **360 €**. Los incentivos por gamificación se suman al ranking territorial.',
    citations: [
      { source: 'Plan de Incentivos Comercial FY26', ref: 'Tabla Vida · ramo 7' },
      { source: 'Nota interna RRCC', ref: 'circular 12/26' },
    ],
    followups: ['¿Y la comisión de Decesos?', '¿Cuándo se liquidan los incentivos?'],
  },
  {
    q: 'Un cliente quiere dar de baja el Auto. ¿Cómo lo retengo?',
    a: 'Antes de tramitar la baja, el sistema recomienda: (1) revisar el **motivo** (precio en el 68% de los casos), (2) ofrecer la **revisión de coberturas** con posible ajuste de franquicia, y (3) aplicar el **descuento de fidelidad multiproducto** si tiene 2+ ramos. Si persiste, ofrecer pausa de 30 días en lugar de baja. Retención media con este flujo: **41%**.',
    citations: [
      { source: 'Playbook de Retención Auto', ref: 'flujo R-Auto v2' },
      { source: 'Microsoft 365 Copilot · Next Best Action', ref: 'modelo propensión-fuga' },
    ],
    followups: ['Aplica el descuento de fidelidad a este cliente', 'Genera el argumentario de retención'],
  },
];

// --- Ticker de eventos en vivo (parte inferior) ----------------------------
export const LIVE_TICKER: string[] = [
  'Diego R. cerró Hogar +€420 · Salamanca 12',
  'Nueva señal: hipoteca formalizada → NBA generada',
  'María L. subió al puesto #3 territorial 🔥',
  'Copilot resolvió 1.284 consultas de banqueros hoy',
  'Sara M. desbloqueó "Cierre relámpago" ⚡',
  'Conversión NBA de la red: 31% (+6 pts vs. mes anterior)',
  'Riesgo de fuga detectado en flota Talleres Vega',
];
