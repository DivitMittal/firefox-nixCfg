{
  pkgs,
  lib,
  config,
  ...
}: let
  inherit (lib) mkIf;
  inherit (pkgs.stdenvNoCC.hostPlatform) isDarwin;
  cfg = config.programs.firefox-nixCfg;
in {
  imports = [
    ./tridactyl
    ./profiles
  ];

  config = mkIf cfg.enable {
    programs.firefox = {
      enable = true;
      package =
        if isDarwin
        then null # added via home.packages, as this causes build issues
        else cfg.package;
      policies = (builtins.import ./policies.nix).policies;
    };
    home.packages = mkIf isDarwin [cfg.package];
  };
}