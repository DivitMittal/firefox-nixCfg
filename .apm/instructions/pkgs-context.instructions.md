---
description: Custom packages and nvfetcher source management under pkgs/
applyTo: "pkgs/**"
---

## Pkgs Directory Context

`pkgs/default.nix` re-exports all custom packages and is the entry point for the overlay consumed by the flake.

## Subdirectory Guide

### `pkgs/custom/webhid-for-firefox/`

A custom package that patches Firefox to expose WebHID support. When modifying:
- Update the derivation in this directory only.
- Ensure the package attribute name in `pkgs/default.nix` remains stable — the module references it by name.
- Test with `nix build .#webhid-for-firefox` before committing.

### `pkgs/_sources/`

Generated entirely by **nvfetcher**. The files here record fetched source hashes and metadata.

**Never edit `pkgs/_sources/` manually.** To update sources:
1. Enter the devshell: `nix develop`
2. Run the `pkgs-update` command (wraps `nvfetcher run`).
3. Commit the resulting diff in `pkgs/_sources/` as a separate atomic commit.

The nvfetcher configuration (specifying what to fetch) lives outside `_sources/` — consult the top-level `nvfetcher.toml` or equivalent config file for source definitions.

## Constraints

- All new custom packages go under `pkgs/custom/` and must be re-exported from `pkgs/default.nix`.
- Do not pin versions by editing `_sources/` — use `pkgs-update` and let nvfetcher manage hashes.
