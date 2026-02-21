(function () {
    'use strict';

    /**
     * Стрімінги з категоріями.
     * Кожен сервіс — окремі рядки: нові фільми, нові серіали, в тренді тощо.
     */

    // TMDB keyword IDs для ексклюзивних категорій 
    var KEYWORD_FANTASY_WORLD = '9715';
    var KEYWORD_BASED_ON_NOVEL = '818';
    // TMDB watch provider ID по service_id (для фільтра «Продовжити перегляд» по сервісу)
    var SERVICE_PROVIDER_IDS = {
        netflix: 8,
        apple: 350,
        hbo: 384,
        amazon: 119,
        disney: 337,
        paramount: 531,
        origin: 43
    };

    var STORAGE_SHOW_TRENDING = 'streaming_show_trending';
    var STORAGE_SHOW_NEW = 'streaming_show_new';
    var STORAGE_SHOW_EXCLUSIVE = 'streaming_show_exclusive';
    var STORAGE_SHOW_POPULAR_NOW = 'streaming_show_popular_now';

    // Країни походження без Азії (TMDB — лише включення): США, Європа, Латинська Америка, Океанія тощо. Без KR, JP, CN, IN тощо.
    var ORIGIN_COUNTRIES_NO_ASIA = 'US|GB|CA|AU|DE|FR|IT|ES|PL|UA|NL|SE|NO|BR|MX|AR|BE|CH|AT|PT|IE|NZ|ZA|RU|TR|FI|DK|CZ|RO|HU|GR';

    function isSettingOn(key) {
        var v = Lampa.Storage.get(key, true);
        return v !== false && v !== 'false';
    }

    var SERVICE_CONFIGS = {
        netflix: {
            title: 'Netflix',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_networks: '213', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '213', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '8', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive //
                { title: 'Netflix Original', url: 'discover/tv', params: { with_networks: '213', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_networks: '213', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_companies: '213', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'На основі книг', url: 'discover/tv', params: { with_networks: '213', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_networks: '213', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_networks: '213', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Анімація', url: 'discover/tv', params: { with_networks: '213', with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_16' },
                { title: 'Детективи', url: 'discover/tv', params: { with_networks: '213', with_genres: '9648', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_9648' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_networks: '213', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
                { title: 'Трилери', url: 'discover/tv', params: { with_networks: '213', with_genres: '53', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_53' }
            ]
        },
        apple: {
            title: 'Apple TV+',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive //
                { title: 'Apple TV+ Original', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '350', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'На основі книг', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Детективи', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', with_genres: '9648', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_9648' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_watch_providers: '350', watch_region: '{watch_region}', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
            ]
        },
        hbo: {
            title: 'HBO',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_networks: '49|3186', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '49|3186', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '384', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive //
                { title: 'Max Originals', url: 'discover/tv', params: { with_networks: '3186', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_networks: '3186', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '384', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'Золота колекція HBO', url: 'discover/tv', params: { with_networks: '49', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'На основі книг', url: 'discover/tv', params: { with_networks: '49|3186', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_networks: '49|3186', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_networks: '49|3186', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Детективи', url: 'discover/tv', params: { with_networks: '49|3186', with_genres: '9648', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_9648' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_networks: '49|3186', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
            ]
        },
        amazon: {
            title: 'Prime Video',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_networks: '1024', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '1024', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '119', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive //
                { title: 'Prime Video Original', url: 'discover/tv', params: { with_networks: '1024', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_networks: '1024', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '119', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'На основі книг', url: 'discover/tv', params: { with_networks: '1024', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_networks: '1024', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_networks: '1024', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Історичні', url: 'discover/tv', params: { with_networks: '1024', with_genres: '36', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_36' },
                { title: 'Детективи', url: 'discover/tv', params: { with_networks: '1024', with_genres: '9648', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_9648' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_networks: '1024', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
            ]
        },
        disney: {
            title: 'Disney+',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING, mergeRequests: [ { url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'popularity.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'popularity.desc', 'vote_count.gte': '10' } } ] },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive (Original by rating, brands by newness) //
                { title: 'Disney+ Original', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '337', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'Класика Disney', url: 'discover/movie', params: { with_companies: '6125', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'Pixar', url: 'discover/movie', params: { with_companies: '3', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'Marvel: Кіновсесвіт', url: 'discover/movie', params: { with_companies: '420', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'Зоряні Війни', url: 'discover/movie', params: { with_companies: '1', with_keywords: '363309', sort_by: 'release_date.asc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'На основі книг', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Історичні', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_genres: '36', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_36' },
                { title: 'Детективи', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_genres: '9648', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_9648' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_watch_providers: '337', watch_region: '{watch_region}', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
            ]
        },
        paramount: {
            title: 'Paramount+',
            categories: [
                // Trending //
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_networks: '4330', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_TRENDING },
                // New //
                { title: 'Нові серіали', url: 'discover/tv', params: { with_networks: '4330', sort_by: 'first_air_date.desc', 'first_air_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                { title: 'Нові фільми', url: 'discover/movie', params: { with_watch_providers: '531', watch_region: '{watch_region}', sort_by: 'primary_release_date.desc', 'primary_release_date.lte': '{current_date}', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_NEW },
                // Exclusive //
                { title: 'Paramount+ Originals', url: 'discover/tv', params: { with_networks: '4330', sort_by: 'vote_average.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE, mergeRequests: [ { url: 'discover/tv', params: { with_networks: '4330', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } }, { url: 'discover/movie', params: { with_watch_providers: '531', watch_region: '{watch_region}', sort_by: 'vote_average.desc', 'vote_count.gte': '10' } } ] },
                { title: 'Всесвіт Йеллоустоун', url: 'discover/tv', params: { with_networks: '318|4330', with_genres: '37,18', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'Блокбастери Paramount', url: 'discover/movie', params: { with_companies: '4', sort_by: 'popularity.desc', 'vote_count.gte': '10', 'vote_average.gte': '6.5' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                { title: 'На основі книг', url: 'discover/tv', params: { with_networks: '4330', with_keywords: KEYWORD_BASED_ON_NOVEL, sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_EXCLUSIVE },
                // Genres //
                { title: 'Пригоди', url: 'discover/tv', params: { with_networks: '4330', with_genres: '12', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_12' },
                { title: 'Комедії', url: 'discover/tv', params: { with_networks: '4330', with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_35' },
                { title: 'Бойовики та вестерни', url: 'discover/tv', params: { with_networks: '4330', with_genres: '28,37', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_28' },
            ]
        },
        origin: {
            title: 'NatGeo',
            categories: [
                { title: 'streaming_popular_now', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: STORAGE_SHOW_POPULAR_NOW },
                // Exclusive //
                { title: 'Космос', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_99' },
                { title: 'Дика природа', url: 'discover/tv', params: { with_networks: '1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_99' },
                { title: 'Документальні серіали', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_99' },
                { title: 'Природа', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_99' },
                { title: 'Наука', url: 'discover/tv', params: { with_networks: '43|1043', with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '10' }, settingKey: 'streaming_show_genre_99' },
            ]
        }
    };

    // Логотипи з streaming/img (вбудовані в код для роботи з CDN)
    var ICON_SIZE = ' width="24" height="24"';
    var ICON_NETFLIX = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M146 56h80l59 177 1-177h80v400c-25-4-53-7-82-8l-58-172-1 172c-28 1-55 4-79 8V56Z"/></svg>';
    var ICON_APPLE = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M368 440c-21 21-45 18-68 8a87 87 0 0 0-72 0c-32 14-49 10-68-8-109-112-93-282 31-288 30 1 50 16 68 18 26-6 51-21 79-19 34 3 59 16 76 40a88 88 0 0 0 11 158c-13 34-30 67-57 91ZM257 150c-4-49 37-90 83-94 6 57-52 100-83 94Z"/></svg>';
    var ICON_HBO = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M163 348h-49v-71H82v71H31V166h51v68h32v-68h49v182Zm226 1a93 93 0 0 0 35-179 91 91 0 0 0-118 46c0-23-23-50-49-50h-84v182h79c31 0 54-28 54-51 7 15 32 52 83 52Zm-144-74c7 0 13 7 13 15s-6 16-13 16h-25v-31h25Zm0-68c7 0 13 7 13 15s-6 15-13 15h-25v-30h25Zm33 49c6-1 16-8 19-12v26c-4-6-13-14-19-14Zm65 0a46 46 0 1 1 92 0 46 46 0 0 1-92 0Zm46 36a36 36 0 1 0 0-73 36 36 0 0 0 0 73Z"/></svg>';
    var ICON_DISNEY = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="42.7" d="M90 123c-26-3-24-12-24-16s9-21 87-21c94 0 293 73 293 201s-174 98-209 90c-34-8-111-45-111-83 0-28 62-48 134-48 73 0 106 21 106 40 0 10-1 25-20 30M226 166v260"/></svg>';
    var ICON_AMAZON = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M456 370c0 15-8 43-26 58-4 3-8 2-6-2 5-13 17-43 12-50-4-6-21-5-35-4l-17 2c-4 0-4-3 0-6 5-4 11-7 17-8 23-7 50-3 53 1 1 1 2 3 2 9Zm-38 26-17 11a294 294 0 0 1-343-37c-4-3-1-9 4-6a397 397 0 0 0 339 26l10-4c7-3 14 5 7 10ZM294 176c0-21 1-33-6-44-6-9-17-14-31-13-16 1-33 11-38 31-1 4-3 8-9 9l-48-6c-4-1-9-3-7-10 10-55 57-75 102-77h10c25 0 56 7 76 25 24 23 22 53 22 87v78c0 24 9 34 19 46 2 5 3 10-1 13l-38 34c-4 2-10 2-13 0-15-12-19-20-28-33-17 18-31 27-47 33-12 3-24 4-36 4-42 0-75-26-75-78 0-41 22-69 54-82s79-17 94-17m-9 104c10-18 9-32 9-64-13 0-26 1-37 3-21 6-38 20-38 48 0 21 12 36 31 36l7-1c13-3 21-10 28-22Z"/></svg>';
    var ICON_PARAMOUNT = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path fill="currentColor" d="M328 412c1-1 3-5 0-12l-9-24c-1-3 2-5 3-3 0 0 17 19 21 28l9 13 45 1-5-6c-32-40-53-62-53-62-6-7-9-9-14-11l-3-1v6l-1 1-47-84c-2-4-5-7-9-10l-5-3-22 52c3 0 6 4 4 7l-20 48h19c7 0 14 2 21 4l5 3s-15 31-15 47l1 9h35l-1-10s21 5 41 7ZM256 97A200 200 0 0 0 95 415c8-3 13-9 16-13l38-47 3-3 5-2 62-78 8-7 19-25 1-2 8-6a6 6 0 0 1 7 0l10 7c5 4 9 8 12 14l38 68 3 3c8 4 13 4 23 15 4 5 25 28 53 63 4 6 9 10 16 13A200 200 0 0 0 256 96ZM110 308l-13-5-8 11v-13l-13-4 13-5v-13l8 11 13-4-8 11 8 11Zm-3 44-4 13-5-13H85l11-8-4-13 11 8 11-8-5 13 11 8h-13Zm2-103 5 13-11-8-11 8 4-13-11-8h13l5-13 4 13h13l-11 8Zm22-29-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 4v14Zm34-48-4 13-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14Zm43-22-8 11v-13l-13-5 13-4v-14l8 11 13-4-8 11 8 11-13-4Zm55-12 4 13-11-8-11 8 4-13-11-8h14l4-13 4 13h14l-11 8Zm49 10v13l-8-11-13 4 8-11-8-11 13 4 8-11v14l13 4-13 5Zm90 138 13 4 8-11v13l13 5-13 4v13l-8-11-13 5 8-11-8-11Zm-51-101-4-13h-14l11-8-4-13 11 8 11-8-4 13 11 8h-14l-4 13Zm30 35v-14l-13-4 13-4v-14l8 11 13-4-8 11 8 11-13-4-8 11Zm24 21 4-13 5 13h13l-11 8 4 13-11-8-11 8 5-13-11-8h13Zm9 111-5 13-4-13h-13l11-8-5-13 11 8 11-8-4 13 11 8h-13Zm-202-10 13-26-1-2-11 12c-5 5-14 20-16 23l-14 23a2 2 0 0 1 2 2l-12 21c-3 5 2 9 3 7 19-31 30-28 30-28l7-15-1-2c-2-1-5-5 0-15Z"/></svg>';
    var ICON_ORIGIN = '<svg xmlns="http://www.w3.org/2000/svg"' + ICON_SIZE + ' fill="none" viewBox="0 0 512 512"><path stroke="currentColor" stroke-width="42.6667" stroke-linecap="round" stroke-linejoin="round" d="M149.333 64H362.667V448H149.333V64Z"/></svg>';
    var SERVICE_ICONS = {
        netflix: ICON_NETFLIX,
        apple: ICON_APPLE,
        hbo: ICON_HBO,
        amazon: ICON_AMAZON,
        disney: ICON_DISNEY,
        paramount: ICON_PARAMOUNT,
        origin: ICON_ORIGIN
    };

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { en: 'Streaming', uk: 'Стрімінги' },
        streaming_popular_now: { en: 'Popular now', uk: 'Популярно зараз' },
        streaming_region_label: { en: 'Watch region', uk: 'Регіон перегляду' },
        streaming_show_trending: { en: 'Show «Trending»', uk: 'Відображати «Зараз у тренді»' },
        streaming_show_new: { en: 'Show «New»', uk: 'Відображати «Нові»' },
        streaming_show_exclusive: { en: 'Show exclusive categories', uk: 'Відображати ексклюзивні категорії' },
        streaming_show_popular_now: { en: 'Show «Popular now»', uk: 'Відображати «Популярно зараз»' },
        streaming_enabled_services_label: { en: 'Streamings', uk: 'Стримінги' },
        streaming_display_categories_label: { en: 'Display categories', uk: 'Відображати категорії' },
        streaming_more_label: { en: 'See all', uk: 'Дивитись усі' },
        streaming_show_genre_12: { en: 'Adventure', uk: 'Пригоди' },
        streaming_show_genre_35: { en: 'Comedy', uk: 'Комедії' },
        streaming_show_genre_16: { en: 'Animation', uk: 'Анімація' },
        streaming_show_genre_36: { en: 'History', uk: 'Історичні' },
        streaming_show_genre_9648: { en: 'Mystery', uk: 'Детективи' },
        streaming_show_genre_28: { en: 'Action & Western', uk: 'Бойовики та вестерни' },
        streaming_show_genre_53: { en: 'Thriller', uk: 'Трилери' },
        streaming_show_genre_10765: { en: 'Sci-Fi & Fantasy', uk: 'Фантастичні світи' },
        streaming_show_genre_99: { en: 'Documentary', uk: 'Документальні' },
        streaming_show_genre_18: { en: 'Drama', uk: 'Драми' },
        streaming_show_genre_10751: { en: 'Family', uk: 'Сімейний перегляд' }
    });


    var STORAGE_WATCH_REGION = 'streaming_watch_region';
    var STORAGE_ENABLED_SERVICES = 'streaming_enabled_services';

    var WATCH_REGIONS = [
        { code: 'UA', label: { uk: 'Україна (UA)', en: 'Ukraine (UA)' } },
        { code: 'US', label: { uk: 'США (US)', en: 'United States (US)' } },
        { code: 'EU', label: { uk: 'Європа (EU)', en: 'Europe (EU)' } }
    ];

    function getWatchRegion() {
        var saved = Lampa.Storage.get(STORAGE_WATCH_REGION);
        if (saved === 'UA' || saved === 'US' || saved === 'EU') return saved;
        return 'UA';
    }

    function getEnabledServiceIds() {
        var allIds = Object.keys(SERVICE_CONFIGS);
        var saved = Lampa.Storage.get(STORAGE_ENABLED_SERVICES);
        if (!saved || !Array.isArray(saved) || saved.length === 0) return allIds;
        return saved.filter(function (id) { return SERVICE_CONFIGS[id]; });
    }

    function getCurrentDate() {
        var d = new Date();
        return [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
    }

    function buildDiscoverUrl(opts) {
        var url = opts.url;
        var params = opts.params || {};
        if (url && url.indexOf('discover/') !== -1 && !params.with_origin_country) {
            params = Object.assign({}, params, { with_origin_country: ORIGIN_COUNTRIES_NO_ASIA });
        }
        var page = opts.page;
        var arr = ['api_key=' + Lampa.TMDB.key(), 'language=' + (Lampa.Storage.get('language') || 'uk')];
        if (page != null) arr.push('page=' + page);
        for (var key in params) {
            var val = params[key];
            if (val === '{current_date}') val = getCurrentDate();
            if (val === '{watch_region}') val = getWatchRegion();
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
        if (categories) {
            categories = categories.filter(function (cat) { return cat.settingKey && isSettingOn(cat.settingKey); });
        }
        if (!categories || !categories.length) {
            comp.create = function () { this.empty(); return this.render(); };
            return comp;
        }

        comp.create = function () {
            var _this = this;
            var sessionId = Date.now();
            comp._streamingSessionId = sessionId;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);
            var staticDone = false;
            this.activity.loader(true);

            function isStale() { return comp._streamingSessionId !== sessionId; }

            function startRest() {
                if (isStale()) return;
                categories.forEach(function (cat, index) {
                    if (cat.collectionId != null) {
                        var collUrl = Lampa.TMDB.api('collection/' + cat.collectionId + '?api_key=' + Lampa.TMDB.key() + '&language=' + (Lampa.Storage.get('language') || 'uk'));
                        network.silent(collUrl, function (json) {
                            if (isStale()) return;
                            var parts = (json && json.parts) ? json.parts : [];
                            status.append(String(index), { results: parts });
                        }, function () {
                            if (isStale()) return;
                            status.append(String(index), { results: [] });
                            status.error();
                        });
                        return;
                    }
                    if (cat.mergeRequests && cat.mergeRequests.length) {
                        var pending = cat.mergeRequests.length;
                        var allResults = [];
                        cat.mergeRequests.forEach(function (req) {
                            network.silent(buildDiscoverUrl({ url: req.url, params: req.params, page: 1 }), function (json) {
                                if (isStale()) return;
                                if (json && json.results && json.results.length) allResults = allResults.concat(json.results);
                                pending--;
                                if (pending === 0) status.append(String(index), { results: allResults });
                            }, function () {
                                if (isStale()) return;
                                pending--;
                                if (pending === 0) status.append(String(index), { results: allResults });
                                status.error();
                            });
                        });
                    } else {
                        network.silent(buildDiscoverUrl({ url: cat.url, params: cat.params, page: 1 }), function (json) {
                            if (isStale()) return;
                            status.append(String(index), json);
                        }, function () {
                            if (isStale()) return;
                            status.append(String(index), { results: [] });
                            status.error();
                        });
                    }
                });
            }

            startRest();
            tryBuild();

            function buildFullData() {
                var fulldata = [];
                Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                    var data = status.data[key];
                    var results = (data && data.results) ? data.results.slice(0, 20) : [];
                    var cat = categories[parseInt(key, 10)];
                    if (!cat || !results.length) return;
                    Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                    var rowTitle = cat.title;
                    if (cat.title === 'streaming_popular_now') {
                        rowTitle = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_popular_now')) || 'Популярно зараз';
                        if (rowTitle === 'streaming_popular_now') rowTitle = 'Популярно зараз';
                    }
                    fulldata.push({
                        title: rowTitle,
                        results: results,
                        url: cat.url,
                        params: cat.params
                    });
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
                page: 1
            });
        };

        return comp;
    }

    function StreamingView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            network.silent(buildDiscoverUrl({ url: object.url, params: object.params, page: 1 }), function (json) {
                var results = (json && json.results) ? json.results : [];
                var totalPages = (json && json.total_pages != null) ? json.total_pages : 1;
                var totalResults = (json && json.total_results != null) ? json.total_results : 0;
                _this.build({ page: 1, results: results, total_pages: totalPages, total_results: totalResults });
                _this.activity.loader(false);
            }, function () {
                _this.build({ page: 1, results: [], total_pages: 1, total_results: 0 });
                _this.activity.loader(false);
            });
            return this.render();
        };

        function loadNextPage(obj, resolve, reject) {
            var page = (obj && obj.page) ? obj.page : 1;
            network.silent(buildDiscoverUrl({ url: object.url, params: object.params, page: page }), resolve, reject);
        }
        comp.nextPageReuest = loadNextPage;
        comp.nextPageRequest = loadNextPage;

        return comp;
    }

    // SQR — окреме підменю в налаштуваннях (як у Applecation: Lampa.SettingsApi.addComponent + addParam)
    var SQR_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

    function registerSqrSettingsApi() {
        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addComponent !== 'function') return;
        Lampa.SettingsApi.addComponent({
            component: 'streaming_sqr_settings',
            name: 'SQR',
            icon: SQR_ICON_SVG
        });
        var regionLabel = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_region_label')) || 'Регіон перегляду';
        var regionValues = {};
        WATCH_REGIONS.forEach(function (r) {
            var lang = (Lampa.Storage && Lampa.Storage.get('language')) || 'uk';
            var label = (r.label && r.label[lang]) ? r.label[lang] : r.code;
            regionValues[r.code] = label;
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
                    var config = SERVICE_CONFIGS[sid];
                    var icon = SERVICE_ICONS[sid] || '';
                    return { title: config.title, value: sid, checkbox: true, checked: enabled.indexOf(sid) !== -1, icon: icon };
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
        var categoriesLabel = (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate('streaming_display_categories_label')) || 'Відображати категорії';
        var categoryOptions = (function () {
            var seen = {};
            var list = [];
            Object.keys(SERVICE_CONFIGS).forEach(function (sid) {
                var cats = SERVICE_CONFIGS[sid].categories;
                if (!cats) return;
                cats.forEach(function (cat) {
                    var key = cat.settingKey;
                    if (key && !seen[key]) {
                        seen[key] = true;
                        list.push({ key: key, label: key, default: true });
                    }
                });
            });
            return list;
        })();
        var t = function (key) { return (Lampa.Lang && Lampa.Lang.translate && Lampa.Lang.translate(key)) || key; };
        Lampa.SettingsApi.addParam({
            component: 'streaming_sqr_settings',
            param: { name: 'streaming_display_categories', type: 'button', default: null },
            field: { name: categoriesLabel },
            onChange: function () {
                var items = categoryOptions.map(function (opt) {
                    return { title: t(opt.label), value: opt.key, checkbox: true, checked: isSettingOn(opt.key) };
                });
                Lampa.Select.show({
                    title: categoriesLabel,
                    items: items,
                    onCheck: function (item) {
                        Lampa.Storage.set(item.value, !!item.checked);
                    },
                    onBack: function () {
                        if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
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
        registerSqrSettingsApi();
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu.js: Lampa not found');
        return;
    }
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
