{
  config,
  lib,
  ...
}: let
  policies = {
    AppAutoUpdate = false; # Disable automatic application update
    BackgroundAppUpdate = false; # Disable automatic application update in the background, when the application is not running. (Windows only)
    ManualAppUpdateOnly = true; # No update prompts
    AutofillAddressEnabled = false; # Disable address autofill
    AutofillCreditCardEnabled = false; # Disable credit card autofill
    OfferToSaveLogins = false;
    OfferToSaveLoginsDefault = false;
    DisableFirefoxStudies = true;
    DisableTelemetry = true;
    DisablePocket = true;
    DontCheckDefaultBrowser = true;

    EnableTrackingProtection = {
      Value = true;
      Locked = true;
      Cryptomining = true;
      Fingerprinting = true;
      EmailTracking = true;
      # Exceptions = ["https://example.com"]
    };
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
