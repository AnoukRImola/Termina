//! Deploy Escrow contract to Casper testnet using Odra livenet backend

use odra::host::Deployer;
use odra::prelude::Addressable;
use termina_contracts::escrow::EscrowInitArgs;
use termina_contracts::types::EscrowConfig;
use termina_contracts::Escrow;

fn main() {
    // Get livenet environment
    let env = odra_casper_livenet_env::env();

    println!("=== ESCROW CONTRACT DEPLOYMENT ===");
    println!("Deploying to Casper testnet...");

    // Set gas for deployment (150 CSPR)
    env.set_gas(150_000_000_000u64);

    // Get deployer account (issuer) and second account (payer)
    let issuer = env.get_account(0);
    let payer = env.get_account(0); // For demo, same account

    println!("Deployer/Issuer: {:?}", issuer);
    println!("Payer: {:?}", payer);

    // Create a demo escrow configuration
    let config = EscrowConfig {
        id: "DEMO-001".to_string(),
        description: "Demo escrow for testing".to_string(),
        amount: 2_500_000_000, // 2.5 CSPR
        payer,
        arbiter: None,
        due_date: None,
    };

    let init_args = EscrowInitArgs { config };

    // Deploy the contract
    let contract = Escrow::deploy(&env, init_args);

    println!("\n=== DEPLOYMENT SUCCESSFUL ===");
    println!("Contract address: {:?}", contract.address());

    // Verify deployment by checking initial state
    let state = contract.get_state();
    println!("Initial state: {:?}", state);

    let invoice = contract.get_invoice();
    println!("Invoice: {:?}", invoice);

    println!("\nSave this contract address to use in your application!");
}
