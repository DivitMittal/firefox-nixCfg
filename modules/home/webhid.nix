{
  config,
  lib,
  pkgs,
  ...
}: let
  cfg = config.programs.firefox-nixCfg;
  inherit (pkgs.stdenvNoCC.hostPlatform) isDarwin;
  sources = pkgs.callPackage ../../pkgs/_sources/generated.nix {};
  webhidPkg = pkgs.callPackage ../../pkgs/custom/webhid-for-firefox/package.nix {inherit sources;};
  serverBin = "${webhidPkg}/bin/webhid-for-firefox-server";
in {
  options.programs.firefox-nixCfg.enableWebHID = lib.mkEnableOption "WebHID-for-Firefox native server";

  config = lib.mkIf (cfg.enable && cfg.enableWebHID) (lib.mkMerge [
    {home.packages = [webhidPkg];}

    (lib.mkIf isDarwin {
      launchd.agents.webhid-for-firefox = {
        enable = true;
        config = {
          Label = "com.github.sainan.webhid-for-firefox";
          ProgramArguments = [serverBin];
          RunAtLoad = false;
          KeepAlive = false;
          StandardOutPath = "${config.home.homeDirectory}/Library/Logs/webhid-for-firefox.log";
          StandardErrorPath = "${config.home.homeDirectory}/Library/Logs/webhid-for-firefox.err";
        };
      };
    })

    (lib.mkIf (!isDarwin) {
      systemd.user.services.webhid-for-firefox = {
        Unit.Description = "WebHID for Firefox native server";
        Service = {
          ExecStart = serverBin;
          Restart = "on-failure";
        };
      };
    })
  ]);
}
