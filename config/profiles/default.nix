{
  pkgs,
  config,
  lib,
  inputs,
  ...
}: let
  profilesDir =
    config.programs.firefox.configPath
    + lib.strings.optionalString pkgs.stdenvNoCC.hostPlatform.isDarwin "/Profiles";
  currentProfileDir = "${profilesDir}/custom-default";
  profiles = {
    clean-profile = {
      id = 0;
      isDefault = false;
    };

    custom-default = {
      id = 1;
      isDefault = true;

      bookmarks = {
        force = true;
        settings = [];
      };

      # containers = {
      #   second = {
      #     color = "blue";
      #     icon = "tree";
      #     id = 1;
      #   };
      #   finance = {;
      #     color = "green";
      #     icon = "dollar";
      #     id = 2;
      #   };
      # };
      # containersForce = true;

      search = {
        force = true;
        default = "Unduck";
        privateDefault = "Unduck";

        engines = {
          "bing".metaData.hidden = true;
          # built-in engines only support specifying one additional alias
          "google".metaData.alias = "@g";
          "wikipedia".metaData.alias = "@w";
          "ddg".metaData.alias = "@d";

          "Youtube" = {
            urls = [
              {
                template = "https://www.youtube.com/results";
                params = [
                  {
                    name = "search_query";
                    value = "{searchTerms}";
                  }
                ];
              }
            ];
            definedAliases = ["@yt"];
          };

          "Github" = {
            urls = [
              {
                template = "https://github.com/search";
                params = [
                  {
                    name = "q";
                    value = "{searchTerms}";
                  }
                  {
                    name = "type";
                    value = "repositories";
                  }
                ];
              }
            ];
            definedAliases = ["@gh"];
          };

          "Startpage" = {
            urls = [
              {
                template = "https://www.startpage.com/sp/search";
                params = [
                  {
                    name = "query";
                    value = "{searchTerms}";
                  }
                ];
              }
            ];
            definedAliases = ["@sp"];
          };

          "Unduck" = {
            urls = [
              {
                template = "https://unduck.link";
                params = [
                  {
                    name = "q";
                    value = "{searchTerms}";
                  }
                ];
              }
            ];
            definedAliases = ["@ud"];
          };

          "Perplexity" = {
            urls = [
              {
                template = "https://www.perplexity.ai";
                params = [
                  {
                    name = "q";
                    value = "{searchTerms}";
                  }
                ];
              }
            ];
            definedAliases = ["@p"];
          };

          # Nix-related search engines
          "Nix Packages" = {
            urls = [
              {
                template = "https://search.nixos.org/packages";
                params = [
                  {
                    name = "type";
                    value = "packages";
                  }
                  {
                    name = "query";
                    value = "{searchTerms}";
                  }
                  {
                    name = "channel";
                    value = "unstable";
                  }
                ];
              }
            ];
            icon = "${pkgs.nixos-icons}/share/icons/hicolor/scalable/apps/nix-snowflake.svg";
            definedAliases = ["@np"];
          };

          "Searchix" = {
            urls = [
              {
                template = "https://searchix.alanpearce.eu";
                params = [
                  {
                    name = "query";
                    value = "{searchTerms}";
                  }
                ];
              }
            ];
            definedAliases = ["@sx"];
          };

          "Home-Manager-Options" = {
            urls = [
              {
                template = "https://home-manager-options.extranix.com";
                params = [
                  {
                    name = "query";
                    value = "{searchTerms}";
                  }
                  {
                    name = "release";
                    value = "master";
                  }
                ];
              }
            ];
            definedAliases = ["@hm"];
          };
        };
      };

      # settings = builtins.import ./user_settings.nix;
      betterfox = {
        enable = true;
        enableAllSections = true;
      };
      userContent = lib.strings.readFile ./chrome/userContent.css;
      userChrome = lib.strings.readFile ./chrome/userChrome.css;
    };
  };
  cfg = config.programs.firefox-nixCfg;
  inherit (lib) mkIf;
in {
  imports = [
    inputs.betterfox-nix.homeManagerModules.betterfox
    ./chrome
  ];
  config = mkIf cfg.enable {
    _module.args = {
      inherit currentProfileDir;
    };
    programs.firefox.betterfox.enable = true;
    programs.firefox.profiles = profiles;
  };
}