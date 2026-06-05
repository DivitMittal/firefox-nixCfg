{pkgs}: let
  sources = pkgs.callPackage ../_sources/generated.nix {};
in {
  webhid-for-firefox = pkgs.callPackage ./webhid-for-firefox/package.nix {inherit sources;};
}
