//! Native Escrow Contract for Casper 2.0
//! Simplified escrow for B2B payments

#![no_std]
#![no_main]

extern crate alloc;

use alloc::{string::{String, ToString}, vec, vec::Vec};
use casper_contract::{
    contract_api::{runtime, storage, system},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    api_error::ApiError,
    addressable_entity::{
        EntityEntryPoint, EntryPointAccess, EntryPointPayment, EntryPointType, EntryPoints, Parameter,
    },
    CLType, CLValue, URef, U512, NamedKeys,
    account::AccountHash, CLTyped, bytesrepr::FromBytes,
};

// Contract keys
const CONTRACT_PACKAGE_NAME: &str = "escrow_package";
const CONTRACT_ACCESS_UREF: &str = "escrow_access_uref";
const CONTRACT_KEY: &str = "escrow_contract";

// State keys
const STATE_KEY: &str = "state";
const ISSUER_KEY: &str = "issuer";
const PAYER_KEY: &str = "payer";
const AMOUNT_KEY: &str = "amount";
const DESCRIPTION_KEY: &str = "description";
const BALANCE_KEY: &str = "balance";
const PURSE_KEY: &str = "escrow_purse";

// Entry point names
const EP_ACCEPT: &str = "accept";
const EP_FUND: &str = "fund";
const EP_RELEASE: &str = "release";
const EP_CANCEL: &str = "cancel";
const EP_GET_STATE: &str = "get_state";
const EP_GET_BALANCE: &str = "get_balance";

// States: 0=Draft, 1=Accepted, 2=Funded, 3=Released, 4=Cancelled
const STATE_DRAFT: u8 = 0;
const STATE_ACCEPTED: u8 = 1;
const STATE_FUNDED: u8 = 2;
const STATE_RELEASED: u8 = 3;
const STATE_CANCELLED: u8 = 4;

// Custom errors
#[repr(u16)]
enum EscrowError {
    InvalidState = 1,
    Unauthorized = 2,
    InsufficientFunds = 3,
    TransferFailed = 4,
}

impl From<EscrowError> for ApiError {
    fn from(e: EscrowError) -> Self {
        ApiError::User(e as u16)
    }
}

// Helper to get stored value
fn get_uref(name: &str) -> URef {
    runtime::get_key(name)
        .unwrap_or_revert_with(ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert_with(ApiError::UnexpectedKeyVariant)
}

fn get_key<T: FromBytes + CLTyped>(name: &str) -> T {
    let uref = get_uref(name);
    storage::read(uref)
        .unwrap_or_revert()
        .unwrap_or_revert()
}

fn set_key<T: casper_types::bytesrepr::ToBytes + CLTyped>(name: &str, value: T) {
    let uref = get_uref(name);
    storage::write(uref, value);
}

/// Accept the escrow terms (called by payer)
#[no_mangle]
pub extern "C" fn accept() {
    let state: u8 = get_key(STATE_KEY);
    if state != STATE_DRAFT {
        runtime::revert(EscrowError::InvalidState);
    }

    let payer: AccountHash = get_key(PAYER_KEY);
    if runtime::get_caller() != payer {
        runtime::revert(EscrowError::Unauthorized);
    }

    set_key(STATE_KEY, STATE_ACCEPTED);
}

/// Fund the escrow (called by payer with attached value)
#[no_mangle]
pub extern "C" fn fund() {
    let state: u8 = get_key(STATE_KEY);
    if state != STATE_ACCEPTED {
        runtime::revert(EscrowError::InvalidState);
    }

    let payer: AccountHash = get_key(PAYER_KEY);
    if runtime::get_caller() != payer {
        runtime::revert(EscrowError::Unauthorized);
    }

    let required_amount: U512 = get_key(AMOUNT_KEY);
    let amount: U512 = runtime::get_named_arg("amount");

    if amount < required_amount {
        runtime::revert(EscrowError::InsufficientFunds);
    }

    // Get escrow purse and transfer funds from caller's main purse
    let escrow_purse: URef = get_uref(PURSE_KEY);

    // Get caller's main purse
    let source_purse: URef = runtime::get_named_arg("source");

    system::transfer_from_purse_to_purse(source_purse, escrow_purse, amount, None)
        .unwrap_or_revert_with(EscrowError::TransferFailed);

    set_key(BALANCE_KEY, amount);
    set_key(STATE_KEY, STATE_FUNDED);
}

/// Release funds to issuer (called by payer)
#[no_mangle]
pub extern "C" fn release() {
    let state: u8 = get_key(STATE_KEY);
    if state != STATE_FUNDED {
        runtime::revert(EscrowError::InvalidState);
    }

    let payer: AccountHash = get_key(PAYER_KEY);
    if runtime::get_caller() != payer {
        runtime::revert(EscrowError::Unauthorized);
    }

    let issuer: AccountHash = get_key(ISSUER_KEY);
    let balance: U512 = get_key(BALANCE_KEY);
    let escrow_purse: URef = get_uref(PURSE_KEY);

    // Transfer to issuer
    system::transfer_from_purse_to_account(escrow_purse, issuer, balance, None)
        .unwrap_or_revert_with(EscrowError::TransferFailed);

    set_key(BALANCE_KEY, U512::zero());
    set_key(STATE_KEY, STATE_RELEASED);
}

/// Cancel escrow (only in Draft or Accepted state)
#[no_mangle]
pub extern "C" fn cancel() {
    let state: u8 = get_key(STATE_KEY);
    let caller = runtime::get_caller();
    let issuer: AccountHash = get_key(ISSUER_KEY);
    let payer: AccountHash = get_key(PAYER_KEY);

    match state {
        STATE_DRAFT => {
            if caller != issuer {
                runtime::revert(EscrowError::Unauthorized);
            }
        }
        STATE_ACCEPTED => {
            if caller != issuer && caller != payer {
                runtime::revert(EscrowError::Unauthorized);
            }
        }
        _ => runtime::revert(EscrowError::InvalidState),
    }

    set_key(STATE_KEY, STATE_CANCELLED);
}

/// Get current state (view function)
#[no_mangle]
pub extern "C" fn get_state() {
    let state: u8 = get_key(STATE_KEY);
    runtime::ret(CLValue::from_t(state).unwrap_or_revert());
}

/// Get current balance (view function)
#[no_mangle]
pub extern "C" fn get_balance() {
    let balance: U512 = get_key(BALANCE_KEY);
    runtime::ret(CLValue::from_t(balance).unwrap_or_revert());
}

/// Contract installation entry point
#[no_mangle]
pub extern "C" fn call() {
    // For demo: use caller as both issuer and payer
    let caller = runtime::get_caller();
    let issuer = caller;
    let payer = caller;

    // Use U64 for amount (simpler serialization), convert to U512 for storage
    let amount_u64: u64 = runtime::get_named_arg("amount");
    let amount = U512::from(amount_u64);
    let description: String = runtime::get_named_arg("description");

    // Create escrow purse to hold funds
    let escrow_purse = system::create_purse();

    // Create named keys with initial state
    let mut named_keys = NamedKeys::new();
    named_keys.insert(STATE_KEY.to_string(), storage::new_uref(STATE_DRAFT).into());
    named_keys.insert(ISSUER_KEY.to_string(), storage::new_uref(issuer).into());
    named_keys.insert(PAYER_KEY.to_string(), storage::new_uref(payer).into());
    named_keys.insert(AMOUNT_KEY.to_string(), storage::new_uref(amount).into());
    named_keys.insert(DESCRIPTION_KEY.to_string(), storage::new_uref(description).into());
    named_keys.insert(BALANCE_KEY.to_string(), storage::new_uref(U512::zero()).into());
    named_keys.insert(PURSE_KEY.to_string(), escrow_purse.into());

    // Define entry points (Casper 2.0 API)
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_ACCEPT,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_FUND,
        vec![
            Parameter::new("amount", CLType::U512),
            Parameter::new("source", CLType::URef),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_RELEASE,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_CANCEL,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_GET_STATE,
        Vec::new(),
        CLType::U8,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    entry_points.add_entry_point(EntityEntryPoint::new(
        EP_GET_BALANCE,
        Vec::new(),
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
        EntryPointPayment::Caller,
    ));

    // Install contract (Casper 2.0 API with message_topics)
    let (contract_hash, _contract_version) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some(CONTRACT_PACKAGE_NAME.to_string()),
        Some(CONTRACT_ACCESS_UREF.to_string()),
        None, // message_topics - not used in this contract
    );

    // Store contract hash for easy access
    runtime::put_key(CONTRACT_KEY, contract_hash.into());
}
