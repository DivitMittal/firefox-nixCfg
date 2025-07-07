{
  description = "firefox-nixCfg flake";

  outputs = inputs: let
    inherit (inputs.flake-parts.lib) mkFlake;
    specialArgs.customLib = builtins.import (inputs.OS-nixCfg + "/lib/custom.nix") {inherit (inputs.nixpkgs) lib;};
  in
    mkFlake {inherit inputs specialArgs;} ({inputs, ...}: {
      systems = builtins.import inputs.systems;
      imports = [
        ./flake
        ./modules
      ];
    });

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    pre-commit-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    actions-nix = {
      url = "github:nialov/actions.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-parts.follows = "flake-parts";
        pre-commit-hooks.follows = "pre-commit-hooks";
      };
    };
    OS-nixCfg = {
      url = "github:DivitMittal/OS-nixCfg";
      flake = false;
    };
    ## Firefox
    betterfox-nix = {
      url = "github:heitoraugustoln/betterfox-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs-firefox-darwin = {
      url = "github:bandithedoge/nixpkgs-firefox-darwin";
      #url = "github:DivitMittal/nixpkgs-firefox-darwin/extra-files";
      #url = "path:/Users/div/Projects/Forks/nixpkgs-firefox-darwin";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    fx-autoconfig = {
      url = "github:MrOtherGuy/fx-autoconfig";
      flake = false;
    };
    fx-csshacks = {
      url = "github:MrOtherGuy/firefox-csshacks";
      flake = false;
    };
  };
}