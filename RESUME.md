# Termina Escrow - Resumen de Desarrollo

## Objetivo
Desplegar un contrato escrow nativo en Casper 2.0 testnet para el demo de la hackathon.

## Lo que se hizo

### 1. Contrato Nativo Casper 2.0
- Creado en `/contracts-native/`
- Usa `casper-contract = "3.0.0"` y `casper-types = "3.0.0"`
- Requiere Rust nightly-2023-06-01 para compilar
- Tiene entry points: `accept`, `fund`, `release`, `cancel`, `get_state`, `get_balance`
- Estados: Draft(0) → Accepted(1) → Funded(2) → Released(3) / Cancelled(4)

### 2. Compilación exitosa
```bash
cd /home/anouk/Escritorio/termina/contracts-native
rustup run nightly-2023-06-01 cargo build --release --target wasm32-unknown-unknown
wasm-strip target/wasm32-unknown-unknown/release/escrow.wasm
```

### 3. Deploy de contrato mínimo - EXITOSO
- Un contrato sin argumentos (`minimal.rs`) se desplegó correctamente
- Deploy hash: `9c75eede95d66477e8423a38908fe359354b59cf8a1dca76116b906701d6a480`
- Esto confirma que el mecanismo de deploy funciona

### 4. Script de deploy
- Ubicado en `/dashboard/scripts/deploy-escrow.ts`
- Usa casper-js-sdk 5.0.7
- Deriva claves desde mnemonic en `.env.local`

## Problema RESUELTO ✅

### Causa raíz
El problema **NO era la serialización de argumentos** del SDK 5.x. Era una **incompatibilidad de versiones** entre las crates de Rust y Casper 2.0 testnet.

### Solución aplicada

| Cambio | Antes | Después |
|--------|-------|---------|
| casper-contract | 3.0.0 | 5.x |
| casper-types | 3.0.0 | 6.x |
| Toolchain | nightly-2023-06-01 | nightly-2024-12-01 |
| EntryPointType | Contract | Called |
| EntryPoint | EntryPoint::new | EntityEntryPoint::new |
| new_contract | 4 args | 5 args (+message_topics) |

### Deploy exitoso
- **Hash**: `86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22`
- **Explorer**: https://testnet.cspr.live/deploy/86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22

### Lecciones aprendidas
1. Casper 2.0 requiere crates actualizadas (casper-contract 5.x, casper-types 6.x)
2. La API de `storage::new_contract` cambió (ahora 5 argumentos)
3. `EntryPointType::Contract` → `EntryPointType::Called`
4. Los entry points ahora se crean con `EntityEntryPoint`

## Archivos clave

```
/contracts-native/
├── Cargo.toml          # casper-contract 3.0.0, casper-types 3.0.0
├── src/
│   ├── main.rs         # Contrato escrow completo
│   └── minimal.rs      # Contrato de prueba (se desplegó OK)

/dashboard/
├── .env.local          # DEMO_PAYER_MNEMONIC
├── scripts/
│   ├── deploy-escrow.ts  # Script de deploy
│   └── escrow.wasm       # WASM compilado
├── src/lib/casper/
│   └── keys.ts         # Derivación de claves y transfers
```

## Comandos útiles

```bash
# Compilar contrato (requiere nightly-2024-12-01)
cd /home/anouk/Escritorio/termina/contracts-native
rustup run nightly-2024-12-01 cargo build --release --target wasm32-unknown-unknown --bin escrow
wasm-strip target/wasm32-unknown-unknown/release/escrow.wasm

# Deploy (desde dashboard)
cd /home/anouk/Escritorio/termina/dashboard
npx tsx scripts/deploy-escrow.ts 5 "Demo escrow"

# Ver en explorer
# https://testnet.cspr.live/deploy/<hash>
```

## Cuenta de prueba
- Mnemonic en `.env.local`
- Public key: `0203ff8cba4d2a6019845d95ade52b110eea6dda8fa28180f234c5def1f2872d7393`
- Tiene ~3000 CSPR en testnet

## Próximos pasos

1. ✅ Contrato desplegado exitosamente
2. Integrar el contract hash con el dashboard para el demo completo
3. Probar los entry points: accept, fund, release, cancel
