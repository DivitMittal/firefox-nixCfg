{
  config,
  lib,
  ...
}: let
  cfg = config.programs.firefox-nixCfg;
in {
  config = lib.mkIf (cfg.enable && lib.hasAttr "stylix" config) {
    stylix.targets.firefox.profileNames = ["custom-default"];
  };
}
