#![doc = "Binary for building schema files from odra contracts."]
fn main() {
    <termina_contracts::Escrow as odra::contract::OdraContract>::schema();
}
