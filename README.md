# Términa

<p align="center">
  <img src="dashboard/public/logo.png" alt="Términa Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Programmable Escrow Infrastructure for Enterprise Financial Workflows</strong>
</p>

<p align="center">
  <a href="https://testnet.cspr.live/deploy/86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22">
    <img src="https://img.shields.io/badge/Casper-Testnet-red" alt="Casper Testnet">
  </a>
  <img src="https://img.shields.io/badge/Rust-Native%20Contract-orange" alt="Rust">
  <img src="https://img.shields.io/badge/Next.js-16.1-black" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React">
</p>

---

## Overview

Términa is a modular, enterprise-ready escrow infrastructure built on the Casper blockchain. It enables trustless conditional payments with multi-party approvals and configurable dispute resolution.

Unlike traditional payment processors, Términa provides the **building blocks** for creating any escrow-based workflow, giving developers full control over escrow logic, participants, and resolution mechanisms.

### Key Features

- **Trustless Execution** - Smart contracts enforce conditions automatically
- **Configurable Arbitration** - Define custom dispute resolution with designated arbiters
- **Instant Settlement** - Funds transfer immediately when conditions are met
- **Complete Audit Trail** - Every state change recorded immutably on-chain
- **Enterprise Ready** - Built on Casper 2.0 with upgradeable contracts

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Términa Stack                           │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard (Next.js 16 + React 19)                              │
│  ├── Documentation site                                         │
│  ├── Live demo interface                                        │
│  └── Wallet integration (Casper Wallet)                         │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (Next.js API Routes)                                 │
│  ├── Transaction signing                                        │
│  ├── Deploy management                                          │
│  └── State queries                                              │
├─────────────────────────────────────────────────────────────────┤
│  Smart Contract (Native Rust)                                   │
│  ├── casper-contract 5.x                                        │
│  ├── casper-types 6.x                                           │
│  └── Entry points: accept, fund, release, cancel                │
├─────────────────────────────────────────────────────────────────┤
│  Casper 2.0 Testnet                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Escrow Lifecycle

The escrow follows a strict state machine:

```
┌─────────┐   accept   ┌──────────┐   fund    ┌────────┐   release   ┌──────────┐
│  DRAFT  │ ─────────► │ ACCEPTED │ ────────► │ FUNDED │ ──────────► │ RELEASED │
└─────────┘            └──────────┘           └────────┘             └──────────┘
     │                      │
     │ cancel               │ cancel
     ▼                      ▼
┌───────────┐          ┌───────────┐
│ CANCELLED │          │ CANCELLED │
└───────────┘          └───────────┘
```

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| `DRAFT` | Initial state after creation | accept, cancel |
| `ACCEPTED` | Payer agreed to terms | fund, cancel |
| `FUNDED` | Funds deposited in contract | release |
| `RELEASED` | Funds sent to issuer | none (final) |
| `CANCELLED` | Escrow cancelled | none (final) |

---

## Project Structure

```
termina/
├── dashboard/                 # Next.js 16 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── demo/         # Live demo page
│   │   │   ├── docs/         # Documentation pages
│   │   │   └── api/          # API routes
│   │   ├── components/       # React components
│   │   └── lib/casper/       # Casper SDK integration
│   └── public/               # Static assets
│
├── contracts-native/          # Native Rust smart contract
│   ├── src/
│   │   └── main.rs           # Escrow contract (Casper 2.0)
│   └── Cargo.toml            # Dependencies
│
├── api/                       # Backend API (Hono)
├── contracts/                 # Legacy contracts
└── scripts/                   # Deployment scripts
```

---

## Smart Contract

### On-Chain Data

Each escrow contract stores:

| Key | Type | Description |
|-----|------|-------------|
| `state` | U8 | Current state (0-4) |
| `issuer` | AccountHash | Payment recipient |
| `payer` | AccountHash | Payment sender |
| `amount` | U512 | Required escrow amount |
| `description` | String | Invoice description |
| `balance` | U512 | Current balance held |
| `escrow_purse` | URef | Purse holding funds |

### Entry Points

| Method | Caller | Description |
|--------|--------|-------------|
| `accept` | Payer | Accept escrow terms |
| `fund` | Payer | Deposit funds into escrow |
| `release` | Payer | Release funds to issuer |
| `cancel` | Issuer/Payer | Cancel the escrow |
| `get_state` | Any | Query current state |
| `get_balance` | Any | Query current balance |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Casper Network 2.0 |
| Smart Contract | Rust (casper-contract 5.x, casper-types 6.x) |
| Frontend | Next.js 16.1, React 19, Tailwind CSS 4 |
| SDK | casper-js-sdk 5.0.7 |
| Wallet | Casper Wallet Extension |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (nightly-2024-12-01)
- wasm-strip (wabt package)
- Casper Wallet browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/AnoukRImola/Termina.git
cd termina

# Install dashboard dependencies
cd dashboard
npm install

# Create environment file
cp .env.example .env.local
# Add your DEMO_PAYER_MNEMONIC
```

### Running the Dashboard

```bash
cd dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Compiling the Smart Contract

```bash
cd contracts-native

# Install Rust nightly
rustup install nightly-2024-12-01
rustup target add wasm32-unknown-unknown --toolchain nightly-2024-12-01

# Build
rustup run nightly-2024-12-01 cargo build --release --target wasm32-unknown-unknown

# Optimize (optional)
wasm-strip target/wasm32-unknown-unknown/release/escrow.wasm
```

---

## Deployed Contracts

### Testnet

| Contract | Deploy Hash |
|----------|-------------|
| Escrow | [`86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22`](https://testnet.cspr.live/deploy/86d45c8af4cf8965de7dc208cfad1d4169b88d10d05a7f6002449c4452e9de22) |

---

## Use Cases

Términa's infrastructure supports various enterprise scenarios:

- **B2B Invoice Payments** - Trustless vendor payments with delivery confirmation
- **Supply Chain Finance** - Multi-party escrow with milestone releases
- **Real Estate** - Earnest money deposits with conditional releases
- **SaaS Licensing** - Subscription payments tied to service delivery
- **M&A Transactions** - Earnout payments based on performance metrics

---

## Demo

The live demo showcases the complete escrow lifecycle on Casper testnet:

1. **Connect Wallet** - Connect your Casper Wallet as the issuer
2. **Create Invoice** - Deploy a new escrow contract
3. **Automatic Flow** - Demo payer accepts, funds, and releases
4. **Verify On-Chain** - View all transactions on the Casper explorer

---

## Development

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/demo/escrow` | POST | Create and execute full escrow cycle |

### Key Files

| File | Purpose |
|------|---------|
| `dashboard/src/lib/casper/keys.ts` | Key derivation (BIP39/BIP44) |
| `dashboard/src/app/api/demo/escrow/route.ts` | Demo API handler |
| `contracts-native/src/main.rs` | Smart contract source |

---

## Why Casper?

Casper blockchain is ideal for enterprise escrow infrastructure:

- **Upgradeable Contracts** - Fix bugs or add features without redeploying
- **Low & Predictable Gas** - Stable costs for business planning
- **Account Abstraction** - Flexible key management and permissions
- **Enterprise Ecosystem** - Built for regulated industries

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for the Casper Hackathon 2025
</p>
