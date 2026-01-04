//! Test storage::new_contract with minimal entry points (Casper 2.0 API)

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::{String, ToString};
use casper_contract::contract_api::{runtime, storage};
use casper_types::{
    EntryPoints, NamedKeys, U512,
};

#[no_mangle]
pub extern "C" fn call() {
    // Read args
    let amount: u64 = runtime::get_named_arg("amount");
    let _description: String = runtime::get_named_arg("description");

    // Create minimal named keys
    let mut named_keys = NamedKeys::new();
    named_keys.insert("test".to_string(), storage::new_uref(U512::from(amount)).into());

    // Create empty entry points (new API)
    let entry_points = EntryPoints::new();

    // Try new_contract with Casper 2.0 API (5 arguments, last one is message_topics)
    let (contract_hash, _) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some("test_pkg".to_string()),
        Some("test_access".to_string()),
        None, // message_topics
    );

    runtime::put_key("contract", contract_hash.into());
}
