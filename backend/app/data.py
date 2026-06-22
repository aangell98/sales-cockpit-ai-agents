"""Datos ficticios para el backend EN VIVO: clientes que el agente NBA analiza
y un flujo de señales para el feed en tiempo real. Todo ilustrativo para demo."""

from __future__ import annotations

import random

# ── Clientes candidatos a Next Best Action ─────────────────────────────────────
# El agente NBA recibe el perfil + señales y razona en vivo la mejor acción.
CLIENTS: list[dict] = [
    {
        "id": "cli-carlos",
        "name": "Carlos Méndez Ruiz",
        "initials": "CM",
        "segment": "Particular · Select",
        "age": 41,
        "products": ["Cuenta nómina", "Hipoteca", "Tarjeta"],
        "signals": [
            "Firmó hipoteca de 185.000 € hace 9 días",
            "Sin póliza de Hogar activa",
            "Abrió la app 4 veces esta semana",
            "Cliente Select desde 2019",
        ],
        "context": "Acaba de comprar vivienda. Ventana óptima de venta cruzada de Hogar.",
    },
    {
        "id": "cli-lucia",
        "name": "Lucía Fernández Gil",
        "initials": "LF",
        "segment": "Particular · Premium",
        "age": 34,
        "products": ["Cuenta nómina", "Fondos", "Tarjeta premium"],
        "signals": [
            "Alta de beneficiario recién nacido en CRM",
            "Búsquedas de 'cuadro médico' en la web",
            "Sin Salud familiar",
            "Ingresos estables 24 meses",
        ],
        "context": "Evento vital de alta intención (nacimiento). Salud familiar.",
    },
    {
        "id": "cli-talleres",
        "name": "Grupo Talleres Vega S.L.",
        "initials": "TV",
        "segment": "Empresa · Pyme",
        "age": None,
        "products": ["Cuenta empresa", "TPV", "Flota Auto (6 vehículos)"],
        "signals": [
            "Renovación de flota en 21 días",
            "Consultó una baja parcial",
            "Sin multirriesgo de comercio",
            "Competidor envió oferta (riesgo de fuga)",
        ],
        "context": "Riesgo de fuga de flota. Defender renovación + cross multirriesgo.",
    },
    {
        "id": "cli-javier",
        "name": "Javier Ortega Soto",
        "initials": "JO",
        "segment": "Particular · Estándar",
        "age": 38,
        "products": ["Cuenta nómina", "Plan de pensiones"],
        "signals": [
            "Nómina domiciliada +18% (últimos 3 meses)",
            "38 años, sin seguro de Vida",
            "Visitó el simulador de Vida",
            "Plan de pensiones activo",
        ],
        "context": "Subida de ingresos. Perfil idóneo para Vida-Ahorro.",
    },
    {
        "id": "cli-ana",
        "name": "Ana Belén Crespo",
        "initials": "AC",
        "segment": "Particular · Select",
        "age": 60,
        "products": ["Cuenta nómina", "Hogar", "Auto", "Tarjeta"],
        "signals": [
            "Cumple 60 años este mes",
            "Alta vinculación (3 productos)",
            "Sin seguro de Decesos",
            "Reside con cónyuge",
        ],
        "context": "Tramo de edad de máxima contratación de Decesos. Cliente muy vinculada.",
    },
]

CLIENT_BY_ID = {c["id"]: c for c in CLIENTS}

# ── Catálogo de productos (para validar/normalizar la salida del agente) ────────
PRODUCTS = ["Hogar", "Auto", "Vida", "Vida-Ahorro", "Salud", "Decesos",
            "Protección de Pagos", "Mascotas", "Multirriesgo Comercio"]

# ── Señales para el feed EN VIVO (radar de oportunidades) ───────────────────────
_SIGNAL_POOL: list[dict] = [
    {"client": "Marta Ruiz Vega", "signal": "Hipoteca formalizada (210.000 €)", "product": "Hogar", "heat": "hot"},
    {"client": "Óscar Pardo León", "signal": "Nuevo préstamo personal de 18.000 €", "product": "Protección de Pagos", "heat": "warm"},
    {"client": "Familia Soler", "signal": "3 pagos recientes a clínica veterinaria", "product": "Mascotas", "heat": "cool"},
    {"client": "Inés Caballero", "signal": "Alta de beneficiario recién nacido", "product": "Salud", "heat": "hot"},
    {"client": "Distribuciones Nogal", "signal": "Renovación de flota en 18 días", "product": "Auto", "heat": "hot"},
    {"client": "Raúl Jiménez", "signal": "Nómina domiciliada +22%", "product": "Vida-Ahorro", "heat": "warm"},
    {"client": "Carmen Ortiz", "signal": "Cumple 60 años este mes", "product": "Decesos", "heat": "warm"},
    {"client": "Hugo Ferrer", "signal": "Visitó el simulador de Hogar 3 veces", "product": "Hogar", "heat": "warm"},
    {"client": "Lorena Vidal", "signal": "Solicitó baja de Auto (motivo: precio)", "product": "Auto", "heat": "hot"},
    {"client": "Pablo Sáez", "signal": "Compra de vivienda detectada (PFM)", "product": "Hogar", "heat": "hot"},
    {"client": "Bar La Esquina S.L.", "signal": "Apertura de nuevo local", "product": "Multirriesgo Comercio", "heat": "warm"},
    {"client": "Nuria Gallego", "signal": "Búsquedas de cuadro médico en la app", "product": "Salud", "heat": "warm"},
]


def random_signal() -> dict:
    """Devuelve una señal aleatoria del pool para el feed en vivo."""
    return dict(random.choice(_SIGNAL_POOL))


def client_summary() -> list[dict]:
    """Versión ligera de los clientes para el selector del frontend."""
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "initials": c["initials"],
            "segment": c["segment"],
            "signals": c["signals"],
            "context": c["context"],
        }
        for c in CLIENTS
    ]
