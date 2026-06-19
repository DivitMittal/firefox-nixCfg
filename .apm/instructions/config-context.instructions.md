---
description: Firefox configuration components — CSS/JS chrome, Tridactyl, and enterprise policies
applyTo: "config/**"
---

## Config Directory Context

`config/default.nix` is the entry point; it imports tridactyl, profiles, and policies and is auto-imported by the home-manager module. Do not bypass it when adding new sub-modules.

## Subdirectory Guide

### `config/profiles/chrome/CSS/`

Contains userChrome.css customizations sourced from **fx-csshacks**. Current state:
- The tab bar is hidden.
- The URL bar is streamlined.

When modifying: CSS changes apply on both platforms but take effect only after fx-autoconfig loads them. Do not restructure the file layout without also updating the profile `extraFiles`/`extraPrefsFiles` wiring in the module.

### `config/profiles/chrome/JS/`

Contains `*.uc.js` automation scripts loaded by **fx-autoconfig**. Each file is loaded in alphabetical order at Firefox startup. Script scope is the browser chrome (not web content). Keep scripts idempotent — they run on every startup.

### `config/tridactyl/`

Tridactyl extension configuration. Only active when `programs.firefox-nixCfg.enableTridactyl = true`. Changes here have no effect unless the extension is installed and the option is enabled.

### `config/policies.nix`

Firefox enterprise policies expressed as Nix. These are deployed via the `policies.json` mechanism and take precedence over user preferences. Prefer `user.js` (Betterfox) for preferences that should be user-overridable; use policies only for hard-enforced settings.

## Testing Note

CSS and JS changes affect both macOS and Linux, but the fx-autoconfig integration mechanism differs between platforms (see `modules/home/firefox-nixCfg.nix`). Verify on both platforms before committing if the change touches the loading path rather than just file content.
