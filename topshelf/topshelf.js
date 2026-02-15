(function () {
    'use strict';

    /**
     * Top Shelf — дані для полиці «Продовжити перегляд» (наприклад Apple TV Top Shelf).
     * На прикладі плагіна Trakt: один глобальний API.
     * Повертає до 10 позицій з історії Lampa (без переглянутих і відкинутих).
     */

    var TOP_SHELF_CONTINUE_MAX = 10;

    function getContinueWatching() {
        if (!Lampa.Favorite || !Lampa.Favorite.get) return [];
        var history = Lampa.Favorite.get({ type: 'history' });
        var viewed = Lampa.Favorite.get({ type: 'viewed' }) || [];
        var thrown = Lampa.Favorite.get({ type: 'thrown' }) || [];
        var viewedIds = viewed.map(function (c) { return c.id; });
        var thrownIds = thrown.map(function (c) { return c.id; });
        var list = history.filter(function (e) {
            return viewedIds.indexOf(e.id) === -1 && thrownIds.indexOf(e.id) === -1;
        });
        return list.slice(0, TOP_SHELF_CONTINUE_MAX);
    }

    /**
     * Отримати до 10 карток «Продовжити перегляд» для Top Shelf.
     * @param {function(Array)} callback — викликається з масивом карток (id, title, poster, method: 'movie'|'tv', тощо).
     */
    function getContinueWatchingForShelf(callback) {
        if (typeof callback !== 'function') return;
        var list = getContinueWatching();
        callback(list);
    }

    var TopShelf = {
        getContinueWatching: getContinueWatchingForShelf,
        maxItems: TOP_SHELF_CONTINUE_MAX
    };

    if (typeof window !== 'undefined') {
        window.TopShelf = TopShelf;
    }

    function init() {
        // Плагін лише надає API; ініціалізація додатку не потрібна.
    }

    if (typeof Lampa === 'undefined') {
        console.warn('topshelf.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
    }
})();
