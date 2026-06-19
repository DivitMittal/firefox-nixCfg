self: {
  imports = [
    (self.inputs.import-tree ./home)
    self.homeManagerModules.default
  ];
  _module.args.firefox-nixCfg = self;
  programs.firefox-nixCfg.enable = true;
}
