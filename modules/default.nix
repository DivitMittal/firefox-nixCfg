_: {
  flake.homeManagerModules = rec {
    default = builtins.import ./firefox-nixCfg.nix;
    firefox-nixCfg = default;
  };
}