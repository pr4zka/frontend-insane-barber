# Insane Barber - Frontend

Interfaz web del sistema de gestion para barberia **Insane Barber**, desarrollado como tesis de grado.

## Stack tecnologico

| Tecnologia | Version | Uso |
|---|---|---|
| Next.js | 16 | Framework React |
| React | 19 | Libreria UI |
| TypeScript | 5 | Lenguaje |
| Tailwind CSS | 4 | Estilos |
| shadcn/ui | 4 | Componentes UI |
| Phosphor Icons | 2 | Iconografia |
| Zustand | 5 | Estado global (auth) |
| Axios | 1.13 | Cliente HTTP |
| Zod | 4 | Validacion |
| React Hook Form | 7 | Formularios |

## Requisitos previos

- Node.js 20+
- npm
- Backend corriendo en `http://localhost:3000`

## Instalacion

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Ya existe .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Ejecucion

```bash
# Desarrollo (puerto 3001)
npm run dev

# Produccion
npm run build
npm run start
```

Acceder a `http://localhost:3001`

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # Inicio de sesion
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Layout con sidebar + auth guard
│   │   ├── dashboard/page.tsx          # Panel principal
│   │   ├── servicios/                  # CRUD servicios
│   │   │   ├── page.tsx                # Lista
│   │   │   ├── nuevo/page.tsx          # Crear
│   │   │   └── [id]/page.tsx           # Editar
│   │   ├── promociones/page.tsx        # Promociones (dialog)
│   │   ├── descuentos/page.tsx         # Descuentos (dialog)
│   │   ├── reclamos/                   # Reclamos
│   │   │   ├── page.tsx                # Lista
│   │   │   └── [id]/page.tsx           # Detalle + seguimiento
│   │   ├── presupuestos/              # Presupuestos
│   │   │   ├── page.tsx                # Lista
│   │   │   ├── nuevo/page.tsx          # Crear con detalles
│   │   │   └── [id]/page.tsx           # Detalle + PDF
│   │   ├── insumos/page.tsx            # Inventario (dialog)
│   │   ├── clientes/                   # CRUD clientes
│   │   │   ├── page.tsx                # Lista
│   │   │   ├── nuevo/page.tsx          # Crear
│   │   │   └── [id]/page.tsx           # Editar
│   │   ├── agenda/                     # Turnos
│   │   │   ├── page.tsx                # Vista diaria + acciones
│   │   │   └── nuevo/page.tsx          # Agendar turno
│   │   ├── caja/page.tsx               # Apertura/cierre + movimientos
│   │   ├── cobros/                     # Pagos
│   │   │   ├── page.tsx                # Lista
│   │   │   └── nuevo/page.tsx          # Registrar cobro
│   │   ├── libro-ventas/page.tsx       # Registro de ventas
│   │   ├── notas/page.tsx              # Notas credito/debito
│   │   ├── recaudaciones/page.tsx      # Resumen recaudaciones
│   │   ├── usuarios/page.tsx           # Gestion usuarios
│   │   └── reportes/page.tsx           # Reportes (tabs)
│   ├── layout.tsx                      # Layout raiz
│   └── page.tsx                        # Redirect inicial
├── components/
│   ├── ui/                             # 28 componentes shadcn
│   ├── layout/
│   │   ├── app-sidebar.tsx             # Sidebar con navegacion
│   │   └── header.tsx                  # Header + breadcrumbs
│   └── shared/
│       ├── data-table.tsx              # Tabla reutilizable
│       ├── page-header.tsx             # Encabezado de pagina
│       ├── status-badge.tsx            # Badge de estados
│       ├── confirm-dialog.tsx          # Dialogo de confirmacion
│       └── loading-skeleton.tsx        # Skeleton de carga
├── services/                           # 16 servicios API
├── hooks/
│   └── use-auth.ts                     # Estado de autenticacion
├── lib/
│   ├── api.ts                          # Cliente Axios configurado
│   ├── constants.ts                    # Formateadores + constantes
│   └── utils.ts                        # Utilidad cn()
└── types/
    └── index.ts                        # Interfaces TypeScript
```

## Flujo de autenticacion

```
Usuario abre la app
       |
       v
  Tiene token en localStorage?
       |
  +----+----+
  No        Si
  |         |
  v         v
/login    /dashboard
  |
  v
Ingresa email + password
  |
  v
POST /api/auth/login
  |
  v
Recibe { token, user }
  |
  v
Guarda en localStorage + Zustand
  |
  v
Redirige a /dashboard
```

- Todas las requests incluyen `Authorization: Bearer {token}` automaticamente
- Si el backend responde 401, se limpia la sesion y redirige a `/login`

## Navegacion (Sidebar)

| Grupo | Pagina | Ruta |
|---|---|---|
| **General** | Dashboard | `/dashboard` |
| **Mod. 1 - Servicios** | Servicios | `/servicios` |
| | Promociones | `/promociones` |
| | Descuentos | `/descuentos` |
| | Reclamos | `/reclamos` |
| | Presupuestos | `/presupuestos` |
| | Insumos | `/insumos` |
| **Mod. 2 - Agenda** | Clientes | `/clientes` |
| | Agenda | `/agenda` |
| **Mod. 3 - Caja** | Caja | `/caja` |
| | Cobros | `/cobros` |
| | Libro de Ventas | `/libro-ventas` |
| | Notas C/D | `/notas` |
| | Recaudaciones | `/recaudaciones` |
| **Sistema** | Usuarios | `/usuarios` |
| | Reportes | `/reportes` |

## Flujo principal del sistema

```
1. Registrar cliente    --> /clientes/nuevo
2. Registrar servicio   --> /servicios/nuevo
3. Abrir caja del dia   --> /caja (boton "Abrir Caja")
4. Agendar turno        --> /agenda/nuevo (cliente + servicio + barbero + fecha + hora)
5. Confirmar turno      --> /agenda (boton "Confirmar")
6. Marcar como atendido --> /agenda (boton "Atendido")
7. Registrar cobro      --> /cobros/nuevo (turno atendido + metodo de pago)
8. Consultar ventas     --> /libro-ventas
9. Cerrar caja          --> /caja (boton "Cerrar Caja")
10. Generar reportes    --> /reportes
```

## Patrones de las paginas

### Paginas con tabla + dialogo (CRUD inline)
Promociones, Descuentos, Insumos, Usuarios, Notas C/D

- Tabla con datos
- Boton "Nuevo" abre un Dialog modal
- Formulario dentro del dialog
- Al guardar se refresca la tabla

### Paginas con tabla + navegacion (CRUD con paginas)
Servicios, Clientes, Presupuestos

- Tabla con datos
- Boton "Nuevo" navega a `/modulo/nuevo`
- Click en fila navega a `/modulo/[id]`
- Formularios en paginas separadas

### Paginas de accion
Agenda, Caja, Cobros

- Vista con estado actual
- Acciones contextuales (confirmar, cancelar, abrir, cerrar)
- Dialogos de confirmacion para acciones destructivas

## Credenciales de prueba

| Rol | Email | Password |
|---|---|---|
| Administrador | admin@insanebarber.com | admin123 |
| Recepcionista | recepcion@insanebarber.com | recep123 |
| Barbero | carlos@insanebarber.com | barbero123 |

## Variables de entorno

| Variable | Valor | Descripcion |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | URL base de la API |

## Scripts

```bash
npm run dev        # Desarrollo en puerto 3001
npm run build      # Compilar para produccion
npm run start      # Ejecutar build de produccion
npm run lint       # Ejecutar linter
```
