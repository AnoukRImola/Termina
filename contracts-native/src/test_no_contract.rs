//! Test WITHOUT storage::new_contract - just runtime::put_key

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::String;
use casper_contract::contract_api::{runtime, storage};
use casper_types::U512;

#[no_mangle]
pub extern "C" fn call() {
    // Read args
    let amount: u64 = runtime::get_named_arg("amount");
    let description: String = runtime::get_named_arg("description");

    // Store using runtime::put_key (like test_both)
    runtime::put_key("amount", storage::new_uref(U512::from(amount)).into());
    runtime::put_key("description_len", storage::new_uref(description.len() as u32).into());
}
