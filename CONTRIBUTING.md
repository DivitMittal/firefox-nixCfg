# Contributing

Contributions are welcome — bug reports, fixes, and improvements to the Firefox or Nix configuration.

## Setup

```sh
nix develop   # enter dev shell (nixd, alejandra, prettier)
```

## Guidelines

- **Nix files**: format with `alejandra` (enforced by pre-commit)
- **CSS/JS files**: format with `prettier` (enforced by pre-commit)
- Run `nix flake check` before submitting — CI runs the same check
- Test changes on the target platform (macOS or Linux) since they use different Firefox packages

## Submitting Changes

1. Fork the repo and create a branch: `feat/description` or `fix/description`
2. Keep commits atomic; use [Conventional Commits](https://www.conventionalcommits.org/) format
3. Open a PR against `main` with a clear description of what and why

## Reporting Issues

Open a GitHub issue with:
- Your platform (macOS/Linux) and nixpkgs channel
- Steps to reproduce
- Expected vs actual behavior
