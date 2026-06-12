{
  currentProfileDir,
  config,
  lib,
  firefox-nixCfg,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
in {
  imports = [
    ./CSS
    ./JS
  ];

  config = mkIf cfg.enable {
    home.file."${currentProfileDir}/chrome/resources" = {
      source = firefox-nixCfg.inputs.fx-autoconfig + "/profile/chrome/resources";
      recursive = true;
    };
    home.file."${currentProfileDir}/chrome/utils" = {
      source = firefox-nixCfg.inputs.fx-autoconfig + "/profile/chrome/utils";
      recursive = true;
    };
  };
}
