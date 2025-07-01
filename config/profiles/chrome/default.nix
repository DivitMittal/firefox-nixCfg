{
  currentProfileDir,
  config,
  lib,
  moduleInputs,
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
      source = moduleInputs.fx-autoconfig + "/profile/chrome/resources";
      recursive = true;
    };
    home.file."${currentProfileDir}/chrome/utils" = {
      source = moduleInputs.fx-autoconfig + "/profile/chrome/utils";
      recursive = true;
    };
  };
}