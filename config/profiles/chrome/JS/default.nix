{
  config,
  lib,
  currentProfileDir,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
in {
  config = mkIf cfg.enable {
    home.file."${currentProfileDir}/chrome/JS/test.uc.js".source = ./test.uc.js;
    home.file."${currentProfileDir}/chrome/JS/collapse_sideberry.uc.js".source = ./collapse_sideberry.uc.js;
  };
}
