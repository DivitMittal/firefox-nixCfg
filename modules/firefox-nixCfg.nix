{
  self,
  inputs,
}: {
  pkgs,
  lib,
  config,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
  inherit (pkgs.stdenvNoCC.hostPlatform) isDarwin;
  configJS = inputs.fx-autoconfig + "/program/config.js";
  defaultsDir = inputs.fx-autoconfig + "/program/defaults";
  darwinPkgs = pkgs.extend (self: super: (inputs.nixpkgs-firefox-darwin.overlay self super));
in {
  imports = [
    ../config
    inputs.betterfox-nix.modules.homeManager.betterfox
  ];
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
    _module.args = {
      firefox-nixCfg = self;
    };
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
