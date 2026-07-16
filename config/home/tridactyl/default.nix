{
  config,
  lib,
  firefox-nixCfg,
  pkgs,
  ...
}: let
  cfg = config.programs.firefox-nixCfg;
  inherit (lib) mkIf;
in {
  config = mkIf cfg.enable (let
    inherit (cfg) enableTridactyl;
  in {
    programs.firefox.nativeMessagingHosts = mkIf enableTridactyl [firefox-nixCfg.inputs."nixpkgs-2605".legacyPackages.${pkgs.stdenvNoCC.hostPlatform.system}.tridactyl-native];

    xdg.configFile."tridactyl" = {
      enable = enableTridactyl;
      source = ./config;
      recursive = true;
    };
  });
}
