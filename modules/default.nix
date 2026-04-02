{
  self,
  inputs,
  ...
}: {
  flake.homeManagerModules = rec {
    ## Default Alias
    default = firefox-nixCfg;

    ## Individual Modules
    firefox-nixCfg = import ./home/firefox-nixCfg.nix {inherit self inputs;};
  };
}
