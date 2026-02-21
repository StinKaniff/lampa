(function () {
    'use strict';

    var ORIGIN_COUNTRIES_NO_ASIA = 'US|GB|CA|AU|DE|FR|IT|ES|PL|UA|NL|SE|NO|BR|MX|AR|BE|CH|AT|PT|IE|NZ|ZA|RU|TR|FI|DK|CZ|RO|HU|GR';
    var STORAGE_WATCH_REGION = 'streaming_watch_region';
    var STORAGE_ENABLED_SERVICES = 'streaming_enabled_services';
    var MAX_CATEGORIES = 25;

    // TMDB keyword IDs for tag filter (id-slug format from user)
    var TAGS = [
        { id: '5096', slug: 'natural-disaster', titleKey: 'streaming_tag_natural_disaster' },
        { id: '363309', slug: 'star-wars', titleKey: 'streaming_tag_star_wars' },
        { id: '161176', slug: 'space-opera', titleKey: 'streaming_tag_space_opera' },
        { id: '818', slug: 'based-on-novel-or-book', titleKey: 'streaming_tag_based_on_novel' }
    ];

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

    // 1–3: фіксовані; 5–8: ексклюзиви (назва стримінгу Original тощо); 11–25: жанри
    var CATEGORY_TEMPLATE = [
        { id: 1, titleKey: 'streaming_trending', section: 'trending' },
        { id: 2, titleKey: 'streaming_new_series', section: 'new_series' },
        { id: 3, titleKey: 'streaming_new_movies', section: 'new_movies' },
        { id: 5, titleKey: 'streaming_exclusive_1', section: 'exclusive' },
        { id: 6, titleKey: 'streaming_exclusive_2', section: 'exclusive' },
        { id: 7, titleKey: 'streaming_exclusive_3', section: 'exclusive' },
        { id: 8, titleKey: 'streaming_exclusive_4', section: 'exclusive' },
        { id: 13, titleKey: 'streaming_documentary', section: 'genre', genres: '99' },
        { id: 15, titleKey: 'streaming_geeked', section: 'genre', genres: '878,14,28,12,10759,10765' },
        { id: 16, titleKey: 'streaming_crime_mystery', section: 'genre', genres: '80,9648,53' },
        { id: 17, titleKey: 'streaming_war_history', section: 'genre', genres: '10752,36,10768' },
        { id: 18, titleKey: 'streaming_animation', section: 'genre', genres: '16' },
        { id: 20, titleKey: 'streaming_action', section: 'genre', genres: '28' },
        { id: 21, titleKey: 'streaming_adventure', section: 'genre', genres: '12' },
        { id: 22, titleKey: 'streaming_western', section: 'genre', genres: '37' },
        { id: 23, titleKey: 'streaming_comedy', section: 'genre', genres: '35' },
        { id: 24, titleKey: 'streaming_family', section: 'genre', genres: '10751' },
        { id: 25, titleKey: 'streaming_drama', section: 'genre', genres: '18' }
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
                    { url: 'discover/tv', params: { with_networks: '213', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_companies: '213', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        apple: {
            title: 'Apple TV+',
            base: { tv: { with_watch_providers: '350', watch_region: '{watch_region}' }, movie: { with_watch_providers: '350', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_apple_original', mergeRequests: [
                    { url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
                ]}
            ]
        },
        hbo: {
            title: 'HBO',
            base: { tv: { with_networks: '49|3186' }, movie: { with_watch_providers: '384', watch_region: '{watch_region}' } },
            mergeTvMovieTrending: false,
            exclusives: [
                { titleKey: 'streaming_max_originals', mergeRequests: [
                    { url: 'discover/tv', params: { with_networks: '3186', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_watch_providers: '384', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
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
                    { url: 'discover/tv', params: { with_networks: '1024', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_watch_providers: '119', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
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
                    { url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
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
                    { url: 'discover/tv', params: { with_networks: '4330', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } },
                    { url: 'discover/movie', params: { with_watch_providers: '531', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }
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
                { titleKey: 'streaming_space', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_wildlife', url: 'discover/tv', params: { with_networks: '1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
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
        streaming_documentary: { en: 'Documentary', uk: 'Документальні' },
        streaming_geeked: { en: 'Geeked: Sci-Fi, Fantasy, Superhero & More', uk: 'Гік-всесвіт: Фантастика, Фентезі та Герої' },
        streaming_crime_mystery: { en: 'Crime & Mystery', uk: 'Темні історії: Кримінал, Детективи, Трилери' },
        streaming_war_history: { en: 'War & History', uk: 'Історія та великі конфлікти' },
        streaming_animation: { en: 'Animation', uk: 'Анімація' },
        streaming_action: { en: 'Action', uk: 'Бойовики' },
        streaming_adventure: { en: 'Adventure', uk: 'Пригоди' },
        streaming_western: { en: 'Western', uk: 'Вестерн' },
        streaming_comedy: { en: 'Comedy', uk: 'Комедія' },
        streaming_family: { en: 'Family', uk: 'Сімейний' },
        streaming_drama: { en: 'Drama', uk: 'Драма' },
        streaming_region_label: { en: 'Watch region', uk: 'Регіон перегляду' },
        streaming_netflix_original: { en: 'Netflix Original', uk: 'Netflix Original' },
        streaming_apple_original: { en: 'Apple TV+ Original', uk: 'Apple TV+ Original' },
        streaming_max_originals: { en: 'Max Originals', uk: 'Max Originals' },
        streaming_hbo_gold: { en: 'HBO Gold', uk: 'Золота колекція HBO' },
        streaming_prime_original: { en: 'Prime Original', uk: 'Prime Video Original' },
        streaming_disney_original: { en: 'Disney+ Original', uk: 'Disney+ Original' },
        streaming_disney_classic: { en: 'Disney Classic', uk: 'Класика Disney' },
        streaming_pixar: { en: 'Pixar', uk: 'Pixar' },
        streaming_marvel: { en: 'Marvel', uk: 'Marvel: Кіновсесвіт' },
        streaming_paramount_originals: { en: 'Paramount+ Originals', uk: 'Paramount+ Originals' },
        streaming_yellowstone: { en: 'Yellowstone', uk: 'Всесвіт Йеллоустоун' },
        streaming_paramount_blockbusters: { en: 'Paramount blockbusters', uk: 'Блокбастери Paramount' },
        streaming_space: { en: 'Space', uk: 'Космос' },
        streaming_wildlife: { en: 'Wildlife', uk: 'Дика природа' },
        streaming_enabled_services_label: { en: 'Streamings', uk: 'Стримінги' },
        streaming_more_label: { en: 'See all', uk: 'Дивитись усі' },
        streaming_search: { en: 'Search', uk: 'Пошук' },
        streaming_search_results: { en: 'Search results', uk: 'Результати пошуку' },
        streaming_tag_label: { en: 'Tag', uk: 'Тег' },
        streaming_reset_filters: { en: 'Reset', uk: 'Скинути' },
        streaming_tag_natural_disaster: { en: 'Natural disaster', uk: 'Стихійні лиха' },
        streaming_tag_star_wars: { en: 'Star Wars', uk: 'Зоряні війни' },
        streaming_tag_space_opera: { en: 'Space opera', uk: 'Космічна опера' },
        streaming_tag_based_on_novel: { en: 'Based on novel or book', uk: 'За книгою' }
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
        for (var i = 0; i < CATEGORY_TEMPLATE.length; i++) {
            var cat = CATEGORY_TEMPLATE[i];
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

    function buildStreamingHeader(object, serviceId, options) {
        var opts = options || {};
        var showTag = opts.showTag !== false;
        var header = document.createElement('div');
        header.className = 'streaming-sqr-header';
        header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 16px;flex-wrap:wrap;';
        var searchBtn = document.createElement('div');
        searchBtn.className = 'simple-button simple-button--invisible selector';
        searchBtn.setAttribute('data-action', 'streaming_search');
        searchBtn.innerHTML = '<svg width="23" height="22" viewBox="0 0 23 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle><path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg><span>' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_search')) || 'Search') + '</span>';
        $(searchBtn).on('hover:enter', function () {
            Lampa.Input.edit({ free: true, nosave: true, nomic: true, value: object.searchQuery || '' }, function (val) {
                if (val != null) {
                    var next = Object.assign({}, object, { searchQuery: (val && val.trim()) ? val.trim() : '', tagKeywordId: object.tagKeywordId || null });
                    Lampa.Activity.replace(next);
                }
            });
        });
        header.appendChild(searchBtn);
        if (showTag) {
            var tagLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag';
            var tagTitle = '';
            if (object.tagKeywordId) {
                var found = TAGS.filter(function (t) { return t.id === String(object.tagKeywordId); })[0];
                tagTitle = found ? ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(found.titleKey)) || found.slug) : '';
            }
            var tagBtnText = tagTitle ? tagLabelBase + ': ' + tagTitle : tagLabelBase;
            var tagBtn = document.createElement('div');
            tagBtn.className = 'simple-button simple-button--invisible selector';
            tagBtn.setAttribute('data-action', 'streaming_tag');
            tagBtn.innerHTML = '<span>' + tagBtnText + '</span>';
            $(tagBtn).on('hover:enter', function () {
                var items = TAGS.map(function (t) {
                    return { title: (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(t.titleKey)) || t.slug, value: t.id, id: t.id };
                });
                items.unshift({ title: '— ' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + ' —', value: '', id: null });
                Lampa.Select.show({
                    title: (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag',
                    items: items,
                    onSelect: function (a) {
                        var next = Object.assign({}, object, { tagKeywordId: a.id || null });
                        Lampa.Activity.replace(next);
                    },
                    onBack: function () { Lampa.Controller.toggle('content'); }
                });
            });
            header.appendChild(tagBtn);
        }
        var resetBtn = document.createElement('div');
        resetBtn.className = 'simple-button simple-button--invisible selector';
        resetBtn.innerHTML = '<span>' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + '</span>';
        $(resetBtn).on('hover:enter', function () {
            var next = Object.assign({}, object, { searchQuery: '', tagKeywordId: null });
            Lampa.Activity.replace(next);
        });
        header.appendChild(resetBtn);
        return header;
    }

    function buildStreamingViewTagHeader(object) {
        var header = document.createElement('div');
        header.className = 'streaming-sqr-header streaming-sqr-header--view';
        header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 16px;flex-wrap:wrap;';
        var tagLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag';
        var tagTitle = '';
        if (object.tagKeywordId) {
            var found = TAGS.filter(function (t) { return t.id === String(object.tagKeywordId); })[0];
            tagTitle = found ? ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(found.titleKey)) || found.slug) : '';
        }
        var tagBtnText = tagTitle ? tagLabelBase + ': ' + tagTitle : tagLabelBase;
        var tagBtn = document.createElement('div');
        tagBtn.className = 'simple-button simple-button--invisible selector';
        tagBtn.setAttribute('data-action', 'streaming_view_tag');
        tagBtn.innerHTML = '<span>' + tagBtnText + '</span>';
        $(tagBtn).on('hover:enter', function () {
            var items = TAGS.map(function (t) {
                return { title: (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(t.titleKey)) || t.slug, value: t.id, id: t.id };
            });
            items.unshift({ title: '— ' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + ' —', value: '', id: null });
            Lampa.Select.show({
                title: (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag',
                items: items,
                onSelect: function (a) {
                    var next = Object.assign({}, object, { tagKeywordId: a.id || null, page: 1 });
                    Lampa.Activity.replace(next);
                },
                onBack: function () { Lampa.Controller.toggle('content'); }
            });
        });
        var resetBtn = document.createElement('div');
        resetBtn.className = 'simple-button simple-button--invisible selector';
        resetBtn.innerHTML = '<span>' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + '</span>';
        $(resetBtn).on('hover:enter', function () {
            var next = Object.assign({}, object, { tagKeywordId: null, page: 1 });
            Lampa.Activity.replace(next);
        });
        header.appendChild(tagBtn);
        header.appendChild(resetBtn);
        return header;
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
            var mainObject = Object.assign({}, object, { tagKeywordId: null });
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
                    var root = _this.activity && _this.activity.render ? _this.activity.render() : _this.render();
                    if (root) {
                        var headerEl = buildStreamingHeader(object, serviceId, { showTag: false });
                        if (root.prepend) root.prepend(headerEl); else if (root.insertBefore && root.firstChild) root.insertBefore(headerEl, root.firstChild); else if (root.appendChild) root.insertBefore(headerEl, root.firstChild);
                    }
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
                tagKeywordId: object.tagKeywordId || null
            });
        };
        return comp;
    }

    function StreamingView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();
        function getViewParams() {
            var params = Object.assign({}, object.params || {});
            if (object.url && object.url.indexOf('discover/') !== -1 && !params.with_origin_country) params.with_origin_country = ORIGIN_COUNTRIES_NO_ASIA;
            if (object.tagKeywordId) params.with_keywords = object.tagKeywordId;
            return params;
        }
        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var url = object.url;
            var params = getViewParams();
            var fullUrl = buildDiscoverUrl(url, params, 1);
            network.silent(fullUrl, function (json) {
                var results = (json && json.results) ? json.results : [];
                var totalPages = (json && json.total_pages != null) ? json.total_pages : 1;
                var totalResults = (json && json.total_results != null) ? json.total_results : 0;
                _this.build({ page: 1, results: results, total_pages: totalPages, total_results: totalResults });
                var root = _this.activity && _this.activity.render ? _this.activity.render() : _this.render();
                if (root) {
                    var headerEl = buildStreamingViewTagHeader(object);
                    if (root.prepend) root.prepend(headerEl); else if (root.insertBefore && root.firstChild) root.insertBefore(headerEl, root.firstChild); else if (root.appendChild) root.insertBefore(headerEl, root.firstChild);
                }
                _this.activity.loader(false);
            }, function () {
                _this.build({ page: 1, results: [], total_pages: 1, total_results: 0 });
                var root = _this.activity && _this.activity.render ? _this.activity.render() : _this.render();
                if (root) {
                    var headerEl = buildStreamingViewTagHeader(object);
                    if (root.prepend) root.prepend(headerEl); else if (root.insertBefore && root.firstChild) root.insertBefore(headerEl, root.firstChild); else if (root.appendChild) root.insertBefore(headerEl, root.firstChild);
                }
                _this.activity.loader(false);
            });
            return this.render();
        };
        function loadNextPage(obj, resolve, reject) {
            var page = (obj && obj.page) ? obj.page : 1;
            var params = getViewParams();
            network.silent(buildDiscoverUrl(object.url, params, page), resolve, reject);
        }
        comp.nextPageReuest = loadNextPage;
        comp.nextPageRequest = loadNextPage;
        return comp;
    }

    var SQR_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    var ICON_SIZE = ' width="24" height="24"';
    var ICON_NETFLIX = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M146 56h80l59 177 1-177h80v400c-25-4-53-7-82-8l-58-172-1 172c-28 1-55 4-79 8V56Z"/></svg>';
    var ICON_APPLE = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M368 440c-21 21-45 18-68 8a87 87 0 0 0-72 0c-32 14-49 10-68-8-109-112-93-282 31-288 30 1 50 16 68 18 26-6 51-21 79-19 34 3 59 16 76 40a88 88 0 0 0 11 158c-13 34-30 67-57 91ZM257 150c-4-49 37-90 83-94 6 57-52 100-83 94Z"/></svg>';
    var ICON_HBO = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M163 348h-49v-71H82v71H31V166h51v68h32v-68h49v182Zm226 1a93 93 0 0 0 35-179 91 91 0 0 0-118 46c0-23-23-50-49-50h-84v182h79c31 0 54-28 54-51 7 15 32 52 83 52Zm-144-74c7 0 13 7 13 15s-6 16-13 16h-25v-31h25Zm0-68c7 0 13 7 13 15s-6 15-13 15h-25v-30h25Zm33 49c6-1 16-8 19-12v26c-4-6-13-14-19-14Zm65 0a46 46 0 1 1 92 0 46 46 0 0 1-92 0Zm46 36a36 36 0 1 0 0-73 36 36 0 0 0 0 73Z"/></svg>';
    var ICON_DISNEY = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="42.7" d="M90 123c-26-3-24-12-24-16s9-21 87-21c94 0 293 73 293 201s-174 98-209 90c-34-8-111-45-111-83 0-28 62-48 134-48 73 0 106 21 106 40 0 10-1 25-20 30M226 166v260"/></svg>';
    var ICON_AMAZON = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M456 370c0 15-8 43-26 58-4 3-8 2-6-2 5-13 17-43 12-50-4-6-21-5-35-4l-17 2c-4 0-4-3 0-6 5-4 11-7 17-8 23-7 50-3 53 1 1 1 2 3 2 9Zm-38 26-17 11a294 294 0 0 1-343-37c-4-3-1-9 4-6a397 397 0 0 0 339 26l10-4c7-3 14 5 7 10ZM294 176c0-21 1-33-6-44-6-9-17-14-31-13-16 1-33 11-38 31-1 4-3 8-9 9l-48-6c-4-1-9-3-7-10 10-55 57-75 102-77h10c25 0 56 7 76 25 24 23 22 53 22 87v78c0 24 9 34 19 46 2 5 3 10-1 13l-38 34c-4 2-10 2-13 0-15-12-19-20-28-33-17 18-31 27-47 33-12 3-24 4-36 4-42 0-75-26-75-78 0-41 22-69 54-82s79-17 94-17m-9 104c10-18 9-32 9-64-13 0-26 1-37 3-21 6-38 20-38 48 0 21 12 36 31 36l7-1c13-3 21-10 28-22Z"/></svg>';
    var ICON_PARAMOUNT = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M328 412c1-1 3-5 0-12l-9-24c-1-3 2-5 3-3 0 0 17 19 21 28l9 13 45 1-5-6c-32-40-53-62-53-62-6-7-9-9-14-11l-3-1v6l-1 1-47-84c-2-4-5-7-9-10l-5-3-22 52c3 0 6 4 4 7l-20 48h19c7 0 14 2 21 4l5 3s-15 31-15 47l1 9h35l-1-10s21 5 41 7ZM256 97A200 200 0 0 0 95 415c8-3 13-9 16-13l38-47 3-3 5-2 62-78 8-7 19-25 1-2 8-6a6 6 0 0 1 7 0l10 7c5 4 9 8 12 14l38 68 3 3c8 4 13 4 23 15 4 5 25 28 53 63 4 6 9 10 16 13A200 200 0 0 0 256 96ZM110 308l-13-5-8 11v-13l-13-4 13-5v-13l8 11 13-4-8 11 8 11Zm-3 44-4 13-5-13H85l11-8-4-13 11 8 11-8-5 13 11 8h-13Zm2-103 5 13-11-8-11 8 4-13-11-8h13l5-13 4 13h13l-11 8Zm22-29-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 4v14Zm34-48-4 13-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14Zm43-22-8 11v-13l-13-5 13-4v-14l8 11 13-4-8 11 8 11-13-4Zm55-12 4 13-11-8-11 8 4-13-11-8h14l4-13 4 13h14l-11 8Zm49 10v13l-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 5Zm90 138 13 4 8-11v13l13 5-13 4v13l-8-11-13 5 8-11-8-11Zm-51-101-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14l-4 13Zm30 35v-14l-13-4 13-4v-14l8 11 13-4-8 11 8 11-13-4-8 11Zm24 21 4-13 5 13h13l-11 8 4 13-11-8-11 8 5-13-11-8h13Zm9 111-5 13-4-13h-13l11-8-5-13 11 8 11-8-4 13 11 8h-13Zm-202-10 13-26-1-2-11 12c-5 5-14 20-16 23l-14 23a2 2 0 0 1 2 2l-12 21c-3 5 2 9 3 7 19-31 30-28 30-28l7-15-1-2c-2-1-5-5 0-15Z"/></svg>';
    var ICON_ORIGIN = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-width="42.6667" stroke-linecap="round" stroke-linejoin="round" d="M149.333 64H362.667V448H149.333V64Z"/></svg>';
    var SERVICE_ICONS = { netflix: ICON_NETFLIX, apple: ICON_APPLE, hbo: ICON_HBO, amazon: ICON_AMAZON, disney: ICON_DISNEY, paramount: ICON_PARAMOUNT, origin: ICON_ORIGIN };

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
