{
  config,
  lib,
  ...
}: let
  policies = {
    AppAutoUpdate = false; # Disable automatic application update
    BackgroundAppUpdate = false; # Disable automatic application update in the background, when the application is not running.

    DisableBuiltinPDFViewer = false;
    DisableFirefoxAccounts = false; # Enable Firefox Sync

    DisableFirefoxStudies = true;
    DisableTelemetry = true;

    DisablePocket = true;

    DontCheckDefaultBrowser = true;
    OfferToSaveLogins = false; # Managed by bitwarden

    EnableTrackingProtection = {
      Value = true;
      Locked = true;
      Cryptomining = true;
      Fingerprinting = true;
      EmailTracking = true;
      # Exceptions = ["https://example.com"]
    };
    ExtensionUpdate = false;
    DefaultDownloadDirectory = "${config.home.homeDirectory}/Downloads";
    PromptForDownloadLocation = true;
  };
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;
in {
  config = mkIf cfg.enable {
    programs.firefox = {
      inherit policies;
    };
  };
}
