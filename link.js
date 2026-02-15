(function () {
    'use strict';

    // Центральний файл посилань на плагіни з різних папок репо.
    // temp — папки з частинами/модулями плагінів; тут підключаються готові скрипти для Lampa.

    var CDN = 'https://cdn.jsdelivr.net/gh/StinKaniff/lampa';
    // Commit hash — оновлюй після кожного push, щоб кеш не тримав старий файл
    var STREAMING_MENU_COMMIT = 'ae2ed4f';

    var plugins = [
        CDN + '@' + STREAMING_MENU_COMMIT + '/streaming/streaming-menu.js'
        // CDN + '/streaming/streaming_services.js'
        // CDN + '/інша-папка/плагін.js'
    ];

    Lampa.Utils.putScriptAsync(plugins, function () { });
})();
