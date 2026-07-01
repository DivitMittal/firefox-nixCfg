self: {
  imports = [self.homeManagerModules.default];
  programs.firefox-nixCfg.enable = true;
}
