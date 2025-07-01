{
  pkgs,
  config,
  lib,
  ...
}: let
  cfg = config.programs.firefox-nixCfg;
  inherit (lib) mkIf;
in {
  config = mkIf cfg.enable (let
    inherit (cfg) enableTridactyl;
  in {
    programs.firefox.nativeMessagingHosts = mkIf enableTridactyl [pkgs.tridactyl-native];

    xdg.configFile."tridactyl" = {
      enable = enableTridactyl;
      source = ./config;
      recursive = true;
    };
  });
}
