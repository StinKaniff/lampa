(function () {
    'use strict';

    /**
     * Стрімінги з категоріями (за зразком studios.js by Syvyj).
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

    // TMDB watch provider ID для фільтра «доступно на цьому стрімінгу» (регіон UA)
    var SERVICE_CONFIGS = {
        netflix: {
            title: 'Netflix',
            provider_ids: [8],
            categories: [
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '8', watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '213', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'В тренді на Netflix', url: 'discover/tv', params: { with_networks: '213', sort_by: 'popularity.desc' } },
                { title: 'Екшн та блокбастери', url: 'discover/movie', params: { with_companies: '213', with_genres: '28,12', sort_by: 'popularity.desc' } },
                { title: 'Фантастичні світи', url: 'discover/tv', params: { with_networks: '213', with_genres: '10765', sort_by: 'vote_average.desc', 'vote_count.gte': '200' } },
                { title: 'Кримінальні драми', url: 'discover/tv', params: { with_networks: '213', with_genres: '80', sort_by: 'popularity.desc' } },
                { title: 'K-Dramas', url: 'discover/tv', params: { with_networks: '213', with_original_language: 'ko', sort_by: 'popularity.desc' } },
                { title: 'Вибір критиків', url: 'discover/movie', params: { with_companies: '213', 'vote_average.gte': '7.5', 'vote_count.gte': '300', sort_by: 'vote_average.desc' } }
            ]
        },
        apple: {
            title: 'Apple TV+',
            provider_ids: [350],
            categories: [
                catNewMoviesProvider(350),
                catNewTvProvider(350),
                { title: 'Хіти Apple TV+', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: 'UA', sort_by: 'popularity.desc' } },
                { title: 'Фантастика Apple', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: 'UA', with_genres: '10765', sort_by: 'vote_average.desc', 'vote_count.gte': '200' } },
                { title: 'Комедії та Feel-good', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: 'UA', with_genres: '35', sort_by: 'popularity.desc' } }
            ]
        },
        hbo: {
            title: 'HBO',
            provider_ids: [],
            network_ids: [49, 3186], // HBO, HBO Max — фільтр серіалів за мережею (релевантний контент)
            categories: [
                { title: 'Нові серіали HBO/Max', url: 'discover/tv', params: { with_networks: '49|3186', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'HBO: Головні хіти', url: 'discover/tv', params: { with_networks: '49', sort_by: 'popularity.desc' } },
                { title: 'Max Originals', url: 'discover/tv', params: { with_networks: '3186', sort_by: 'popularity.desc' } },
                { title: 'Золота колекція HBO', url: 'discover/tv', params: { with_networks: '49', sort_by: 'vote_average.desc', 'vote_count.gte': '500', 'vote_average.gte': '8.0' } },
                { title: 'Епічні світи (Фентезі)', url: 'discover/tv', params: { with_networks: '49|3186', with_genres: '10765', sort_by: 'popularity.desc' } }
            ]
        },
        amazon: {
            title: 'Prime Video',
            provider_ids: [119],
            categories: [
                { title: 'В тренді на Prime Video', url: 'discover/tv', params: { with_networks: '1024', sort_by: 'popularity.desc' } },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '119', watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '1024', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Екшн та антигерої', url: 'discover/tv', params: { with_networks: '1024', with_genres: '10765,10759', sort_by: 'popularity.desc' } },
                { title: 'Найвищий рейтинг', url: 'discover/tv', params: { with_networks: '1024', 'vote_average.gte': '8.0', 'vote_count.gte': '500', sort_by: 'vote_average.desc' } }
            ]
        },
        disney: {
            title: 'Disney+',
            provider_ids: [337],
            categories: [
                catNewMoviesProvider(337, 'Нові фільми на Disney+'),
                catNewTvProvider(337, 'Нові серіали на Disney+'),
                { title: 'Marvel: Кіновсесвіт', url: 'discover/movie', params: { with_companies: '420', sort_by: 'release_date.desc', 'vote_count.gte': '200' } },
                { title: 'Зоряні Війни', url: 'discover/movie', params: { with_companies: '1', sort_by: 'release_date.asc' } },
                { title: 'Класика Disney', url: 'discover/movie', params: { with_companies: '6125', sort_by: 'popularity.desc' } },
                { title: 'Pixar', url: 'discover/movie', params: { with_companies: '3', sort_by: 'popularity.desc' } }
            ]
        },
        hulu: {
            title: 'Hulu',
            provider_ids: [453],
            categories: [
                { title: 'Hulu Originals: У тренді', url: 'discover/tv', params: { with_networks: '453', sort_by: 'popularity.desc' } },
                { title: 'Драми та трилери', url: 'discover/tv', params: { with_networks: '453', with_genres: '18,9648', sort_by: 'vote_average.desc' } },
                { title: 'Комедії та анімація', url: 'discover/tv', params: { with_networks: '453', with_genres: '35,16', sort_by: 'popularity.desc' } }
            ]
        },
        paramount: {
            title: 'Paramount+',
            provider_ids: [531],
            categories: [
                { title: 'Paramount+ Originals', url: 'discover/tv', params: { with_networks: '4330', sort_by: 'popularity.desc' } },
                { title: 'Блокбастери Paramount', url: 'discover/movie', params: { with_companies: '4', sort_by: 'revenue.desc' } },
                { title: 'Всесвіт Йеллоустоун', url: 'discover/tv', params: { with_networks: '318|4330', with_genres: '37,18', sort_by: 'popularity.desc' } }
            ]
        },
        syfy: {
            title: 'Syfy',
            provider_ids: [], // немає watch provider для UA — показуємо без фільтра
            categories: [
                { title: 'Хіти Syfy', url: 'discover/tv', params: { with_networks: '77', sort_by: 'popularity.desc' } },
                { title: 'Наукова фантастика', url: 'discover/tv', params: { with_networks: '77', with_genres: '10765', sort_by: 'vote_average.desc' } }
            ]
        }
    };

    // Логотипи для пунктів меню (з streaming_services.js; відсутні — дефолт Netflix)
    var ICON_NETFLIX = '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M84 0v512h88V308l88 204h88V0h-88v204l-88-204z"/></svg>';
    var ICON_APPLETV = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
    var ICON_HBO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 93.4C0 41.8 41.8 0 93.4 0l184.7 0c20 0 39.2 7.9 53.4 22l126.6 126.6c14.1 14.1 22 33.4 22 53.4l0 184.7c0 51.6-41.8 93.4-93.4 93.4l-184.7 0c-20 0-39.2-7.9-53.4-22L22 331.4C7.9 317.2 0 298 0 278l0-184.7zM192.2 128H96v256h96V256h64v128h96V128H288v96H192V128z"/></svg>';
    var ICON_DISNEY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>';
    var ICON_PRIME = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"/></svg>';
    var ICON_PARAMOUNT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L256 352.1l-101.8-158.3L256 64l101.8 129.8z"/></svg>';
    var SERVICE_ICONS = {
        netflix: ICON_NETFLIX,
        apple: ICON_APPLETV,
        hbo: ICON_HBO,
        amazon: ICON_PRIME,
        disney: ICON_DISNEY,
        hulu: ICON_NETFLIX,
        paramount: ICON_PARAMOUNT,
        syfy: ICON_NETFLIX
    };

    var AFTERPLAY_STORAGE_PREFIX = 'afterplay_show_';

    function isAfterplayServiceEnabled(serviceId) {
        var key = AFTERPLAY_STORAGE_PREFIX + serviceId;
        var val = Lampa.Storage.get(key);
        return val !== false && val !== 'false';
    }

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
        streaming_menu_panel_title: { ru: 'Выбор стриминговых сервисов', en: 'Choose streaming services', uk: 'Вибір стрімінгових сервісів' },
        streaming_continue: { ru: 'Продолжить просмотр', en: 'Continue watching', uk: 'Продовжити перегляд' },
        streaming_recommend: { ru: 'Рекомендации для вас', en: 'Recommendations for you', uk: 'Рекомендації для вас' },
        afterplay_settings_title: { ru: 'Afterplay', en: 'Afterplay', uk: 'Afterplay' }
    });

    // Ліміти: джерела для рекомендацій, макс. карток (до фільтра за сервісом), продовжити, батч фільтра
    var RECOMMEND_SOURCE_IDS = 8;
    var RECOMMEND_MAX_RESULTS = 50;
    var CONTINUE_MAX = 19;
    var FILTER_BATCH_SIZE = 5;

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
                    if (ids === null) {
                        out.push(card);
                    } else if (ids.length && ids.some(function (id) { return networkIds.indexOf(id) !== -1; })) {
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
                    if (ids === null) {
                        out.push(card);
                    } else if (ids.length && ids.some(function (id) { return providerIds.indexOf(id) !== -1; })) {
                        out.push(card);
                    }
                    pending--;
                    if (pending === 0) checkNext();
                });
            });
        }
        checkNext();
    }

    function filterCardsForService(cards, config, done) {
        var networkIds = config.network_ids || [];
        if (networkIds.length > 0) {
            filterCardsByTvNetwork(cards, networkIds, done);
        } else {
            filterCardsByProvider(cards, config.provider_ids || [], done);
        }
    }

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
        return list.slice(0, CONTINUE_MAX);
    }

    function fetchRecommendations(done) {
        if (!Lampa.Favorite || !Lampa.Favorite.get || !Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            done([]);
            return;
        }
        var history = Lampa.Favorite.get({ type: 'history' });
        var fromHistory = history.filter(function (e) { return e && (e.source === 'tmdb' || e.source === 'cub'); });
        var toFetch = fromHistory.slice(0, RECOMMEND_SOURCE_IDS);
        if (!toFetch.length) {
            done([]);
            return;
        }
        var historyIds = {};
        history.forEach(function (e) { historyIds[e.id] = true; });
        var collected = [];
        var pending = toFetch.length;
        var currentYear = new Date().getFullYear();

        function onOne() {
            pending--;
            if (pending === 0) {
                var seen = {};
                var out = [];
                for (var i = 0; i < collected.length && out.length < RECOMMEND_MAX_RESULTS; i++) {
                    var r = collected[i];
                    var id = r.id;
                    if (seen[id] || historyIds[id]) continue;
                    var year = (r.first_air_date || r.release_date || '0000').split('-')[0];
                    if (parseInt(year, 10) < currentYear - 20) continue;
                    seen[id] = true;
                    out.push(r);
                }
                done(out);
            }
        }

        toFetch.forEach(function (elem) {
            var isTv = elem.number_of_seasons || elem.seasons || elem.first_air_date;
            var path = (isTv ? 'tv' : 'movie') + '/' + elem.id + '/recommendations';
            Lampa.Api.sources.tmdb.get(path, {}, function (json) {
                if (json && json.results && json.results.length) {
                    collected = collected.concat(json.results);
                }
                onOne();
            }, onOne);
        });
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
        var network = new Lampa.Reguest();
        var status = new Lampa.Status(categories.length);
        var recommendationsDone = false;
        var recommendationsResults = [];
        var staticDone = false;
        var continueDone = false;
        var continueRow = null;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);

            var continueList = getContinueWatching();
            if (continueList.length === 0) {
                continueDone = true;
                tryBuild();
            } else {
                filterCardsForService(continueList, config, function (filtered) {
                    if (filtered.length) {
                        Lampa.Utils.extendItemsParams(filtered, { style: { name: 'wide' } });
                        continueRow = {
                            title: Lampa.Lang.translate('streaming_continue'),
                            results: filtered,
                            url: null,
                            params: null
                        };
                    }
                    continueDone = true;
                    tryBuild();
                });
            }

            fetchRecommendations(function (recList) {
                if (recList.length === 0) {
                    recommendationsDone = true;
                    tryBuild();
                    return;
                }
                filterCardsForService(recList, config, function (filtered) {
                    recommendationsResults = filtered;
                    recommendationsDone = true;
                    tryBuild();
                });
            });

            function buildFullData() {
                var fulldata = [];
                if (continueRow) fulldata.push(continueRow);
                if (recommendationsResults.length) {
                    Lampa.Utils.extendItemsParams(recommendationsResults, { style: { name: 'wide' } });
                    fulldata.push({
                        title: Lampa.Lang.translate('streaming_recommend'),
                        results: recommendationsResults,
                        url: null,
                        params: null
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
                if (!continueDone || !recommendationsDone || !staticDone) return;
                var fulldata = buildFullData();
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            }

            status.onComplite = function () {
                staticDone = true;
                tryBuild();
            };

            categories.forEach(function (cat, index) {
                network.silent(buildDiscoverUrl({ url: cat.url, params: cat.params, page: 1 }), function (json) {
                    status.append(String(index), json);
                }, function () { status.error(); });
            });
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

    // Список стрімінгових сервісів у основному контенті (замість оверлею)
    function StreamingServicesList(object) {
        var scroll = new Lampa.Scroll({ horizontal: false, step: 250 });
        var html = $('<div class="category-items"><div class="category-items__title">' + Lampa.Lang.translate('streaming_menu_panel_title') + '</div><div class="category-items__cards streaming-services-list"></div></div>');
        var cardsContainer = html.find('.streaming-services-list');
        var items = [];

        this.create = function () {
            if (this.activity && this.activity.loader) this.activity.loader(true);
            var serviceIds = Object.keys(SERVICE_CONFIGS).filter(function (sid) { return isAfterplayServiceEnabled(sid); });
            serviceIds.forEach(function (sid) {
                var config = SERVICE_CONFIGS[sid];
                var icon = SERVICE_ICONS[sid] || ICON_NETFLIX;
                var tile = $(
                    '<div class="card selector card--category streaming-service-tile">' +
                    '  <div class="card__view">' +
                    '    <div class="streaming-service-tile__icon">' + icon + '</div>' +
                    '    <div class="streaming-service-tile__title">' + (config ? config.title : sid) + '</div>' +
                    '  </div>' +
                    '</div>'
                );
                tile.on('hover:enter', function () {
                    Lampa.Activity.push({
                        component: 'streaming_main',
                        service_id: sid,
                        title: config ? config.title : sid,
                        page: 1
                    });
                });
                cardsContainer.append(tile);
                items.push(tile);
            });
            scroll.append(html);
            if (this.activity && this.activity.loader) this.activity.loader(false);
            return this.render();
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function () {
                    if (typeof Navigator !== 'undefined' && Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                up: function () {
                    if (typeof Navigator !== 'undefined' && Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (typeof Navigator !== 'undefined') Navigator.move('down');
                },
                right: function () {
                    if (typeof Navigator !== 'undefined') Navigator.move('right');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return scroll.render(); };
        this.destroy = function () {
            scroll.destroy();
            html.remove();
            items = [];
        };
        return this;
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

    function openStreamingServicesList() {
        Lampa.Activity.push({
            component: 'streaming_services_list',
            title: Lampa.Lang.translate('streaming_menu_title'),
            page: 1
        });
    }

    function addMenuItem() {
        var menu = Lampa.Menu.render();
        if (!menu || !menu.length) return;
        var title = Lampa.Lang.translate('streaming_menu_title');
        var dataAction = 'streaming_menu_open';
        var itemHtml = $(
            '<li class="menu__item selector" data-action="' + dataAction + '">' +
            '  <div class="menu__ico">' + ICON_NETFLIX + '</div>' +
            '  <div class="menu__text">' + title + '</div>' +
            '</li>'
        );
        itemHtml.on('hover:enter', function () { openStreamingServicesList(); });
        var afterItem = menu.find('[data-action="catalog"]').length ? menu.find('[data-action="catalog"]') : menu.find('[data-action="tv"]');
        if (afterItem.length) afterItem.after(itemHtml);
        else menu.find('.menu__item').last().after(itemHtml);
    }

    function init() {
        Lampa.Component.add('streaming_main', StreamingMain);
        Lampa.Component.add('streaming_view', StreamingView);
        Lampa.Component.add('streaming_services_list', StreamingServicesList);
        addMenuItem();

        if (typeof Lampa.SettingsApi !== 'undefined') {
            Lampa.SettingsApi.addComponent({
                component: 'afterplay',
                name: Lampa.Lang.translate('afterplay_settings_title'),
                icon: ICON_NETFLIX
            });
            Object.keys(SERVICE_CONFIGS).forEach(function (sid) {
                var config = SERVICE_CONFIGS[sid];
                var storageKey = AFTERPLAY_STORAGE_PREFIX + sid;
                Lampa.SettingsApi.addParam({
                    component: 'afterplay',
                    param: {
                        name: storageKey,
                        type: 'trigger',
                        default: true
                    },
                    field: { name: config.title },
                    onChange: function (value) {
                        var enabled = value === true || value === 'true';
                        Lampa.Storage.set(storageKey, enabled);
                    }
                });
            });
        }
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
