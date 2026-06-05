{
  lib,
  stdenv,
  sources,
}:
stdenv.mkDerivation {
  pname = "webhid-for-firefox";
  inherit (sources.webhid-for-firefox) version src;

  buildPhase = ''
    runHook preBuild

    SOUP_DIR="$PWD/server/Soup/soup"
    OBJ_DIR="$TMPDIR/soup-obj"
    mkdir -p "$OBJ_DIR"

    for f in "$SOUP_DIR"/*.cpp; do
      name=$(basename "''${f%.cpp}")
      [ "$name" = "soup" ] && continue
      $CXX -std=c++17 -fno-rtti -O3 -ffunction-sections -fdata-sections -fPIC \
        -DSOUP_STANDALONE \
        -I "$SOUP_DIR" \
        -c "$f" -o "$OBJ_DIR/$name.o"
    done

    ar rc "$OBJ_DIR/libsoup.a" "$OBJ_DIR"/*.o

    $CXX -std=c++17 -fno-rtti -O3 \
      -I "$SOUP_DIR" \
      server/main.cpp \
      "$OBJ_DIR/libsoup.a" \
      ${lib.optionalString stdenv.isDarwin "-framework IOKit -framework CoreFoundation"} \
      ${lib.optionalString stdenv.isLinux "-lresolv"} \
      -pthread -lm -ldl \
      -o webhid-for-firefox-server

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    install -Dm755 webhid-for-firefox-server "$out/bin/webhid-for-firefox-server"
    runHook postInstall
  '';

  meta = {
    description = "Native HID server for the WebHID-for-Firefox browser extension";
    homepage = "https://github.com/Sainan/WebHID-for-Firefox";
    license = lib.licenses.mit;
    maintainers = with lib.maintainers; [DivitMittal];
    platforms = lib.platforms.unix;
    mainProgram = "webhid-for-firefox-server";
  };
}
