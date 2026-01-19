{
  firefox-nixCfg,
  currentProfileDir,
  config,
  lib,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
in {
  config = mkIf cfg.enable {
    home.file."${currentProfileDir}/chrome/CSS/fx-csshacks" = {
      source = firefox-nixCfg.inputs.fx-csshacks;
      recursive = true;
    };

    home.file."${currentProfileDir}/chrome/CSS/custom" = {
      source = ./custom;
      recursive = true;
    };
  };
}
