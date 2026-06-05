{...}: {
  perSystem = {pkgs, ...}: let
    customPkgs = import ./custom {inherit pkgs;};
  in {
    packages = customPkgs // {default = customPkgs.webhid-for-firefox;};
  };
}
