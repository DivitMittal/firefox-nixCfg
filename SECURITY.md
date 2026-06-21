# Security Policy

## Scope

This repo contains a declarative Firefox home-manager module with Betterfox, CSS hacks, and fx-autoconfig. The relevant attack surface includes:

- **fx-autoconfig scripts** executed with full browser privileges — malicious JS in autoconfig files
- **CSS hacks** injected into browser chrome
- **Nix module options** that write Firefox config files or enable potentially unsafe preferences

## Reporting a Vulnerability

If you find a security issue (e.g. an autoconfig script that could be exploited, or a pref that weakens browser security):

1. Open a **GitHub issue** with the label `security`.
2. Include a description, reproduction steps, and impact assessment.

## Out of Scope

- Firefox platform security issues (report to Mozilla)
- Issues in upstream Betterfox or nixpkgs (report upstream)

## Supported Versions

Only the latest commit on `main` is supported.
