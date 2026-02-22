# Дослідження: фокус пультом на екрані з фільтрами (Показати ще)

## Проблема
На екрані «Показати ще» (streaming_view) після закриття діалогу фільтра (жанр/країна/тег) фокус не повертається на хедер з кнопками — пультом не вдається знову вибрати фільтри.

## Що перевірено

### 1. Плагін nc.js (https://lampame.github.io/main/nc/nc.js)
- **Підхід:** власний компонент (не InteractionCategory), у `start()` реєструють контролер:
  `Lampa.Controller.add('content', { toggle: function() { collectionSet(header, scroll); collectionFocus(last||false, header, scroll); }, left, right, up, down, back })`.
- **Важливо:** кожен виклик `toggle('content')` (зокрема після закриття Select по Back) знову виконує `collectionSet` і `collectionFocus` — колекція й фокус оновлюються.
- У нас: ми розширюємо `Lampa.InteractionCategory`, тому не можемо повністю замінити `start()`. Робимо патч: після `originalStart()` замінюємо `toggle` контролера `content` на обгортку, яка викликає `applyStreamingViewCollection(true)` і потім оригінальний `toggle`.

### 2. Можливі причини, чому не працювало
- **Час патчу:** `Controller.enabled()` одразу після `originalStart()` могла повертати ще не `content` (наприклад `head`/`menu`). Додано затримку 50 ms перед патчем.
- **Перший аргумент collectionFocus:** у nc.js передають `last` (останній сфокусований елемент) або `false`. Спробовано передавати перший `.selector` у хедері замість `true`.
- **Контекст:** у обгортці `toggle` використовується `prevToggle.call(self)`, щоб не губити контекст компонента.

### 3. Джерела Lampa
- Репозиторій yumata/lampa-source (index, plugins, public, src) — відкритий код контролера/колекцій у публічному репо не знайдено (немає згадок collectionSet у пошуку).
- Документація DeepWiki згадує plugin API, але без деталей Controller.

### 4. Що зроблено в плагіні
- З головної сторінки (категорії) прибрано ряд з фільтрами — лишаються лише ряди категорій.
- На екрані «Показати ще» залишаються хедер з фільтрами і логіка: `scheduleCollectionApply`, патч `toggle` з затримкою 50 ms, у `applyStreamingViewCollection` — фокус на перший `.selector` у хедері (якщо focusHeader).
- При поверненні з Select викликається `onReturnFocus` (через 200 ms), який також викликає `applyStreamingViewCollection(true)` і `scheduleCollectionApply()`.

## Як перевірити далі
- На пристрої з пультом: відкрити «Показати ще», відкрити фільтр (жанр/країна/тег), натиснути Back — чи фокус повертається на хедер.
- Якщо ні — перевірити в Lampa (devtools), чи після `originalStart()` активний контролер має `name === 'content'`, і чи наш патч дійсно застосовується до нього.
