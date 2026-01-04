//! Test if storage::new_contract causes the serialization issue

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::{String, ToString};
use casper_contract::contract_api::{runtime, storage};
use casper_types::{
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, NamedKeys},
    CLType, U512,
};

#[no_mangle]
pub extern "C" fn dummy() {}

#[no_mangle]
pub extern "C" fn call() {
    // Read args first
    let amount: u64 = runtime::get_named_arg("amount");
    let description: String = runtime::get_named_arg("description");

    // Create named keys (simpler than escrow)
    let mut named_keys = NamedKeys::new();
    named_keys.insert("amount".to_string(), storage::new_uref(U512::from(amount)).into());
    named_keys.insert("description".to_string(), storage::new_uref(description).into());

    // Create entry points
    let mut entry_points = EntryPoints::new();
    entry_points.add_entry_point(EntryPoint::new(
        "dummy",
        alloc::vec::Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Install contract - THIS is the test
    let (contract_hash, _) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some("test_package".to_string()),
        Some("test_access".to_string()),
    );

    runtime::put_key("test_contract", contract_hash.into());
}
