(function () {
    'use strict';

    var ORIGIN_COUNTRIES_NO_ASIA = 'US|GB|CA|AU|DE|FR|IT|ES|PL|UA|NL|SE|NO|BR|MX|AR|BE|CH|AT|PT|IE|NZ|ZA|RU|TR|FI|DK|CZ|RO|HU|GR';
    var STORAGE_WATCH_REGION = 'streaming_watch_region';
    var STORAGE_ENABLED_SERVICES = 'streaming_enabled_services';
    var MAX_CATEGORIES = 25;
    var ICON_TAG_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M18.567 67.753c1.32 4.614 4.876 8.165 11.983 15.272l8.418 8.418C51.34 103.822 57.524 110 65.206 110c7.686 0 13.869-6.182 26.238-18.551C103.818 79.074 110 72.892 110 65.205c0-7.682-6.182-13.869-18.552-26.238l-8.417-8.418c-7.112-7.107-10.663-10.663-15.277-11.983-4.614-1.325-9.513-.193-19.306 2.07L42.8 21.938c-8.243 1.9-12.364 2.852-15.189 5.672-2.824 2.82-3.767 6.95-5.671 15.189l-1.307 5.648c-2.258 9.798-3.385 14.693-2.065 19.306Zm36.795-25.506a9.28 9.28 0 0 1-6.525 15.956 9.277 9.277 0 1 1 6.525-15.956ZM96.43 64.234 64.327 96.342a3.45 3.45 0 0 1-4.876-4.88L91.55 59.354a3.451 3.451 0 0 1 4.88 4.88Z" clip-rule="evenodd"/></svg>';
    var ICON_CLEAN_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="opacity:0.5"><path fill="currentColor" d="M42.205 39.642a2.565 2.565 0 1 0-5.13-.002 2.565 2.565 0 0 0 5.13.002Zm7.692 0a10.256 10.256 0 1 1-20.512 0 10.256 10.256 0 0 1 20.512 0ZM53.744 23.487v-.512a5.128 5.128 0 1 1 10.256 0v.512a5.128 5.128 0 1 1-10.256 0Z"/><path fill="currentColor" d="M107.353 15.21a3.847 3.847 0 0 1 5.602 5.272L74.308 61.544c1.215 1.265 2.269 2.549 2.948 4.125l.189.472.004.01c.879 2.405.686 4.614.475 7.04l-.035.405c-1.18 13.716-5.877 23.572-10.36 30.036-2.236 3.223-4.41 5.592-6.054 7.177a33.805 33.805 0 0 1-2.016 1.801c-.25.205-.455.364-.605.478l-.183.137-.012.009-.047.034-.012.009-.01.006-.008.006a3.866 3.866 0 0 1-3.153.599c-10.777-2.67-20.583-7.436-28.002-16.178a45.968 45.968 0 0 1-3.255-4.334c.816.007 1.734-.014 2.738-.082a37.75 37.75 0 0 0 2.253-.221c5.351-.687 12.44-2.748 19.49-8.19a3.846 3.846 0 0 0-4.701-6.089c-5.772 4.456-11.504 6.102-15.768 6.648-2.137.275-3.114.321-5.106.205-1.993-.116-3.176-.164-3.176-.164-3.086-7.072-5.094-15.605-5.89-25.862a3.846 3.846 0 0 1 5.251-3.874c9.343 3.704 18.513 4.48 30.262-.03l.133-.05c2.8-1.074 5.13-1.967 7.037-2.517 1.929-.556 3.949-.928 5.993-.507l.017.004c1.965.414 3.554 1.412 5.006 2.59.352.286.715.599 1.09.935l38.552-40.961Z"/></svg>';
    var ICON_GENRE_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M64 14c27.615 0 50 22.385 50 50 0 16.574-8.065 31.264-20.483 40.361l15.664.001a4.818 4.818 0 1 1 0 9.638H64c-27.615 0-50-22.385-50-50s22.385-50 50-50Zm0 58.735a11.595 11.595 0 1 0 0 23.191 11.595 11.595 0 0 0 0-23.19ZM43.669 52.404a11.596 11.596 0 1 0 0 23.191 11.596 11.596 0 0 0 0-23.191Zm40.662 0a11.596 11.596 0 1 0 0 23.191 11.596 11.596 0 0 0 0-23.191ZM64 32.072a11.596 11.596 0 1 0 0 23.192 11.596 11.596 0 0 0 0-23.192Z" clip-rule="evenodd"/></svg>';
    var ICON_COUNTRY_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M46.169 21.583a46.011 46.011 0 1 1 35.213 85.019 46.007 46.007 0 0 1-59.863-25.008 46.011 46.011 0 0 1 24.651-60.01M29.224 45.62a39.277 39.277 0 0 1 8.622-10.9 7.685 7.685 0 0 1 2.677-.436h.048l3.76 4.363 2.885-.263 1.51-.139a3.808 3.808 0 0 0 2.345-1.103 3.808 3.808 0 0 1 2.466-1.113l2.377-.142 2.53 2.869a4.198 4.198 0 0 1-3.288 6.972l-3.552-.12a1.262 1.262 0 0 0-1.15.655 1.264 1.264 0 0 1-1.53.58l-5.819-2.07a1.606 1.606 0 0 1-1.058-1.323 1.612 1.612 0 0 0-1.657-1.417l-5.58.188a1.093 1.093 0 0 1-.897-.41 1.1 1.1 0 0 0-1.724.008l-2.965 3.801Zm26.69-9.733.946-2.046a6.011 6.011 0 0 1 5.002-3.466l1.222-.092a3.858 3.858 0 0 1 3.453 1.639l.695.994a2.463 2.463 0 0 1-3.236 3.552l-.994-.564a4.03 4.03 0 0 0-2.399-.504l-4.689.487ZM27.58 49.098c.144-.348.293-.694.447-1.036-.03.148-.052.298-.068.449l-.478 4.506a12.772 12.772 0 0 0 3.649 10.365l1.736 1.747a6.745 6.745 0 0 0 4.702 1.988 6.75 6.75 0 0 1 6.666 6.63l.051 2.858a5.358 5.358 0 0 0 2.032 4.103 5.364 5.364 0 0 1 2.032 4.03l.199 6.315a5.643 5.643 0 0 0 5.244 5.444 5.614 5.614 0 0 0 4.441-1.728l2.017-2.118a12.244 12.244 0 0 0 3.38-8.405l.026-8.481a9.563 9.563 0 0 1 2.717-6.647l1.688-1.726a5.294 5.294 0 0 0 .015-7.373l-7.917-8.182a1.308 1.308 0 0 1 .964-2.244 1.311 1.311 0 0 1 .925.43l4.108 4.318a6.574 6.574 0 0 0 4.486 2.033l1.254.052a3.713 3.713 0 0 0 2.783-6.33l-4.255-4.266a1.025 1.025 0 0 1 1.446-1.452l1.921 1.898a3.1 3.1 0 0 0 2.164.896l1.683.01a7.24 7.24 0 0 1 6.13 3.45l4.074 6.63a1.076 1.076 0 0 0 1.95-.264l.99-3.412a5.112 5.112 0 0 1 .787-1.598l.827-1.126c2.015-2.74 6.002-2.807 8.138-.333a39.176 39.176 0 0 1-19.14 48.562 39.186 39.186 0 0 1-36.595-.718 39.18 39.18 0 0 1-17.221-49.275m42.448 35.787a2.034 2.034 0 0 1-2.032-2.148l.096-1.713c.039-.73.297-1.43.739-2.012l.649-.853a1.755 1.755 0 0 1 3.154 1.118l-.079 2.512a3.19 3.19 0 0 1-.432 1.503l-.336.58a2.033 2.033 0 0 1-1.759 1.013Z" clip-rule="evenodd"/></svg>';

    // TMDB genre IDs for filter (list from UI: 19 genres)
    var TMDB_GENRES = [
        { id: 36, titleKey: 'streaming_genre_history' },      // Історичний
        { id: 28, titleKey: 'streaming_genre_action' },        // Бойовик
        { id: 37, titleKey: 'streaming_genre_western' },       // Вестерн
        { id: 10752, titleKey: 'streaming_genre_war' },        // Військовий
        { id: 9648, titleKey: 'streaming_genre_mystery' },     // Детектив
        { id: 99, titleKey: 'streaming_genre_documentary' },   // Документальний
        { id: 18, titleKey: 'streaming_genre_drama' },         // Драма
        { id: 27, titleKey: 'streaming_genre_horror' },        // Жахи
        { id: 35, titleKey: 'streaming_genre_comedy' },        // Комедія
        { id: 80, titleKey: 'streaming_genre_crime' },         // Кримінал
        { id: 10749, titleKey: 'streaming_genre_romance' },    // Мелодрама
        { id: 10402, titleKey: 'streaming_genre_music' },      // Музика
        { id: 16, titleKey: 'streaming_genre_animation' },     // Мультфільм
        { id: 12, titleKey: 'streaming_genre_adventure' },      // Пригоди
        { id: 10751, titleKey: 'streaming_genre_family' },     // Сімейний
        { id: 10770, titleKey: 'streaming_genre_tv_movie' },   // Телефільм
        { id: 53, titleKey: 'streaming_genre_thriller' },      // Трилер
        { id: 878, titleKey: 'streaming_genre_scifi' },         // Фантастика
        { id: 14, titleKey: 'streaming_genre_fantasy' }        // Фентезі
    ];
    function getGenresSorted() {
        var translate = function (k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; };
        var list = TMDB_GENRES.map(function (g) { return { id: g.id, title: translate(g.titleKey) || g.titleKey }; });
        list.sort(function (a, b) { return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }); });
        return list;
    }
    function showGenreSelect(object, isView, onReturnFocus) {
        var genreTitle = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_genre_label')) || 'Genre';
        var items = [{ title: '— ' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + ' —', value: '', id: null }];
        getGenresSorted().forEach(function (g) { items.push({ title: g.title, value: g.id, id: g.id }); });
        Lampa.Select.show({
            title: genreTitle,
            items: items,
            onSelect: function (a) {
                var next = Object.assign({}, object, { genreId: a && a.id != null ? a.id : null });
                if (isView) next.page = 1;
                Lampa.Activity.replace(next);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
                if (typeof onReturnFocus === 'function') setTimeout(onReturnFocus, 200);
            }
        });
    }

    // Country filter (origin country): EU = European codes; IN, CN, KR at bottom
    var COUNTRY_FILTER_LIST = [
        { code: 'UA', titleKey: 'streaming_country_UA' },
        { code: 'US', titleKey: 'streaming_country_US' },
        { code: 'GB', titleKey: 'streaming_country_GB' },
        { code: 'EU', titleKey: 'streaming_country_EU' },
        { code: 'CA', titleKey: 'streaming_country_CA' },
        { code: 'AU', titleKey: 'streaming_country_AU' },
        { code: 'BR', titleKey: 'streaming_country_BR' },
        { code: 'MX', titleKey: 'streaming_country_MX' },
        { code: 'AR', titleKey: 'streaming_country_AR' },
        { code: 'JP', titleKey: 'streaming_country_JP' },
        { code: 'TH', titleKey: 'streaming_country_TH' },
        { code: 'ID', titleKey: 'streaming_country_ID' },
        { code: 'ZA', titleKey: 'streaming_country_ZA' },
        { code: 'NZ', titleKey: 'streaming_country_NZ' },
        { code: 'IN', titleKey: 'streaming_country_IN' },
        { code: 'CN', titleKey: 'streaming_country_CN' },
        { code: 'KR', titleKey: 'streaming_country_KR' }
    ];
    var ORIGIN_COUNTRY_EU = 'DE|FR|IT|ES|PL|NL|SE|NO|RU|TR|CZ|HU|RO|BE|AT|CH|PT|IE|FI|DK|GR';
    function getCountriesSorted() {
        var translate = function (k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; };
        return COUNTRY_FILTER_LIST.map(function (c) { return { code: c.code, title: translate(c.titleKey) || c.titleKey }; });
    }
    function showCountrySelect(object, isView, onReturnFocus) {
        var countryTitle = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_country_label')) || 'Country';
        var items = [{ title: '— ' + ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset') + ' —', value: '', code: null }];
        getCountriesSorted().forEach(function (c) { items.push({ title: c.title, value: c.code, code: c.code }); });
        Lampa.Select.show({
            title: countryTitle,
            items: items,
            onSelect: function (a) {
                var next = Object.assign({}, object, { originCountry: a && a.code != null ? a.code : null });
                if (isView) next.page = 1;
                Lampa.Activity.replace(next);
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
                if (typeof onReturnFocus === 'function') setTimeout(onReturnFocus, 200);
            }
        });
    }

    // TMDB keyword IDs for tag filter, grouped by category
    var TAGS_BY_CATEGORY = [
        {
            categoryTitleKey: 'streaming_tag_cat_fantasy_future',
            tags: [
                { id: '2964', titleKey: 'streaming_tag_future' },
                { id: '9715', titleKey: 'streaming_tag_superheroes' },
                { id: '12332', titleKey: 'streaming_tag_apocalypse' },
                { id: '4379', titleKey: 'streaming_tag_time_travel' },
                { id: '4565', titleKey: 'streaming_tag_dystopia' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_monsters',
            tags: [
                { id: '12377', titleKey: 'streaming_tag_zombie' },
                { id: '1299', titleKey: 'streaming_tag_monsters' },
                { id: '767', titleKey: 'streaming_tag_witches' },
                { id: '12554', titleKey: 'streaming_tag_dragons' },
                { id: '1720', titleKey: 'streaming_tag_dinosaurs' },
                { id: '1718', titleKey: 'streaming_tag_mutations' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_narrative',
            tags: [
                { id: '818', titleKey: 'streaming_tag_based_on_novel' },
                { id: '9663', titleKey: 'streaming_tag_sequel' },
                { id: '9935', titleKey: 'streaming_tag_journey' },
                { id: '10092', titleKey: 'streaming_tag_mystery' },
                { id: '1463', titleKey: 'streaming_tag_culture_clash' },
                { id: '180635', titleKey: 'streaming_tag_multiple_pov' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_space',
            tags: [
                { id: '10158', titleKey: 'streaming_tag_alien_world' },
                { id: '195114', titleKey: 'streaming_tag_space_adventure' },
                { id: '3386', titleKey: 'streaming_tag_space_war' },
                { id: '161176', titleKey: 'streaming_tag_space_opera' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_psychology',
            tags: [
                { id: '9748', titleKey: 'streaming_tag_vengeance' },
                { id: '2095', titleKey: 'streaming_tag_antihero' },
                { id: '10044', titleKey: 'streaming_tag_tragic_hero' },
                { id: '9990', titleKey: 'streaming_tag_femme_fatale' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_crime',
            tags: [
                { id: '189402', titleKey: 'streaming_tag_criminal_investigation' },
                { id: '726', titleKey: 'streaming_tag_drug_addiction' },
                { id: '853', titleKey: 'streaming_tag_crime_fighter' },
                { id: '156082', titleKey: 'streaming_tag_heist' },
                { id: '10909', titleKey: 'streaming_tag_lawyer' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_action',
            tags: [
                { id: '10039', titleKey: 'streaming_tag_racing' },
                { id: '14819', titleKey: 'streaming_tag_violence' },
                { id: '258', titleKey: 'streaming_tag_explosion' },
                { id: '14796', titleKey: 'streaming_tag_destruction' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_war',
            tags: [
                { id: '13065', titleKey: 'streaming_tag_soldier' },
                { id: '14643', titleKey: 'streaming_tag_battle' },
                { id: '11399', titleKey: 'streaming_tag_marines' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_spy',
            tags: [
                { id: '470', titleKey: 'streaming_tag_spy' },
                { id: '4289', titleKey: 'streaming_tag_secret_agent' },
                { id: '14555', titleKey: 'streaming_tag_mi6' },
                { id: '156095', titleKey: 'streaming_tag_british_intelligence' }
            ]
        },
        {
            categoryTitleKey: 'streaming_tag_cat_apocalypse',
            tags: [
                { id: '186565', titleKey: 'streaming_tag_zombie_apocalypse' },
                { id: '949', titleKey: 'streaming_tag_terrorism' },
                { id: '160381', titleKey: 'streaming_tag_nuclear_threat' }
            ]
        }
    ];

    function getAllTagsFlat() {
        var out = [];
        for (var i = 0; i < TAGS_BY_CATEGORY.length; i++) {
            var cat = TAGS_BY_CATEGORY[i];
            if (cat && cat.tags) {
                for (var j = 0; j < cat.tags.length; j++) out.push(cat.tags[j]);
            }
        }
        return out;
    }

    function getTagSelectItems() {
        var translate = function (k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; };
        var resetTitle = '— ' + (translate('streaming_reset_filters') || 'Reset') + ' —';
        var items = [{ title: resetTitle, value: '', id: null }];
        for (var i = 0; i < TAGS_BY_CATEGORY.length; i++) {
            var cat = TAGS_BY_CATEGORY[i];
            if (!cat || !cat.tags) continue;
            items.push({
                title: translate(cat.categoryTitleKey) || cat.categoryTitleKey,
                value: null,
                id: null,
                categoryIndex: i
            });
        }
        return items;
    }

    function getTagSelectItemsForCategory(categoryIndex) {
        var translate = function (k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; };
        var cat = TAGS_BY_CATEGORY[categoryIndex];
        if (!cat || !cat.tags) return [];
        return cat.tags.map(function (t) {
            return { title: translate(t.titleKey) || t.titleKey, value: t.id, id: t.id };
        });
    }

    function showTagCategorySelect(object, isView, onReturnFocus) {
        var tagTitle = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag';
        Lampa.Select.show({
            title: tagTitle,
            items: getTagSelectItems(),
            onSelect: function (a) {
                if (a && a.categoryIndex !== undefined) {
                    showTagSubmenu(object, a.categoryIndex, isView);
                    return;
                }
                if (a && a.id === null) {
                    var next = Object.assign({}, object, { tagKeywordId: null });
                    if (isView) next.page = 1;
                    Lampa.Activity.replace(next);
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
                if (typeof onReturnFocus === 'function') setTimeout(onReturnFocus, 200);
            }
        });
    }

    function showTagSubmenu(object, categoryIndex, isView) {
        var translate = function (k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; };
        var cat = TAGS_BY_CATEGORY[categoryIndex];
        if (!cat || !cat.tags) return;
        var subTitle = translate(cat.categoryTitleKey) || cat.categoryTitleKey;
        var items = getTagSelectItemsForCategory(categoryIndex);
        Lampa.Select.show({
            title: subTitle,
            items: items,
            onSelect: function (a) {
                if (!a || a.id == null) return;
                var next = Object.assign({}, object, { tagKeywordId: a.id });
                if (isView) next.page = 1;
                Lampa.Activity.replace(next);
            },
            onBack: function () { showTagCategorySelect(object, isView); }
        });
    }

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
        { id: 14, titleKey: 'streaming_nonfiction', section: 'genre', genres: '36,99' }
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
                { titleKey: 'streaming_space', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' } },
                { titleKey: 'streaming_wildlife', url: 'discover/tv', params: { with_networks: '1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }
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
        streaming_enabled_services_label: { en: 'Streamings', uk: 'Стримінги' },
        streaming_more_label: { en: 'See all', uk: 'Дивитись усі' },
        streaming_search: { en: 'Search', uk: 'Пошук' },
        streaming_search_results: { en: 'Search results', uk: 'Результати пошуку' },
        streaming_tag_label: { en: 'Tag', uk: 'Тег' },
        streaming_reset_filters: { en: 'Reset', uk: 'Скинути' },
        streaming_clear_filters: { en: 'Clear', uk: 'Очистити' },
        streaming_tag_cat_fantasy_future: { en: 'Sci‑Fi & Future', uk: 'Фантастика та Майбутнє' },
        streaming_tag_cat_monsters: { en: 'Monsters & Creatures', uk: 'Монстри та Істоти' },
        streaming_tag_cat_narrative: { en: 'Narrative & Plot', uk: 'Наратив та Сюжет' },
        streaming_tag_cat_space: { en: 'Space', uk: 'Космос' },
        streaming_tag_cat_psychology: { en: 'Psychology & Archetypes', uk: 'Психологія та Архетипи' },
        streaming_tag_cat_crime: { en: 'Crime & Justice', uk: 'Кримінал та Правосуддя' },
        streaming_tag_cat_action: { en: 'Action & Spectacle', uk: 'Екшен та Видовищність' },
        streaming_tag_cat_war: { en: 'War & Army', uk: 'Війна та Армія' },
        streaming_tag_cat_spy: { en: 'Spy', uk: 'Шпигунство' },
        streaming_tag_cat_apocalypse: { en: 'Post‑apocalypse & Global threats', uk: 'Постапокаліпсис та Глобальні загрози' },
        streaming_tag_future: { en: 'Future', uk: 'Майбутнє' },
        streaming_tag_time_travel: { en: 'Time travel', uk: 'Подорожі в часі' },
        streaming_tag_dystopia: { en: 'Dystopia', uk: 'Антиутопія' },
        streaming_tag_apocalypse: { en: 'Apocalypse', uk: 'Апокаліпсис' },
        streaming_tag_zombie_apocalypse: { en: 'Zombie apocalypse', uk: 'Зомбі-апокаліпсис' },
        streaming_tag_space_war: { en: 'Space war', uk: 'Космічна війна' },
        streaming_tag_alien_world: { en: 'Alien world', uk: 'Інопланетний світ' },
        streaming_tag_superheroes: { en: 'Superheroes', uk: 'Супергерої' },
        streaming_tag_monsters: { en: 'Monsters', uk: 'Монстри' },
        streaming_tag_witches: { en: 'Witches', uk: 'Відьми' },
        streaming_tag_zombie: { en: 'Zombie', uk: 'Зомбі' },
        streaming_tag_mutations: { en: 'Mutations', uk: 'Мутації' },
        streaming_tag_dinosaurs: { en: 'Dinosaurs', uk: 'Динозаври' },
        streaming_tag_dragons: { en: 'Dragons', uk: 'Дракони' },
        streaming_tag_space_adventure: { en: 'Space adventure', uk: 'Космічна пригода' },
        streaming_tag_space_opera: { en: 'Space opera', uk: 'Космічна опера' },
        streaming_tag_journey: { en: 'Journey', uk: 'Подорож' },
        streaming_tag_vengeance: { en: 'Vengeance', uk: 'Помста' },
        streaming_tag_battle: { en: 'Battle', uk: 'Битва' },
        streaming_tag_destruction: { en: 'Destruction', uk: 'Руйнування' },
        streaming_tag_violence: { en: 'Violence', uk: 'Жорстокість' },
        streaming_tag_soldier: { en: 'Soldier', uk: 'Солдат' },
        streaming_tag_marines: { en: 'Marines', uk: 'Морська піхота' },
        streaming_tag_terrorism: { en: 'Terrorism', uk: 'Тероризм' },
        streaming_tag_nuclear_threat: { en: 'Nuclear threat', uk: 'Ядерна загроза' },
        streaming_tag_explosion: { en: 'Explosion', uk: 'Вибух' },
        streaming_tag_racing: { en: 'Racing', uk: 'Перегони' },
        streaming_tag_spy: { en: 'Spy', uk: 'Шпигунство' },
        streaming_tag_secret_agent: { en: 'Secret agent', uk: 'Таємний агент' },
        streaming_tag_mi6: { en: 'MI6', uk: 'MI6' },
        streaming_tag_british_intelligence: { en: 'British intelligence', uk: 'Британська розвідка' },
        streaming_tag_mystery: { en: 'Mystery', uk: 'Таємниця' },
        streaming_tag_heist: { en: 'Heist', uk: 'Професійний крадій' },
        streaming_tag_drug_addiction: { en: 'Drug addiction', uk: 'Наркозалежність' },
        streaming_tag_crime_fighter: { en: 'Crime fighter', uk: 'Борець зі злочинністю' },
        streaming_tag_femme_fatale: { en: 'Femme fatale', uk: 'Лиходійка' },
        streaming_tag_tragic_hero: { en: 'Tragic hero', uk: 'Трагічний герой' },
        streaming_tag_antihero: { en: 'Antihero', uk: 'Антигерой' },
        streaming_tag_criminal_investigation: { en: 'Criminal investigation', uk: 'Кримінальне розслідування' },
        streaming_tag_lawyer: { en: 'Lawyer', uk: 'Адвокат' },
        streaming_tag_based_on_novel: { en: 'Based on book', uk: 'Екранізація книги' },
        streaming_tag_sequel: { en: 'Sequel', uk: 'Сиквел' },
        streaming_tag_multiple_pov: { en: 'Multiple points of view', uk: 'Кілька точок зору' },
        streaming_tag_culture_clash: { en: 'Culture clash', uk: 'Зіткнення культур' },
        streaming_genre_label: { en: 'Genre', uk: 'Жанр' },
        streaming_genre_action: { en: 'Action', uk: 'Бойовик' },
        streaming_genre_adventure: { en: 'Adventure', uk: 'Пригоди' },
        streaming_genre_animation: { en: 'Animation', uk: 'Мультфільм' },
        streaming_genre_comedy: { en: 'Comedy', uk: 'Комедія' },
        streaming_genre_crime: { en: 'Crime', uk: 'Кримінал' },
        streaming_genre_documentary: { en: 'Documentary', uk: 'Документальний' },
        streaming_genre_drama: { en: 'Drama', uk: 'Драма' },
        streaming_genre_family: { en: 'Family', uk: 'Сімейний' },
        streaming_genre_fantasy: { en: 'Fantasy', uk: 'Фентезі' },
        streaming_genre_history: { en: 'History', uk: 'Історичний' },
        streaming_genre_horror: { en: 'Horror', uk: 'Жахи' },
        streaming_genre_music: { en: 'Music', uk: 'Музика' },
        streaming_genre_mystery: { en: 'Mystery', uk: 'Детектив' },
        streaming_genre_romance: { en: 'Romance', uk: 'Мелодрама' },
        streaming_genre_scifi: { en: 'Science Fiction', uk: 'Фантастика' },
        streaming_genre_tv_movie: { en: 'TV Movie', uk: 'Телефільм' },
        streaming_genre_thriller: { en: 'Thriller', uk: 'Трилер' },
        streaming_genre_war: { en: 'War', uk: 'Військовий' },
        streaming_genre_western: { en: 'Western', uk: 'Вестерн' },
        streaming_country_label: { en: 'Country', uk: 'Країна' },
        streaming_country_UA: { en: 'Ukraine', uk: 'Україна' },
        streaming_country_US: { en: 'United States', uk: 'США' },
        streaming_country_GB: { en: 'United Kingdom', uk: 'Велика Британія' },
        streaming_country_EU: { en: 'Europe', uk: 'Європа' },
        streaming_country_JP: { en: 'Japan', uk: 'Японія' },
        streaming_country_NZ: { en: 'New Zealand', uk: 'Нова Зеландія' },
        streaming_country_CN: { en: 'China', uk: 'Китай' },
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

    function buildStreamingHeader(object, serviceId, options) {
        var opts = options || {};
        var showTag = opts.showTag !== false;
        var header = document.createElement('div');
        header.className = 'streaming-sqr-header';
        header.style.cssText = 'display:flex;align-items:center;gap:16px;padding:10px 16px;flex-wrap:nowrap;width:100%;box-sizing:border-box;';
        var searchBtn = document.createElement('div');
        searchBtn.className = 'simple-button simple-button--invisible selector';
        searchBtn.setAttribute('data-action', 'streaming_search');
        searchBtn.setAttribute('tabindex', '0');
        searchBtn.setAttribute('role', 'button');
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
                var found = getAllTagsFlat().filter(function (t) { return t.id === String(object.tagKeywordId); })[0];
                tagTitle = found ? ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(found.titleKey)) || found.titleKey) : '';
            }
            var tagBtnText = tagTitle ? tagLabelBase + ': ' + tagTitle : tagLabelBase;
            var tagBtn = document.createElement('div');
            tagBtn.className = 'simple-button simple-button--invisible selector';
            tagBtn.setAttribute('data-action', 'streaming_tag');
            tagBtn.setAttribute('tabindex', '0');
            tagBtn.setAttribute('role', 'button');
            tagBtn.innerHTML = ICON_TAG_SVG + '<span>' + tagBtnText + '</span>';
            $(tagBtn).on('hover:enter', function () { showTagCategorySelect(object, false); });
            header.appendChild(tagBtn);
        }
        var rightSpacer = document.createElement('div');
        rightSpacer.style.cssText = 'flex:1 1 0;min-width:12px;';
        header.appendChild(rightSpacer);
        var resetBtn = document.createElement('div');
        resetBtn.className = 'simple-button simple-button--invisible selector';
        resetBtn.setAttribute('tabindex', '0');
        resetBtn.setAttribute('role', 'button');
        resetBtn.innerHTML = ICON_CLEAN_SVG;
        resetBtn.title = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset';
        $(resetBtn).on('hover:enter', function () {
            var next = Object.assign({}, object, { searchQuery: '', tagKeywordId: null });
            Lampa.Activity.replace(next);
        });
        header.appendChild(resetBtn);
        return header;
    }

    function buildStreamingViewHeader(object, opts) {
        opts = opts || {};
        var onReturnFocus = opts.onReturnFocus;
        var header = document.createElement('div');
        header.className = 'streaming-sqr-header streaming-sqr-header--view';
        header.style.cssText = 'display:flex;align-items:center;gap:16px;padding:10px 16px;flex-wrap:nowrap;width:100%;box-sizing:border-box;';
        var searchLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_search')) || 'Search';
        var searchQuery = (object.searchQuery && object.searchQuery.trim) ? object.searchQuery.trim() : '';
        var searchBtnText = searchQuery ? searchLabelBase + ': ' + searchQuery : searchLabelBase;
        var searchBtn = document.createElement('div');
        searchBtn.className = 'simple-button simple-button--invisible selector';
        searchBtn.setAttribute('data-action', 'streaming_view_search');
        searchBtn.setAttribute('tabindex', '0');
        searchBtn.setAttribute('role', 'button');
        searchBtn.innerHTML = '<svg width="23" height="22" viewBox="0 0 23 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle><path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg><span>' + searchBtnText + '</span>';
        $(searchBtn).on('hover:enter', function () {
            Lampa.Input.edit({ free: true, nosave: true, nomic: true, value: object.searchQuery || '' }, function (val) {
                if (val != null) {
                    var next = Object.assign({}, object, { searchQuery: (val && val.trim()) ? val.trim() : '', page: 1 });
                    Lampa.Activity.replace(next);
                }
            });
        });
        header.appendChild(searchBtn);
        var genreLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_genre_label')) || 'Genre';
        var genreTitle = '';
        if (object.genreId != null) {
            var genreFound = getGenresSorted().filter(function (g) { return g.id === object.genreId; })[0];
            genreTitle = genreFound ? genreFound.title : '';
        }
        var genreBtnText = genreTitle ? genreLabelBase + ': ' + genreTitle : genreLabelBase;
        var genreBtn = document.createElement('div');
        genreBtn.className = 'simple-button simple-button--invisible selector';
        genreBtn.setAttribute('data-action', 'streaming_view_genre');
        genreBtn.setAttribute('tabindex', '0');
        genreBtn.setAttribute('role', 'button');
        genreBtn.innerHTML = ICON_GENRE_SVG + '<span>' + genreBtnText + '</span>';
        $(genreBtn).on('hover:enter', function () { showGenreSelect(object, true, onReturnFocus); });
        header.appendChild(genreBtn);
        var tagLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_tag_label')) || 'Tag';
        var tagTitle = '';
        if (object.tagKeywordId) {
            var found = getAllTagsFlat().filter(function (t) { return t.id === String(object.tagKeywordId); })[0];
            tagTitle = found ? ((Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(found.titleKey)) || found.titleKey) : '';
        }
        var tagBtnText = tagTitle ? tagLabelBase + ': ' + tagTitle : tagLabelBase;
        var tagBtn = document.createElement('div');
        tagBtn.className = 'simple-button simple-button--invisible selector';
        tagBtn.setAttribute('data-action', 'streaming_view_tag');
        tagBtn.setAttribute('tabindex', '0');
        tagBtn.setAttribute('role', 'button');
        tagBtn.innerHTML = ICON_TAG_SVG + '<span>' + tagBtnText + '</span>';
        $(tagBtn).on('hover:enter', function () { showTagCategorySelect(object, true, onReturnFocus); });
        header.appendChild(tagBtn);
        var countryLabelBase = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_country_label')) || 'Country';
        var countryTitle = '';
        if (object.originCountry) {
            var countryFound = getCountriesSorted().filter(function (c) { return c.code === object.originCountry; })[0];
            countryTitle = countryFound ? countryFound.title : '';
        }
        var countryBtnText = countryTitle ? countryLabelBase + ': ' + countryTitle : countryLabelBase;
        var countryBtn = document.createElement('div');
        countryBtn.className = 'simple-button simple-button--invisible selector';
        countryBtn.setAttribute('data-action', 'streaming_view_country');
        countryBtn.setAttribute('tabindex', '0');
        countryBtn.setAttribute('role', 'button');
        countryBtn.innerHTML = ICON_COUNTRY_SVG + '<span>' + countryBtnText + '</span>';
        $(countryBtn).on('hover:enter', function () { showCountrySelect(object, true, onReturnFocus); });
        header.appendChild(countryBtn);
        var rightSpacer = document.createElement('div');
        rightSpacer.style.cssText = 'flex:1 1 0;min-width:12px;';
        header.appendChild(rightSpacer);
        var resetBtn = document.createElement('div');
        resetBtn.className = 'simple-button simple-button--invisible selector';
        resetBtn.setAttribute('tabindex', '0');
        resetBtn.setAttribute('role', 'button');
        resetBtn.innerHTML = ICON_CLEAN_SVG;
        resetBtn.title = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_reset_filters')) || 'Reset';
        $(resetBtn).on('hover:enter', function () {
            var next = Object.assign({}, object, { searchQuery: '', tagKeywordId: null, genreId: null, originCountry: null, page: 1 });
            Lampa.Activity.replace(next);
        });
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
            var headerEl = buildStreamingViewHeader(object, {
                onReturnFocus: function () {
                    applyStreamingViewCollection(false);
                    scheduleCollectionApply();
                }
            });
            if (root.prepend) {
                root.prepend(headerEl);
            } else if (root.insertBefore && root.firstChild) {
                root.insertBefore(headerEl, root.firstChild);
            } else {
                root.insertBefore(headerEl, null);
            }
            streamingHeaderEl = headerEl;
            streamingRootEl = root;
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
    var ICON_MARVEL = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M243.2 200.597h-.256V256.5a16.59 16.59 0 0 0 7.347-1.774 27.72 27.72 0 0 0 10.589-11.271 27.873 27.873 0 0 0 2.928-15.215c0-26.923-18.253-27.669-20.608-27.643ZM0 153v207h512V153H0Zm433.28 119.237h-28.006v39.857h28.006v31.243H374.4V185.811l-24.858 157.526h-36.377l-18.586-111.78a50.61 50.61 0 0 1-3.551 24.459 50.385 50.385 0 0 1-14.702 19.821l19.687 67.397h-30.72l-15.002-57.523-7.27 1.055v56.417h-59.162l-3.635-26.743h-24.448l-3.635 26.743H91.878v-83.597l-14.003 83.751H61.261l-14.234-83.751v83.751H15.795V169.56h39.68l13.927 89.794 14.31-89.794h39.654v159.814l23.86-159.84h41.446l23.04 154.286V169.534h31.693a50.008 50.008 0 0 1 26.605 7.641 50.329 50.329 0 0 1 18.528 20.645l-3.533-28.286h31.641l14.285 105.84L345.6 169.56h87.757v31.68h-28.083v39.266h28.006v31.731Zm62.976 71.074h-57.574V169.534h31.001v142.535h26.573v31.242Zm-336.794-54.257h17.485l-8.909-74.314-8.576 74.314Z"/></svg>';
    var ICON_DC = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M131.608 197.095h39.49c11.019 0 19.947 8.928 19.947 19.947v90.823c0 11-8.928 19.947-19.947 19.947h-24.181V209.708a2.946 2.946 0 0 0-1.21-2.365l-14.099-10.248ZM256 459.482a203.142 203.142 0 0 1-158.748-76.175.847.847 0 0 1-.09-.883.848.848 0 0 1 .75-.474h108.826a4.76 4.76 0 0 0 2.805-.917l41.617-30.213a2.94 2.94 0 0 0 1.173-2.347V175.627a2.931 2.931 0 0 0-1.191-2.365l-41.599-30.195a4.76 4.76 0 0 0-2.805-.917H88.91a.847.847 0 0 1-.719-.453.843.843 0 0 1 .04-.849A203.32 203.32 0 0 1 256 52.5c69.63 0 131.083 34.962 167.768 88.312a.836.836 0 0 1 .036.856.853.853 0 0 1-.305.323.849.849 0 0 1-.427.122h-29.279a2.49 2.49 0 0 0-2.255 1.449l-6.471 13.878-19.837-14.41a4.763 4.763 0 0 0-2.805-.917H315.62a4.771 4.771 0 0 0-2.823.917l-41.58 30.232a2.932 2.932 0 0 0-1.192 2.365v172.846c0 .917.44 1.797 1.192 2.347l41.616 30.213a4.765 4.765 0 0 0 2.805.917h98.469c.696 0 1.1.825.66 1.357a203.15 203.15 0 0 1-70.698 56.196A203.113 203.113 0 0 1 256 459.482ZM65.37 188.167l19.03 13.841a2.956 2.956 0 0 1 1.247 2.42v160.05c0 .844-1.1 1.155-1.54.459A202.586 202.586 0 0 1 52.518 256c0-23.632 4.034-46.31 11.44-67.412a.923.923 0 0 1 .595-.577.914.914 0 0 1 .817.137v.019Zm250.617 8.946h59.125v32.56c0 .844.696 1.54 1.54 1.54h49.518a1.83 1.83 0 0 0 1.76-1.521l9.808-61.857a.844.844 0 0 1 1.577-.238 202.586 202.586 0 0 1 20.167 88.421 202.576 202.576 0 0 1-25.484 98.67c-.403.734-1.54.44-1.54-.421v-56.54a1.539 1.539 0 0 0-1.54-1.54h-54.266a1.539 1.539 0 0 0-1.54 1.54v30.103H351.26a19.987 19.987 0 0 1-14.106-5.846 19.989 19.989 0 0 1-5.859-14.101v-98.175a2.928 2.928 0 0 0-1.192-2.365l-14.116-10.23ZM256 36C134.505 36 36 134.505 36 256s98.505 220 220 220 220-98.505 220-220S377.495 36 256 36Z"/></svg>';
    var SERVICE_ICONS = { netflix: ICON_NETFLIX, apple: ICON_APPLE, hbo: ICON_HBO, amazon: ICON_AMAZON, disney: ICON_DISNEY, paramount: ICON_PARAMOUNT, origin: ICON_ORIGIN, marvel: ICON_MARVEL, dc: ICON_DC };

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
