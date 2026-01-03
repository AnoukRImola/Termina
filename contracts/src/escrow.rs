//! Main Escrow contract implementation

use odra::prelude::*;
use odra::prelude::{Address, Var};

use crate::events::*;
use crate::types::*;

/// Main Escrow contract for B2B invoice workflows
#[odra::module(events = [
    EscrowCreated,
    EscrowAccepted,
    FundsDeposited,
    FundsReleased,
    EscrowCancelled,
    DisputeRaised,
    DisputeResolved
])]
pub struct Escrow {
    /// Current state of the escrow
    state: Var<EscrowState>,
    /// Invoice data
    invoice: Var<Invoice>,
    /// Amount currently held in escrow
    balance: Var<u64>,
}

#[odra::module]
impl Escrow {
    /// Initialize a new escrow with the given configuration
    pub fn init(&mut self, config: EscrowConfig) {
        let caller = self.env().caller();
        let now = self.env().get_block_time();

        let invoice = Invoice {
            id: config.id.clone(),
            description: config.description,
            amount: config.amount,
            issuer: caller,
            payer: config.payer,
            arbiter: config.arbiter,
            created_at: now,
            due_date: config.due_date,
        };

        self.invoice.set(invoice);
        self.state.set(EscrowState::Draft);
        self.balance.set(0);

        self.env().emit_event(EscrowCreated {
            escrow_id: config.id,
            issuer: caller,
            payer: config.payer,
            amount: config.amount,
        });
    }

    /// Accept the escrow terms (called by payer)
    pub fn accept(&mut self) {
        self.require_state(EscrowState::Draft);
        self.require_payer();

        let invoice = self.invoice.get().unwrap();

        self.state.set(EscrowState::Accepted);

        self.env().emit_event(EscrowAccepted {
            escrow_id: invoice.id,
            payer: self.env().caller(),
        });
    }

    /// Deposit funds into escrow (called by payer)
    /// Note: In production, this would handle actual token transfers
    pub fn fund(&mut self, amount: u64) {
        self.require_state(EscrowState::Accepted);
        self.require_payer();

        let invoice = self.invoice.get().unwrap();

        if amount < invoice.amount {
            self.env().revert(EscrowError::InsufficientFunds);
        }

        self.balance.set(amount);
        self.state.set(EscrowState::Funded);

        self.env().emit_event(FundsDeposited {
            escrow_id: invoice.id,
            payer: self.env().caller(),
            amount,
        });
    }

    /// Release funds to the issuer (called by payer to approve)
    pub fn release(&mut self) {
        self.require_state(EscrowState::Funded);
        self.require_payer();

        let invoice = self.invoice.get().unwrap();
        let amount = self.balance.get_or_default();

        self.balance.set(0);
        self.state.set(EscrowState::Released);

        // In production: transfer tokens to issuer here

        self.env().emit_event(FundsReleased {
            escrow_id: invoice.id,
            receiver: invoice.issuer,
            amount,
        });
    }

    /// Cancel the escrow (only in Draft or Accepted state)
    pub fn cancel(&mut self) {
        let state = self.state.get_or_default();
        let invoice = self.invoice.get().unwrap();
        let caller = self.env().caller();

        match state {
            EscrowState::Draft => {
                // Only issuer can cancel in draft
                if caller != invoice.issuer {
                    self.env().revert(EscrowError::Unauthorized);
                }
            }
            EscrowState::Accepted => {
                // Both parties can cancel before funding
                if caller != invoice.issuer && caller != invoice.payer {
                    self.env().revert(EscrowError::Unauthorized);
                }
            }
            _ => {
                self.env().revert(EscrowError::InvalidState);
            }
        }

        self.state.set(EscrowState::Cancelled);

        self.env().emit_event(EscrowCancelled {
            escrow_id: invoice.id,
            cancelled_by: caller,
        });
    }

    /// Raise a dispute (only when funded)
    pub fn dispute(&mut self, reason: String) {
        self.require_state(EscrowState::Funded);

        let invoice = self.invoice.get().unwrap();
        let caller = self.env().caller();

        if caller != invoice.issuer && caller != invoice.payer {
            self.env().revert(EscrowError::Unauthorized);
        }

        self.state.set(EscrowState::Disputed);

        self.env().emit_event(DisputeRaised {
            escrow_id: invoice.id,
            raised_by: caller,
            reason,
        });
    }

    /// Resolve a dispute (only by arbiter)
    pub fn resolve_dispute(&mut self, release_to_receiver: bool) {
        self.require_state(EscrowState::Disputed);
        self.require_arbiter();

        let invoice = self.invoice.get().unwrap();
        let amount = self.balance.get_or_default();

        self.balance.set(0);
        self.state.set(EscrowState::Released);

        let receiver = if release_to_receiver {
            invoice.issuer
        } else {
            invoice.payer
        };

        // In production: transfer tokens to receiver here

        self.env().emit_event(DisputeResolved {
            escrow_id: invoice.id.clone(),
            resolved_by: self.env().caller(),
            release_to_receiver,
        });

        self.env().emit_event(FundsReleased {
            escrow_id: invoice.id,
            receiver,
            amount,
        });
    }

    // --- View functions ---

    /// Get the current escrow state
    pub fn get_state(&self) -> EscrowState {
        self.state.get_or_default()
    }

    /// Get the invoice details
    pub fn get_invoice(&self) -> Option<Invoice> {
        self.invoice.get()
    }

    /// Get the current balance held in escrow
    pub fn get_balance(&self) -> u64 {
        self.balance.get_or_default()
    }

    // --- Internal helpers ---

    fn require_state(&self, expected: EscrowState) {
        let current = self.state.get_or_default();
        if core::mem::discriminant(&current) != core::mem::discriminant(&expected) {
            self.env().revert(EscrowError::InvalidState);
        }
    }

    fn require_payer(&self) {
        let invoice = self.invoice.get().unwrap();
        if self.env().caller() != invoice.payer {
            self.env().revert(EscrowError::Unauthorized);
        }
    }

    fn require_arbiter(&self) {
        let invoice = self.invoice.get().unwrap();
        match invoice.arbiter {
            Some(arbiter) if self.env().caller() == arbiter => {}
            _ => self.env().revert(EscrowError::Unauthorized),
        }
    }
}

/// Errors that can occur in the Escrow contract
#[odra::odra_error]
pub enum EscrowError {
    /// Caller is not authorized to perform this action
    Unauthorized = 1,
    /// Invalid state for this operation
    InvalidState = 2,
    /// Insufficient funds provided
    InsufficientFunds = 3,
    /// Escrow not found
    NotFound = 4,
}

#[cfg(test)]
mod tests {
    use crate::Escrow;
    use crate::escrow::EscrowInitArgs;
    use crate::types::*;
    use odra::host::Deployer;

    #[test]
    fn test_escrow_lifecycle() {
        let env = odra_test::env();

        let issuer = env.get_account(0);
        let payer = env.get_account(1);

        env.set_caller(issuer);

        let config = EscrowConfig {
            id: "INV-001".to_string(),
            description: "Services rendered".to_string(),
            amount: 1000,
            payer,
            arbiter: None,
            due_date: None,
        };

        let init_args = EscrowInitArgs { config };
        let mut escrow = Escrow::deploy(&env, init_args);

        assert!(matches!(escrow.get_state(), EscrowState::Draft));

        // Payer accepts
        env.set_caller(payer);
        escrow.accept();
        assert!(matches!(escrow.get_state(), EscrowState::Accepted));

        // Payer funds
        escrow.fund(1000);
        assert!(matches!(escrow.get_state(), EscrowState::Funded));
        assert_eq!(escrow.get_balance(), 1000);

        // Payer releases
        escrow.release();
        assert!(matches!(escrow.get_state(), EscrowState::Released));
        assert_eq!(escrow.get_balance(), 0);
    }
}
