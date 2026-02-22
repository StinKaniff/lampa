(function () {
    'use strict';

    var ORIGIN_COUNTRIES_NO_ASIA = 'US|GB|CA|AU|DE|FR|IT|ES|PL|UA|NL|SE|NO|BR|MX|AR|BE|CH|AT|PT|IE|NZ|ZA|RU|TR|FI|DK|CZ|RO|HU|GR';
    var STORAGE_WATCH_REGION = 'streaming_watch_region';
    var STORAGE_ENABLED_SERVICES = 'streaming_enabled_services';
    var ORIGIN_COUNTRY_EU = 'DE|FR|IT|ES|PL|NL|SE|NO|RU|TR|CZ|HU|RO|BE|AT|CH|PT|IE|FI|DK|GR';
    function getWatchRegion() {
        var s = Lampa.Storage.get(STORAGE_WATCH_REGION);
        return (s === 'UA' || s === 'US' || s === 'EU') ? s : 'UA';
    }

    function getCurrentDate() {
        var d = new Date();
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }

    function getWatchRegionForService(service) {
        if (service && service.watch_region_override) return service.watch_region_override;
        return getWatchRegion();
    }

    function subParams(p, service) {
        var out = {};
        var region = getWatchRegionForService(service);
        var date = getCurrentDate();
        for (var k in p) {
            var v = p[k];
            if (v === '{watch_region}') v = region;
            else if (v === '{current_date}') v = date;
            out[k] = v;
        }
        return out;
    }

    function buildDiscoverUrl(url, params, page) {
        var p = Object.assign({}, params);
        if (url.indexOf('discover/') !== -1 && !p.with_origin_country) p.with_origin_country = ORIGIN_COUNTRIES_NO_ASIA;
        var arr = ['api_key=' + Lampa.TMDB.key(), 'language=' + (Lampa.Storage.get('language') || 'uk')];
        if (page != null) arr.push('page=' + page);
        for (var key in p) arr.push(key + '=' + encodeURIComponent(p[key]));
        return Lampa.TMDB.api(url + '?' + arr.join('&'));
    }

    function buildSearchUrl(query, page) {
        var lang = Lampa.Storage.get('language') || 'uk';
        var arr = ['api_key=' + Lampa.TMDB.key(), 'language=' + lang, 'query=' + encodeURIComponent(query)];
        if (page != null) arr.push('page=' + page);
        return Lampa.TMDB.api('search/multi?' + arr.join('&'));
    }

    // 1–3: фіксовані; 5–9: оригінальні + до 4 унікальних; далі жанри
    var CATEGORY_TEMPLATE = [
        { id: 1, titleKey: 'streaming_trending', section: 'trending' },
        { id: 2, titleKey: 'streaming_new_series', section: 'new_series' },
        { id: 3, titleKey: 'streaming_new_movies', section: 'new_movies' },
        { id: 5, titleKey: 'streaming_exclusive_1', section: 'exclusive' },
        { id: 6, titleKey: 'streaming_exclusive_2', section: 'exclusive' },
        { id: 7, titleKey: 'streaming_exclusive_3', section: 'exclusive' },
        { id: 8, titleKey: 'streaming_exclusive_4', section: 'exclusive' },
        { id: 9, titleKey: 'streaming_exclusive_5', section: 'exclusive' },
        { id: 10, titleKey: 'streaming_scifi_fantasy', section: 'genre', genres: '878,14,12' },
        { id: 11, titleKey: 'streaming_action_thrillers', section: 'genre', genres: '28,53,80' },
        { id: 12, titleKey: 'streaming_comedy', section: 'genre', genres: '35' },
        { id: 13, titleKey: 'streaming_animation', section: 'genre', genres: '16' },
        { id: 14, titleKey: 'streaming_nonfiction', section: 'genre', genres: '36,99' },
        { id: 15, titleKey: 'streaming_drama', section: 'genre', genres: '18' },
        { id: 16, titleKey: 'streaming_horror', section: 'genre', genres: '27' },
        { id: 17, titleKey: 'streaming_romance', section: 'genre', genres: '10749' },
        { id: 18, titleKey: 'streaming_mystery', section: 'genre', genres: '9648' },
        { id: 19, titleKey: 'streaming_discovery', section: 'genre', genres: '99' }
    ];
    var CATEGORY_TEMPLATE_BRAND = [
        { id: 1, titleKey: 'streaming_trending', section: 'trending' },
        { id: 2, titleKey: 'streaming_new_series', section: 'new_series' },
        { id: 3, titleKey: 'streaming_new_movies', section: 'new_movies' },
        { id: 5, titleKey: 'streaming_animation', section: 'exclusive' }
    ];

    function getBaseParams(service) {
        var b = service.base;
        return b ? subParams(b.tv, service) : {};
    }

    function getBaseParamsMovie(service) {
        var b = service.base;
        return b && b.movie ? subParams(b.movie, service) : {};
    }

    function addKeywordFilter(params, object) {
        if (object && object.tagKeywordId) {
            var p = Object.assign({}, params);
            p.with_keywords = object.tagKeywordId;
            return p;
        }
        return params;
    }

    function getCategoryRequest(service, cat, index, object) {
        if (cat.section === 'search') {
            if (!object || !object.searchQuery || !object.searchQuery.trim()) return null;
            return { url: 'search/multi', params: { query: object.searchQuery.trim() }, isSearch: true };
        }
        var baseTv = getBaseParams(service);
        var baseMovie = getBaseParamsMovie(service);
        var opts = { url: 'discover/tv', params: null, mergeRequests: null };

        if (cat.section === 'trending') {
            opts.params = addKeywordFilter(Object.assign({ sort_by: 'popularity.desc', 'vote_count.gte': '10' }, baseTv), object);
            if (service.mergeTvMovieTrending) {
                opts.mergeRequests = [
                    { url: 'discover/tv', params: opts.params },
                    { url: 'discover/movie', params: addKeywordFilter(Object.assign({ sort_by: 'popularity.desc', 'vote_count.gte': '10' }, baseMovie), object) }
                ];
            }
            return opts;
        }
        if (cat.section === 'new_series') {
            opts.params = addKeywordFilter(Object.assign({ sort_by: 'first_air_date.desc', 'first_air_date.lte': getCurrentDate(), 'vote_count.gte': '10' }, baseTv), object);
            return opts;
        }
        if (cat.section === 'new_movies') {
            return { url: 'discover/movie', params: addKeywordFilter(Object.assign({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': getCurrentDate(), 'vote_count.gte': '10' }, baseMovie), object) };
        }
        if (cat.section === 'exclusive') {
            var exIdx = index - 5;
            var list = service.exclusives || [];
            var ex = list[exIdx];
            if (!ex) return null;
            if (ex.mergeRequests) return { mergeRequests: ex.mergeRequests.map(function (r) { return { url: r.url, params: addKeywordFilter(subParams(r.params, service), object) }; }) };
            return { url: ex.url, params: addKeywordFilter(subParams(ex.params, service), object) };
        }
        if (cat.section === 'genre') {
            var g = Object.assign({ sort_by: 'popularity.desc', 'vote_count.gte': '10' }, baseTv);
            if (cat.keywords) g.with_keywords = cat.keywords;
            else g = addKeywordFilter(g, object);
            if (cat.genres) {
                var genreIds = cat.genres.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                if (genreIds.length > 1) {
                    opts.mergeRequests = genreIds.map(function (oneId) {
                        var params = Object.assign({}, g, { with_genres: oneId });
                        return { url: 'discover/tv', params: params };
                    });
                    return opts;
                }
                g.with_genres = cat.genres;
            }
            opts.params = g;
            return opts;
        }
        return null;
    }

    var SERVICE_CONFIGS = {
        netflix: {
            title: 'Netflix',
            base: {
                tv: { with_networks: '213' },
                movie: { with_watch_providers: '8', watch_region: '{watch_region}' }
            },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_netflix_original', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '213', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '213', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        apple: {
            title: 'Apple TV+',
            base: { tv: { with_watch_providers: '350', watch_region: '{watch_region}' }, movie: { with_watch_providers: '350', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_apple_original', mergeRequests: [
                    { url: 'discover/tv', params: { with_companies: '284', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '284', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        hbo: {
            title: 'HBO',
            base: { tv: { with_networks: '49|3186' }, movie: { with_watch_providers: '384', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_max_originals', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '3186', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '2739', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]},
                { titleKey: 'streaming_hbo_gold', url: 'discover/tv', params: { with_networks: '49', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
            ]
        },
        amazon: {
            title: 'Prime Video',
            base: { tv: { with_networks: '1024' }, movie: { with_watch_providers: '119', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_prime_original', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '1024', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '3192', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        disney: {
            title: 'Disney+',
            watch_region_override: 'US',
            base: { tv: { with_watch_providers: '337', watch_region: '{watch_region}' }, movie: { with_watch_providers: '337', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: true,
            exclusives: [
                { titleKey: 'streaming_disney_original', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '2739', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '6125', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]},
                { titleKey: 'streaming_disney_classic', url: 'discover/movie', params: { with_companies: '6125', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_pixar', url: 'discover/movie', params: { with_companies: '3', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_marvel', url: 'discover/movie', params: { with_companies: '420', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
            ]
        },
        paramount: {
            title: 'Paramount+',
            base: { tv: { with_networks: '4330' }, movie: { with_watch_providers: '531', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_paramount_originals', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '4330', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '4', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]},
                { titleKey: 'streaming_yellowstone', url: 'discover/tv', params: { with_networks: '318|4330', with_genres: '37,18', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_paramount_blockbusters', url: 'discover/movie', params: { with_companies: '4', sort_by: 'popularity.desc', 'vote_count.gte': '10', 'vote_average.gte': '6.5' } }
            ]
        },
        origin: {
            title: 'NatGeo',
            base: { tv: { with_networks: '43|1043', with_genres: '99' }, movie: {} },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_space', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', with_keywords: '9882', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_wildlife', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', with_keywords: '9902', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_nature_science', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', with_keywords: '221355', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
            ]
        },
        discovery: {
            title: 'Discovery',
            base: { tv: { with_networks: '64', with_genres: '99' }, movie: {} },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_discovery_docs', url: 'discover/tv', params: { with_networks: '64', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_wildlife', url: 'discover/tv', params: { with_networks: '64', with_genres: '99', with_keywords: '9902', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_discovery_science', url: 'discover/tv', params: { with_networks: '64', with_genres: '99', with_keywords: '221355', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
            ]
        },
        marvel: {
            title: 'MARVEL',
            categoryTemplate: 'brand',
            base: { tv: { with_companies: '420' }, movie: { with_companies: '420' } },
            mergeTvMovieTrending: true,
            exclusives: [
                { titleKey: 'streaming_animation', mergeRequests: [
                    { url: 'discover/tv', params: { with_companies: '420', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '420', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        dc: {
            title: 'DC',
            categoryTemplate: 'brand',
            base: { tv: { with_companies: '429' }, movie: { with_companies: '429' } },
            mergeTvMovieTrending: true,
            exclusives: [
                { titleKey: 'streaming_animation', mergeRequests: [
                    { url: 'discover/tv', params: { with_companies: '429', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '429', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        }
    };

    Lampa.Lang.add({
        streaming_menu_title: { en: 'Streaming', uk: 'Стрімінги' },
        streaming_trending: { en: 'Popular now', uk: 'В тренді' },
        streaming_new_series: { en: 'New series', uk: 'Нові серіали' },
        streaming_new_movies: { en: 'New movies', uk: 'Нові фільми' },
        streaming_exclusive_1: { en: 'Exclusive 1', uk: 'Ексклюзив 1' },
        streaming_exclusive_2: { en: 'Exclusive 2', uk: 'Ексклюзив 2' },
        streaming_exclusive_3: { en: 'Exclusive 3', uk: 'Ексклюзив 3' },
        streaming_exclusive_4: { en: 'Exclusive 4', uk: 'Ексклюзив 4' },
        streaming_exclusive_5: { en: 'Exclusive 5', uk: 'Ексклюзив 5' },
        streaming_scifi_fantasy: { en: 'Sci-Fi & Fantasy', uk: 'Наукова фантастика та Фентезі' },
        streaming_action_thrillers: { en: 'Action & Thrillers', uk: 'Бойовики та Трилери' },
        streaming_nonfiction: { en: 'Non-Fiction', uk: 'Нон-фікшен' },
        streaming_animation: { en: 'Animation', uk: 'Анімація' },
        streaming_comedy: { en: 'Comedy', uk: 'Комедії' },
        streaming_region_label: { en: 'Watch region', uk: 'Регіон перегляду' },
        streaming_netflix_original: { en: 'Netflix Originals', uk: 'Netflix оригінальні' },
        streaming_apple_original: { en: 'Apple TV+ Originals', uk: 'Apple TV+ оригінальні' },
        streaming_max_originals: { en: 'Max Originals', uk: 'Max оригінальні' },
        streaming_hbo_gold: { en: 'HBO Gold', uk: 'Золота колекція HBO' },
        streaming_prime_original: { en: 'Prime Video Originals', uk: 'Prime Video оригінальні' },
        streaming_disney_original: { en: 'Disney+ Originals', uk: 'Disney+ оригінальні' },
        streaming_disney_classic: { en: 'Disney Classic', uk: 'Класика Disney' },
        streaming_pixar: { en: 'Pixar', uk: 'Pixar' },
        streaming_marvel: { en: 'Marvel', uk: 'Marvel: Кіновсесвіт' },
        streaming_paramount_originals: { en: 'Paramount+ Originals', uk: 'Paramount+ оригінальні' },
        streaming_yellowstone: { en: 'Yellowstone', uk: 'Всесвіт Йеллоустоун' },
        streaming_paramount_blockbusters: { en: 'Paramount blockbusters', uk: 'Блокбастери Paramount' },
        streaming_space: { en: 'Space', uk: 'Космос' },
        streaming_wildlife: { en: 'Wildlife', uk: 'Дика природа' },
        streaming_nature_science: { en: 'Nature & Science', uk: 'Природа та наука' },
        streaming_discovery_docs: { en: 'Documentaries', uk: 'Документальні' },
        streaming_discovery_science: { en: 'Science & Nature', uk: 'Наука та природа' },
        streaming_enabled_services_label: { en: 'Streamings', uk: 'Стримінги' },
        streaming_more_label: { en: 'See all', uk: 'Дивитись усі' },
        streaming_drama: { en: 'Drama', uk: 'Драма' },
        streaming_horror: { en: 'Horror', uk: 'Жахи' },
        streaming_romance: { en: 'Romance', uk: 'Мелодрама' },
        streaming_mystery: { en: 'Mystery & Detective', uk: 'Детектив та Таємниця' },
        streaming_discovery: { en: 'Nature, Space & Wildlife', uk: 'Природа, космос та тварини' },
        streaming_search_results: { en: 'Search results', uk: 'Результати пошуку' },
    });

    var WATCH_REGIONS = [
        { code: 'UA', label: { uk: 'Україна (UA)', en: 'Ukraine (UA)' } },
        { code: 'US', label: { uk: 'США (US)', en: 'United States (US)' } },
        { code: 'EU', label: { uk: 'Європа (EU)', en: 'Europe (EU)' } }
    ];

    function getEnabledServiceIds() {
        var all = Object.keys(SERVICE_CONFIGS);
        var s = Lampa.Storage.get(STORAGE_ENABLED_SERVICES);
        if (!s || !Array.isArray(s) || !s.length) return all;
        return s.filter(function (id) { return SERVICE_CONFIGS[id]; });
    }

    function getRowTitle(cat, service, index) {
        if (cat.section === 'exclusive' && service && service.exclusives) {
            var ex = service.exclusives[index - 5];
            if (ex && ex.titleKey) return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(ex.titleKey)) || ex.titleKey;
        }
        var key = cat.titleKey;
        return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(key)) || key;
    }

    function buildEffectiveCategories(serviceId, object) {
        var service = SERVICE_CONFIGS[serviceId];
        if (!service) return [];
        var list = [];
        var searchQuery = object && object.searchQuery && object.searchQuery.trim ? object.searchQuery.trim() : '';
        if (searchQuery) {
            var searchTitle = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_search_results')) || 'Search results';
            list.push({
                index: 0,
                titleKey: 'streaming_search_results',
                title: searchTitle + ': ' + searchQuery,
                url: 'search/multi',
                params: { query: searchQuery },
                mergeRequests: null,
                isSearch: true
            });
        }
        var template = (service.categoryTemplate === 'brand') ? CATEGORY_TEMPLATE_BRAND : CATEGORY_TEMPLATE;
        for (var i = 0; i < template.length; i++) {
            var cat = template[i];
            if (!cat) continue;
            if (cat.section === 'exclusive') {
                var exs = service.exclusives || [];
                if (!exs[cat.id - 5]) continue;
            }
            var req = getCategoryRequest(service, cat, cat.id, object);
            if (!req || (!req.params && !req.mergeRequests)) continue;
            var firstReq = req.mergeRequests && req.mergeRequests[0];
            list.push({
                index: cat.id,
                titleKey: cat.section === 'exclusive' ? (service.exclusives[cat.id - 5] && service.exclusives[cat.id - 5].titleKey) || cat.titleKey : cat.titleKey,
                title: getRowTitle(cat, service, cat.id),
                url: req.url || (firstReq && firstReq.url),
                params: req.params || (firstReq && firstReq.params),
                mergeRequests: req.mergeRequests,
                isSearch: req.isSearch || false
            });
        }
        return list;
    }

    function buildStreamingViewHeader() {
        return null;
    }

    function StreamingMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var serviceId = object.service_id;
        var config = SERVICE_CONFIGS[serviceId];
        if (!config) {
            comp.create = function () { this.empty(); return this.render(); };
            return comp;
        }
        comp.create = function () {
            var mainObject = Object.assign({}, object, { tagKeywordId: null, searchQuery: '' });
            var categories = buildEffectiveCategories(serviceId, mainObject);
            if (!categories.length) {
                this.empty();
                return this.render();
            }
            var _this = this;
            var sessionId = Date.now();
            comp._streamingSessionId = sessionId;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);
            var staticDone = false;
            this.activity.loader(true);
            function isStale() { return comp._streamingSessionId !== sessionId; }

            function doRequest(cat, index, onOk, onErr) {
                if (cat.isSearch && cat.params && cat.params.query) {
                    var fullUrl = buildSearchUrl(cat.params.query, 1);
                    network.silent(fullUrl, function (json) {
                        if (!json || !json.results) return onOk({ results: [] });
                        var filtered = json.results.filter(function (r) { return r && (r.media_type === 'tv' || r.media_type === 'movie'); }).slice(0, 20);
                        onOk({ results: filtered });
                    }, onErr);
                    return;
                }
                var fullUrl = buildDiscoverUrl(cat.url, cat.params || {}, 1);
                network.silent(fullUrl, onOk, onErr);
            }

            categories.forEach(function (cat, index) {
                if (cat.mergeRequests && cat.mergeRequests.length) {
                    var pending = cat.mergeRequests.length;
                    var allResults = [];
                    function dedupeById(arr) {
                        var seen = {};
                        return arr.filter(function (r) {
                            var id = (r && r.id) != null ? String(r.id) + '_' + (r.media_type || 'tv') : '';
                            if (!id || seen[id]) return false;
                            seen[id] = true;
                            return true;
                        });
                    }
                    cat.mergeRequests.forEach(function (r) {
                        var url = r.url;
                        var params = r.params;
                        var fullUrl = buildDiscoverUrl(url, params || {}, 1);
                        network.silent(fullUrl, function (json) {
                            if (isStale()) return;
                            if (json && json.results && json.results.length) allResults = allResults.concat(json.results);
                            pending--;
                            if (pending === 0) status.append(String(index), { results: dedupeById(allResults) });
                        }, function () {
                            if (isStale()) return;
                            pending--;
                            if (pending === 0) status.append(String(index), { results: dedupeById(allResults) });
                            status.error();
                        });
                    });
                } else {
                    doRequest(cat, index, function (json) {
                        if (isStale()) return;
                        status.append(String(index), json);
                    }, function () {
                        if (isStale()) return;
                        status.append(String(index), { results: [] });
                        status.error();
                    });
                }
            });

            function buildFullData() {
                var fulldata = [];
                var keys = Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); });
                keys.forEach(function (key) {
                    var data = status.data[key];
                    var results = (data && data.results) ? data.results.slice(0, 20) : [];
                    var cat = categories[parseInt(key, 10)];
                    if (!cat || !results.length) return;
                    Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                    fulldata.push({ title: cat.title, results: results, url: cat.url, params: cat.params });
                });
                return fulldata;
            }

            function tryBuild() {
                if (isStale()) return;
                if (!staticDone) return;
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
                page: 1,
                tagKeywordId: object.tagKeywordId || null,
                genreId: object.genreId != null ? object.genreId : null,
                originCountry: object.originCountry || null,
                searchQuery: object.searchQuery || ''
            });
        };
        return comp;
    }

    function getViewParamsFromObject(obj) {
        if (!obj) return {};
        var params = Object.assign({}, obj.params || {});
        if (obj.url && obj.url.indexOf('discover/') !== -1 && !params.with_origin_country) params.with_origin_country = ORIGIN_COUNTRIES_NO_ASIA;
        if (obj.tagKeywordId) params.with_keywords = obj.tagKeywordId;
        if (obj.genreId != null) params.with_genres = String(obj.genreId);
        if (obj.originCountry) params.with_origin_country = obj.originCountry === 'EU' ? ORIGIN_COUNTRY_EU : obj.originCountry;
        return params;
    }

    function StreamingView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();
        function getViewParams() {
            return getViewParamsFromObject(object);
        }
        var streamingHeaderEl = null;
        var streamingRootEl = null;
        function prependViewHeader(_this) {
            var root = _this.activity && _this.activity.render ? _this.activity.render() : _this.render();
            if (!root) return;
            streamingRootEl = root;
            var headerEl = buildStreamingViewHeader(object, {
                onReturnFocus: function () {
                    applyStreamingViewCollection(false);
                    scheduleCollectionApply();
                }
            });
            if (headerEl) {
                if (root.prepend) {
                    root.prepend(headerEl);
                } else if (root.insertBefore && root.firstChild) {
                    root.insertBefore(headerEl, root.firstChild);
                } else {
                    root.insertBefore(headerEl, null);
                }
                streamingHeaderEl = headerEl;
            }
        }
        function applyStreamingViewCollection(focusOnHeader) {
            if (!streamingHeaderEl || !streamingRootEl || !Lampa.Controller || typeof Lampa.Controller.collectionSet !== 'function') return;
            var content = streamingRootEl.children && streamingRootEl.children.length > 1 ? streamingRootEl.children[1] : streamingRootEl;
            Lampa.Controller.collectionSet(streamingHeaderEl, content);
            if (typeof Lampa.Controller.collectionFocus === 'function') {
                var focusEl = focusOnHeader
                    ? (streamingHeaderEl.querySelector && streamingHeaderEl.querySelector('.selector'))
                    : (content.querySelector && content.querySelector('.selector'));
                Lampa.Controller.collectionFocus(focusEl || focusOnHeader === true, streamingHeaderEl, content);
            }
        }
        function scheduleCollectionApply() {
            setTimeout(applyStreamingViewCollection.bind(null, false), 0);
            setTimeout(applyStreamingViewCollection.bind(null, false), 150);
            setTimeout(applyStreamingViewCollection.bind(null, false), 450);
        }
        
        var originalStart = comp.start;
        if (originalStart) {
            comp.start = function () {
                originalStart.apply(this, arguments);
                scheduleCollectionApply();
                var self = this;
                setTimeout(function () {
                    var contentCtrl = Lampa.Controller.enabled && Lampa.Controller.enabled();
                    if (contentCtrl && contentCtrl.toggle) {
                        var prevToggle = contentCtrl.toggle;
                        Lampa.Controller.add('content', Object.assign({}, contentCtrl, {
                            toggle: function () {
                                applyStreamingViewCollection(false);
                                if (prevToggle) prevToggle.call(self);
                            }
                        }));
                    }
                }, 50);
            };
        }
        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var searchQuery = (object.searchQuery && object.searchQuery.trim) ? object.searchQuery.trim() : '';
            if (searchQuery) {
                var fullUrl = buildSearchUrl(searchQuery, 1);
                network.silent(fullUrl, function (json) {
                    var raw = (json && json.results) ? json.results : [];
                    var results = raw.filter(function (r) { return r && (r.media_type === 'tv' || r.media_type === 'movie'); });
                    var totalPages = (json && json.total_pages != null) ? json.total_pages : 1;
                    var totalResults = (json && json.total_results != null) ? json.total_results : results.length;
                    _this.build({ page: 1, results: results, total_pages: totalPages, total_results: totalResults });
                    prependViewHeader(_this);
                    _this.activity.loader(false);
                    scheduleCollectionApply();
                }, function () {
                    _this.build({ page: 1, results: [], total_pages: 1, total_results: 0 });
                    prependViewHeader(_this);
                    _this.activity.loader(false);
                    scheduleCollectionApply();
                });
            } else {
                var url = object.url;
                var params = getViewParams();
                var fullUrl = buildDiscoverUrl(url, params, 1);
                network.silent(fullUrl, function (json) {
                    var results = (json && json.results) ? json.results : [];
                    var totalPages = (json && json.total_pages != null) ? json.total_pages : 1;
                    var totalResults = (json && json.total_results != null) ? json.total_results : 0;
                    _this.build({ page: 1, results: results, total_pages: totalPages, total_results: totalResults });
                    prependViewHeader(_this);
                    _this.activity.loader(false);
                    scheduleCollectionApply();
                }, function () {
                    _this.build({ page: 1, results: [], total_pages: 1, total_results: 0 });
                    prependViewHeader(_this);
                    _this.activity.loader(false);
                    scheduleCollectionApply();
                });
            }
            return this.render();
        };
        function loadNextPage(obj, resolve, reject) {
            var page = (obj && obj.page) ? obj.page : 1;
            var searchQuery = (object.searchQuery && object.searchQuery.trim) ? object.searchQuery.trim() : '';
            if (searchQuery) {
                network.silent(buildSearchUrl(searchQuery, page), function (json) {
                    var raw = (json && json.results) ? json.results : [];
                    var results = raw.filter(function (r) { return r && (r.media_type === 'tv' || r.media_type === 'movie'); });
                    resolve({ results: results, total_pages: json.total_pages || 1, total_results: json.total_results || 0 });
                }, reject);
            } else {
                var params = getViewParams();
                network.silent(buildDiscoverUrl(object.url, params, page), resolve, reject);
            }
        }
        comp.nextPageReuest = loadNextPage;
        comp.nextPageRequest = loadNextPage;
        return comp;
    }

    var SQR_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M103.19 259.166c-.496-36.878 12.288-70.811 38.101-97.364a133.021 133.021 0 0 1 94.684-40.779 132.22 132.22 0 0 1 75.606 22.038c4.791 3.174 9.628 7.255 14.598 11.45 11.876 10.021 24.513 20.686 39.11 21.143 7.643.239 15.445-1.01 22.938-2.438 3.203-.61 8.485-1.849 15.035-3.385 28.727-6.736 81.883-19.201 91.479-9.581.876.88 1.282 1.94 1.258 3.185-.073 3.485-5.488 8.278-8.019 10.488-9.433 8.244-19.95 15.585-30.319 22.822-2.773 1.936-5.536 3.864-8.266 5.801-4.999 3.549-10.051 7.061-15.095 10.568-11.107 7.721-22.226 15.452-32.936 23.674-10.096 7.752-19.68 16.167-29.135 24.68-2.97 38.078-17.043 70.751-46.537 95.954a134.364 134.364 0 0 1-97.842 32.511 136.084 136.084 0 0 1-58.686-18.41l-.406-.236-.248-.142-.358-.206c-3.809-2.188-10.708-6.151-11.18-9.994.345-2.074 2.639-4.047 4.309-5.102l.487-.311c12.718-8.123 26.28-16.784 42.045-13.531 3.26.611 6.36 1.397 9.448 2.18 4.013 1.018 8.005 2.031 12.301 2.646 46.798 6.708 91.399-25.297 102.025-70.994.495-2.126.796-5.836 1.125-9.896.594-7.315 1.281-15.774 3.359-18.195 4.333-5.051 12.061-9.573 18.894-13.571 2.446-1.431 4.777-2.795 6.797-4.093 14.27-8.962 29.111-16.527 44.007-24.121 5.865-2.99 11.739-5.984 17.59-9.07 1.095-.581 2.732-1.434 4.698-2.459 8.535-4.449 23.274-12.131 26.78-14.796 4.539-2.289 9.747-5.484 13.541-8.85-4.925 1.194-10.424 3.326-15.467 5.28-1.074.416-2.14.83-3.162 1.219a753.983 753.983 0 0 0-72.142 33.28 4336.525 4336.525 0 0 0-101.31 55.119 3627.018 3627.018 0 0 1-57.962 32.151c-1.791.987-3.578 1.974-5.364 2.96l-.077.043-.024.013c-8.441 4.663-16.86 9.314-25.522 13.824-38.886 20.265-81.017 36.027-123.103 48.071-9.994 2.86-30.136 7.347-39.519 4.279-15.02-4.913 9.946-30.393 16.917-37.508.543-.554.976-.996 1.273-1.309a2665.668 2665.668 0 0 1 34.55-35.712c7.07-7.211 24.6-25.118 29.724-33.326Zm128.951-95.097c28.251-1.71 55.658 9.404 74.451 30.726 7.082 8.035 11.228 15.615 16.097 25.062-12.148 5.895-27.316 14.705-40.292 22.242-2.864 1.663-5.62 3.265-8.215 4.759a1747.844 1747.844 0 0 1-54.737 30.307c-20.284 9.895-42.219 19.34-65.185 16.588-4.663-10.305-6.988-18.963-7.907-30.38a92.596 92.596 0 0 1 22.089-68.087c16.239-19.014 38.996-29.282 63.699-31.217Z" clip-rule="evenodd"/></svg>';
    var ICON_SIZE = ' width="24" height="24"';
    var ICON_NETFLIX = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M146 56h80l59 177 1-177h80v400c-25-4-53-7-82-8l-58-172-1 172c-28 1-55 4-79 8V56Z"/></svg>';
    var ICON_APPLE = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M368 440c-21 21-45 18-68 8a87 87 0 0 0-72 0c-32 14-49 10-68-8-109-112-93-282 31-288 30 1 50 16 68 18 26-6 51-21 79-19 34 3 59 16 76 40a88 88 0 0 0 11 158c-13 34-30 67-57 91ZM257 150c-4-49 37-90 83-94 6 57-52 100-83 94Z"/></svg>';
    var ICON_HBO = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M163 348h-49v-71H82v71H31V166h51v68h32v-68h49v182Zm226 1a93 93 0 0 0 35-179 91 91 0 0 0-118 46c0-23-23-50-49-50h-84v182h79c31 0 54-28 54-51 7 15 32 52 83 52Zm-144-74c7 0 13 7 13 15s-6 16-13 16h-25v-31h25Zm0-68c7 0 13 7 13 15s-6 15-13 15h-25v-30h25Zm33 49c6-1 16-8 19-12v26c-4-6-13-14-19-14Zm65 0a46 46 0 1 1 92 0 46 46 0 0 1-92 0Zm46 36a36 36 0 1 0 0-73 36 36 0 0 0 0 73Z"/></svg>';
    var ICON_DISNEY = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="42.7" d="M90 123c-26-3-24-12-24-16s9-21 87-21c94 0 293 73 293 201s-174 98-209 90c-34-8-111-45-111-83 0-28 62-48 134-48 73 0 106 21 106 40 0 10-1 25-20 30M226 166v260"/></svg>';
    var ICON_AMAZON = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M456 370c0 15-8 43-26 58-4 3-8 2-6-2 5-13 17-43 12-50-4-6-21-5-35-4l-17 2c-4 0-4-3 0-6 5-4 11-7 17-8 23-7 50-3 53 1 1 1 2 3 2 9Zm-38 26-17 11a294 294 0 0 1-343-37c-4-3-1-9 4-6a397 397 0 0 0 339 26l10-4c7-3 14 5 7 10ZM294 176c0-21 1-33-6-44-6-9-17-14-31-13-16 1-33 11-38 31-1 4-3 8-9 9l-48-6c-4-1-9-3-7-10 10-55 57-75 102-77h10c25 0 56 7 76 25 24 23 22 53 22 87v78c0 24 9 34 19 46 2 5 3 10-1 13l-38 34c-4 2-10 2-13 0-15-12-19-20-28-33-17 18-31 27-47 33-12 3-24 4-36 4-42 0-75-26-75-78 0-41 22-69 54-82s79-17 94-17m-9 104c10-18 9-32 9-64-13 0-26 1-37 3-21 6-38 20-38 48 0 21 12 36 31 36l7-1c13-3 21-10 28-22Z"/></svg>';
    var ICON_PARAMOUNT = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M328 412c1-1 3-5 0-12l-9-24c-1-3 2-5 3-3 0 0 17 19 21 28l9 13 45 1-5-6c-32-40-53-62-53-62-6-7-9-9-14-11l-3-1v6l-1 1-47-84c-2-4-5-7-9-10l-5-3-22 52c3 0 6 4 4 7l-20 48h19c7 0 14 2 21 4l5 3s-15 31-15 47l1 9h35l-1-10s21 5 41 7ZM256 97A200 200 0 0 0 95 415c8-3 13-9 16-13l38-47 3-3 5-2 62-78 8-7 19-25 1-2 8-6a6 6 0 0 1 7 0l10 7c5 4 9 8 12 14l38 68 3 3c8 4 13 4 23 15 4 5 25 28 53 63 4 6 9 10 16 13A200 200 0 0 0 256 96ZM110 308l-13-5-8 11v-13l-13-4 13-5v-13l8 11 13-4-8 11 8 11Zm-3 44-4 13-5-13H85l11-8-4-13 11 8 11-8-5 13 11 8h-13Zm2-103 5 13-11-8-11 8 4-13-11-8h13l5-13 4 13h13l-11 8Zm22-29-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 4v14Zm34-48-4 13-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14Zm43-22-8 11v-13l-13-5 13-4v-14l8 11 13-4-8 11 8 11-13-4Zm55-12 4 13-11-8-11 8 4-13-11-8h14l4-13 4 13h14l-11 8Zm49 10v13l-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 5Zm90 138 13 4 8-11v13l13 5-13 4v13l-8-11-13 5 8-11-8-11Zm-51-101-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14l-4 13Zm30 35v-14l-13-4 13-4v-14l8 11 13-4-8 11 8 11-13-4-8 11Zm24 21 4-13 5 13h13l-11 8 4 13-11-8-11 8 5-13-11-8h13Zm9 111-5 13-4-13h-13l11-8-5-13 11 8 11-8-4 13 11 8h-13Zm-202-10 13-26-1-2-11 12c-5 5-14 20-16 23l-14 23a2 2 0 0 1 2 2l-12 21c-3 5 2 9 3 7 19-31 30-28 30-28l7-15-1-2c-2-1-5-5 0-15Z"/></svg>';
    var ICON_ORIGIN = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-width="42.6667" stroke-linecap="round" stroke-linejoin="round" d="M149.333 64H362.667V448H149.333V64Z"/></svg>';
    var ICON_DISCOVERY = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M192.417 293.847c.47.202.976.306 1.487.305a3.749 3.749 0 0 0 3.245-1.868l.621-1.071a5.873 5.873 0 0 0 .797-2.772l.145-4.634a3.233 3.233 0 0 0-2.155-3.16 3.234 3.234 0 0 0-3.665 1.097l-1.197 1.575a6.73 6.73 0 0 0-1.365 3.711l-.176 3.159a3.735 3.735 0 0 0 1.019 2.79c.351.371.775.667 1.244.868Z" clip-rule="evenodd"/><path fill="currentColor" d="M414.071 256c0 103.722-82.281 180-186.649 180H119.42v-71.997h108.002c59.65 0 107.635-48.353 107.635-108.003 0-59.637-47.985-107.99-107.635-107.99H119.42V76l108.002.013c104.368 0 186.649 76.265 186.649 179.987Z"/><path fill="currentColor" fill-rule="evenodd" d="M182.439 170.773a84.93 84.93 0 0 0-32.56 6.609 84.884 84.884 0 0 0-45.581 45.971 84.845 84.845 0 0 0 .093 64.728 84.888 84.888 0 0 0 45.716 45.84 84.934 84.934 0 0 0 64.752.292 84.914 84.914 0 0 0 27.7-18.34 84.861 84.861 0 0 0 25.078-60.124 84.864 84.864 0 0 0-24.936-60.184 84.907 84.907 0 0 0-60.262-24.792Zm-47.919 30.845a72.468 72.468 0 0 0-15.91 20.106l5.47-7.011a2.036 2.036 0 0 1 1.588-.778 2.022 2.022 0 0 1 1.595.762 2.011 2.011 0 0 0 1.654.756l10.298-.347a2.976 2.976 0 0 1 3.057 2.615 2.958 2.958 0 0 0 1.954 2.441l10.736 3.818a2.334 2.334 0 0 0 2.826-1.071 2.34 2.34 0 0 1 2.121-1.207l6.554.221a7.748 7.748 0 0 0 7.267-4.435 7.736 7.736 0 0 0-1.198-8.426l-4.67-5.292 8.653-.898a7.435 7.435 0 0 1 4.428.929l1.834 1.04a4.551 4.551 0 0 0 5.608-.888 4.54 4.54 0 0 0 .363-5.664l-1.282-1.834a7.135 7.135 0 0 0-2.785-2.356 7.134 7.134 0 0 0-3.587-.668l-2.256.17a11.098 11.098 0 0 0-9.23 6.395l-1.746 3.774-4.386.261a7.03 7.03 0 0 0-4.55 2.054 7.032 7.032 0 0 1-4.33 2.035l-8.108.74-6.939-8.048h-.088a14.18 14.18 0 0 0-4.941.806Zm-18.945 26.52c.267-.643.542-1.28.826-1.912-.054.274-.096.55-.126.828l-.882 8.313a23.55 23.55 0 0 0 6.734 19.12l3.204 3.223a12.45 12.45 0 0 0 8.675 3.666 12.459 12.459 0 0 1 12.303 12.228l.094 5.274a9.887 9.887 0 0 0 3.75 7.569 9.887 9.887 0 0 1 3.75 7.434l.365 11.648c.067 2.079.76 4.099 1.986 5.784a10.363 10.363 0 0 0 7.692 4.258 10.357 10.357 0 0 0 8.196-3.187l3.721-3.906a22.58 22.58 0 0 0 6.236-15.504l.051-15.646a17.636 17.636 0 0 1 5.013-12.26l3.114-3.185a9.763 9.763 0 0 0 .028-13.601l-14.609-15.092a2.406 2.406 0 0 1-.724-1.737 2.427 2.427 0 0 1 .743-1.73 2.406 2.406 0 0 1 1.759-.672 2.426 2.426 0 0 1 1.707.794l7.582 7.963a12.134 12.134 0 0 0 8.278 3.752l2.313.094a6.848 6.848 0 0 0 5.136-11.677l-7.852-7.868a1.89 1.89 0 0 1 2.669-2.678l3.545 3.5a5.726 5.726 0 0 0 3.992 1.654l3.107.018a13.37 13.37 0 0 1 11.31 6.363l7.518 12.232a1.987 1.987 0 0 0 3.599-.488l1.828-6.294c.309-1.062.8-2.06 1.452-2.948l1.526-2.076c3.718-5.056 11.076-5.179 15.018-.615a72.25 72.25 0 0 1-8.92 66.926 72.316 72.316 0 0 1-93.93 21.33 72.26 72.26 0 0 1-36.971-56.504 72.25 72.25 0 0 1 5.194-34.391Z" clip-rule="evenodd"/></svg>';
    var ICON_MARVEL = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M243.2 200.597h-.256V256.5a16.59 16.59 0 0 0 7.347-1.774 27.72 27.72 0 0 0 10.589-11.271 27.873 27.873 0 0 0 2.928-15.215c0-26.923-18.253-27.669-20.608-27.643ZM0 153v207h512V153H0Zm433.28 119.237h-28.006v39.857h28.006v31.243H374.4V185.811l-24.858 157.526h-36.377l-18.586-111.78a50.61 50.61 0 0 1-3.551 24.459 50.385 50.385 0 0 1-14.702 19.821l19.687 67.397h-30.72l-15.002-57.523-7.27 1.055v56.417h-59.162l-3.635-26.743h-24.448l-3.635 26.743H91.878v-83.597l-14.003 83.751H61.261l-14.234-83.751v83.751H15.795V169.56h39.68l13.927 89.794 14.31-89.794h39.654v159.814l23.86-159.84h41.446l23.04 154.286V169.534h31.693a50.008 50.008 0 0 1 26.605 7.641 50.329 50.329 0 0 1 18.528 20.645l-3.533-28.286h31.641l14.285 105.84L345.6 169.56h87.757v31.68h-28.083v39.266h28.006v31.731Zm62.976 71.074h-57.574V169.534h31.001v142.535h26.573v31.242Zm-336.794-54.257h17.485l-8.909-74.314-8.576 74.314Z"/></svg>';
    var ICON_DC = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M131.608 197.095h39.49c11.019 0 19.947 8.928 19.947 19.947v90.823c0 11-8.928 19.947-19.947 19.947h-24.181V209.708a2.946 2.946 0 0 0-1.21-2.365l-14.099-10.248ZM256 459.482a203.142 203.142 0 0 1-158.748-76.175.847.847 0 0 1-.09-.883.848.848 0 0 1 .75-.474h108.826a4.76 4.76 0 0 0 2.805-.917l41.617-30.213a2.94 2.94 0 0 0 1.173-2.347V175.627a2.931 2.931 0 0 0-1.191-2.365l-41.599-30.195a4.76 4.76 0 0 0-2.805-.917H88.91a.847.847 0 0 1-.719-.453.843.843 0 0 1 .04-.849A203.32 203.32 0 0 1 256 52.5c69.63 0 131.083 34.962 167.768 88.312a.836.836 0 0 1 .036.856.853.853 0 0 1-.305.323.849.849 0 0 1-.427.122h-29.279a2.49 2.49 0 0 0-2.255 1.449l-6.471 13.878-19.837-14.41a4.763 4.763 0 0 0-2.805-.917H315.62a4.771 4.771 0 0 0-2.823.917l-41.58 30.232a2.932 2.932 0 0 0-1.192 2.365v172.846c0 .917.44 1.797 1.192 2.347l41.616 30.213a4.765 4.765 0 0 0 2.805.917h98.469c.696 0 1.1.825.66 1.357a203.15 203.15 0 0 1-70.698 56.196A203.113 203.113 0 0 1 256 459.482ZM65.37 188.167l19.03 13.841a2.956 2.956 0 0 1 1.247 2.42v160.05c0 .844-1.1 1.155-1.54.459A202.586 202.586 0 0 1 52.518 256c0-23.632 4.034-46.31 11.44-67.412a.923.923 0 0 1 .595-.577.914.914 0 0 1 .817.137v.019Zm250.617 8.946h59.125v32.56c0 .844.696 1.54 1.54 1.54h49.518a1.83 1.83 0 0 0 1.76-1.521l9.808-61.857a.844.844 0 0 1 1.577-.238 202.586 202.586 0 0 1 20.167 88.421 202.576 202.576 0 0 1-25.484 98.67c-.403.734-1.54.44-1.54-.421v-56.54a1.539 1.539 0 0 0-1.54-1.54h-54.266a1.539 1.539 0 0 0-1.54 1.54v30.103H351.26a19.987 19.987 0 0 1-14.106-5.846 19.989 19.989 0 0 1-5.859-14.101v-98.175a2.928 2.928 0 0 0-1.192-2.365l-14.116-10.23ZM256 36C134.505 36 36 134.505 36 256s98.505 220 220 220 220-98.505 220-220S377.495 36 256 36Z"/></svg>';
    var SERVICE_ICONS = { netflix: ICON_NETFLIX, apple: ICON_APPLE, hbo: ICON_HBO, amazon: ICON_AMAZON, disney: ICON_DISNEY, paramount: ICON_PARAMOUNT, origin: ICON_ORIGIN, discovery: ICON_DISCOVERY, marvel: ICON_MARVEL, dc: ICON_DC };

    function registerSqrSettingsApi() {
        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') return;
        Lampa.SettingsApi.addComponent({ component: 'streaming_sqr_settings', name: 'SQR', icon: SQR_ICON_SVG });
        var regionLabel = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_region_label')) || 'Регіон перегляду';
        var regionValues = {};
        WATCH_REGIONS.forEach(function (r) {
            var lang = (Lampa.Storage && Lampa.Storage.get('language')) || 'uk';
            regionValues[r.code] = (r.label && r.label[lang]) ? r.label[lang] : r.code;
        });
        Lampa.SettingsApi.addParam({
            component: 'streaming_sqr_settings',
            param: { name: STORAGE_WATCH_REGION, type: 'select', values: regionValues, default: 'UA' },
            field: { name: regionLabel },
            onChange: function (value) {
                if (value === 'UA' || value === 'US' || value === 'EU') {
                    Lampa.Storage.set(STORAGE_WATCH_REGION, value);
                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                }
            }
        });
        var streamingsLabel = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_enabled_services_label')) || 'Стримінги';
        Lampa.SettingsApi.addParam({
            component: 'streaming_sqr_settings',
            param: { name: STORAGE_ENABLED_SERVICES, type: 'button', default: [] },
            field: { name: streamingsLabel },
            onChange: function () {
                var enabled = getEnabledServiceIds();
                var allIds = Object.keys(SERVICE_CONFIGS);
                var items = allIds.map(function (sid) {
                    var c = SERVICE_CONFIGS[sid];
                    return { title: c.title, value: sid, checkbox: true, checked: enabled.indexOf(sid) !== -1, icon: SERVICE_ICONS[sid] || '' };
                });
                Lampa.Select.show({
                    title: streamingsLabel,
                    items: items,
                    onCheck: function (item) {
                        var list = getEnabledServiceIds().slice();
                        var i = list.indexOf(item.value);
                        if (item.checked) { if (i === -1) list.push(item.value); }
                        else { if (i !== -1) list.splice(i, 1); }
                        Lampa.Storage.set(STORAGE_ENABLED_SERVICES, list.length ? list : allIds);
                    },
                    onBack: function () {
                        if (Lampa.Controller && Lampa.Controller.toggle) Lampa.Controller.toggle('settings_component');
                    }
                });
            }
        });
    }

    var MENU_ANCHOR = '[data-action="catalog"]';
    var MENU_ANCHOR_FALLBACK = '[data-action="tv"]';
    var MENU_ITEM_DELAY_MS = 150;

    function addOneStreamingMenuItem(sid, insertAfter) {
        var config = SERVICE_CONFIGS[sid];
        if (!config) return insertAfter;
        var icon = SERVICE_ICONS[sid] || ICON_NETFLIX;
        var dataAction = 'streaming_menu_' + sid;
        var itemHtml = $(
            '<li class="menu__item selector" data-action="' + dataAction + '">' +
            '  <div class="menu__ico">' + icon + '</div>' +
            '  <div class="menu__text">' + config.title + '</div>' +
            '</li>'
        );
        itemHtml.on('hover:enter', function () {
            Lampa.Activity.push({
                component: 'streaming_main',
                service_id: sid,
                title: config.title,
                page: 1,
                searchQuery: '',
                tagKeywordId: null
            });
        });
        if (insertAfter && insertAfter.length) insertAfter.after(itemHtml);
        return itemHtml;
    }

    function addStreamingMenuItems() {
        var menu = Lampa.Menu.render();
        if (!menu || !menu.length) return;
        var insertAfter = menu.find(MENU_ANCHOR).length ? menu.find(MENU_ANCHOR) : menu.find(MENU_ANCHOR_FALLBACK);
        if (!insertAfter.length) insertAfter = menu.find('.menu__item').last();
        var serviceIds = getEnabledServiceIds();
        var index = 0;
        function addNext() {
            if (index >= serviceIds.length) return;
            var sid = serviceIds[index];
            index += 1;
            var menuNow = Lampa.Menu.render();
            var anchor = menuNow.find(MENU_ANCHOR).length ? menuNow.find(MENU_ANCHOR) : menuNow.find(MENU_ANCHOR_FALLBACK);
            if (!anchor.length) anchor = menuNow.find('.menu__item').last();
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
        registerSqrSettingsApi();
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu-v2.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
