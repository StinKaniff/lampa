(function () {
    'use strict';

    /**
     * Список категорій для окремого контролю
     * Кожна категорія матиме свій пункт в меню "Канали"
     */
    var CATEGORIES = [
        "Зараз дивляться",
        "Сьогодні у тренді",
        "У тренді за тиждень",
        "Дивіться у кінозалах",
        "Популярні фільми",
        "Популярні серіали",
        "Топ фільми",
        "Топ серіали"
    ];

    /**
     * Системні блоки, які не треба приховувати
     */
    var SAFE_TITLES = ["Продовжити перегляд", "Trakt UpNext", "Меню", "Закладки"];

    /**
     * Генерує безпечний ключ для зберігання налаштувань
     */
    function getCategoryKey(title) {
        return 'home_hide_' + btoa(unescape(encodeURIComponent(title))).replace(/[^a-zA-Z0-9]/g, '');
    }

    /**
     * Перевіряє, чи є категорія в списку контрольованих
     */
    function isControlledCategory(title) {
        return CATEGORIES.indexOf(title) !== -1;
    }

    /**
     * Перевіряє, чи є блок системним (безпечним)
     */
    function isSafeBlock(title) {
        return SAFE_TITLES.some(function(t) { 
            return title.indexOf(t) !== -1; 
        });
    }

    /**
     * Обробляє один рядок контенту
     */
    function processRow($node, title) {
        var hide = false;

        if (isControlledCategory(title)) {
            // Це одна з контрольованих категорій
            var key = getCategoryKey(title);
            hide = Lampa.Storage.get(key, false);
        } else if (!isSafeBlock(title)) {
            // Це рекомендація (7 блоків) - перевіряємо загальне налаштування
            hide = Lampa.Storage.get('home_hide_recommendations', false);
        }

        // Застосовуємо видимість
        if (hide) {
            if ($node.css('display') !== 'none') $node.hide();
        } else {
            if ($node.css('display') === 'none') $node.show();
        }
    }

    /**
     * Очищає головний екран від прихованих категорій
     */
    function cleanMainScreen($activity) {
        var content = $activity.find('.scroll__body');
        
        // Якщо не знайшли .scroll__body, шукаємо ширше (на випадок змін)
        if (!content.length) {
            content = $activity.find('.scroll__content > div');
        }

        if (!content.length) return;

        // Шукаємо всі рядки контенту
        var rows = content.find('.items-line');

        rows.each(function () {
            var $node = $(this);
            var titleEl = $node.find('.items-line__title');
            var title = titleEl.text().trim();

            if (title) {
                processRow($node, title);
            }
        });
    }

    /**
     * Оновлює головний екран після зміни налаштувань
     */
    function triggerUpdate() {
        var active = Lampa.Activity.active();
        if (active && active.component === 'main') {
            cleanMainScreen($(active.activity));
        }
    }

    /**
     * Реєструє налаштування для кожної категорії
     */
    function registerCategorySettings() {
        CATEGORIES.forEach(function (title) {
            var key = getCategoryKey(title);
            
            Lampa.SettingsApi.addParam({
                component: 'home', // Меню "Канали"
                param: {
                    name: key,
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: title,
                    description: 'Приховати цю категорію'
                },
                onChange: function (value) {
                    triggerUpdate();
                }
            });
        });
    }

    /**
     * Реєструє налаштування для рекомендацій
     */
    function registerRecommendationsSetting() {
        Lampa.SettingsApi.addParam({
            component: 'home',
            param: {
                name: 'home_hide_recommendations',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Рекомендації',
                description: 'Приховати всі додаткові блоки рекомендацій (7 блоків)'
            },
            onChange: function (value) {
                triggerUpdate();
            }
        });
    }

    /**
     * Ініціалізація плагіна
     */
    function init() {
        // 1. Реєструємо налаштування в меню "Канали"
        registerCategorySettings();
        registerRecommendationsSetting();

        // 2. Слідкуємо за головним екраном
        Lampa.Listener.follow('activity', function (e) {
            if (e.type == 'main') {
                cleanMainScreen($(e.object.activity));
            }
        });

        // Якщо плагін завантажився, а ми вже на головній
        var active = Lampa.Activity.active();
        if (active && active.component === 'main') {
            cleanMainScreen($(active.activity));
        }
    }

    // Запускаємо при завантаженні
    if (window.Lampa) {
        init();
    }
})();
