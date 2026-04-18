{
  config,
  lib,
  pkgs,
  currentProfileDir,
  ...
}: let
  inherit (lib) mkIf;
  cfg = config.programs.firefox-nixCfg;

  # Pinned dl-librescore release bundle — update hash when bumping version.
  # To get the hash: nix store prefetch-file --hash-type sha256 <url>
  dlLibrescoreBundle = pkgs.fetchurl {
    url = "https://github.com/LibreScore/dl-librescore/releases/latest/download/dl-librescore.user.js";
    hash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  };
in {
  config = mkIf cfg.enable {
    home.file."${currentProfileDir}/chrome/JS/test.uc.js".source = ./test.uc.js;
    home.file."${currentProfileDir}/chrome/JS/collapse_sideberry.uc.js".source = ./collapse_sideberry.uc.js;
    home.file."${currentProfileDir}/chrome/JS/github-pr-actions.uc.js".source = ./github-pr-actions.uc.js;
    # dl-librescore: shim loads the bundle via Cu.Sandbox with GM API shims
    home.file."${currentProfileDir}/chrome/JS/dl-librescore-shim.uc.js".source = ./dl-librescore-shim.uc.js;
    home.file."${currentProfileDir}/chrome/JS/dl-librescore.user.js".source = dlLibrescoreBundle;
  };
}
