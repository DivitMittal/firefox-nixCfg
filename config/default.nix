{self, ...}: {
  flake.homeManagerConfigurations = rec {
    Cfg = import ./setup.nix self;
    default = Cfg;
  };
}
