# Base de conocimiento · Acme (demo)

> Corpus ficticio orientado a demo. Cifras, cláusulas y referencias son ilustrativas.
> El agente Copilot para banqueros responde **citando** estos documentos. No es producto real.

---

## DOC-HOGAR · Condicionado Seguro de Hogar Acme (ed. 2026)

### [Hogar §4.2] Daños por Agua
La cobertura de **Daños por Agua** ampara los daños materiales causados por fugas,
roturas o desbordamientos de instalaciones de agua, incluidas las procedentes de
**viviendas colindantes** (p. ej. el vecino de arriba). Cubre continente y contenido del
asegurado, así como la **localización y reparación de la avería** en la vivienda asegurada.
La reparación en el origen (vivienda del vecino) corresponde a la póliza de dicho vecino.
- Franquicia: **0 €** en modalidades **Confort** y **Premium**; 90 € en modalidad Básica.
- Límite de contenido: hasta el capital asegurado declarado.

### [Hogar §4.5] Responsabilidad Civil
Cubre daños a terceros derivados de la vivienda hasta **600.000 €**. Incluye daños por agua
que el asegurado cause a vecinos.

### [Hogar §6.1] Asistencia 24h
Manitas, cerrajería de urgencia, fontanería y electricidad. Sin coste hasta 3 servicios/año.

### [Hogar §7.3] Reposición a nuevo
El contenido se indemniza a **valor de reposición a nuevo** (sin depreciación) durante los
primeros 5 años de antigüedad del bien.

---

## DOC-SALUD · Condicionado Seguro de Salud Acme (ed. 2026)

### [Salud Anexo II] Carencias
Periodos de carencia desde el alta:
- **Urgencias y accidentes: sin carencia** (cobertura desde el día 1).
- Asistencia primaria y especialistas: **sin carencia**.
- Pruebas diagnósticas de alta tecnología: **3 meses**.
- **Cirugía programada: 6 meses**.
- **Parto: 8 meses**.
La carencia puede **eliminarse** aportando el certificado de la póliza anterior si el cliente
procede de otra compañía, por **continuidad de coberturas** (política v3.1).

### [Salud §2.4] Cuadro médico
Más de 43.000 profesionales y los principales hospitales privados. En Madrid incluye los
centros de referencia. Acceso por app sin volante para primaria.

### [Salud §9] Copagos
Modalidad con copago: 3 €/acto de primaria, 6 €/especialista. Modalidad sin copago disponible.

---

## DOC-AUTO · Condicionado Seguro de Auto Acme (ed. 2026)

### [Auto §3] Modalidades
Terceros, Terceros Ampliado (lunas, robo, incendio) y Todo Riesgo con/sin franquicia.

### [Auto §5.2] Asistencia en viaje
Desde el **kilómetro 0** (incluida la propia vivienda). Vehículo de sustitución hasta 15 días
en Todo Riesgo.

### [Playbook R-Auto v2] Retención de bajas de Auto
Flujo recomendado ante una solicitud de baja:
1. Identificar el **motivo** real. En el **68%** de los casos es **precio**.
2. Ofrecer **revisión de coberturas** y ajuste de franquicia (puede bajar la prima 10–18%).
3. Aplicar el **descuento de fidelidad multiproducto** si el cliente tiene **2+ ramos**.
4. Si persiste, ofrecer **pausa de 30 días** en lugar de baja definitiva.
Retención media aplicando el flujo completo: **41%**.

---

## DOC-VIDA · Seguro de Vida y Vida-Ahorro Acme (ed. 2026)

### [Vida §2] Coberturas
Fallecimiento e invalidez. Vida-Ahorro combina protección con ahorro a medio/largo plazo
con fiscalidad favorable (reducción en base imponible según normativa vigente).

### [Vida §4.1] Sin reconocimiento médico
Hasta **60.000 €** de capital sin reconocimiento médico (declaración de salud simplificada),
para edades de hasta 50 años.

---

## DOC-DECESOS · Seguro de Decesos Acme (ed. 2026)

### [Decesos §1] Prestación
Servicio funerario completo + asistencia a la familia + gestión de trámites. Capital adicional
opcional. Sin límite de edad de permanencia.

---

## DOC-INC · Plan de Incentivos Comercial FY26 (uso interno red)

### [Incentivos · Tabla por ramo]
Retribución comercial sobre prima (primer año / recurrente):
- **Hogar**: 22% / 4%
- **Salud**: 18% / 5%
- **Auto**: 14% / 4%
- **Vida-Ahorro**: **50% / 3%** (incentivo de captación)
- **Decesos**: 30% / 6%
- **Protección de Pagos (CPI)**: 25% / 3%
- **Mascotas**: 20% / 4%

Ejemplos:
- Vida-Ahorro, prima 720 €/año → comisión primer año ≈ **360 €**.
- Hogar, prima 540 €/año → comisión primer año ≈ **119 €**.

### [Incentivos · Liquidación]
Los incentivos se **liquidan mensualmente** con la nómina del mes siguiente al alta efectiva
de la póliza (tras superar el periodo de desistimiento de 14 días). Los puntos de gamificación
se actualizan en tiempo real en el ranking territorial.

### [Incentivos · Gamificación]
Cada póliza suma puntos según ramo y dificultad. Bonus por **multiproducto** (5 ramos distintos
en un mes) y por **racha** (días consecutivos cumpliendo acciones IA). Top 1% accede al Club Diamante.

---

## DOC-NBA · Next Best Action · Modelo de propensión (gobernanza)

### [NBA §1] Qué es
El motor de **Next Best Action** prioriza, para cada banquero, los clientes con mayor
probabilidad de contratar un producto concreto, cruzando señales de CRM, transaccionales y
de comportamiento. Devuelve: producto, **propensión (0–100)**, motivo, señales, canal y
momento óptimos y un guion sugerido.

### [NBA §2] Señales típicas
Hipoteca formalizada, nacimiento/alta de beneficiario, subida de nómina, renovación de flota,
cumpleaños en tramos clave, nuevo préstamo, gasto recurrente (PFM), visitas a simuladores.

### [NBA §3] Gobernanza y cumplimiento
- **Explicabilidad**: toda recomendación incluye el porqué y las señales usadas (auditable).
- **Human-in-the-loop**: el banquero decide; la IA nunca contrata por su cuenta.
- **Protección de datos**: tratamiento conforme a RGPD; solo datos con base legal y consentimiento.
- **Sin sesgos prohibidos**: el modelo no usa variables sensibles (salud, ideología, etc.).
- **Trazabilidad**: cada interacción del Copilot queda registrada (quién, cuándo, qué fuente).

---

## DOC-RET · Retención y vinculación

### [Retención §2] Descuento de fidelidad multiproducto
Clientes con **2 ramos**: −5% en la cartera; **3+ ramos**: −10% y prioridad en asistencia.
La vinculación multiproducto reduce la tasa de fuga anual del 14% al **4%**.

---

## DOC-PROC · Procesos y tramitación

### [Proceso · Parte de siniestro Hogar por agua]
Documentación a pedir al cliente: fotos del daño, fecha del suceso, datos del vecino origen
(si aplica), y factura/presupuesto de reparación. El parte se abre desde la app o la oficina;
la asistencia 24h se activa en el momento.
