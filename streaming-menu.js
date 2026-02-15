(function () {
    'use strict';

    // Стрімінгові сервіси (TMDB network id)
    var allStreamingServices = [
        { id: 49, title: 'HBO' },
        { id: 77, title: 'SyFy' },
        { id: 2552, title: 'Apple TV+' },
        { id: 453, title: 'Hulu' },
        { id: 1024, title: 'Amazon Prime' },
        { id: 213, title: 'Netflix' },
        { id: 3186, title: 'HBO Max' },
        { id: 2076, title: 'Paramount network' },
        { id: 4330, title: 'Paramount+' },
        { id: 3353, title: 'Peacock' },
        { id: 2739, title: 'Disney+' },
        { id: 2, title: 'ABC' },
        { id: 6, title: 'NBC' },
        { id: 16, title: 'CBS' },
        { id: 318, title: 'Starz' },
        { id: 174, title: 'AMC' },
        { id: 19, title: 'FOX' },
        { id: 64, title: 'Discovery' },
        { id: 493, title: 'BBC America' },
        { id: 88, title: 'FX' },
        { id: 67, title: 'Showtime' }
    ];

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
        streaming_menu_panel_title: { ru: 'Выбор стриминговых сервисов', en: 'Choose streaming services', uk: 'Вибір стрімінгових сервісів' }
    });

    function openStreamingPanel() {
        var previousController = Lampa.Controller.enabled().name;

        var items = allStreamingServices.map(function (service) {
            return {
                title: service.title,
                id: String(service.id),
                _serviceId: service.id,
                _serviceTitle: service.title
            };
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('streaming_menu_panel_title'),
            items: items,
            onBack: function () {
                try {
                    Lampa.Controller.toggle(previousController);
                } catch (e) {
                    console.error('streaming-menu onBack:', e);
                }
            },
            onSelect: function (selectedItem) {
                try {
                    var serviceId = selectedItem._serviceId;
                    var serviceTitle = selectedItem._serviceTitle || selectedItem.title;
                    if (serviceId === undefined) return;

                    Lampa.Controller.toggle(previousController);

                    // Відкриваємо каталог серіалів/фільмів цього стрімінгу (TMDB discover by network)
                    Lampa.Activity.push({
                        component: 'category',
                        url: 'tv',
                        title: serviceTitle,
                        source: 'tmdb',
                        network: serviceId,
                        page: 1,
                        card_type: true
                    });
                } catch (e) {
                    console.error('streaming-menu onSelect:', e);
                }
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

        itemHtml.on('hover:enter', function () {
            openStreamingPanel();
        });

        // Вставляємо після "Каталог" або після "Серіали"
        var afterItem = menu.find('[data-action="catalog"]');
        if (!afterItem.length) {
            afterItem = menu.find('[data-action="tv"]');
        }
        if (afterItem.length) {
            afterItem.after(itemHtml);
        } else {
            menu.find('.menu__item').last().after(itemHtml);
        }
    }

    function init() {
        addMenuItem();
    }

    if (typeof Lampa === 'undefined') {
        console.warn('streaming-menu.js: Lampa not found');
        return;
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                init();
            }
        });
    }
})();
