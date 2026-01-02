use std::process::Command;

fn main() {
    let output = Command::new("cargo")
        .args(["odra", "build"])
        .output()
        .expect("Failed to execute build command");

    println!("{}", String::from_utf8_lossy(&output.stdout));
    eprintln!("{}", String::from_utf8_lossy(&output.stderr));
}
