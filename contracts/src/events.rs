//! Events emitted by the Escrow contract

use odra::prelude::*;
use odra::prelude::Address;

/// Emitted when a new escrow is created
#[odra::event]
pub struct EscrowCreated {
    pub escrow_id: String,
    pub issuer: Address,
    pub payer: Address,
    pub amount: u64,
}

/// Emitted when an escrow is accepted by the payer
#[odra::event]
pub struct EscrowAccepted {
    pub escrow_id: String,
    pub payer: Address,
}

/// Emitted when funds are deposited into escrow
#[odra::event]
pub struct FundsDeposited {
    pub escrow_id: String,
    pub payer: Address,
    pub amount: u64,
}

/// Emitted when funds are released to the receiver
#[odra::event]
pub struct FundsReleased {
    pub escrow_id: String,
    pub receiver: Address,
    pub amount: u64,
}

/// Emitted when an escrow is cancelled
#[odra::event]
pub struct EscrowCancelled {
    pub escrow_id: String,
    pub cancelled_by: Address,
}

/// Emitted when a dispute is raised
#[odra::event]
pub struct DisputeRaised {
    pub escrow_id: String,
    pub raised_by: Address,
    pub reason: String,
}

/// Emitted when a dispute is resolved
#[odra::event]
pub struct DisputeResolved {
    pub escrow_id: String,
    pub resolved_by: Address,
    pub release_to_receiver: bool,
}
