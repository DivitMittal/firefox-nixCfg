{inputs, self, ...}: {
  flake.homeManagerModules = {
    ## Default import for all modules
    default = {
      _module.args.ffcfgInputs = inputs;
      _module.args.firefox-nixCfg = self;
      imports = [
        (inputs.import-tree ./home)
        (inputs.import-tree (self + "/config/home"))
        inputs.betterfox-nix.modules.homeManager.betterfox
      ];
    };

    ## Individual imports (for selective usage)
    firefox-nixCfg = {
      _module.args.ffcfgInputs = inputs;
      imports = [
        ./home/firefox-nixCfg.nix
        inputs.betterfox-nix.modules.homeManager.betterfox
      ];
    };
  };
}
