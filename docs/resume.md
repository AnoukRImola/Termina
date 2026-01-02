# Termina - Resumen del Proyecto

## Concepto

**Termina** es una infraestructura de escrow programable para workflows B2B sobre Casper blockchain, inspirada en [Trustless Work](https://docs.trustlesswork.com/).

Para la hackathon, demostramos el concepto con un **dashboard de tokenización de facturas**.

---

## Arquitectura

```
termina/
├── docs/                 # Documentación
├── contracts/            # Smart contracts (Odra/Rust)
├── api/                  # Backend API (Node.js/Hono)
├── dashboard/            # Frontend (Next.js) [pendiente]
└── scripts/              # Scripts de deploy [pendiente]
```

---

## Progreso Actual

### ✅ Completado

#### 1. Contratos (`/contracts`)

| Archivo | Descripción |
|---------|-------------|
| `Cargo.toml` | Configuración del proyecto Rust/Odra |
| `Odra.toml` | Configuración específica de Odra |
| `src/lib.rs` | Módulo principal |
| `src/types.rs` | Tipos: `EscrowState`, `Role`, `Invoice`, `EscrowConfig` |
| `src/events.rs` | Eventos: `EscrowCreated`, `FundsDeposited`, `FundsReleased`, etc. |
| `src/escrow.rs` | Contrato principal con flujo completo |

**Funcionalidades del contrato:**
- `init()` - Crear escrow
- `accept()` - Aceptar (payer)
- `fund()` - Depositar fondos
- `release()` - Liberar pago
- `cancel()` - Cancelar
- `dispute()` - Levantar disputa
- `resolve_dispute()` - Resolver disputa (arbiter)

#### 2. API (`/api`)

| Archivo | Descripción |
|---------|-------------|
| `package.json` | Dependencias (Hono, casper-js-sdk, zod) |
| `tsconfig.json` | Configuración TypeScript |
| `src/index.ts` | Entry point del servidor |
| `src/types/index.ts` | Tipos y schemas de validación |
| `src/routes/health.ts` | Endpoint de health check |
| `src/routes/escrow.ts` | CRUD de escrows |
| `src/services/casper.ts` | Servicio de interacción con Casper (placeholder) |

**Endpoints:**
- `POST /escrow` - Crear escrow
- `GET /escrow/:address` - Obtener estado
- `POST /escrow/:address/accept` - Aceptar
- `POST /escrow/:address/fund` - Fondear
- `POST /escrow/:address/release` - Liberar
- `POST /escrow/:address/cancel` - Cancelar
- `POST /escrow/:address/dispute` - Disputar
- `POST /escrow/:address/resolve` - Resolver disputa

---

### ⏳ Pendiente

1. **Dashboard** (`/dashboard`)
   - Frontend Next.js
   - Integración con CSPR.click
   - UI de facturas

2. **Scripts** (`/scripts`)
   - Deploy a testnet
   - Funding de cuentas de prueba

3. **Integración real**
   - Conectar API con contratos desplegados
   - Manejo de transacciones reales

4. **Archivos raíz**
   - README.md principal
   - .gitignore
   - package.json workspace

---

## Stack Técnico

| Capa | Tecnología |
|------|------------|
| Contratos | Rust + Odra Framework |
| API | Node.js + Hono + TypeScript |
| Frontend | Next.js 14 + TypeScript (pendiente) |
| Wallet | CSPR.click (pendiente) |
| Styling | Tailwind CSS (pendiente) |

---

## Flujo del MVP

```
1. Empresa A crea factura  →  Escrow en estado Draft
2. Empresa B acepta        →  Estado: Accepted
3. Empresa B deposita      →  Estado: Funded
4. Empresa B aprueba       →  Estado: Released (pago automático)
```

---

## Próximos Pasos

1. Commit inicial con estructura base
2. Configurar dashboard Next.js
3. Probar contratos con `cargo odra test`
4. Deploy a Casper testnet
5. Integrar frontend con API
