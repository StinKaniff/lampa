(function () {
    'use strict';

    // Центральний файл посилань на плагіни з різних папок репо.
    // temp — папки з частинами/модулями плагінів; тут підключаються готові скрипти для Lampa.

    var CDN = 'https://cdn.jsdelivr.net/gh/StinKaniff/lampa';
    // Bump version when testing to bust cache (no git tags needed)
    var STREAMING_MENU_VERSION = '0.0.1';

    var plugins = [
        CDN + '/streaming/streaming-menu.js?v=' + STREAMING_MENU_VERSION
        // CDN + '/streaming/streaming_services.js'
        // CDN + '/інша-папка/плагін.js'
    ];

    Lampa.Utils.putScriptAsync(plugins, function () { });
})();
