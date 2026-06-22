// =============================================================================
// Marca — fuente única de verdad para el demo Acme.
// =============================================================================
// Reemplaza estos valores por los de tu marca. Es la fuente única de verdad para
// el nombre, el logo, la tagline y el color primario que se muestran en la app.
export const BRAND = {
  bank: 'Acme',
  unit: 'Acme',
  product: 'Cockpit Comercial',
  productAccent: 'Copilot para Banqueros',
  logoUrl: '/brand-logo.svg',
  logoAlt: 'Acme',
  microsoftLogo: '/microsoft.svg',
  tagline: 'El copiloto de IA de la red comercial de bancaseguros',
  primaryHex: '#0D9488',
  caseId: 'SC-01',
  caseTitle: 'Dashboard comercial y agente de Teams para banqueros',
} as const;

// Stack Microsoft que se muestra en el reveal tecnológico.
export interface TechBadge {
  logo: string;          // ruta a svg en /public/logos
  name: string;
  role: string;
}

export const MS_STACK: TechBadge[] = [
  { logo: '/logos/copilot.svg',        name: 'Microsoft 365 Copilot',     role: 'Agente conversacional embebido en el flujo del banquero' },
  { logo: '/logos/teams.svg',          name: 'Microsoft Teams',           role: 'Superficie de entrega: el agente vive donde trabaja el banquero' },
  { logo: '/logos/foundry.svg',        name: 'Azure AI Foundry',          role: 'Orquestación de agentes con Microsoft Agent Framework' },
  { logo: '/logos/azure-openai.svg',   name: 'Azure OpenAI',              role: 'Razonamiento, next best action y generación de propuestas' },
  { logo: '/logos/cosmos-db.svg',      name: 'Azure Cosmos DB',           role: 'Señales de cliente, propensión y estado del pipeline' },
  { logo: '/logos/power-bi.svg',       name: 'Power BI / Fabric',         role: 'KPIs comerciales, gamificación y ranking en tiempo real' },
  { logo: '/logos/entra.svg',          name: 'Microsoft Entra ID',        role: 'Identidad corporativa, roles y gobierno de acceso' },
  { logo: '/logos/api-management.svg', name: 'Azure API Management',      role: 'AI Gateway: políticas, límites de tokens y auditoría' },
];

export type Tone = 'red' | 'emerald' | 'amber' | 'blue' | 'violet' | 'slate';
