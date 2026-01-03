# Plan de Desarrollo - Termina

## Objetivo Final

Tener un MVP funcional desplegado en Casper Testnet con:
1. Contrato de escrow operativo
2. API conectada al contrato
3. Dashboard de facturas usable

---

## Fase 1: Contratos (Prioridad Alta)

### 1.1 Validar contratos con Odra
- [ ] Instalar Odra CLI: `cargo install cargo-odra --locked`
- [ ] Ejecutar tests: `cargo odra test`
- [ ] Corregir errores de compilación si los hay
- [ ] Ejecutar tests con CasperVM: `cargo odra test -b casper`

### 1.2 Agregar manejo de tokens
- [ ] Integrar transferencias de CSPR nativo
- [ ] O integrar CEP-18 (tokens fungibles) para stablecoins
- [ ] Actualizar `fund()` para recibir tokens reales
- [ ] Actualizar `release()` para transferir tokens

### 1.3 Deploy a Testnet
- [ ] Configurar cuenta en Casper Testnet
- [ ] Obtener CSPR de faucet: https://testnet.cspr.live/tools/faucet
- [ ] Deploy del contrato: `cargo odra deploy -b casper`
- [ ] Documentar contract hash

---

## Fase 2: API (Prioridad Alta)

### 2.1 Instalar dependencias
- [ ] `cd api && npm install`
- [ ] Verificar que compila: `npm run build`
- [ ] Probar servidor: `npm run dev`

### 2.2 Integrar casper-js-sdk
- [ ] Implementar `deployEscrow()` real en `services/casper.ts`
- [ ] Implementar `getEscrow()` - leer estado del contrato
- [ ] Implementar `acceptEscrow()` - llamar entry point
- [ ] Implementar `fundEscrow()` - transferir tokens
- [ ] Implementar `releaseEscrow()` - liberar fondos
- [ ] Implementar `waitForDeploy()` - esperar confirmación

### 2.3 Base de datos (opcional para hackathon)
- [ ] Decidir: ¿SQLite, PostgreSQL, o solo blockchain?
- [ ] Si DB: guardar mapping escrow_id <-> contract_address
- [ ] Si DB: guardar metadata de facturas off-chain

### 2.4 Testing
- [ ] Crear tests de integración con testnet
- [ ] Documentar flujo completo en Postman/Insomnia

---

## Fase 3: Dashboard (Prioridad Alta)

### 3.1 Setup Next.js
- [ ] Inicializar proyecto: `npx create-next-app@latest dashboard`
- [ ] Configurar Tailwind CSS
- [ ] Estructura de carpetas según arquitectura

### 3.2 Integración Wallet
- [ ] Instalar CSPR.click SDK
- [ ] Componente `WalletConnect.tsx`
- [ ] Hook `useCasper.ts` para estado de wallet
- [ ] Manejo de conexión/desconexión

### 3.3 Páginas principales
- [ ] `/` - Landing con propuesta de valor
- [ ] `/invoices` - Lista de facturas
- [ ] `/invoices/new` - Crear factura
- [ ] `/invoices/[id]` - Detalle y acciones

### 3.4 Componentes
- [ ] `InvoiceCard.tsx` - Card de factura con estado
- [ ] `CreateInvoiceForm.tsx` - Formulario de creación
- [ ] `InvoiceActions.tsx` - Botones según estado
- [ ] `StatusBadge.tsx` - Badge visual de estado

### 3.5 Flujo UX
- [ ] Crear factura → firma con wallet → deploy
- [ ] Aceptar factura → firma → transacción
- [ ] Fondear → input monto → firma → transacción
- [ ] Liberar → confirmación → firma → transacción

### 3.6 Estados visuales
- [ ] Draft: gris
- [ ] Accepted: azul
- [ ] Funded: amarillo
- [ ] Released: verde
- [ ] Cancelled: rojo
- [ ] Disputed: naranja

---

## Fase 4: Integración End-to-End

### 4.1 Conectar todo
- [ ] Dashboard llama a API
- [ ] API llama a contratos
- [ ] Contratos emiten eventos
- [ ] (Opcional) API escucha eventos

### 4.2 Testing E2E
- [ ] Flujo completo: crear → aceptar → fondear → liberar
- [ ] Probar cancelación
- [ ] Probar disputa y resolución
- [ ] Grabar video demo

---

## Fase 5: Polish para Hackathon

### 5.1 Documentación
- [ ] README.md principal con badges
- [ ] Instrucciones de instalación
- [ ] Arquitectura diagram
- [ ] Screenshots/GIFs del dashboard

### 5.2 Video Demo
- [ ] Script de 3 minutos
- [ ] Grabar flujo completo
- [ ] Subir a YouTube/Loom

### 5.3 Submission
- [ ] Project overview (1-2 párrafos)
- [ ] Link a GitHub
- [ ] Link a demo (si hay deploy)
- [ ] Link a video

---

## Checklist Pre-Submission

- [ ] Contrato desplegado en testnet
- [ ] API funcionando (local o desplegada)
- [ ] Dashboard funcionando (local o desplegada)
- [ ] Flujo completo demostrable
- [ ] README completo
- [ ] Video demo grabado
- [ ] Formulario de DoraHacks llenado

---

## Recursos Útiles

### Casper
- Docs: https://docs.casper.network
- Testnet Faucet: https://testnet.cspr.live/tools/faucet
- Block Explorer: https://testnet.cspr.live

### Odra
- Docs: https://odra.dev/docs
- GitHub: https://github.com/odradev/odra

### CSPR.click
- Docs: https://docs.cspr.click
- SDK: https://www.npmjs.com/package/@csprclick/core

### Referencia
- Trustless Work: https://docs.trustlesswork.com

---

## Timeline Sugerido

| Día | Foco |
|-----|------|
| 1 | Validar contratos, fix bugs, tests |
| 2 | Deploy testnet, integrar API |
| 3 | Setup dashboard, wallet connect |
| 4 | UI de facturas, flujo crear/aceptar |
| 5 | Flujo fondear/liberar, testing |
| 6 | Polish, documentación, video |
| 7 | Buffer, submission |

---

## Notas

- **No sobre-ingeniear**: mantener scope del MVP
- **Commits frecuentes**: mostrar progreso
- **Probar en testnet temprano**: evitar sorpresas
- **UX > features**: mejor poco y pulido que mucho y roto
