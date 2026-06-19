---
description: Home-manager module authoring rules and platform-split details for modules/home/
applyTo: "modules/**"
---

## Module Directory Context

`modules/home/firefox-nixCfg.nix` is the single home-manager module. It is the integration point between the Nix module system and the Firefox configuration files under `config/`.

## Exposed Options

| Option | Type | Purpose |
|---|---|---|
| `programs.firefox-nixCfg.enable` | bool | Master toggle |
| `programs.firefox-nixCfg.package` | package | Override the Firefox package |
| `programs.firefox-nixCfg.enableTridactyl` | bool | Gate Tridactyl extension wiring |

## Platform Split

The module branches on `pkgs.stdenv.isDarwin`:

- **macOS**: Pulls Firefox from the `nixpkgs-firefox-darwin` overlay (native binary). fx-autoconfig is wired in via `extraFiles` on the profile.
- **Linux**: Uses standard nixpkgs `firefox`. fx-autoconfig is wired in via `extraPrefsFiles`.

Both paths must be kept in sync. **Do not add a new top-level option without also handling it on both branches.**

## Betterfox Integration

Betterfox is imported as a separate home-manager module that generates `user.js`. It is not inlined into `firefox-nixCfg.nix` — reference it as a module import, do not duplicate its logic.

## Constraints

- Preserve the existing option namespace (`programs.firefox-nixCfg.*`).
- Platform-conditional logic lives in this module, not in `config/`.
- `modules/default.nix` re-exports this module; do not bypass it.
