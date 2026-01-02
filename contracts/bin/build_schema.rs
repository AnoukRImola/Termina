use std::process::Command;

fn main() {
    let output = Command::new("cargo")
        .args(["odra", "schema"])
        .output()
        .expect("Failed to execute schema command");

    println!("{}", String::from_utf8_lossy(&output.stdout));
    eprintln!("{}", String::from_utf8_lossy(&output.stderr));
}
