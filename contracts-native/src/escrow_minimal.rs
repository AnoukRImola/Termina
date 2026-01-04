//! Minimal escrow that just reads args and stores them
//! Test to isolate the serialization issue

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::{String, ToString};
use casper_contract::{
    contract_api::{runtime, storage, system},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, NamedKeys},
    CLType, U512,
};

const CONTRACT_PACKAGE_NAME: &str = "escrow_package";
const CONTRACT_ACCESS_UREF: &str = "escrow_access_uref";
const CONTRACT_KEY: &str = "escrow_contract";

#[no_mangle]
pub extern "C" fn get_state() {
    // Simple view function
}

#[no_mangle]
pub extern "C" fn call() {
    // Read arguments exactly like the main escrow
    let amount_u64: u64 = runtime::get_named_arg("amount");
    let description: String = runtime::get_named_arg("description");

    // Use caller as both issuer and payer (like the main escrow)
    let caller = runtime::get_caller();

    // Create escrow purse
    let escrow_purse = system::create_purse();

    // Create named keys
    let mut named_keys = NamedKeys::new();
    named_keys.insert("state".to_string(), storage::new_uref(0u8).into());
    named_keys.insert("issuer".to_string(), storage::new_uref(caller).into());
    named_keys.insert("payer".to_string(), storage::new_uref(caller).into());
    named_keys.insert("amount".to_string(), storage::new_uref(U512::from(amount_u64)).into());
    named_keys.insert("description".to_string(), storage::new_uref(description).into());
    named_keys.insert("balance".to_string(), storage::new_uref(U512::zero()).into());
    named_keys.insert("escrow_purse".to_string(), escrow_purse.into());

    // Create minimal entry points
    let mut entry_points = EntryPoints::new();
    entry_points.add_entry_point(EntryPoint::new(
        "get_state",
        alloc::vec::Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Install contract
    let (contract_hash, _) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some(CONTRACT_PACKAGE_NAME.to_string()),
        Some(CONTRACT_ACCESS_UREF.to_string()),
    );

    runtime::put_key(CONTRACT_KEY, contract_hash.into());
}
