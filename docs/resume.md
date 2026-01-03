# Termina - Resumen del Proyecto

## Concepto

**Termina** es una infraestructura de escrow programable para workflows B2B sobre Casper blockchain, inspirada en [Trustless Work](https://docs.trustlesswork.com/).

Para la hackathon, demostramos el concepto con un **dashboard de tokenización de facturas** completamente funcional.

---

## Arquitectura

```
termina/
├── docs/                 # Documentación
├── contracts/            # Smart contracts (Odra 2.4/Rust)
├── api/                  # Backend API (Node.js/Hono)
├── dashboard/            # Frontend (Next.js 14)
└── scripts/              # Scripts de deploy
```

---

## Estado Actual: MVP Completo

### Servidores

| Servicio | URL | Estado |
|----------|-----|--------|
| API | http://localhost:3001 | Funcionando |
| Dashboard | http://localhost:3000 | Funcionando |

### Modo Demo

El proyecto incluye un **modo demo** que permite probar todo el flujo sin necesidad de wallet real:
- Simula conexión de wallet con cuenta de prueba
- Todas las operaciones de escrow retornan respuestas simuladas
- Perfecto para demos y hackathons

---

## Componentes Completados

### 1. Contratos (`/contracts`)

| Archivo | Descripción |
|---------|-------------|
| `Cargo.toml` | Configuración del proyecto Rust/Odra 2.4 |
| `Odra.toml` | Configuración específica de Odra |
| `src/lib.rs` | Módulo principal |
| `src/types.rs` | Tipos: `EscrowState`, `Role`, `Invoice`, `EscrowConfig` |
| `src/events.rs` | Eventos: `EscrowCreated`, `FundsDeposited`, `FundsReleased`, etc. |
| `src/escrow.rs` | Contrato principal con flujo completo |

**Entry points del contrato:**
- `init()` - Crear escrow con factura
- `accept()` - Aceptar factura (payer)
- `fund()` - Depositar fondos en escrow
- `release()` - Liberar pago al emisor
- `cancel()` - Cancelar escrow
- `dispute()` - Levantar disputa
- `resolve_dispute()` - Resolver disputa (arbiter)

### 2. API (`/api`)

**Stack:** Hono + TypeScript + casper-js-sdk + @hono/node-server

| Archivo | Descripción |
|---------|-------------|
| `src/index.ts` | Entry point con servidor Node.js |
| `src/types/index.ts` | Tipos TypeScript y schemas Zod |
| `src/routes/health.ts` | Health check endpoint |
| `src/routes/escrow.ts` | CRUD completo de escrows |
| `src/services/casper.ts` | Servicio Casper con modo demo y producción |

**Endpoints REST:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/escrow` | Crear nuevo escrow |
| `GET` | `/escrow/:address` | Obtener estado de escrow |
| `POST` | `/escrow/:address/accept` | Aceptar factura |
| `POST` | `/escrow/:address/fund` | Depositar fondos |
| `POST` | `/escrow/:address/release` | Liberar fondos |
| `POST` | `/escrow/:address/cancel` | Cancelar escrow |
| `POST` | `/escrow/:address/dispute` | Iniciar disputa |
| `POST` | `/escrow/:address/resolve` | Resolver disputa |

**Endpoints para Deploy (producción):**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/deploy/build/create` | Construir deploy de creación |
| `POST` | `/deploy/build/accept` | Construir deploy de aceptación |
| `POST` | `/deploy/build/fund` | Construir deploy de fondeo |
| `POST` | `/deploy/build/release` | Construir deploy de liberación |
| `POST` | `/deploy/submit` | Enviar deploy firmado |
| `GET` | `/deploy/status/:hash` | Estado de deploy |

### 3. Dashboard (`/dashboard`)

**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Lucide Icons

#### Páginas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Página de inicio |
| `/dashboard` | Dashboard | Vista general con métricas |
| `/invoices` | InvoicesPage | Lista de facturas con filtros |
| `/invoices/new` | NewInvoicePage | Formulario de nueva factura |
| `/invoices/[id]` | InvoiceDetailPage | Detalle con acciones de escrow |
| `/clients` | ClientsPage | Gestión de clientes |
| `/settings` | SettingsPage | Configuración |

#### Componentes UI (`/src/components/ui`)

| Componente | Descripción |
|------------|-------------|
| `Button` | Botón con variantes (primary, outline, ghost, danger) |
| `Input` | Campo de entrada con label y validación |
| `Select` | Selector dropdown |
| `Textarea` | Área de texto |
| `Card` | Tarjeta con Header, Content, Footer |
| `StatusBadge` | Badge de estado con colores |
| `DataTable` | Tabla de datos con ordenamiento |

#### Componentes Layout (`/src/components/layout`)

| Componente | Descripción |
|------------|-------------|
| `DashboardLayout` | Layout principal con sidebar |
| `Sidebar` | Navegación lateral |
| `Header` | Encabezado con acciones y wallet |
| `WalletButton` | Botón de conexión de wallet |

#### Integración Wallet (`/src/lib/casper`)

| Archivo | Descripción |
|---------|-------------|
| `CasperProvider.tsx` | Provider de contexto React |
| `types.ts` | Tipos TypeScript para wallet |
| `index.ts` | Exports del módulo |

**Características:**
- Integración con CSPR.click SDK
- Modo demo automático si SDK no disponible
- Conexión/desconexión de wallet
- Firma de mensajes y deploys
- Estado persistente de sesión

#### API Client (`/src/lib/api`)

| Archivo | Descripción |
|---------|-------------|
| `client.ts` | Cliente HTTP para comunicación con API |
| `index.ts` | Exports |

#### Hooks (`/src/hooks`)

| Hook | Descripción |
|------|-------------|
| `useInvoices` | Gestión de estado de facturas con acciones de escrow |

**Funciones del hook:**
- `createInvoice()` - Crear nueva factura
- `acceptInvoice()` - Aceptar factura
- `fundInvoice()` - Depositar fondos
- `releaseInvoice()` - Liberar pago
- `cancelInvoice()` - Cancelar
- `refreshInvoice()` - Actualizar estado

---

## Flujo del MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO DE ESCROW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CREAR FACTURA                                               │
│     └─> Empresa A crea factura en dashboard                     │
│     └─> Se crea escrow en estado "Draft"                        │
│     └─> Se envía notificación a Empresa B                       │
│                                                                 │
│  2. ACEPTAR                                                     │
│     └─> Empresa B revisa la factura                             │
│     └─> Acepta los términos                                     │
│     └─> Estado cambia a "Accepted"                              │
│                                                                 │
│  3. FONDEAR                                                     │
│     └─> Empresa B deposita fondos en escrow                     │
│     └─> Fondos quedan bloqueados en contrato                    │
│     └─> Estado cambia a "Funded"                                │
│                                                                 │
│  4. LIBERAR                                                     │
│     └─> Empresa B confirma recepción del servicio               │
│     └─> Fondos se liberan automáticamente a Empresa A           │
│     └─> Estado cambia a "Released/Completed"                    │
│                                                                 │
│  ALTERNATIVAS:                                                  │
│     • Cancel: Cualquier parte puede cancelar antes de fondear   │
│     • Dispute: Se puede abrir disputa después de fondear        │
│     • Resolve: Árbitro resuelve disputas                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Técnico

| Capa | Tecnología | Estado |
|------|------------|--------|
| Contratos | Rust + Odra 2.4 | Completado |
| API | Node.js + Hono + TypeScript | Completado |
| Blockchain SDK | casper-js-sdk 2.15.4 | Integrado |
| Frontend | Next.js 14 + TypeScript | Completado |
| Wallet | CSPR.click SDK + Modo Demo | Completado |
| Styling | Tailwind CSS 3.4 | Completado |
| Icons | Lucide React | Completado |

---

## Cómo Ejecutar

### Requisitos
- Node.js 18+
- npm o pnpm

### API
```bash
cd api
npm install
npm run dev
# Servidor en http://localhost:3001
```

### Dashboard
```bash
cd dashboard
npm install
npm run dev
# Servidor en http://localhost:3000
```

### Probar
1. Abrir http://localhost:3000
2. Navegar a "New Invoice"
3. Click en "Connect Wallet" (usa modo demo)
4. Llenar formulario y crear factura
5. Ver acciones de escrow en detalle de factura

---

## Variables de Entorno

### API (`/api/.env`)
```env
PORT=3001
CASPER_NODE_URL=https://rpc.testnet.casperlabs.io/rpc
CASPER_NETWORK=casper-test
ESCROW_CONTRACT_HASH=
```

### Dashboard (`/dashboard/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Estructura de Archivos Clave

```
dashboard/
├── src/
│   ├── app/                    # Páginas Next.js App Router
│   │   ├── layout.tsx          # Layout raíz con providers
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── invoices/           # Módulo de facturas
│   │   │   ├── page.tsx        # Lista de facturas
│   │   │   ├── new/page.tsx    # Nueva factura
│   │   │   └── [id]/page.tsx   # Detalle de factura
│   │   ├── clients/            # Gestión de clientes
│   │   └── settings/           # Configuración
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   └── layout/             # Componentes de layout
│   ├── hooks/
│   │   └── useInvoices.ts      # Hook de gestión de facturas
│   ├── lib/
│   │   ├── api/                # Cliente API
│   │   ├── casper/             # Integración wallet
│   │   ├── mock-data.ts        # Datos de prueba
│   │   └── utils.ts            # Utilidades
│   └── types/
│       └── index.ts            # Tipos TypeScript

api/
├── src/
│   ├── index.ts                # Entry point
│   ├── routes/
│   │   ├── health.ts           # Health check
│   │   └── escrow.ts           # Endpoints de escrow
│   ├── services/
│   │   └── casper.ts           # Servicio Casper
│   └── types/
│       └── index.ts            # Tipos y schemas
```

---

## Características Destacadas

### Para el Hackathon

1. **Modo Demo Completo**: No requiere wallet real para probar
2. **UI Profesional**: Diseño moderno con Tailwind CSS
3. **Flujo End-to-End**: Desde crear factura hasta liberar pago
4. **Código Limpio**: TypeScript estricto, componentes reutilizables
5. **Arquitectura Escalable**: Separación clara de concerns

### Técnicas

1. **Smart Contracts Odra 2.4**: Última versión del framework
2. **casper-js-sdk**: Integración real con Casper blockchain
3. **Next.js 14 App Router**: Última arquitectura de React
4. **Server Components**: Optimización de rendimiento
5. **CSPR.click SDK**: Integración de wallet lista para producción

---

## Próximos Pasos (Post-Hackathon)

1. [ ] Deploy de contratos a Casper testnet
2. [ ] Integración real con CSPR.click en producción
3. [ ] Sistema de notificaciones por email
4. [ ] Generación de PDF de facturas
5. [ ] Dashboard analytics avanzado
6. [ ] Multi-currency support
7. [ ] Integración con sistemas contables
