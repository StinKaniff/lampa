(function () {
    'use strict';

    /**
     * Стрімінги з категоріями (за зразком studios.js by Syvyj).
     * Кожен сервіс — окремі рядки: нові фільми, нові серіали, в тренді тощо.
     */

    var WATCH_REGION = 'UA';

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
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '350', watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Нові серіали', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: 'UA', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
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
                { title: 'Нові фільми на Disney+', url: 'discover/movie', params: { with_watch_providers: '337', watch_region: 'UA', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '5' } },
                { title: 'Нові серіали на Disney+', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: 'UA', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '5' } },
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

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
        streaming_menu_panel_title: { ru: 'Выбор стриминговых сервисов', en: 'Choose streaming services', uk: 'Вибір стрімінгових сервісів' },
        streaming_continue: { ru: 'Продолжить просмотр', en: 'Continue watching', uk: 'Продовжити перегляд' },
        streaming_recommend: { ru: 'Рекомендации для вас', en: 'Recommendations for you', uk: 'Рекомендації для вас' }
    });

    var RECOMMEND_SOURCE_IDS = 5;
    var RECOMMEND_MAX_RESULTS = 20;
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

    function getProviderIdsForCard(card, callback) {
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            callback(null);
            return;
        }
        var isTv = card.number_of_seasons || card.seasons || card.first_air_date || card.media_type === 'tv';
        var path = (isTv ? 'tv' : 'movie') + '/' + card.id + '/watch/providers';
        Lampa.Api.sources.tmdb.get(path, {}, function (json) {
            callback(parseProviderIdsFromResponse(json));
        }, function () {
            if (!isTv) {
                var pathTv = 'tv/' + card.id + '/watch/providers';
                Lampa.Api.sources.tmdb.get(pathTv, {}, function (json2) {
                    callback(parseProviderIdsFromResponse(json2));
                }, function () { callback(null); });
            } else {
                var pathMovie = 'movie/' + card.id + '/watch/providers';
                Lampa.Api.sources.tmdb.get(pathMovie, {}, function (json2) {
                    callback(parseProviderIdsFromResponse(json2));
                }, function () { callback(null); });
            }
        });
    }

    function getTvNetworkIds(card, callback) {
        if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
            callback(null);
            return;
        }
        var isTv = card.number_of_seasons || card.seasons || card.first_air_date || card.media_type === 'tv';
        if (!isTv) {
            callback([]);
            return;
        }
        Lampa.Api.sources.tmdb.get('tv/' + card.id, {}, function (json) {
            var ids = [];
            if (json && json.networks && json.networks.length) {
                json.networks.forEach(function (n) { if (n.id) ids.push(n.id); });
            }
            callback(ids);
        }, function () { callback(null); });
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

    function buildCategoryUrl(cat, page) {
        var params = [];
        params.push('api_key=' + Lampa.TMDB.key());
        params.push('language=' + (Lampa.Storage.get('language') || 'uk'));
        if (page) params.push('page=' + page);
        if (cat.params) {
            for (var key in cat.params) {
                var val = cat.params[key];
                if (val === '{current_date}') val = getCurrentDate();
                params.push(key + '=' + encodeURIComponent(val));
            }
        }
        return Lampa.TMDB.api(cat.url + '?' + params.join('&'));
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
        var providerIds = config.provider_ids || [];
        var networkIds = config.network_ids || [];
        var useNetworkFilter = networkIds.length > 0;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);

            var continueList = getContinueWatching();
            if (continueList.length === 0) {
                continueDone = true;
                tryBuild();
            } else {
                var filterContinue = useNetworkFilter
                    ? function (cb) { filterCardsByTvNetwork(continueList, networkIds, cb); }
                    : function (cb) { filterCardsByProvider(continueList, providerIds, cb); };
                filterContinue(function (filtered) {
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
                var filterRec = useNetworkFilter
                    ? function (cb) { filterCardsByTvNetwork(recList, networkIds, cb); }
                    : function (cb) { filterCardsByProvider(recList, providerIds, cb); };
                filterRec(function (filtered) {
                    recommendationsResults = filtered;
                    recommendationsDone = true;
                    tryBuild();
                });
            });

            function tryBuild() {
                if (!continueDone || !recommendationsDone || !staticDone) return;
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
                network.silent(buildCategoryUrl(cat, 1), function (json) {
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

    // Повний список однієї категорії з пагінацією (як StudiosView)
    function StreamingView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + Lampa.TMDB.key());
            params.push('language=' + (Lampa.Storage.get('language') || 'uk'));
            params.push('page=' + page);
            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') val = getCurrentDate();
                    params.push(key + '=' + encodeURIComponent(val));
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            network.silent(buildUrl(1), function (json) {
                _this.build(json);
                _this.activity.loader(false);
            }, function () {
                _this.empty();
            });
            return this.render();
        };

        comp.nextPageReuest = function (obj, resolve, reject) {
            network.silent(buildUrl(obj.page || 1), resolve, reject);
        };

        return comp;
    }

    function openStreamingPanel() {
        var previousController = Lampa.Controller.enabled().name;
        var items = Object.keys(SERVICE_CONFIGS).map(function (sid) {
            return { title: SERVICE_CONFIGS[sid].title, id: sid, _serviceId: sid };
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('streaming_menu_panel_title'),
            items: items,
            onBack: function () {
                try { Lampa.Controller.toggle(previousController); } catch (e) { console.error('streaming-menu onBack:', e); }
            },
            onSelect: function (selectedItem) {
                try {
                    var serviceId = selectedItem._serviceId;
                    if (!serviceId) return;
                    var title = SERVICE_CONFIGS[serviceId] ? SERVICE_CONFIGS[serviceId].title : selectedItem.title;
                    Lampa.Controller.toggle(previousController);
                    Lampa.Activity.push({
                        component: 'streaming_main',
                        service_id: serviceId,
                        title: title,
                        page: 1
                    });
                } catch (e) { console.error('streaming-menu onSelect:', e); }
            }
        });
    }

    function addMenuItem() {
        var menu = Lampa.Menu.render();
        if (!menu || !menu.length) return;
        var title = Lampa.Lang.translate('streaming_menu_title');
        var dataAction = 'streaming_menu_open';
        var itemHtml = $(
            '<li class="menu__item selector" data-action="' + dataAction + '">' +
            '  <div class="menu__ico">' +
            '    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '      <path d="M4 6H20V8H4V6ZM4 11H20V13H4V11ZM4 16H14V18H4V16Z" fill="currentColor"/>' +
            '    </svg>' +
            '  </div>' +
            '  <div class="menu__text">' + title + '</div>' +
            '</li>'
        );
        itemHtml.on('hover:enter', function () { openStreamingPanel(); });
        var afterItem = menu.find('[data-action="catalog"]').length ? menu.find('[data-action="catalog"]') : menu.find('[data-action="tv"]');
        if (afterItem.length) afterItem.after(itemHtml);
        else menu.find('.menu__item').last().after(itemHtml);
    }

    function init() {
        Lampa.Component.add('streaming_main', StreamingMain);
        Lampa.Component.add('streaming_view', StreamingView);
        addMenuItem();
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
