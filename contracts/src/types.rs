//! Core types for the Escrow contract

use odra::prelude::*;
use odra::prelude::Address;

/// Represents the current state of an escrow
#[odra::odra_type]
#[derive(Default)]
pub enum EscrowState {
    /// Initial state - escrow created but not yet accepted
    #[default]
    Draft,
    /// Receiver has accepted the escrow terms
    Accepted,
    /// Funds have been deposited into escrow
    Funded,
    /// Funds have been released to the receiver
    Released,
    /// Escrow has been cancelled
    Cancelled,
    /// Escrow is in dispute
    Disputed,
}

/// Roles within an escrow
#[odra::odra_type]
pub enum Role {
    /// The party that creates the escrow (invoice issuer)
    Issuer,
    /// The party that pays (invoice payer)
    Payer,
    /// Optional arbiter for dispute resolution
    Arbiter,
}

/// Invoice data structure representing a B2B invoice
#[odra::odra_type]
pub struct Invoice {
    /// Unique identifier for the invoice
    pub id: String,
    /// Description of goods/services
    pub description: String,
    /// Amount in smallest token unit
    pub amount: u64,
    /// Invoice issuer address
    pub issuer: Address,
    /// Invoice payer address
    pub payer: Address,
    /// Optional arbiter address
    pub arbiter: Option<Address>,
    /// Creation timestamp
    pub created_at: u64,
    /// Due date timestamp (optional)
    pub due_date: Option<u64>,
}

/// Configuration for creating a new escrow
#[odra::odra_type]
pub struct EscrowConfig {
    /// Invoice/escrow identifier
    pub id: String,
    /// Description
    pub description: String,
    /// Amount to be held in escrow
    pub amount: u64,
    /// Payer address
    pub payer: Address,
    /// Optional arbiter for disputes
    pub arbiter: Option<Address>,
    /// Optional due date
    pub due_date: Option<u64>,
}
