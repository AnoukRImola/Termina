//! Termina: Escrow infrastructure for B2B workflows on Casper
//!
//! This crate provides programmable escrow contracts for enterprise workflows,
//! demonstrated through B2B invoice tokenization.

pub mod escrow;
pub mod events;
pub mod types;

pub use escrow::Escrow;
pub use events::*;
pub use types::*;
