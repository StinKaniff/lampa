(function () {
  "use strict";

  const i18n = {
    uk: {
      settings_title: "Стрімінгові сервіси",
      popular_series: "Популярні серіали",
      popular_movies: "Популярні фільми",
      series: "Серіали",
      movies: "Фільми",
      more: "Більше"
    },
    en: {
      settings_title: "Streaming Services",
      popular_series: "Popular Series",
      popular_movies: "Popular Movies",
      series: "Series",
      movies: "Movies",
      more: "More"
    }
  };

  const services = {
    netflix: {
      name: { uk: "Netflix", en: "Netflix" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M84 0v512h88V308l88 204h88V0h-88v204l-88-204z"/></svg>',
      movie_params: "with_watch_providers=8&watch_region=UA",
      tv_params: "with_networks=213",
      enabled_key: "streaming_netflix_enabled"
    },
    appletv: {
      name: { uk: "Apple TV+", en: "Apple TV+" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>',
      movie_params: "with_watch_providers=350&watch_region=UA",
      tv_params: "with_networks=2552",
      enabled_key: "streaming_appletv_enabled"
    },
    hbo: {
      name: { uk: "HBO Max", en: "HBO Max" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 93.4C0 41.8 41.8 0 93.4 0l184.7 0c20 0 39.2 7.9 53.4 22l126.6 126.6c14.1 14.1 22 33.4 22 53.4l0 184.7c0 51.6-41.8 93.4-93.4 93.4l-184.7 0c-20 0-39.2-7.9-53.4-22L22 331.4C7.9 317.2 0 298 0 278l0-184.7zM192.2 128H96v256h96V256h64v128h96V128H288v96H192V128z"/></svg>',
      movie_params: "with_watch_providers=384&watch_region=UA",
      tv_params: "with_networks=49",
      enabled_key: "streaming_hbo_enabled"
    },
    disney: {
      name: { uk: "Disney+", en: "Disney+" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>',
      movie_params: "with_watch_providers=337&watch_region=UA",
      tv_params: "with_networks=2739",
      enabled_key: "streaming_disney_enabled"
    },
    prime: {
      name: { uk: "Amazon Prime", en: "Amazon Prime" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"/></svg>',
      movie_params: "with_watch_providers=119&watch_region=UA",
      tv_params: "with_networks=1024",
      enabled_key: "streaming_prime_enabled"
    },
    paramount: {
      name: { uk: "Paramount+", en: "Paramount+" },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L256 352.1l-101.8-158.3L256 64l101.8 129.8z"/></svg>',
      movie_params: "with_watch_providers=531&watch_region=UA",
      tv_params: "with_networks=4330",
      enabled_key: "streaming_paramount_enabled"
    }
  };

  const lang = Lampa.Storage.get('language', 'uk');
  const t = i18n[lang] || i18n.uk;

  function getServiceName(serviceId) {
    return services[serviceId].name[lang] || services[serviceId].name.uk;
  }

  function component(serviceId) {
    const service = services[serviceId];
    let network = new Lampa.Reguest();
    let scroll = new Lampa.Scroll({ horizontal: false, step: 250 });
    let items = [];
    let html = $('<div></div>');

    this.create = function () {
      this.activity.loader(true);
      
      const sections = [
        {
          title: t.popular_series,
          url: `discover/tv?language=ua&${service.tv_params}&sort_by=popularity.desc`,
          type: 'tv'
        },
        {
          title: t.popular_movies,
          url: `discover/movie?language=ua&${service.movie_params}&sort_by=popularity.desc`,
          type: 'movie'
        },
        {
          title: t.series,
          url: `discover/tv?language=ua&${service.tv_params}&sort_by=vote_average.desc&vote_count.gte=100`,
          type: 'tv'
        },
        {
          title: t.movies,
          url: `discover/movie?language=ua&${service.movie_params}&sort_by=vote_average.desc&vote_count.gte=100`,
          type: 'movie'
        }
      ];

      sections.forEach((section) => {
        const sectionHtml = $(`
          <div class="category-items">
            <div class="category-items__title">${section.title}</div>
            <div class="category-items__cards"></div>
          </div>
        `);

        const cardsContainer = sectionHtml.find('.category-items__cards');

        network.silent(section.url, (data) => {
          const results = data.results || [];
          const itemsToShow = results.slice(0, 8);

          itemsToShow.forEach((item) => {
            const card = Lampa.Template.get('card', {
              title: item.title || item.name,
              release_year: (item.release_date || item.first_air_date || '').split('-')[0],
              img: item.poster_path ? 'https://image.tmdb.org/t/p/w342' + item.poster_path : './img/img_broken.svg',
              vote_average: item.vote_average
            });

            card.addClass('card--category');

            card.on('hover:enter', () => {
              Lampa.Activity.push({
                url: '',
                component: section.type === 'movie' ? 'movie' : 'full',
                id: item.id,
                method: section.type,
                card: item
              });
            });

            cardsContainer.append(card);
            items.push(card);
          });

          // Додаємо кнопку "Більше"
          const moreCard = $(`
            <div class="card selector card--category">
              <div class="card__view">
                <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:1.2em;">
                  ${t.more}
                </div>
              </div>
            </div>
          `);

          moreCard.on('hover:enter', () => {
            Lampa.Activity.push({
              url: section.url,
              title: `${getServiceName(serviceId)} – ${section.title}`,
              component: 'category_full',
              source: 'tmdb',
              card_type: true,
              page: 1
            });
          });

          cardsContainer.append(moreCard);
          items.push(moreCard);
        }, () => {}, false, {
          dataType: 'json'
        });

        html.append(sectionHtml);
      });

      scroll.append(html);
      this.activity.toggle();
      this.activity.loader(false);
    };

    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: () => {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(false, scroll.render());
        },
        left: () => {
          if (Navigator.canmove('left')) Navigator.move('left');
          else Lampa.Controller.toggle('menu');
        },
        up: () => {
          if (Navigator.canmove('up')) Navigator.move('up');
          else Lampa.Controller.toggle('head');
        },
        down: () => {
          Navigator.move('down');
        },
        right: () => {
          Navigator.move('right');
        },
        back: () => {
          Lampa.Activity.backward();
        }
      });

      Lampa.Controller.toggle('content');
    };

    this.pause = function () {};

    this.stop = function () {};

    this.render = function () {
      return scroll.render();
    };

    this.destroy = function () {
      network.clear();
      scroll.destroy();
      html.remove();
      items = null;
      network = null;
    };
  }

  function addServiceMenuItem(serviceId) {
    const service = services[serviceId];
    const serviceName = getServiceName(serviceId);
    const ITEM_MOVE_TIMEOUT = 2000;
    const ITEM_TV_SELECTOR = '[data-action="tv"]';

    const moveItemAfter = function (item, after) {
      return setTimeout(function () {
        const menuRoot = Lampa.Menu.render();
        if (menuRoot.length) {
          const $after = menuRoot.find(after);
          const $item = $(item);
          if ($after.length && $item.length) {
            $after.after($item);
          }
        }
      }, ITEM_MOVE_TIMEOUT);
    };

    function tryAppend() {
      const menuList = $(".menu .menu__list").eq(0);

      if (menuList.length) {
        const item = $(`
          <li class="menu__item selector" data-action="streaming_${serviceId}">
            <div class="menu__ico">${service.icon}</div>
            <div class="menu__text">${serviceName}</div>
          </li>
        `);
        
        item.on("hover:enter", function () {
          Lampa.Activity.push({
            url: '',
            title: serviceName,
            component: `streaming_${serviceId}`,
            page: 1
          });
        });
        
        menuList.append(item);
        moveItemAfter(`[data-action="streaming_${serviceId}"]`, ITEM_TV_SELECTOR);
      } else {
        setTimeout(tryAppend, 300);
      }
    }

    tryAppend();
  }

  function removeServiceMenuItem(serviceId) {
    $(`[data-action='streaming_${serviceId}']`).remove();
  }

  function init() {
    if (window.streaming_services_ready) return;

    // Реєструємо компоненти для кожного сервісу
    Object.keys(services).forEach(serviceId => {
      Lampa.Component.add(`streaming_${serviceId}`, component.bind(null, serviceId));
      
      const isEnabled = Lampa.Storage.get(services[serviceId].enabled_key, false);
      if (isEnabled) {
        addServiceMenuItem(serviceId);
      }
    });

    // Додаємо секцію налаштувань
    Lampa.SettingsApi.addComponent({
      component: "streaming_services",
      name: t.settings_title,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M0 256C0 114.6 114.6 0 256 0S512 114.6 512 256s-114.6 256-256 256S0 397.4 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>'
    });

    // Додаємо перемикачі для кожного сервісу
    Object.keys(services).forEach(serviceId => {
      const service = services[serviceId];
      const serviceName = getServiceName(serviceId);
      
      Lampa.SettingsApi.addParam({
        component: "streaming_services",
        param: {
          name: service.enabled_key,
          type: "trigger",
          default: false
        },
        field: {
          name: serviceName
        },
        onChange: function (value) {
          const normalized = value === true || value === "true";
          const existing = $(`[data-action='streaming_${serviceId}']`);
          
          if (normalized) {
            if (!existing.length) addServiceMenuItem(serviceId);
          } else {
            removeServiceMenuItem(serviceId);
          }
        }
      });
    });

    window.streaming_services_ready = true;
  }

  if (window.appready) {
    init();
  } else {
    Lampa.Listener.follow("app", function (e) {
      if (e.type === "ready") init();
    });

    setTimeout(() => {
      if (!window.streaming_services_ready) init();
    }, 1000);
  }
})();
