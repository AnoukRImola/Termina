//! Minimal test contract for Casper 2.0

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::ToString;
use casper_contract::contract_api::{runtime, storage};
use casper_types::contracts::NamedKeys;

#[no_mangle]
pub extern "C" fn call() {
    // Just store a simple value to verify deployment works
    let mut named_keys = NamedKeys::new();
    named_keys.insert("test_value".to_string(), storage::new_uref(42u32).into());
    runtime::put_key("minimal_test", storage::new_uref(true).into());
}
