{
  inputs,
  lib,
  ...
}: {
  imports = [inputs.devshell.flakeModule];

  perSystem = {
    pkgs,
    config,
    ...
  }: {
    devshells.default = {
      devshell = rec {
        name = "firefox-nixCfg";
        motd = "{202}Welcome to {91}${name} {202}devshell!{reset} \n $(menu)";
        startup = {
          git-hooks.text = ''
            ${config.pre-commit.installationScript}
          '';
        };
        packages = lib.attrsets.attrValues {
          inherit
            (pkgs)
            ### LSPs & Formatters
            nixd
            alejandra
            prettier
            ### Updaters
            nvfetcher
            ;
        };
      };

      commands = [
        {
          name = "pkgs-update";
          help = "Update custom package sources (pkgs/_sources/) via nvfetcher";
          command = ''
            set -euo pipefail
            TOKEN=$(gh auth token 2>/dev/null || true)
            if [ -n "$TOKEN" ]; then
              KEYFILE=$(mktemp /tmp/nvfetcher-keys.XXXXXX.toml)
              printf '[keyfile]\ngithub = "%s"\n' "$TOKEN" > "$KEYFILE"
              nix run nixpkgs#nvfetcher -- build \
                -c "$PRJ_ROOT/pkgs/nvfetcher.toml" \
                -o "$PRJ_ROOT/pkgs/_sources" \
                --keyfile "$KEYFILE"
              rm -f "$KEYFILE"
            else
              nix run nixpkgs#nvfetcher -- build \
                -c "$PRJ_ROOT/pkgs/nvfetcher.toml" \
                -o "$PRJ_ROOT/pkgs/_sources"
            fi
          '';
        }
      ];
    };
  };
}
