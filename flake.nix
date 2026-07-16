{
  description = "firefox-nixCfg flake";

  outputs = inputs: let
    inherit (inputs.flake-parts.lib) mkFlake;
    isX86Darwin = system: system == "x86_64-darwin";
  in
    mkFlake {inherit inputs;} ({inputs, ...}: {
      systems = import inputs.systems;
      imports = [
        (inputs.import-tree ./flake)
        ./modules
        ./pkgs
        ./config
      ];
      perSystem = {system, ...}: {
        _module.args.pkgs =
          if isX86Darwin system
          then import inputs."nixpkgs-2605" {inherit system;}
          else import inputs.nixpkgs {inherit system;};
      };
    });

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    "nixpkgs-2605".url = "github:NixOS/nixpkgs/nixpkgs-26.05-darwin";
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
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    actions-nix = {
      url = "github:nialov/actions.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-parts.follows = "flake-parts";
        git-hooks.follows = "git-hooks";
      };
    };
    import-tree.url = "github:vic/import-tree";
    ## Firefox
    betterfox-nix = {
      url = "github:heitoraugustoln/betterfox-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nixpkgs-firefox-darwin = {
      url = "github:bandithedoge/nixpkgs-firefox-darwin";
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
