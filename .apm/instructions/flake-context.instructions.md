---
description: Flake-level tooling context for formatters, checks, devshell, and CI actions
applyTo: "flake/**"
---

## Flake Directory Context

`flake.nix` auto-imports every `.nix` file under `flake/` via `customLib.scanPaths`. Adding a file here makes it active automatically — no explicit import needed.

## Files and Responsibilities

- **`formatters.nix`**: treefmt configuration. alejandra handles `.nix` files; prettier handles `.css` and `.js` files. Always run `nix fmt` before committing — the pre-commit hook enforces this.
- **`checks.nix`**: pre-commit hooks (whitespace trimming, large-file guard, merge-conflict detection, and formatter checks).
- **`devshells.nix`**: development shell providing nixd, alejandra, prettier, nvfetcher, and apm-cli. Activated automatically via direnv.
- **`actions/`**: GitHub Actions workflows generated via actions-nix. **Never edit `.github/workflows/` directly** — regenerate from `actions/` instead.

## Constraints

- Do not add a `default.nix` or manual import list — `customLib.scanPaths` handles discovery.
- Keep each concern in its own file (formatters separate from checks, etc.).
- `nix flake check` must pass before any commit.
