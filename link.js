(function () {
    'use strict';

    // Центральний файл посилань на плагіни з різних папок репо.
    // temp — папки з частинами/модулями плагінів; тут підключаються готові скрипти для Lampa.

    var CDN = 'https://cdn.jsdelivr.net/gh/StinKaniff/lampa';

    var plugins = [
        // streaming: частини в streaming/temp/
        CDN + '/streaming/temp/streaming-menu.js',
        CDN + '/streaming/streaming_services.js'
        // Далі додавати посилання на плагіни з інших папок, наприклад:
        // CDN + '/інша-папка/плагін.js'
    ];

    Lampa.Utils.putScriptAsync(plugins, function () { });
})();
