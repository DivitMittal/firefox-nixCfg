{
  pkgs,
  lib,
  config,
  ffcfgInputs,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
  inherit (pkgs.stdenvNoCC.hostPlatform) isDarwin;
  configJS = ffcfgInputs.fx-autoconfig + "/program/config.js";
  defaultsDir = ffcfgInputs.fx-autoconfig + "/program/defaults";
  darwinPkgs = pkgs.extend (final: prev: (ffcfgInputs.nixpkgs-firefox-darwin.overlay final prev));
in {
  options = let
    inherit (lib) mkEnableOption mkOption types;
    inherit (pkgs.stdenvNoCC.hostPlatform) isDarwin;
  in {
    programs.firefox-nixCfg = {
      enable = mkEnableOption "Enable the firefox-nixCfg Nix home-manager configuration module";
      package = mkOption {
        type = types.nullOr types.package;
        default =
          if isDarwin
          then
            (darwinPkgs.firefox-bin.override {
              extraFiles = {
                "defaults" = {
                  source = defaultsDir;
                  recursive = true;
                };
                "config.js".source = configJS;
              };
            })
          else (pkgs.firefox.override {extraPrefsFiles = [configJS];});
        description = "Override the Firefox package.";
      };
      enableTridactyl = mkEnableOption "Enable Tridactyl in Firefox";
    };
  };

  config = mkIf cfg.enable {
    programs.firefox = {
      enable = true;
      package =
        if isDarwin
        then null # added via home.packages, as this causes build issues
        else cfg.package;
    };
    home.packages = mkIf isDarwin [cfg.package];
  };
}
