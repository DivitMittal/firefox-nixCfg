{inputs, ...}: {
  flake.homeManagerModules = rec {
    default = builtins.import ./firefox-nixCfg.nix inputs;
    firefox-nixCfg = default;
  };
}