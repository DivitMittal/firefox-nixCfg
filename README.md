<h1 align='center'>firefox-nixCfg</h1>
<div align='center'>
    <p>A declarative Firefox configuration using Nix home-manager, designed for enhanced performance, a streamlined UI, and powerful automation.</p>
    <div align='center'>
        <a href='https://github.com/DivitMittal/firefox-nixCfg'>
            <img src='https://img.shields.io/github/repo-size/DivitMittal/firefox-nixCfg?&style=for-the-badge&logo=github'>
        </a>
        <a href='https://github.com/DivitMittal/firefox-nixCfg/blob/main/LICENSE'>
            <img src='https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=MIT&logo=unlicense'/>
        </a>
    </div>
    <br>
</div>

---

<div align='center'>
    <img src="https://github.com/DivitMittal/firefox-nixCfg/actions/workflows/.github/workflows/flake-check.yml/badge.svg" alt="nix-flake-check"/>
</div>

---

This Nix flake provides a highly customized and declarative Firefox configuration, managed through a [home-manager](https://github.com/nix-community/home-manager) module. It focuses on delivering a superior browsing experience by integrating performance enhancements, UI/UX improvements, and automation scripts.

## ✨ Features

### 🚀 Performance & Security (Betterfox)

The configuration incorporates hardened user preferences inspired by projects like [Betterfox](https://github.com/yokoffing/Betterfox). These settings are applied automatically via `autoconfig` scripts to enhance browsing speed, reduce memory usage, and improve security and privacy by default.

### 🎨 UI/UX & CSS Hacks

The user interface is heavily customized to be minimal, clean, and efficient.

- **Minimalist Design:** The tab bar is hidden, and the URL bar is streamlined for a distraction-free look.
- **Custom Styles:** Additional CSS tweaks are applied to refine margins and element spacing for a polished feel.
- **Declarative Theming:** All `userChrome.css` and `userContent.css` files are managed directly by Nix.

*Placeholder for UI/UX Screenshot:*
`![Custom Firefox UI](path/to/your/screenshot.png)`

### 🤖 Automation & Sidebery

Advanced functionality is added via JavaScript user scripts (`*.uc.js`), enabling powerful UI automation.

- **Collapsible Sidebery:** The [Sidebery](https://addons.mozilla.org/en-US/firefox/addon/sidebery/) extension's sidebar can be automatically collapsed and expanded on hover, maximizing screen real estate without sacrificing functionality.

*Placeholder for Sidebery Automation GIF:*
`![Sidebery Automation GIF](path/to/your/automation.gif)`

### ⌨️ Tridactyl Integration

For keyboard-driven power users, the configuration includes a custom theme and setup for the [Tridactyl](https://github.com/tridactyl/tridactyl) extension, providing a seamless Vim-like browsing experience.

##  Flakes Usage

To use this module in your own configuration, add it to your `flake.nix` inputs:

```nix
# flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    home-manager.url = "github:nix-community/home-manager";
    firefox-nixCfg.url = "github:DivitMittal/firefox-nixCfg";
  };

  outputs = { self, nixpkgs, home-manager, firefox-nixCfg, ... }: {
    homeConfigurations.your-user = home-manager.lib.homeManagerConfiguration {
      pkgs = nixpkgs.legacyPackages.x86_64-linux; # Or your system
      modules = [
        # Import the module
        (firefox-nixCfg.homeManagerModules.firefox-nixCfg firefox-nixCfg.inputs)

        # Your other modules
        ./home.nix
      ];
    };
  };
}
```

Then, enable it in your `home.nix`:

```nix
# home.nix
{
  programs.firefox-nixCfg = {
    enable = true;
    # Optionally enable Tridactyl support
    enableTridactyl = true;
  };
}
```