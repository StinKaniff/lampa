(function () {
    'use strict';

    var COMPONENT_NAME = 'streaming_menu_category';

    // Watch provider ID (TMDB) — контент саме доступний на цьому стрімінгу в регіоні
    var WATCH_REGION = 'UA';
    var allStreamingServices = [
        { id: 8, title: 'Netflix' },
        { id: 384, title: 'HBO Max' },
        { id: 337, title: 'Disney+' },
        { id: 119, title: 'Amazon Prime' },
        { id: 350, title: 'Apple TV+' },
        { id: 531, title: 'Paramount+' },
        { id: 453, title: 'Hulu' },
        { id: 386, title: 'Peacock' },
        { id: 283, title: 'Crunchyroll' },
        { id: 37, title: 'Showtime' },
        { id: 43, title: 'Starz' }
    ];

    // Локалізація
    Lampa.Lang.add({
        streaming_menu_title: { ru: 'Стриминги', en: 'Streaming', uk: 'Стрімінги' },
        streaming_menu_panel_title: { ru: 'Выбор стриминговых сервисов', en: 'Choose streaming services', uk: 'Вибір стрімінгових сервісів' }
    });

    // Компонент категорії: список серіалів/фільмів по вибраному стрімінгу (TMDB discover by network)
    function streamingCategoryComponent(object) {
        var comp = new Lampa.InteractionCategory(object);

        comp.create = function () {
            var _this = this;
            var providerId = object.url;
            var page = object.page || 1;

            this.activity.loader(true);

            if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
                this.empty();
                return this.render();
            }

            Lampa.Api.sources.tmdb.get('discover/tv', {
                with_watch_providers: providerId,
                watch_region: WATCH_REGION,
                page: page,
                sort_by: 'popularity.desc'
            }, function (data) {
                if (data && data.results && data.results.length) {
                    _this.build(data);
                } else {
                    _this.empty();
                }
            }, function () {
                _this.empty();
            });

            return this.render();
        };

        comp.nextPageReuest = function (obj, resolve, reject) {
            var providerId = obj.url;
            var page = obj.page || 1;

            if (!Lampa.Api || !Lampa.Api.sources || !Lampa.Api.sources.tmdb) {
                reject();
                return;
            }

            Lampa.Api.sources.tmdb.get('discover/tv', {
                with_watch_providers: providerId,
                watch_region: WATCH_REGION,
                page: page,
                sort_by: 'popularity.desc'
            }, resolve, reject);
        };

        return comp;
    }

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

                    Lampa.Activity.push({
                        component: COMPONENT_NAME,
                        url: String(serviceId),
                        title: serviceTitle,
                        page: 1
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
        Lampa.Component.add(COMPONENT_NAME, streamingCategoryComponent);
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
