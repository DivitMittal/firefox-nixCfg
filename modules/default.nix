{
  self,
  inputs,
  ...
}: {
  flake.homeManagerModules = rec {
    default = import ./firefox-nixCfg.nix {inherit self inputs;};
    firefox-nixCfg = default;
  };
}
