//! Test contract for String argument deserialization

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::String;
use casper_contract::contract_api::{runtime, storage};

#[no_mangle]
pub extern "C" fn call() {
    // Try to read a String argument
    let description: String = runtime::get_named_arg("description");

    // Store the length to verify it was read correctly
    let len = description.len() as u32;
    runtime::put_key("test_desc_len", storage::new_uref(len).into());
}
