//! Test contract for multiple arguments deserialization

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::String;
use casper_contract::contract_api::{runtime, storage};
use casper_types::U512;

#[no_mangle]
pub extern "C" fn call() {
    // Read both arguments - same as the escrow contract
    let amount: u64 = runtime::get_named_arg("amount");
    let description: String = runtime::get_named_arg("description");

    // Store to verify
    runtime::put_key("test_amount", storage::new_uref(U512::from(amount)).into());
    runtime::put_key("test_desc_len", storage::new_uref(description.len() as u32).into());
}
