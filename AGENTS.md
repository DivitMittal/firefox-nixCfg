## Project Overview

This is a Nix flake that provides a declarative Firefox configuration module for home-manager. It creates a highly customized Firefox setup with performance enhancements (Betterfox), UI customizations (CSS hacks), and automation scripts (fx-autoconfig).

## Development Commands

### Nix Flake Commands

- `nix develop` - Enter development shell with all tools (nixd, alejandra, prettier)
- `nix flake check` - Validate flake and run all checks
- `nix flake update` - Update flake.lock dependencies
- `nix build` - Build the home-manager module

### Formatting and Linting

- `nix fmt` - Format all files using treefmt (alejandra for Nix, prettier for web files)
- `deadnix` - Remove unused Nix code (available in dev shell)
- `statix` - Nix static analysis and linting (available in dev shell)

### Pre-commit Hooks

Git hooks are automatically installed in the dev shell and will run:

- Trailing whitespace trimming
- Large file checks (excludes images: .png, .jpg, .jpeg, .svg, .gif)
- Case conflict detection
- Executable/shebang validation
- Merge conflict detection
- Private key detection

## Architecture

### Core Structure

```
flake/               # Flake configuration modules
├── devshells.nix   # Development environment setup
├── formatters.nix  # treefmt formatting configuration
├── checks.nix      # Pre-commit hooks and validation
├── actions/        # GitHub Actions workflows (flake-check, flake-lock-update)
└── default.nix     # Auto-imports all flake modules

modules/             # Nix module definitions
├── default.nix     # Module entry point
└── firefox-nixCfg.nix  # Main home-manager module

config/              # Firefox configuration components
├── default.nix     # Imports tridactyl, profiles, policies
├── tridactyl/      # Tridactyl extension configuration
├── profiles/       # Firefox profile configurations
│   ├── chrome/     # Custom CSS and JS for UI modifications
│   └── default.nix # Profile management
└── policies.nix    # Firefox enterprise policies
```

### Key Dependencies

- **flake-parts**: Modular flake structure
- **betterfox-nix**: Performance and privacy user.js generation
- **nixpkgs-firefox-darwin**: macOS Firefox binary support
- **fx-autoconfig**: Enables custom userChrome.css and \*.uc.js loading
- **fx-csshacks**: UI customization CSS collection

### Module Architecture

The main module (`modules/firefox-nixCfg.nix`) provides:

- `programs.firefox-nixCfg.enable` - Main toggle
- `programs.firefox-nixCfg.package` - Custom Firefox package override
- `programs.firefox-nixCfg.enableTridactyl` - Tridactyl extension support

Platform-specific handling:

- **macOS**: Uses `nixpkgs-firefox-darwin` overlay for native Firefox binary with fx-autoconfig integration
- **Linux**: Uses standard nixpkgs Firefox with extraPrefsFiles for fx-autoconfig

### Configuration Components

- **Betterfox**: Imported as home-manager module for user.js generation
- **CSS Customization**: Located in `config/profiles/chrome/CSS/` for userChrome.css
- **JavaScript Automation**: Located in `config/profiles/chrome/JS/` for \*.uc.js files
- **Tridactyl**: Separate configuration module in `config/tridactyl/`

## Development Guidelines

### File Organization

- Place new Firefox configurations in appropriate `config/` subdirectories
- Use `config/profiles/chrome/` for UI-related CSS/JS customizations
- Add new Nix modules to `modules/` and import via `default.nix`
- Flake-level configurations go in `flake/` directory

### Platform Considerations

- Test changes on both macOS and Linux as they use different Firefox packages
- macOS uses `firefox-bin` with `extraFiles` for fx-autoconfig integration
- Linux uses `firefox` with `extraPrefsFiles` approach

### Code Quality

- All Nix code is formatted with alejandra
- Web files (CSS, JS) are formatted with prettier
- Pre-commit hooks enforce code quality standards
- Use `nix flake check` to validate changes before committing

### External Dependencies

- **OS-nixCfg**: Provides custom library functions via `customLib.scanPaths`
- **fx-autoconfig**: Enables userChrome.css and autoconfig.js loading
- **fx-csshacks**: Source of CSS customizations for Firefox UI
