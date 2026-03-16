# README_DESARROLLO.md
## Insane Barber — Guía de desarrollo del sistema

---

# 1. Objetivo de este archivo

Este documento guía el desarrollo técnico del sistema web **Insane Barber**, pensado como tesis de grado.

Este README cubre:

- arquitectura del sistema
- stack tecnológico
- estructura del proyecto
- orden de desarrollo
- módulos
- base de datos
- pruebas
- reportes
- entregables técnicos

La UTIC exige módulos funcionales, herramientas libres, base de datos permitida y elaboración de informes web. También prohíbe generadores de código. :contentReference[oaicite:1]{index=1}

---

# 2. Definición del proyecto

## Nombre
**Insane Barber**

## Tipo de sistema
Sistema web de gestión para barbería.

## Stack
- JavaScript full stack
- PostgreSQL

## Módulos
1. Gestión de Servicios
2. Agenda y Clientes
3. Caja y Ventas

---

# 3. Objetivo general del sistema

Desarrollar un sistema web para administrar los servicios, turnos, clientes, cobros y reportes operativos de la barbería Insane Barber.

---

# 4. Alcance técnico

## Incluye
- autenticación
- roles
- CRUD de clientes
- CRUD de servicios
- promociones
- descuentos
- reclamos con seguimiento
- presupuestos
- registro de insumos utilizados
- agenda de turnos
- asignación de barbero
- historial de atención
- recordatorios de turno
- apertura y cierre de caja
- movimientos de caja
- cobros por efectivo y Dpago
- libro de ventas
- notas de crédito y débito
- generación e impresión de comprobantes
- recaudaciones a depositar
- reportes web

## No incluye
- app móvil
- integración con facturación electrónica
- integración automática con WhatsApp
- RRHH
- contabilidad avanzada
- delivery

---

# 5. Stack recomendado

## Frontend
- Next.js
- React
- Tailwind CSS

## Backend
- Node.js
- Express

## Base de datos
- PostgreSQL

## ORM
- Prisma

## Autenticación
- JWT

## Utilidades opcionales
- Zod
- React Hook Form
- Axios
- date-fns

---

# 6. Estructura del proyecto

insane-barber/
├── README.md
├── README_DIAGRAMAS.md
├── README_DESARROLLO.md
├── docs/
├── frontend/
├── backend/
└── database/

## Estructura del frontend

frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── modules/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/

## Estructura del backend

backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   ├── modules/
│   ├── lib/
│   ├── utils/
│   └── config/

## Estructura de database

database/
├── schema.sql
├── seed.sql
├── prisma/
└── diccionario-datos.md

---

# 7. Entidades principales del sistema

- rol
- usuario
- cliente
- barbero
- servicio
- turno
- promocion
- reclamo
- caja
- movimiento_caja
- pago
- presupuesto
- detalle_presupuesto
- insumo
- insumo_utilizado
- nota_credito_debito
- libro_ventas

---

# 8. Roles del sistema

## Administrador
Puede gestionar todo el sistema:
- usuarios
- clientes
- servicios
- promociones
- reclamos
- agenda
- caja
- reportes

## Recepcionista
Puede:
- registrar clientes
- agendar turnos
- confirmar o cancelar turnos
- registrar cobros
- operar caja
- consultar reportes operativos

## Barbero
Puede:
- ver sus turnos
- registrar atención
- revisar historial de servicios asignados

---

# 9. Módulo 1 — Gestión de Servicios

## Objetivo
Administrar el catálogo y operación básica de los servicios de la barbería.

## Funcionalidades
- registrar servicio
- editar servicio
- eliminar o desactivar servicio
- listar servicios
- registrar promociones
- registrar descuentos
- registrar reclamos con control de seguimiento del cliente
- registrar e imprimir presupuesto
- registrar insumos utilizados por servicio
- generar orden de servicio
- consultar informes web

## Pantallas sugeridas
- listado de servicios
- formulario de servicio
- promociones
- descuentos
- reclamos (con historial de seguimiento)
- presupuestos
- formulario de presupuesto
- insumos
- detalle de insumos utilizados por turno

## Endpoints sugeridos
- `GET /services`
- `POST /services`
- `PATCH /services/:id`
- `DELETE /services/:id`
- `GET /promotions`
- `POST /promotions`
- `PATCH /promotions/:id`
- `GET /discounts`
- `POST /discounts`
- `GET /complaints`
- `POST /complaints`
- `PATCH /complaints/:id`
- `GET /complaints/:id/follow-ups`
- `POST /complaints/:id/follow-ups`
- `GET /budgets`
- `POST /budgets`
- `GET /budgets/:id`
- `GET /budgets/:id/pdf`
- `GET /supplies`
- `POST /supplies`
- `PATCH /supplies/:id`
- `POST /supplies/usage`
- `GET /supplies/usage?turnoId=`

---

# 10. Módulo 2 — Agenda y Clientes

## Objetivo
Gestionar clientes, turnos y asignación operativa.

## Funcionalidades
- registrar cliente
- editar cliente
- listar clientes
- crear turno
- confirmar turno
- cancelar turno
- reagendar turno
- asignar barbero
- registrar observaciones
- ver historial de servicios
- gestionar recordatorios de turno
- emitir informes web

## Pantallas sugeridas
- listado de clientes
- detalle de cliente
- agenda diaria
- agenda semanal
- formulario de turno
- historial de cliente

## Endpoints sugeridos
- `GET /clients`
- `POST /clients`
- `PATCH /clients/:id`
- `GET /appointments`
- `POST /appointments`
- `PATCH /appointments/:id`
- `PATCH /appointments/:id/confirm`
- `PATCH /appointments/:id/cancel`
- `PATCH /appointments/:id/reschedule`

---

# 11. Módulo 3 — Caja y Ventas

## Objetivo
Controlar cobros, movimientos de caja, libro de ventas y documentos comerciales.

## Funcionalidades
- apertura de caja
- cierre de caja
- registrar cobro (efectivo y Dpago)
- registrar movimiento manual
- ver arqueo
- gestionar cuentas a cobrar (pagos pendientes)
- registrar libro de ventas
- generar recaudaciones a depositar
- emitir notas de crédito
- emitir notas de débito
- generar e imprimir comprobantes de pago (PDF)
- ver resumen diario
- ver ingresos por período
- consultar informes web

## Pantallas sugeridas
- apertura de caja
- caja actual
- movimientos
- cobros
- libro de ventas
- notas de crédito y débito
- comprobante de pago
- recaudaciones a depositar
- cuentas a cobrar
- cierre de caja
- reportes

## Endpoints sugeridos
- `POST /cash-register/open`
- `POST /cash-register/close`
- `GET /cash-register/current`
- `GET /cash-register/collections`
- `POST /payments`
- `GET /payments`
- `GET /payments/:id/receipt`
- `GET /payments/pending`
- `POST /cash-movements`
- `GET /cash-movements`
- `GET /sales-book`
- `POST /credit-debit-notes`
- `GET /credit-debit-notes`

---

# 12. Reportes web obligatorios

La tesis debe incluir informes web. :contentReference[oaicite:2]{index=2}

## Reportes mínimos recomendados
- clientes registrados por período
- turnos por día
- turnos por barbero
- servicios más solicitados
- ingresos diarios
- ingresos mensuales
- arqueo de caja
- reclamos registrados

## Filtros recomendados
- fecha desde
- fecha hasta
- barbero
- servicio
- estado
- método de pago

---

# 13. Orden exacto de desarrollo

## Fase 1 — Preparación
1. crear repositorio
2. crear estructura de carpetas
3. configurar PostgreSQL
4. configurar Prisma
5. definir variables de entorno
6. crear README base

## Fase 2 — Base del sistema
1. crear base de datos
2. crear tablas principales
3. configurar backend Express
4. configurar frontend Next.js
5. configurar autenticación
6. proteger rutas

## Fase 3 — Módulo de servicios
1. CRUD servicios
2. promociones
3. descuentos
4. reclamos con seguimiento
5. presupuestos
6. registro de insumos

## Fase 4 — Módulo de agenda y clientes
1. CRUD clientes
2. agenda
3. creación de turnos
4. confirmación y cancelación
5. asignación de barbero
6. historial
7. recordatorios de turno

## Fase 5 — Módulo de caja y ventas
1. apertura de caja
2. cobros (efectivo + Dpago)
3. movimientos
4. libro de ventas
5. notas de crédito y débito
6. comprobantes PDF
7. recaudaciones a depositar
8. cierre de caja
9. arqueo

## Fase 6 — Reportes
1. reportes por módulo
2. filtros
3. resúmenes diarios y mensuales

## Fase 7 — Pruebas y cierre
1. pruebas funcionales
2. correcciones
3. capturas
4. manual técnico
5. manual de usuario

---

# 14. Base de datos inicial sugerida

## Tablas mínimas
- roles
- usuarios
- clientes
- barberos
- servicios
- turnos
- promociones
- reclamos
- seguimientos_reclamo
- presupuestos
- detalles_presupuesto
- insumos
- insumos_utilizados
- cajas
- movimientos_caja
- pagos
- notas_credito_debito
- libro_ventas

## Reglas clave
- no permitir cobro sin turno válido
- no permitir cierre de caja sin caja abierta
- registrar cada pago como movimiento de caja
- registrar cada pago en el libro de ventas
- mantener estados de turno
- usar borrado lógico donde convenga
- registrar seguimiento en cada cambio de estado del reclamo
- descontar insumos al registrar uso en un turno

---

# 15. Estados sugeridos

## Estado de turno
- pendiente
- confirmado
- cancelado
- atendido

## Estado de caja
- abierta
- cerrada

## Estado de reclamo
- pendiente
- en_proceso
- resuelto

## Estado de presupuesto
- borrador
- enviado
- aprobado
- rechazado

## Estado de nota crédito/débito
- emitida
- anulada

## Estado general de registros
- activo
- inactivo

---

# 16. Flujo principal del sistema

## Flujo 1 — Registrar cliente
1. usuario entra al módulo clientes
2. completa formulario
3. guarda cliente
4. sistema confirma registro

## Flujo 2 — Agendar turno
1. seleccionar cliente
2. seleccionar servicio
3. seleccionar fecha y hora
4. seleccionar barbero
5. verificar disponibilidad
6. guardar turno
7. mostrar confirmación

## Flujo 3 — Registrar atención
1. buscar turno confirmado
2. iniciar atención
3. registrar observaciones si aplica
4. marcar como atendido

## Flujo 4 — Registrar cobro
1. buscar turno atendido
2. calcular monto
3. aplicar descuento si corresponde
4. seleccionar método de pago
5. guardar pago
6. registrar movimiento de caja
7. emitir comprobante visual

## Flujo 5 — Cierre de caja
1. listar ingresos y egresos
2. calcular total
3. ingresar monto final contado
4. comparar con sistema
5. cerrar caja
6. guardar arqueo

---

# 17. Pantallas mínimas del sistema

- login
- dashboard
- usuarios
- clientes
- servicios
- promociones
- descuentos
- reclamos (con seguimiento)
- presupuestos
- insumos
- agenda
- caja
- cobros
- libro de ventas
- notas de crédito y débito
- comprobante de pago
- recaudaciones a depositar
- reportes

---

# 18. API mínima sugerida

## Auth
- `POST /auth/login`
- `GET /auth/me`

## Users
- `GET /users`
- `POST /users`

## Clients
- `GET /clients`
- `POST /clients`
- `PATCH /clients/:id`

## Barbers
- `GET /barbers`
- `POST /barbers`

## Services
- `GET /services`
- `POST /services`
- `PATCH /services/:id`

## Appointments
- `GET /appointments`
- `POST /appointments`
- `PATCH /appointments/:id`
- `PATCH /appointments/:id/confirm`
- `PATCH /appointments/:id/cancel`

## Budgets
- `GET /budgets`
- `POST /budgets`
- `GET /budgets/:id`
- `GET /budgets/:id/pdf`

## Supplies
- `GET /supplies`
- `POST /supplies`
- `PATCH /supplies/:id`
- `POST /supplies/usage`
- `GET /supplies/usage?turnoId=`

## Complaints
- `GET /complaints`
- `POST /complaints`
- `PATCH /complaints/:id`
- `GET /complaints/:id/follow-ups`
- `POST /complaints/:id/follow-ups`

## Payments
- `GET /payments`
- `POST /payments`
- `GET /payments/:id/receipt`
- `GET /payments/pending`

## Cash register
- `POST /cash-register/open`
- `POST /cash-register/close`
- `GET /cash-register/current`
- `GET /cash-register/collections`

## Sales book
- `GET /sales-book`

## Credit/Debit notes
- `POST /credit-debit-notes`
- `GET /credit-debit-notes`

## Reports
- `GET /reports/daily-income`
- `GET /reports/monthly-income`
- `GET /reports/appointments`
- `GET /reports/services`
- `GET /reports/complaints`
- `GET /reports/sales-book`
- `GET /reports/supplies`

---

# 19. Checklist de desarrollo

## Preparación
- [ ] crear repo
- [ ] crear estructura
- [ ] configurar frontend
- [ ] configurar backend
- [ ] configurar PostgreSQL
- [ ] configurar Prisma

## Seguridad
- [ ] login
- [ ] JWT
- [ ] rutas protegidas
- [ ] control por roles

## Módulo servicios
- [ ] CRUD servicios
- [ ] promociones
- [ ] descuentos
- [ ] reclamos con seguimiento
- [ ] presupuestos (crear, imprimir PDF)
- [ ] CRUD insumos
- [ ] registro de insumos utilizados por turno

## Módulo agenda
- [ ] CRUD clientes
- [ ] agenda
- [ ] turnos
- [ ] confirmación
- [ ] cancelación
- [ ] historial
- [ ] recordatorios de turno

## Módulo caja
- [ ] apertura
- [ ] cobros (efectivo + Dpago)
- [ ] movimientos
- [ ] libro de ventas
- [ ] notas de crédito y débito
- [ ] comprobantes PDF
- [ ] recaudaciones a depositar
- [ ] cuentas a cobrar
- [ ] cierre
- [ ] arqueo

## Reportes
- [ ] ingresos diarios
- [ ] ingresos mensuales
- [ ] turnos
- [ ] servicios
- [ ] reclamos
- [ ] libro de ventas
- [ ] insumos utilizados

## Cierre
- [ ] pruebas
- [ ] capturas
- [ ] manual técnico
- [ ] manual de usuario

---

# 20. Pruebas mínimas

## Casos mínimos
- registrar cliente
- registrar servicio
- registrar insumo
- crear presupuesto
- imprimir presupuesto PDF
- crear turno
- confirmar turno
- cancelar turno
- registrar atención
- registrar insumos utilizados en turno
- registrar reclamo con seguimiento
- abrir caja
- registrar pago en efectivo
- registrar pago con Dpago
- generar comprobante PDF
- emitir nota de crédito
- emitir nota de débito
- consultar libro de ventas
- generar recaudaciones a depositar
- cerrar caja
- consultar reporte

## Formato sugerido
- caso
- acción ejecutada
- resultado esperado
- resultado obtenido
- estado

---

# 21. Capturas necesarias para la tesis

- pantalla de login
- dashboard
- listado de clientes
- formulario de cliente
- listado de servicios
- presupuesto creado
- presupuesto PDF
- insumos
- reclamo con seguimiento
- agenda
- creación de turno
- caja abierta
- cobro registrado (efectivo)
- cobro registrado (Dpago)
- comprobante de pago PDF
- libro de ventas
- nota de crédito
- recaudaciones a depositar
- cierre de caja
- reportes

---

# 22. Entregables técnicos finales

- código fuente frontend
- código fuente backend
- base de datos PostgreSQL
- script de creación
- script seed
- manual técnico
- manual de usuario
- capturas
- reportes web funcionales

---

# 23. Reglas para no perder el hilo

1. no programar sin diagrama previo
2. no crear tablas sin validar relaciones
3. trabajar módulo por módulo
4. cerrar cada módulo antes de pasar al siguiente
5. documentar decisiones importantes
6. guardar capturas durante el desarrollo
7. actualizar este README cuando cambie el alcance

---

# 24. Orden diario recomendado

## Día típico de trabajo
1. revisar objetivo del módulo
2. revisar diagrama relacionado
3. revisar tablas implicadas
4. implementar backend
5. implementar frontend
6. probar flujo
7. guardar captura
8. anotar pendientes

---

# 25. Resultado esperado

Cuando este README esté cumplido, deberías tener:
- sistema funcional web
- 3 módulos completos
- reportes web listos
- base de datos consistente
- evidencia para la tesis y la defensa

---

# 26. Integración de Pagos — API Dpago

## Objetivo
Integrar la pasarela de pagos **Dpago** como método de pago digital dentro del Módulo 3 (Caja y Ventas), permitiendo cobros electrónicos además del cobro en efectivo.

## URL base
```
https://api.dpago.com
```

## Plataformas de pago disponibles

| ID | Plataforma |
|----|------------|
| 1  | Tigo |
| 2  | Personal |
| 3  | Wally |
| 4  | Zimple |
| 5  | Tarjeta de crédito |
| 6  | QR |
| 7  | Transferencia bancaria |
| 8  | Infonet |
| 9  | Pago express |

---

## 26.1 Endpoint: Crear Transacción

- **Método:** POST
- **Ruta:** `https://api.dpago.com/transactions`
- **Descripción:** Crea una nueva transacción de pago.

### Cuerpo de solicitud (JSON)

```json
{
  "amount": 50000,
  "description": "Corte de cabello + barba",
  "reference": "TURNO-00123",
  "withInvoice": false,
  "customer": {
    "email": "cliente@ejemplo.com",
    "identification": "12345678",
    "name": "Juan Pérez",
    "phone": "+595981123456"
  },
  "token": "<SHA256(reference + amount + publicToken)>",
  "platformId": 1,
  "commerceId": 1
}
```

### Generación del token

El token se genera con SHA256 concatenando: `reference + amount + publicToken`.
El `publicToken` se obtiene del panel de desarrollo del comercio en Dpago.

```javascript
const token = CryptoJS.SHA256(reference + amount + publicToken).toString();
```

### Respuesta exitosa (200)

```json
{
  "reference": "DPAGO-REF-456",
  "error": null,
  "redirectUrl": "https://pay.dpago.com/..."
}
```

- `reference` — referencia de Dpago para seguimiento
- `redirectUrl` — URL a donde redirigir al cliente para completar el pago

### Respuesta de error (400 / 500)

Objeto de error con detalles del problema.

### Ejemplo de implementación

```javascript
async function createTransaction(transactionData) {
  const { reference, amount, publicToken, ...rest } = transactionData;
  const token = CryptoJS.SHA256(reference + amount + publicToken).toString();

  const response = await fetch('https://api.dpago.com/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...rest, reference, amount, token }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}
```

---

## 26.2 Endpoint: Obtener Transacción

- **Método:** GET
- **Ruta:** `https://api.dpago.com/transactions/:reference`
- **Descripción:** Obtiene los detalles de una transacción usando la referencia de Dpago o el ID interno.

### Respuesta exitosa (200)

```json
{
  "id": 456,
  "accredited": 47500,
  "amount": 50000,
  "commerceReference": "TURNO-00123",
  "description": "Corte de cabello + barba",
  "fee": 2500,
  "error": null,
  "createdAt": "2026-03-12T10:00:00Z",
  "updatedAt": "2026-03-12T10:01:00Z",
  "invoice": null,
  "isTest": false,
  "isWithDrawal": false,
  "status": "completed",
  "customer": {
    "email": "cliente@ejemplo.com",
    "identification": "12345678",
    "name": "Juan Pérez",
    "phone": "+595981123456"
  },
  "platform": {
    "id": 1,
    "name": "Tigo",
    "logo": "https://...",
    "type": "mobile"
  },
  "commerce": {
    "id": 1,
    "name": "Insane Barber"
  }
}
```

### Estados de transacción
- `completed` — pago completado
- `refused` — pago rechazado
- `pending` — pago pendiente
- `incomplete` — pago incompleto
- `reversed` — pago revertido

### Ejemplo de implementación

```javascript
async function getTransaction(reference) {
  const response = await fetch(`https://api.dpago.com/transactions/${reference}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}
```

---

## 26.3 Endpoint: Crear Link de Pago

- **Método:** POST
- **Ruta:** `https://api.dpago.com/transactions/link`
- **Descripción:** Genera un link de pago donde el cliente elige la plataforma.

### Cuerpo de solicitud (JSON)

```json
{
  "commerceId": 1,
  "amount": 50000,
  "description": "Corte de cabello + barba",
  "isTest": false
}
```

### Respuesta exitosa (200)

```json
{
  "link": "https://pay.dpago.com/link/..."
}
```

### Ejemplo de implementación

```javascript
async function createPaymentLink(linkData) {
  const response = await fetch('https://api.dpago.com/transactions/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(linkData),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.link;
}
```

---

## 26.4 Flujo de pago con Dpago en Insane Barber

1. Recepcionista selecciona turno atendido
2. Sistema calcula monto (con descuento si aplica)
3. Recepcionista selecciona método de pago:
   - **Efectivo** → cobro directo, registra movimiento de caja
   - **Dpago** → sistema crea transacción o link de pago
4. Si es Dpago:
   - se envía POST a `/transactions` o `/transactions/link`
   - se redirige al cliente o se muestra QR/link
   - se consulta GET `/transactions/:reference` para verificar estado
   - si `status === "completed"` → se registra pago y movimiento de caja
   - si `status === "refused"` o `"reversed"` → se notifica error
5. Se emite comprobante visual

## 26.5 Métodos de pago soportados en el sistema

| Método | Tipo | Implementación |
|--------|------|----------------|
| Efectivo | Manual | Registro directo en caja |
| Tigo Money | Dpago | `platformId: 1` |
| Personal Pay | Dpago | `platformId: 2` |
| Wally | Dpago | `platformId: 3` |
| Zimple | Dpago | `platformId: 4` |
| Tarjeta de crédito | Dpago | `platformId: 5` |
| QR | Dpago | `platformId: 6` |
| Transferencia bancaria | Dpago | `platformId: 7` |
| Infonet | Dpago | `platformId: 8` |
| Pago Express | Dpago | `platformId: 9` |

## 26.6 Endpoints del backend para integrar Dpago

- `POST /api/payments/dpago` → crea transacción en Dpago y registra pago pendiente
- `POST /api/payments/dpago/link` → genera link de pago
- `GET /api/payments/dpago/:reference` → consulta estado de transacción
- `POST /api/payments/dpago/webhook` → recibe notificación de Dpago (opcional)

## 26.7 Variables de entorno necesarias

```env
DPAGO_API_URL=https://api.dpago.com
DPAGO_PUBLIC_TOKEN=<tu-public-token>
DPAGO_COMMERCE_ID=<tu-commerce-id>
```

## 26.8 Dependencia necesaria

```bash
npm install crypto-js
```

Para generar el token SHA256 en el backend:

```javascript
const CryptoJS = require('crypto-js');
const token = CryptoJS.SHA256(reference + amount + publicToken).toString();
```

## 26.9 Notas importantes

- El `publicToken` se obtiene del panel de desarrollo de Dpago
- Siempre verificar el estado de la transacción antes de marcar un pago como completado
- Usar `isTest: true` durante desarrollo para no generar cobros reales
- Registrar cada pago de Dpago como movimiento de caja automáticamente
- Guardar la `reference` de Dpago en la tabla `pagos` para trazabilidad