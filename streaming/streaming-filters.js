/**
 * Фільтри для streaming-menu-v2: жанр, країна, тег.
 * Підключається опційно з streaming-menu-v2.js (налаштування плагіна).
 * Реєструє window.StreamingMenu.buildViewHeaderWithFilters(object, opts).
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    var ICON_TAG_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M18.567 67.753c1.32 4.614 4.876 8.165 11.983 15.272l8.418 8.418C51.34 103.822 57.524 110 65.206 110c7.686 0 13.869-6.182 26.238-18.551C103.818 79.074 110 72.892 110 65.205c0-7.682-6.182-13.869-18.552-26.238l-8.417-8.418c-7.112-7.107-10.663-10.663-15.277-11.983-4.614-1.325-9.513-.193-19.306 2.07L42.8 21.938c-8.243 1.9-12.364 2.852-15.189 5.672-2.824 2.82-3.767 6.95-5.671 15.189l-1.307 5.648c-2.258 9.798-3.385 14.693-2.065 19.306Zm36.795-25.506a9.28 9.28 0 0 1-6.525 15.956 9.277 9.277 0 1 1 6.525-15.956ZM96.43 64.234 64.327 96.342a3.45 3.45 0 0 1-4.876-4.88L91.55 59.354a3.451 3.451 0 0 1 4.88 4.88Z" clip-rule="evenodd"/></svg>';
    var ICON_CLEAN_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="opacity:0.5"><path fill="currentColor" d="M42.205 39.642a2.565 2.565 0 1 0-5.13-.002 2.565 2.565 0 0 0 5.13.002Zm7.692 0a10.256 10.256 0 1 1-20.512 0 10.256 10.256 0 0 1 20.512 0ZM53.744 23.487v-.512a5.128 5.128 0 1 1 10.256 0v.512a5.128 5.128 0 1 1-10.256 0Z"/><path fill="currentColor" d="M107.353 15.21a3.847 3.847 0 0 1 5.602 5.272L74.308 61.544c1.215 1.265 2.269 2.549 2.948 4.125l.189.472.004.01c.879 2.405.686 4.614.475 7.04l-.035.405c-1.18 13.716-5.877 23.572-10.36 30.036-2.236 3.223-4.41 5.592-6.054 7.177a33.805 33.805 0 0 1-2.016 1.801c-.25.205-.455.364-.605.478l-.183.137-.012.009-.047.034-.012.009-.01.006-.008.006a3.866 3.866 0 0 1-3.153.599c-10.777-2.67-20.583-7.436-28.002-16.178a45.968 45.968 0 0 1-3.255-4.334c.816.007 1.734-.014 2.738-.082a37.75 37.75 0 0 0 2.253-.221c5.351-.687 12.44-2.748 19.49-8.19a3.846 3.846 0 0 0-4.701-6.089c-5.772 4.456-11.504 6.102-15.768 6.648-2.137.275-3.114.321-5.106.205-1.993-.116-3.176-.164-3.176-.164-3.086-7.072-5.094-15.605-5.89-25.862a3.846 3.846 0 0 1 5.251-3.874c9.343 3.704 18.513 4.48 30.262-.03l.133-.05c2.8-1.074 5.13-1.967 7.037-2.517 1.929-.556 3.949-.928 5.993-.507l.017.004c1.965.414 3.554 1.412 5.006 2.59.352.286.715.599 1.09.935l38.552-40.961Z"/></svg>';
    var ICON_GENRE_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M64 14c27.615 0 50 22.385 50 50 0 16.574-8.065 31.264-20.483 40.361l15.664.001a4.818 4.818 0 1 1 0 9.638H64c-27.615 0-50-22.385-50-50s22.385-50 50-50Zm0 58.735a11.595 11.595 0 1 0 0 23.191 11.595 11.595 0 0 0 0-23.19ZM43.669 52.404a11.596 11.596 0 1 0 0 23.191 11.596 11.596 0 0 0 0-23.191Zm40.662 0a11.596 11.596 0 1 0 0 23.191 11.596 11.596 0 0 0 0-23.191ZM64 32.072a11.596 11.596 0 1 0 0 23.192 11.596 11.596 0 0 0 0-23.192Z" clip-rule="evenodd"/></svg>';
    var ICON_COUNTRY_SVG = '<svg width="22" height="22" viewBox="0 0 128 128" fill="none" style="flex-shrink:0"><path fill="currentColor" fill-rule="evenodd" d="M46.169 21.583a46.011 46.011 0 1 1 35.213 85.019 46.007 46.007 0 0 1-59.863-25.008 46.011 46.011 0 0 1 24.651-60.01M29.224 45.62a39.277 39.277 0 0 1 8.622-10.9 7.685 7.685 0 0 1 2.677-.436h.048l3.76 4.363 2.885-.263 1.51-.139a3.808 3.808 0 0 0 2.345-1.103 3.808 3.808 0 0 1 2.466-1.113l2.377-.142 2.53 2.869a4.198 4.198 0 0 1-3.288 6.972l-3.552-.12a1.262 1.262 0 0 0-1.15.655 1.264 1.264 0 0 1-1.53.58l-5.819-2.07a1.606 1.606 0 0 1-1.058-1.323 1.612 1.612 0 0 0-1.657-1.417l-5.58.188a1.093 1.093 0 0 1-.897-.41 1.1 1.1 0 0 0-1.724.008l-2.965 3.801Zm26.69-9.733.946-2.046a6.011 6.011 0 0 1 5.002-3.466l1.222-.092a3.858 3.858 0 0 1 3.453 1.639l.695.994a2.463 2.463 0 0 1-3.236 3.552l-.994-.564a4.03 4.03 0 0 0-2.399-.504l-4.689.487ZM27.58 49.098c.144-.348.293-.694.447-1.036-.03.148-.052.298-.068.449l-.478 4.506a12.772 12.772 0 0 0 3.649 10.365l1.736 1.747a6.745 6.745 0 0 0 4.702 1.988 6.75 6.75 0 0 1 6.666 6.63l.051 2.858a5.358 5.358 0 0 0 2.032 4.103 5.364 5.364 0 0 1 2.032 4.03l.199 6.315a5.643 5.643 0 0 0 5.244 5.444 5.614 5.614 0 0 0 4.441-1.728l2.017-2.118a12.244 12.244 0 0 0 3.38-8.405l.026-8.481a9.563 9.563 0 0 1 2.717-6.647l1.688-1.726a5.294 5.294 0 0 0 .015-7.373l-7.917-8.182a1.308 1.308 0 0 1 .964-2.244 1.311 1.311 0 0 1 .925.43l4.108 4.318a6.574 6.574 0 0 0 4.486 2.033l1.254.052a3.713 3.713 0 0 0 2.783-6.33l-4.255-4.266a1.025 1.025 0 0 1 1.446-1.452l1.921 1.898a3.1 3.1 0 0 0 2.164.896l1.683.01a7.24 7.24 0 0 1 6.13 3.45l4.074 6.63a1.076 1.076 0 0 0 1.95-.264l.99-3.412a5.112 5.112 0 0 1 .787-1.598l.827-1.126c2.015-2.74 6.002-2.807 8.138-.333a39.176 39.176 0 0 1-19.14 48.562 39.186 39.186 0 0 1-36.595-.718 39.18 39.18 0 0 1-17.221-49.275m42.448 35.787a2.034 2.034 0 0 1-2.032-2.148l.096-1.713c.039-.73.297-1.43.739-2.012l.649-.853a1.755 1.755 0 0 1 3.154 1.118l-.079 2.512a3.19 3.19 0 0 1-.432 1.503l-.336.58a2.033 2.033 0 0 1-1.759 1.013Z" clip-rule="evenodd"/></svg>';

    var TMDB_GENRES = [
        { id: 36, titleKey: 'streaming_genre_history' },
        { id: 28, titleKey: 'streaming_genre_action' },
        { id: 37, titleKey: 'streaming_genre_western' },
        { id: 10752, titleKey: 'streaming_genre_war' },
        { id: 9648, titleKey: 'streaming_genre_mystery' },
        { id: 99, titleKey: 'streaming_genre_documentary' },
        { id: 18, titleKey: 'streaming_genre_drama' },
        { id: 27, titleKey: 'streaming_genre_horror' },
        { id: 35, titleKey: 'streaming_genre_comedy' },
        { id: 80, titleKey: 'streaming_genre_crime' },
        { id: 10749, titleKey: 'streaming_genre_romance' },
        { id: 10402, titleKey: 'streaming_genre_music' },
        { id: 16, titleKey: 'streaming_genre_animation' },
        { id: 12, titleKey: 'streaming_genre_adventure' },
        { id: 10751, titleKey: 'streaming_genre_family' },
        { id: 10770, titleKey: 'streaming_genre_tv_movie' },
        { id: 53, titleKey: 'streaming_genre_thriller' },
        { id: 878, titleKey: 'streaming_genre_scifi' },
        { id: 14, titleKey: 'streaming_genre_fantasy' }
    ];
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
        { code: 'ZA', titleKey: 'streaming_country_ZA' },
        { code: 'NZ', titleKey: 'streaming_country_NZ' }
    ];
    var TAGS_BY_CATEGORY = [
        { categoryTitleKey: 'streaming_tag_cat_fantasy_future', tags: [{ id: '2964', titleKey: 'streaming_tag_future' }, { id: '9715', titleKey: 'streaming_tag_superheroes' }, { id: '12332', titleKey: 'streaming_tag_apocalypse' }, { id: '4379', titleKey: 'streaming_tag_time_travel' }, { id: '4565', titleKey: 'streaming_tag_dystopia' }] },
        { categoryTitleKey: 'streaming_tag_cat_monsters', tags: [{ id: '12377', titleKey: 'streaming_tag_zombie' }, { id: '1299', titleKey: 'streaming_tag_monsters' }, { id: '767', titleKey: 'streaming_tag_witches' }, { id: '12554', titleKey: 'streaming_tag_dragons' }, { id: '1720', titleKey: 'streaming_tag_dinosaurs' }, { id: '1718', titleKey: 'streaming_tag_mutations' }] },
        { categoryTitleKey: 'streaming_tag_cat_narrative', tags: [{ id: '818', titleKey: 'streaming_tag_based_on_novel' }, { id: '9663', titleKey: 'streaming_tag_sequel' }, { id: '9935', titleKey: 'streaming_tag_journey' }, { id: '10092', titleKey: 'streaming_tag_mystery' }, { id: '1463', titleKey: 'streaming_tag_culture_clash' }, { id: '180635', titleKey: 'streaming_tag_multiple_pov' }] },
        { categoryTitleKey: 'streaming_tag_cat_space', tags: [{ id: '10158', titleKey: 'streaming_tag_alien_world' }, { id: '195114', titleKey: 'streaming_tag_space_adventure' }, { id: '3386', titleKey: 'streaming_tag_space_war' }, { id: '161176', titleKey: 'streaming_tag_space_opera' }] },
        { categoryTitleKey: 'streaming_tag_cat_psychology', tags: [{ id: '9748', titleKey: 'streaming_tag_vengeance' }, { id: '2095', titleKey: 'streaming_tag_antihero' }, { id: '10044', titleKey: 'streaming_tag_tragic_hero' }, { id: '9990', titleKey: 'streaming_tag_femme_fatale' }] },
        { categoryTitleKey: 'streaming_tag_cat_crime', tags: [{ id: '189402', titleKey: 'streaming_tag_criminal_investigation' }, { id: '726', titleKey: 'streaming_tag_drug_addiction' }, { id: '853', titleKey: 'streaming_tag_crime_fighter' }, { id: '156082', titleKey: 'streaming_tag_heist' }, { id: '10909', titleKey: 'streaming_tag_lawyer' }] },
        { categoryTitleKey: 'streaming_tag_cat_action', tags: [{ id: '10039', titleKey: 'streaming_tag_racing' }, { id: '14819', titleKey: 'streaming_tag_violence' }, { id: '258', titleKey: 'streaming_tag_explosion' }, { id: '14796', titleKey: 'streaming_tag_destruction' }] },
        { categoryTitleKey: 'streaming_tag_cat_war', tags: [{ id: '13065', titleKey: 'streaming_tag_soldier' }, { id: '14643', titleKey: 'streaming_tag_battle' }, { id: '11399', titleKey: 'streaming_tag_marines' }] },
        { categoryTitleKey: 'streaming_tag_cat_spy', tags: [{ id: '470', titleKey: 'streaming_tag_spy' }, { id: '4289', titleKey: 'streaming_tag_secret_agent' }, { id: '14555', titleKey: 'streaming_tag_mi6' }, { id: '156095', titleKey: 'streaming_tag_british_intelligence' }] },
        { categoryTitleKey: 'streaming_tag_cat_apocalypse', tags: [{ id: '186565', titleKey: 'streaming_tag_zombie_apocalypse' }, { id: '949', titleKey: 'streaming_tag_terrorism' }, { id: '160381', titleKey: 'streaming_tag_nuclear_threat' }] }
    ];

    function translate(k) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(k)) || k; }
    function getGenresSorted() {
        var list = TMDB_GENRES.map(function (g) { return { id: g.id, title: translate(g.titleKey) || g.titleKey }; });
        list.sort(function (a, b) { return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }); });
        return list;
    }
    function getCountriesSorted() {
        return COUNTRY_FILTER_LIST.map(function (c) { return { code: c.code, title: translate(c.titleKey) || c.titleKey }; });
    }
    function getAllTagsFlat() {
        var out = [];
        for (var i = 0; i < TAGS_BY_CATEGORY.length; i++) {
            var cat = TAGS_BY_CATEGORY[i];
            if (cat && cat.tags) for (var j = 0; j < cat.tags.length; j++) out.push(cat.tags[j]);
        }
        return out;
    }
    function getTagSelectItems() {
        var resetTitle = '— ' + (translate('streaming_reset_filters') || 'Reset') + ' —';
        var items = [{ title: resetTitle, value: '', id: null }];
        for (var i = 0; i < TAGS_BY_CATEGORY.length; i++) {
            var cat = TAGS_BY_CATEGORY[i];
            if (!cat || !cat.tags) continue;
            items.push({ title: translate(cat.categoryTitleKey) || cat.categoryTitleKey, value: null, id: null, categoryIndex: i });
        }
        return items;
    }
    function getTagSelectItemsForCategory(categoryIndex) {
        var cat = TAGS_BY_CATEGORY[categoryIndex];
        if (!cat || !cat.tags) return [];
        return cat.tags.map(function (t) { return { title: translate(t.titleKey) || t.titleKey, value: t.id, id: t.id }; });
    }

    function showGenreSelect(object, isView, onReturnFocus) {
        var items = [{ title: '— ' + (translate('streaming_reset_filters') || 'Reset') + ' —', value: '', id: null }];
        getGenresSorted().forEach(function (g) { items.push({ title: g.title, value: g.id, id: g.id }); });
        Lampa.Select.show({
            title: translate('streaming_genre_label') || 'Genre',
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
    function showCountrySelect(object, isView, onReturnFocus) {
        var items = [{ title: '— ' + (translate('streaming_reset_filters') || 'Reset') + ' —', value: '', code: null }];
        getCountriesSorted().forEach(function (c) { items.push({ title: c.title, value: c.code, code: c.code }); });
        Lampa.Select.show({
            title: translate('streaming_country_label') || 'Country',
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
    function showTagSubmenu(object, categoryIndex, isView) {
        var cat = TAGS_BY_CATEGORY[categoryIndex];
        if (!cat || !cat.tags) return;
        var subTitle = translate(cat.categoryTitleKey) || cat.categoryTitleKey;
        Lampa.Select.show({
            title: subTitle,
            items: getTagSelectItemsForCategory(categoryIndex),
            onSelect: function (a) {
                if (!a || a.id == null) return;
                var next = Object.assign({}, object, { tagKeywordId: a.id });
                if (isView) next.page = 1;
                Lampa.Activity.replace(next);
            },
            onBack: function () { showTagCategorySelect(object, isView); }
        });
    }
    function showTagCategorySelect(object, isView, onReturnFocus) {
        Lampa.Select.show({
            title: translate('streaming_tag_label') || 'Tag',
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

    function buildViewHeaderWithFilters(object, opts) {
        opts = opts || {};
        var onReturnFocus = opts.onReturnFocus;
        var header = document.createElement('div');
        header.className = 'streaming-sqr-header streaming-sqr-header--view';
        header.style.cssText = 'display:flex;align-items:center;gap:16px;padding:10px 16px;flex-wrap:nowrap;width:100%;box-sizing:border-box;';
        var searchLabelBase = translate('streaming_search') || 'Search';
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
        var genreLabelBase = translate('streaming_genre_label') || 'Genre';
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
        var tagLabelBase = translate('streaming_tag_label') || 'Tag';
        var tagTitle = '';
        if (object.tagKeywordId) {
            var found = getAllTagsFlat().filter(function (t) { return t.id === String(object.tagKeywordId); })[0];
            tagTitle = found ? translate(found.titleKey) : '';
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
        var countryLabelBase = translate('streaming_country_label') || 'Country';
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
        resetBtn.title = translate('streaming_reset_filters') || 'Reset';
        $(resetBtn).on('hover:enter', function () {
            var next = Object.assign({}, object, { searchQuery: '', tagKeywordId: null, genreId: null, originCountry: null, page: 1 });
            Lampa.Activity.replace(next);
        });
        header.appendChild(resetBtn);
        return header;
    }

    Lampa.Lang.add({
        streaming_reset_filters: { en: 'Reset', uk: 'Скинути' },
        streaming_tag_label: { en: 'Tag', uk: 'Тег' },
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
        streaming_country_CA: { en: 'Canada', uk: 'Канада' },
        streaming_country_AU: { en: 'Australia', uk: 'Австралія' },
        streaming_country_BR: { en: 'Brazil', uk: 'Бразилія' },
        streaming_country_MX: { en: 'Mexico', uk: 'Мексика' },
        streaming_country_AR: { en: 'Argentina', uk: 'Аргентина' },
        streaming_country_ZA: { en: 'South Africa', uk: 'ПАР' },
        streaming_country_NZ: { en: 'New Zealand', uk: 'Нова Зеландія' }
    });

    window.StreamingMenu = window.StreamingMenu || {};
    window.StreamingMenu.buildViewHeaderWithFilters = buildViewHeaderWithFilters;
})();
