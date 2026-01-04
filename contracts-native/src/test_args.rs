//! Test contract for argument deserialization
//! Tests if casper-js-sdk 5.x args are compatible with casper-contract 3.x

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::ToString;
use casper_contract::contract_api::{runtime, storage};
use casper_types::U512;

#[no_mangle]
pub extern "C" fn call() {
    // Try to read a u64 argument
    let amount: u64 = runtime::get_named_arg("amount");

    // Store it to verify it was read correctly
    runtime::put_key("test_amount", storage::new_uref(amount).into());

    // Also store as U512 to verify
    let amount_u512 = U512::from(amount);
    runtime::put_key("test_amount_u512", storage::new_uref(amount_u512).into());
}
