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
        var key = '';

        if (isControlledCategory(title)) {
            // Це одна з контрольованих категорій
            key = getCategoryKey(title);
            hide = Lampa.Storage.field(key, false);
            console.log('[Categories] Category', title, 'key:', key, 'hide:', hide);
        } else if (!isSafeBlock(title)) {
            // Це рекомендація (7 блоків) - перевіряємо загальне налаштування
            key = 'home_hide_recommendations';
            hide = Lampa.Storage.field(key, false);
            console.log('[Categories] Recommendation', title, 'hide:', hide);
        }

        // Застосовуємо видимість через visibility (як на скріншотах)
        // Використовуємо обидва способи для надійності
        if (hide) {
            $node.css({
                'visibility': 'hidden',
                'display': 'none'
            });
            $node.attr('data-category-hidden', 'true');
            console.log('[Categories] Hiding:', title);
        } else {
            $node.css({
                'visibility': 'visible',
                'display': ''
            });
            $node.removeAttr('data-category-hidden');
        }
    }

    /**
     * Очищає головний екран від прихованих категорій
     */
    function cleanMainScreen($activity) {
        if (!$activity || !$activity.length) {
            console.log('[Categories] No activity found');
            return;
        }
        
        // Спробуємо різні способи знайти контент
        var content = $activity.find('.scroll__body');
        if (!content.length) {
            content = $activity.find('.scroll__content');
        }
        if (!content.length) {
            content = $activity.find('.scroll');
        }
        if (!content.length) {
            content = $activity;
        }

        // Шукаємо всі рядки контенту
        var rows = content.find('.items-line');
        
        if (!rows.length) {
            // Спробуємо знайти через загальний селектор
            rows = $activity.find('.items-line');
        }
        
        if (!rows.length) {
            // Спробуємо знайти в document
            rows = $('.items-line');
        }

        if (!rows.length) {
            console.log('[Categories] No .items-line elements found');
            return;
        }

        console.log('[Categories] Found', rows.length, 'items-line elements');

        rows.each(function () {
            var $node = $(this);
            
            // Спробуємо різні селектори для заголовка
            var titleEl = $node.find('.items-line_title');
            if (!titleEl.length) {
                titleEl = $node.find('.items-line__title');
            }
            if (!titleEl.length) {
                titleEl = $node.find('[class*="title"]');
            }
            
            var title = titleEl.text().trim();
            
            // Якщо не знайшли через text(), спробуємо через html
            if (!title && titleEl.length) {
                title = titleEl.html().trim();
                // Видалимо HTML теги
                title = title.replace(/<[^>]*>/g, '').trim();
            }

            if (title) {
                console.log('[Categories] Processing row:', title);
                processRow($node, title);
            } else {
                console.log('[Categories] No title found for row');
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
                    console.log('[Categories] Setting changed:', key, 'value:', value);
                    // Зберігаємо значення вручну
                    Lampa.Storage.set(key, value);
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
                console.log('[Categories] Recommendations setting changed:', value);
                // Зберігаємо значення вручну
                Lampa.Storage.set('home_hide_recommendations', value);
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
                console.log('[Categories] Main activity detected');
                // Додаємо невелику затримку, щоб DOM встиг відрендеритися
                setTimeout(function() {
                    cleanMainScreen($(e.object.activity));
                }, 300);
                
                // Також перевіряємо через інтервал, поки елементи не з'являться
                var attempts = 0;
                var intervalId = setInterval(function() {
                    attempts++;
                    var rows = $(e.object.activity).find('.items-line');
                    if (rows.length > 0 || attempts > 10) {
                        clearInterval(intervalId);
                        if (rows.length > 0) {
                            cleanMainScreen($(e.object.activity));
                        }
                    }
                }, 200);
            }
        });

        // Якщо плагін завантажився, а ми вже на головній
        setTimeout(function() {
            var active = Lampa.Activity.active();
            if (active && active.component === 'main') {
                console.log('[Categories] Already on main screen');
                cleanMainScreen($(active.activity));
            }
        }, 500);
        
        // Також слухаємо зміни контенту через MutationObserver
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                var active = Lampa.Activity.active();
                if (active && active.component === 'main') {
                    // Дебаунс, щоб не викликати занадто часто
                    clearTimeout(observer.timeout);
                    observer.timeout = setTimeout(function() {
                        cleanMainScreen($(active.activity));
                    }, 100);
                }
            });
            
            // Спостерігаємо за змінами в body
            setTimeout(function() {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    console.log('[Categories] MutationObserver started');
                }
            }, 1000);
        }
    }

    // Запускаємо при завантаженні
    if (window.Lampa) {
        init();
    }
})();
