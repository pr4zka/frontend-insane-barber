# Manual Técnico - Insane Barber

## 1. Arquitectura del Sistema

### 1.1 Patrón Arquitectónico
El sistema utiliza una arquitectura **Cliente-Servidor** con separación completa entre frontend y backend (API REST).

```
┌─────────────────┐     HTTP/JSON      ┌─────────────────┐     SQL      ┌──────────────┐
│    Frontend     │ ◄──────────────► │    Backend      │ ◄─────────► │  PostgreSQL   │
│   (Next.js)     │    Puerto 3001     │   (NestJS)      │  Puerto 5432  │   Database    │
│   React 19      │                    │   TypeScript     │              │              │
└─────────────────┘                    └─────────────────┘              └──────────────┘
```

### 1.2 Stack Tecnológico

| Capa | Tecnología | Versión | Licencia |
|------|-----------|---------|----------|
| Frontend | Next.js | 16.1.6 | MIT |
| UI Framework | React | 19.2.3 | MIT |
| Lenguaje | TypeScript | 5.x | Apache 2.0 |
| Backend | NestJS | 10.x | MIT |
| ORM | Prisma | 7.5.0 | Apache 2.0 |
| Base de Datos | PostgreSQL | 16+ | PostgreSQL License |
| Autenticación | JWT (passport-jwt) | 4.0.1 | MIT |
| Documentación API | Swagger | 11.2.6 | MIT |
| Generación PDF | jsPDF | 4.2.0 | MIT |
| Estilos | Tailwind CSS | 4.x | MIT |

Todas las herramientas utilizadas son de **código abierto** con licencias libres (MIT, Apache 2.0, PostgreSQL License).

### 1.3 Estructura de Directorios

```
tesis-code/
├── backend/                    # API REST (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de datos (25 entidades)
│   │   └── migrations/         # Migraciones de BD
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/     # @Roles()
│   │   │   ├── filters/        # Manejo global de excepciones
│   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   └── interceptors/   # DecimalTransformInterceptor
│   │   ├── modules/            # 17 módulos de negocio
│   │   │   ├── auth/           # Autenticación JWT
│   │   │   ├── users/          # Gestión de usuarios
│   │   │   ├── clients/        # Gestión de clientes
│   │   │   ├── barbers/        # Gestión de barberos
│   │   │   ├── services/       # Catálogo de servicios
│   │   │   ├── appointments/   # Agenda y turnos
│   │   │   ├── promotions/     # Promociones
│   │   │   ├── discounts/      # Descuentos
│   │   │   ├── complaints/     # Reclamos y seguimiento
│   │   │   ├── budgets/        # Presupuestos
│   │   │   ├── supplies/       # Insumos
│   │   │   ├── cash-register/  # Caja y movimientos
│   │   │   ├── payments/       # Cobros y pagos
│   │   │   ├── credit-debit-notes/ # Notas C/D ventas
│   │   │   ├── sales-book/     # Libro de ventas
│   │   │   ├── purchases/      # Módulo de compras
│   │   │   └── reports/        # Reportes e informes
│   │   ├── prisma/             # Servicio Prisma
│   │   ├── app.module.ts       # Módulo raíz
│   │   └── main.ts             # Punto de entrada
│   └── package.json
├── frontend/                   # Aplicación Web (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Páginas de autenticación
│   │   │   │   └── login/
│   │   │   └── (dashboard)/    # Páginas del sistema
│   │   │       ├── dashboard/
│   │   │       ├── servicios/
│   │   │       ├── promociones/
│   │   │       ├── descuentos/
│   │   │       ├── reclamos/
│   │   │       ├── presupuestos/
│   │   │       ├── insumos/
│   │   │       ├── clientes/
│   │   │       ├── agenda/
│   │   │       ├── caja/
│   │   │       ├── cobros/
│   │   │       ├── libro-ventas/
│   │   │       ├── notas/
│   │   │       ├── recaudaciones/
│   │   │       ├── notas-remision-venta/
│   │   │       ├── proveedores/
│   │   │       ├── ordenes-compra/
│   │   │       ├── libro-compras/
│   │   │       ├── notas-remision/
│   │   │       ├── notas-cd-compra/
│   │   │       ├── ajustes-compra/
│   │   │       ├── usuarios/
│   │   │       └── reportes/
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, header
│   │   │   ├── shared/         # Componentes reutilizables
│   │   │   └── ui/             # Componentes base (shadcn/ui)
│   │   ├── hooks/              # Custom hooks (useAuth)
│   │   ├── lib/                # Utilidades (api, pdf, constants)
│   │   ├── services/           # Servicios HTTP
│   │   ├── stores/             # Estado global (Zustand)
│   │   └── types/              # Interfaces TypeScript
│   └── package.json
└── docs/                       # Documentación
    ├── MANUAL_USUARIO.md
    ├── MANUAL_TECNICO.md
    └── diagramas/              # Diagramas UML (Mermaid)
```

## 2. Requisitos de Instalación

### 2.1 Requisitos de Software

| Software | Versión Mínima | Propósito |
|----------|---------------|-----------|
| Node.js | 20.x | Runtime JavaScript |
| npm | 10.x | Gestor de paquetes |
| PostgreSQL | 16.x | Base de datos |
| Git | 2.x | Control de versiones |

### 2.2 Requisitos de Hardware (mínimo)

| Componente | Mínimo | Recomendado |
|-----------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disco | 2 GB libres | 5 GB libres |
| Red | Conexión local | LAN/Internet |

## 3. Guía de Instalación

### 3.1 Clonar el repositorio
```bash
git clone <url-repositorio> insane-barber
cd insane-barber
```

### 3.2 Configurar la base de datos
```bash
# Crear la base de datos en PostgreSQL
psql -U postgres
CREATE DATABASE insane_barber;
\q
```

### 3.3 Configurar el backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los datos de conexión:
# DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/insane_barber"
# JWT_SECRET="clave-secreta-jwt"

# Ejecutar migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Compilar
npx nest build

# Iniciar servidor (desarrollo)
npm run start:dev

# Iniciar servidor (producción)
npm run start:prod
```

### 3.4 Configurar el frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Iniciar (desarrollo)
npm run dev

# Compilar para producción
npm run build
npm run start
```

### 3.5 Acceso al sistema
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs

### 3.6 Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@insanebarber.com | admin123 |
| Recepcionista | recepcion@insanebarber.com | recep123 |
| Barbero | carlos@insanebarber.com | barbero123 |

## 4. Modelo de Datos

### 4.1 Resumen de Entidades (25 tablas)

| Módulo | Entidad | Descripción |
|--------|---------|-------------|
| Sistema | roles | Roles del sistema |
| Sistema | usuarios | Usuarios con autenticación |
| Servicios | servicios | Catálogo de servicios |
| Servicios | promociones | Promociones vigentes |
| Servicios | descuentos | Descuentos aplicables |
| Servicios | reclamos | Reclamos de clientes |
| Servicios | seguimientos_reclamo | Seguimiento de reclamos |
| Servicios | presupuestos | Presupuestos para clientes |
| Servicios | detalles_presupuesto | Líneas del presupuesto |
| Servicios | insumos | Materiales e insumos |
| Servicios | insumos_utilizados | Uso de insumos por turno |
| Agenda | clientes | Base de clientes |
| Agenda | barberos | Barberos del local |
| Agenda | turnos | Turnos agendados |
| Caja | cajas | Apertura/cierre de caja |
| Caja | movimientos_caja | Movimientos de caja |
| Caja | pagos | Cobros realizados |
| Caja | notas_credito_debito | Notas C/D sobre pagos |
| Caja | libro_ventas | Libro de ventas |
| Caja | notas_remision_venta | Notas de remisión de venta |
| Compras | proveedores | Proveedores de insumos |
| Compras | ordenes_compra | Órdenes de compra |
| Compras | detalles_orden_compra | Líneas de la orden |
| Compras | libro_compras | Libro de compras |
| Compras | notas_remision | Notas de remisión (compras) |
| Compras | notas_cd_compra | Notas C/D de compras |
| Compras | ajustes_compra | Ajustes sobre compras |

### 4.2 Relaciones Principales

- Un **Cliente** puede tener muchos **Turnos**, **Reclamos** y **Presupuestos**
- Un **Turno** pertenece a un **Cliente**, **Barbero** y **Servicio**
- Un **Turno** puede generar un **Pago** y una **NotaRemisiónVenta**
- Un **Pago** puede tener una **Promoción** o **Descuento** aplicado (opcional, mutuamente excluyentes)
- Un **Pago** se registra automáticamente en el **LibroVentas**
- Una **Caja** registra múltiples **MovimientosCaja**
- Un **Proveedor** recibe múltiples **ÓrdenesCompra**
- Al recibir una orden, se actualiza el **stock** de insumos, se crea un registro en **LibroCompras** y se genera una **NotaRemisión**

## 5. API REST

### 5.1 Autenticación
Todas las rutas (excepto `/auth/login`) requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

### 5.2 Endpoints (60+ endpoints)

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Auth | POST | /auth/login | Iniciar sesión |
| Auth | GET | /auth/me | Obtener usuario actual |
| Usuarios | GET | /users | Listar usuarios |
| Usuarios | POST | /users | Crear usuario |
| Clientes | GET | /clients | Listar clientes |
| Clientes | POST | /clients | Crear cliente |
| Clientes | PATCH | /clients/:id | Editar cliente |
| Barberos | GET | /barbers | Listar barberos |
| Servicios | GET | /services | Listar servicios |
| Servicios | POST | /services | Crear servicio |
| Servicios | PATCH | /services/:id | Editar servicio |
| Turnos | GET | /appointments | Listar turnos |
| Turnos | POST | /appointments | Crear turno |
| Turnos | PATCH | /appointments/:id | Editar turno |
| Turnos | PATCH | /appointments/:id/confirm | Confirmar turno |
| Turnos | PATCH | /appointments/:id/cancel | Cancelar turno |
| Promociones | GET | /promotions | Listar promociones |
| Promociones | POST | /promotions | Crear promoción |
| Descuentos | GET | /discounts | Listar descuentos |
| Descuentos | POST | /discounts | Crear descuento |
| Reclamos | GET | /complaints | Listar reclamos |
| Reclamos | POST | /complaints | Crear reclamo |
| Reclamos | GET | /complaints/:id/follow-ups | Ver seguimiento |
| Reclamos | POST | /complaints/:id/follow-ups | Agregar seguimiento |
| Presupuestos | GET | /budgets | Listar presupuestos |
| Presupuestos | POST | /budgets | Crear presupuesto |
| Presupuestos | GET | /budgets/:id | Ver presupuesto |
| Insumos | GET | /supplies | Listar insumos |
| Insumos | POST | /supplies | Crear insumo |
| Insumos | POST | /supplies/usage | Registrar uso |
| Caja | GET | /cash-register/current | Caja actual |
| Caja | POST | /cash-register/open | Abrir caja |
| Caja | POST | /cash-register/close | Cerrar caja |
| Caja | GET | /cash-register/collections | Recaudaciones |
| Movimientos | POST | /cash-movements | Crear movimiento |
| Pagos | GET | /payments | Listar pagos |
| Pagos | POST | /payments | Crear pago (acepta promocionId y descuentoId opcionales) |
| Pagos | GET | /payments/delivery-notes | Notas remisión venta |
| Pagos | POST | /payments/delivery-notes | Crear nota remisión |
| Notas C/D | GET | /credit-debit-notes | Listar notas |
| Notas C/D | POST | /credit-debit-notes | Crear nota |
| Libro Ventas | GET | /sales-book | Consultar libro |
| Compras | GET | /purchases/suppliers | Listar proveedores |
| Compras | POST | /purchases/suppliers | Crear proveedor |
| Compras | PATCH | /purchases/suppliers/:id | Editar proveedor |
| Compras | GET | /purchases/orders | Listar órdenes |
| Compras | POST | /purchases/orders | Crear orden |
| Compras | PATCH | /purchases/orders/:id/approve | Aprobar orden |
| Compras | PATCH | /purchases/orders/:id/cancel | Cancelar orden |
| Compras | PATCH | /purchases/orders/:id/receive | Recibir mercadería |
| Compras | GET | /purchases/ledger | Libro de compras |
| Compras | GET | /purchases/delivery-notes | Notas remisión |
| Compras | GET | /purchases/notes | Notas C/D compras |
| Compras | POST | /purchases/notes | Crear nota C/D |
| Compras | GET | /purchases/adjustments | Listar ajustes |
| Compras | POST | /purchases/adjustments | Crear ajuste |
| Reportes | GET | /reports/daily-income | Ingresos diarios |
| Reportes | GET | /reports/appointments | Reporte turnos |
| Reportes | GET | /reports/services | Reporte servicios |
| Reportes | GET | /reports/complaints | Reporte reclamos |

## 6. Seguridad

### 6.1 Autenticación
- Contraseñas hasheadas con **bcryptjs** (salt rounds: 10)
- Tokens JWT con expiración configurable
- Validación de credenciales en cada petición

### 6.2 Autorización
- Sistema de roles: administrador, recepcionista, barbero
- Guards de NestJS verifican rol del usuario en cada endpoint
- Frontend filtra opciones de menú según rol del usuario logueado

### 6.3 Protección de Datos
- Queries parametrizadas vía Prisma ORM (prevención de SQL injection)
- Validación de DTOs con class-validator (prevención de inyección de datos)
- CORS configurado para orígenes permitidos

## 7. Generación de Informes PDF

El sistema genera informes en formato PDF utilizando la librería **jsPDF** con el plugin **jspdf-autotable**. Los informes incluyen:

- Encabezado con nombre del sistema y fecha de generación
- Tabla con los datos filtrados
- Totales calculados
- Pie de página con paginación

### Informes disponibles:
| Sección | Tipo de Informe |
|---------|----------------|
| Reportes | Ingresos diarios, Turnos, Servicios, Reclamos |
| Libro de Ventas | Listado con filtros y total |
| Libro de Compras | Listado con filtros y total |
| Cobros | Comprobante individual por pago |
| Presupuestos | Detalle del presupuesto |
| Órdenes de Compra | Detalle de la orden |
| Recaudaciones | Resumen por método de pago |
