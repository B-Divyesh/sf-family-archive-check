fn main() {
    println!("cargo:rerun-if-changed=../src/main.ts");
    println!("cargo:rerun-if-env-changed=FAC_BUILD_COMMIT");

    let interface = std::fs::read_to_string("../src/main.ts")
        .expect("the desktop interface source must be available");
    for required in [
        "Import recovery file list",
        "id=\"recovery-file-input\"",
        "importRecoveryFile",
    ] {
        assert!(
            interface.contains(required),
            "desktop releases require recovery-file import: missing {required}"
        );
    }

    let source_commit = std::env::var("FAC_BUILD_COMMIT").unwrap_or_else(|_| "development".into());
    println!("cargo:rustc-env=FAC_BUILD_COMMIT={source_commit}");

    if std::env::var_os("CARGO_FEATURE_DESKTOP").is_some() {
        tauri_build::build();
    }
}
