{
  currentProfileDir,
  inputs,
  config,
  lib,
  ...
}: let
  cfg = config.programs.firefox-nixCfg;
in {
  imports = [
    ./CSS
  ];

  config = lib.mkIf cfg.enable {
    ## fx-autoconfig
    home.file."${currentProfileDir}/chrome/JS" = {
      source = ./JS;
      recursive = true;
    };
    home.file."${currentProfileDir}/chrome/resources" = {
      source = inputs.fx-autoconfig + "/profile/chrome/resources";
      recursive = true;
    };
    home.file."${currentProfileDir}/chrome/utils" = {
      source = inputs.fx-autoconfig + "/profile/chrome/utils";
      recursive = true;
    };
  };
}