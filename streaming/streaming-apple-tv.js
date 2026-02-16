(function () {
    'use strict';

    /**
     * Стрімінги з категоріями.
     * Кожен сервіс — окремі рядки: нові фільми, нові серіали, в тренді тощо.
     */

    function catNewMoviesProvider(providerId, title) {
        return {
            title: title || 'Нові фільми',
            url: 'discover/movie',
            params: { with_watch_providers: String(providerId), watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' }
        };
    }
    function catNewTvProvider(providerId, title) {
        return {
            title: title || 'Нові серіали',
            url: 'discover/tv',
            params: { with_watch_providers: String(providerId), watch_region: 'UA', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' }
        };
    }

    // Кожен сервіс — окремий «плагін»: своя filterCards(cards, done), лише свій контент у «Продовжити перегляд».
    var SERVICE_CONFIGS = {
        netflix: {
            title: 'Netflix',
            filterCards: function (cards, done) { filterCardsByProvider(cards, [8], done); },
            categories: [
                { title: 'В тренді на Netflix', url: 'discover/tv', params: { with_networks: '213', sort_by: 'popularity.desc' } },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '8', watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '213', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Екшн та блокбастери', url: 'discover/movie', params: { with_companies: '213', with_genres: '28,12', sort_by: 'popularity.desc' } },
                { title: 'Фантастичні світи', url: 'discover/tv', params: { with_networks: '213', with_genres: '10765', sort_by: 'vote_average.desc', 'vote_count.gte': '200' } },
                { title: 'Кримінальні драми', url: 'discover/tv', params: { with_networks: '213', with_genres: '80', sort_by: 'popularity.desc' } },
                { title: 'Вибір критиків', url: 'discover/movie', params: { with_companies: '213', 'vote_average.gte': '7.5', 'vote_count.gte': '300', sort_by: 'vote_average.desc' } },
                { title: 'Природа та дика природа', url: 'discover/tv', params: { with_networks: '213', with_genres: '99', sort_by: 'popularity.desc' } },
                { title: 'Космос та наука', url: 'discover/tv', params: { with_networks: '213', with_genres: '99', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } }
            ]
        }
    };

    // Логотипи з streaming/img (вбудовані в код для роботи з CDN)
    var ICON_SIZE = ' width="24" height="24"';
    var ICON_NETFLIX = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M146 56h80l59 177 1-177h80v400c-25-4-53-7-82-8l-58-172-1 172c-28 1-55 4-79 8V56Z"/></svg>';
    var SERVICE_ICONS = {
        netflix: ICON_NETFLIX
    };

    var SQR_STORAGE_PREFIX = 'sqr_show_';

    function isSqrServiceEnabled(serviceId) {
        var key = SQR_STORAGE_PREFIX + serviceId;
        var val = Lampa.Storage.get(key);
        if (val !== undefined) return val !== false && val !== 'false';
        var legacyKey = 'afterplay_show_' + serviceId;
        var legacy = Lampa.Storage.get(legacyKey);
        return legacy !== false && legacy !== 'false';
    }

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
        streaming_menu_panel_title: { ru: 'Выбор стриминговых сервисов', en: 'Choose streaming services', uk: 'Вибір стрімінгових сервісів' },
        sqr_streaming_chooser_title: { ru: 'Вибір стримингов', en: 'Choose streamings', uk: 'Вибір стримінгів' },
        sqr_settings_title: { ru: 'SQR', en: 'SQR', uk: 'SQR' },
        streaming_continue_watching: { ru: 'Продолжить просмотр', en: 'Continue watching', uk: 'Продовжити перегляд' }
    });

    var FILTER_BATCH_SIZE = 5;
    var CONTINUE_WATCHING_MAX = 20; // скільки з історії брати для фільтрації; після фільтра по стрімінгу залишиться менше

    /** Повертає нещодавно переглянуті (історія без переглянутих/відкинутих) для подальшого фільтра по стрімінгу. */
    function getRecentlyWatchedCards() {
        if (!Lampa.Favorite || !Lampa.Favorite.get) return [];
        var history = Lampa.Favorite.get({ type: 'history' });
        if (!history || !history.length) return [];
        var viewed = Lampa.Favorite.get({ type: 'viewed' }) || [];
        var thrown = Lampa.Favorite.get({ type: 'thrown' }) || [];
        var viewedIds = viewed.map(function (c) { return c.id; });
        var thrownIds = thrown.map(function (c) { return c.id; });
        var list = history.filter(function (e) {
            return viewedIds.indexOf(e.id) === -1 && thrownIds.indexOf(e.id) === -1;
        });
        return list.slice(0, CONTINUE_WATCHING_MAX);
    }

    // Для блоку «Продовжити» / «Рекомендації» регіон не використовуємо — збираємо провайдерів з усіх регіонів
    function parseProviderIdsFromResponse(json) {
        var ids = [];
        var seen = {};
        if (json && json.results) {
            Object.keys(json.results).forEach(function (region) {
                var flat = json.results[region].flatrate;
                if (flat && flat.length) {
                    flat.forEach(function (p) {
                        if (p.provider_id && !seen[p.provider_id]) {
                            seen[p.provider_id] = true;
                            ids.push(p.provider_id);
                        }
                    });
                }
            });
        }
        return ids;
    }

    function parseNetworkIdsFromResponse(json) {
        var ids = [];
        if (json && json.networks && json.networks.length) {
            json.networks.forEach(function (n) { if (n.id) ids.push(n.id); });
        }
        return ids;
    }

    function requestTmdb(path, fallbackPath, parse, callback) {
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            callback(null);
            return;
        }
        var api = Lampa.Api.sources.tmdb;
        api.get(path, {}, function (json) {
            callback(parse(json));
        }, function () {
            if (fallbackPath) {
                api.get(fallbackPath, {}, function (json2) {
                    callback(parse(json2));
                }, function () { callback(null); });
            } else {
                callback(null);
            }
        });
    }

    function getProviderIdsForCard(card, callback) {
        var isTv = card.number_of_seasons || card.seasons || card.first_air_date || card.media_type === 'tv';
        var prefix = isTv ? 'tv' : 'movie';
        var fallback = (isTv ? 'movie' : 'tv') + '/' + card.id + '/watch/providers';
        requestTmdb(prefix + '/' + card.id + '/watch/providers', fallback, parseProviderIdsFromResponse, callback);
    }

    function getTvNetworkIds(card, callback) {
        var isTv = card.number_of_seasons || card.seasons || card.first_air_date || card.media_type === 'tv';
        if (!isTv) {
            callback([]);
            return;
        }
        requestTmdb('tv/' + card.id, null, parseNetworkIdsFromResponse, callback);
    }

    function filterCardsByTvNetwork(cards, networkIds, done) {
        if (!networkIds || !networkIds.length || !cards.length) {
            done(networkIds && networkIds.length ? [] : cards);
            return;
        }
        var out = [];
        var index = 0;
        function checkNext() {
            if (index >= cards.length) {
                done(out);
                return;
            }
            var batch = cards.slice(index, index + FILTER_BATCH_SIZE);
            index += FILTER_BATCH_SIZE;
            var pending = batch.length;
            batch.forEach(function (card) {
                getTvNetworkIds(card, function (ids) {
                    if (ids !== null && ids.length && ids.some(function (id) { return networkIds.indexOf(id) !== -1; })) {
                        out.push(card);
                    }
                    pending--;
                    if (pending === 0) checkNext();
                });
            });
        }
        checkNext();
    }

    function filterCardsByProvider(cards, providerIds, done) {
        if (!providerIds || providerIds.length === 0) {
            done(cards);
            return;
        }
        if (!cards.length) {
            done([]);
            return;
        }
        var out = [];
        var index = 0;

        function checkNext() {
            if (index >= cards.length) {
                done(out);
                return;
            }
            var batch = cards.slice(index, index + FILTER_BATCH_SIZE);
            index += FILTER_BATCH_SIZE;
            var pending = batch.length;
            batch.forEach(function (card) {
                getProviderIdsForCard(card, function (ids) {
                    if (ids !== null && ids.length && ids.some(function (id) { return providerIds.indexOf(id) !== -1; })) {
                        out.push(card);
                    }
                    pending--;
                    if (pending === 0) checkNext();
                });
            });
        }
        checkNext();
    }

    // Prime Video: серіали — за мережею 1024, фільми — за провайдером 119 (watch/providers ненадійний для всього)
    function filterCardsByProviderAndNetwork(cards, providerIds, networkIds, done) {
        if (!cards.length) {
            done([]);
            return;
        }
        var out = [];
        var index = 0;
        function checkNext() {
            if (index >= cards.length) {
                done(out);
                return;
            }
            var batch = cards.slice(index, index + FILTER_BATCH_SIZE);
            index += FILTER_BATCH_SIZE;
            var pending = batch.length;
            batch.forEach(function (card) {
                var isTv = card.number_of_seasons || card.seasons || card.first_air_date || card.media_type === 'tv';
                if (isTv) {
                    getTvNetworkIds(card, function (ids) {
                        if (ids !== null && ids.length && ids.some(function (id) { return networkIds.indexOf(id) !== -1; })) {
                            out.push(card);
                        }
                        pending--;
                        if (pending === 0) checkNext();
                    });
                } else {
                    getProviderIdsForCard(card, function (ids) {
                        if (ids !== null && ids.length && ids.some(function (id) { return providerIds.indexOf(id) !== -1; })) {
                            out.push(card);
                        }
                        pending--;
                        if (pending === 0) checkNext();
                    });
                }
            });
        }
        checkNext();
    }

    function getCurrentDate() {
        var d = new Date();
        return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
    }

    function buildDiscoverUrl(opts) {
        var url = opts.url;
        var params = opts.params || {};
        var page = opts.page;
        var arr = ['api_key=' + Lampa.TMDB.key(), 'language=' + (Lampa.Storage.get('language') || 'uk')];
        if (page != null) arr.push('page=' + page);
        for (var key in params) {
            var val = params[key];
            if (val === '{current_date}') val = getCurrentDate();
            arr.push(key + '=' + encodeURIComponent(val));
        }
        return Lampa.TMDB.api(url + '?' + arr.join('&'));
    }

    // Головний екран: рядки категорій по одному сервісу (як StudiosMain)
    function StreamingMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];
        if (!config) {
            comp.create = function () { this.empty(); return this.render(); };
            return comp;
        }
        var categories = config.categories;

        comp.create = function () {
            var _this = this;
            var sessionId = Date.now();
            comp._streamingSessionId = sessionId;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);
            var staticDone = false;
            var continueDone = false;
            var continueFiltered = [];
            this.activity.loader(true);

            function isStale() { return comp._streamingSessionId !== sessionId; }

            function startRest() {
                if (isStale()) return;
                categories.forEach(function (cat, index) {
                    network.silent(buildDiscoverUrl({ url: cat.url, params: cat.params, page: 1 }), function (json) {
                        if (isStale()) return;
                        status.append(String(index), json);
                    }, function () {
                        if (isStale()) return;
                        status.error();
                    });
                });
            }

            // Після кожного відкриття сторінки стрімінгу — рахуємо нещодавно переглянуті і фільтруємо під цей сервіс.
            function startContinueWatching() {
                if (isStale()) return;
                var cards = getRecentlyWatchedCards();
                if (!cards.length || !config.filterCards) {
                    continueDone = true;
                    tryBuild();
                    return;
                }
                config.filterCards(cards, function (filtered) {
                    if (isStale()) return;
                    continueFiltered = filtered || [];
                    continueDone = true;
                    tryBuild();
                });
            }

            startRest();
            startContinueWatching();
            tryBuild();

            function buildFullData() {
                var fulldata = [];
                if (continueFiltered.length) {
                    var continueTitle = Lampa.Lang.translate('streaming_continue_watching');
                    if (Lampa.Utils && Lampa.Utils.extendItemsParams) {
                        Lampa.Utils.extendItemsParams(continueFiltered, { style: { name: 'wide' } });
                    }
                    fulldata.push({
                        title: continueTitle,
                        results: continueFiltered
                        // без url/params — рядок «Продовжити перегляд» без переходу в категорію
                    });
                }
                Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                    var data = status.data[key];
                    if (data && data.results && data.results.length) {
                        var cat = categories[parseInt(key, 10)];
                        Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                        fulldata.push({
                            title: cat.title,
                            results: data.results,
                            url: cat.url,
                            params: cat.params
                        });
                    }
                });
                return fulldata;
            }

            function tryBuild() {
                if (isStale()) return;
                if (!staticDone || !continueDone) return;
                var fulldata = buildFullData();
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            }

            status.onComplite = function () {
                if (isStale()) return;
                staticDone = true;
                tryBuild();
            };

            return this.render();
        };

        comp.onMore = function (data) {
            if (!data.url) return;
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'streaming_view',
                page: 1
            });
        };

        return comp;
    }

    // Повний список однієї категорії з пагінацією (як StudiosView)
    function StreamingView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            network.silent(buildDiscoverUrl({ url: object.url, params: object.params, page: 1 }), function (json) {
                _this.build(json);
                _this.activity.loader(false);
            }, function () {
                _this.empty();
            });
            return this.render();
        };

        comp.nextPageReuest = function (obj, resolve, reject) {
            network.silent(buildDiscoverUrl({ url: object.url, params: object.params, page: obj.page || 1 }), resolve, reject);
        };

        return comp;
    }

    // Один пункт меню для одного стрімінгу. Виклик окремо для кожного — щоб меню не було пустим і відображалось вірно.
    var MENU_ANCHOR = '[data-action="catalog"]';
    var MENU_ANCHOR_FALLBACK = '[data-action="tv"]';
    var MENU_ITEM_DELAY_MS = 150;

    function addOneStreamingMenuItem(sid, insertAfter) {
        var config = SERVICE_CONFIGS[sid];
        if (!config) return insertAfter;
        var title = config.title;
        var icon = SERVICE_ICONS[sid] || ICON_NETFLIX;
        var dataAction = 'streaming_menu_' + sid;
        var itemHtml = $(
            '<li class="menu__item selector" data-action="' + dataAction + '">' +
            '  <div class="menu__ico">' + icon + '</div>' +
            '  <div class="menu__text">' + title + '</div>' +
            '</li>'
        );
        itemHtml.on('hover:enter', function () {
            Lampa.Activity.push({
                component: 'streaming_main',
                service_id: sid,
                title: title,
                page: 1
            });
        });
        if (insertAfter && insertAfter.length) insertAfter.after(itemHtml);
        return itemHtml;
    }

    // Стилі для SQR-екрану вибору стрімінгів
    var SQR_CHOOSER_STYLES = (
        '.sqr-streaming-chooser { padding: 20px; }' +
        '.sqr-streaming-chooser__header { margin-bottom: 16px; font-size: 1.1em; color: var(--color-text, #fff); }' +
        '.sqr-streaming-chooser__list { display: flex; flex-direction: column; gap: 2px; }' +
        '.sqr-streaming-row { display: flex; align-items: center; gap: 16px; padding: 12px 16px; ' +
        'background: var(--color-body-bg, rgba(255,255,255,0.06)); border-radius: 8px; ' +
        'cursor: pointer; min-height: 56px; }' +
        '.sqr-streaming-row.selector--focus { background: var(--color-body-focus, rgba(255,255,255,0.12)); }' +
        '.sqr-streaming-row__ico { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: var(--color-text); }' +
        '.sqr-streaming-row__ico svg { width: 24px; height: 24px; }' +
        '.sqr-streaming-row__name { flex: 1; font-size: 1em; color: var(--color-text, #fff); }' +
        '.sqr-streaming-row__check { width: 24px; height: 24px; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.5); ' +
        'border-radius: 6px; display: flex; align-items: center; justify-content: center; }' +
        '.sqr-streaming-row__check--on { background: var(--color-action, #00a8e6); border-color: var(--color-action, #00a8e6); }' +
        '.sqr-streaming-row__check--on::after { content: "✓"; color: #fff; font-size: 14px; font-weight: bold; }'
    );

    // Компонент SQR: екран вибору стрімінгів — Логотип | Назва | Чекбокс
    function SqrStreamingChooser(object) {
        var _this = this;
        var scroll = new Lampa.Scroll({ horizontal: false, step: 80 });
        var list = [];
        var items = [];
        var html = $('<div class="sqr-streaming-chooser"></div>');
        var panelTitle = Lampa.Lang.translate('sqr_streaming_chooser_title');

        function buildRow(sid) {
            var config = SERVICE_CONFIGS[sid];
            if (!config) return null;
            var icon = SERVICE_ICONS[sid] || ICON_NETFLIX;
            var storageKey = SQR_STORAGE_PREFIX + sid;
            var checked = isSqrServiceEnabled(sid);
            var row = $(
                '<div class="sqr-streaming-row selector" data-service="' + sid + '">' +
                '  <div class="sqr-streaming-row__ico">' + icon + '</div>' +
                '  <div class="sqr-streaming-row__name">' + config.title + '</div>' +
                '  <div class="sqr-streaming-row__check' + (checked ? ' sqr-streaming-row__check--on' : '') + '"></div>' +
                '</div>'
            );
            row.data('sid', sid);
            row.data('checked', checked);
            row.on('hover:enter', function () {
                var el = $(this);
                var sid = el.data('sid');
                var wasChecked = el.data('checked');
                var nowChecked = !wasChecked;
                el.data('checked', nowChecked);
                Lampa.Storage.set(SQR_STORAGE_PREFIX + sid, nowChecked);
                el.find('.sqr-streaming-row__check').toggleClass('sqr-streaming-row__check--on', nowChecked);
            });
            return row;
        }

        this.create = function () {
            if (!$('#sqr-streaming-chooser-styles').length) {
                $('head').append('<style id="sqr-streaming-chooser-styles">' + SQR_CHOOSER_STYLES + '</style>');
            }
            var container = $('<div class="sqr-streaming-chooser__list"></div>');
            var header = $(
                '<div class="sqr-streaming-chooser__header">' +
                '  <span class="sqr-streaming-chooser__title">' + panelTitle + '</span>' +
                '</div>'
            );
            html.append(header);
            Object.keys(SERVICE_CONFIGS).forEach(function (sid) {
                var row = buildRow(sid);
                if (row) {
                    container.append(row);
                    items.push(row);
                }
            });
            html.append(container);
            scroll.append(html);
            list = items;
            return this.render();
        };

        this.render = function () {
            return scroll.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function () {
                    if (Lampa.Navigator && Lampa.Navigator.canmove && Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                up: function () {
                    if (Lampa.Navigator && Lampa.Navigator.canmove && Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Lampa.Navigator && Lampa.Navigator.move) Lampa.Navigator.move('down');
                },
                right: function () {
                    if (Lampa.Navigator && Lampa.Navigator.move) Lampa.Navigator.move('right');
                },
                back: function () {
                    addStreamingMenuItems();
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () {
            if (scroll && scroll.destroy) scroll.destroy();
            html.remove();
        };

        return this;
    }

    function addStreamingMenuItems() {
        var menu = Lampa.Menu.render();
        if (!menu || !menu.length) return;
        var insertAfter = menu.find(MENU_ANCHOR).length ? menu.find(MENU_ANCHOR) : menu.find(MENU_ANCHOR_FALLBACK);
        if (!insertAfter.length) insertAfter = menu.find('.menu__item').last();

        var serviceIds = Object.keys(SERVICE_CONFIGS).filter(function (sid) { return isSqrServiceEnabled(sid); });
        var index = 0;

        function addNext() {
            if (index >= serviceIds.length) return;
            var sid = serviceIds[index];
            index += 1;
            var menuNow = Lampa.Menu.render();
            var anchor = menuNow.find(MENU_ANCHOR).length ? menuNow.find(MENU_ANCHOR) : menuNow.find(MENU_ANCHOR_FALLBACK);
            if (!anchor.length) anchor = menuNow.find('.menu__item').last();
            // Після першого пункту вставляємо після попереднього стрімінгу
            if (index > 1) {
                var prev = menuNow.find('[data-action="streaming_menu_' + serviceIds[index - 2] + '"]');
                if (prev.length) anchor = prev;
            }
            addOneStreamingMenuItem(sid, anchor);
            if (index < serviceIds.length) setTimeout(addNext, MENU_ITEM_DELAY_MS);
        }

        if (serviceIds.length) addNext();
    }

    function init() {
        Lampa.Component.add('streaming_main', StreamingMain);
        Lampa.Component.add('streaming_view', StreamingView);
        addStreamingMenuItems();
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
