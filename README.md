# 🎨 Antigravity 2.0 only Granular Color Customizer (111 Pro Themes)

> **Глубокая кастомизация интерфейса Google Antigravity с библиотекой из 111 готовых дизайнерских тем, тонкой настройкой 15 зон UI и 60 FPS плавными анимациями.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows | macOS | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen.svg)](#)
[![Python: 3.x](https://img.shields.io/badge/Python-3.8+-yellow.svg)](#)

---

## ✨ Ключевые возможности

* **🎨 111 готовых дизайнерских тем** — разбиты по 8 категориям в удобном выпадающем списке (`<optgroup>`):
  * **IDE & Редакторы** (16 тем): *Dracula Pro, Tokyo Night, Atom One Dark, GitHub Dark, Monokai Pro, Nord Frost, Gruvbox, Material Palenight, Ayu, Night Owl, Shades of Purple, Cobalt2, JetBrains Darcula, Sublime...*
  * **Игровые & Киберпанк** (16 тем): *Cyberpunk 2077, The Witcher 3, DOOM Eternal, Fallout Pip-Boy 3000, Mass Effect N7, Elden Ring Erdtree, Half-Life Black Mesa, Portal Aperture, Starfield, BioShock Rapture, Hotline Miami 1989, Dark Souls Bonfire, Halo Spartan, Skyrim...*
  * **Дизайн-системы & Бренды** (14 тем): *Discord Nitro Blurple, Spotify Dark, Steam Deck Midnight, Slack Aubergine, Linear Luxe, Vercel Pure Monochrome, Supabase Emerald, Raycast Red, Figma Creative, Arc Space, Twitter/X Dim, Twitch Prime, Notion Charcoal, Apple macOS Sequoia...*
  * **Космос, Ночь & Галактики** (14 тем): *Andromeda Galaxy, Aurora Borealis, Supernova, Orion Nebula, Lunar Eclipse, Cosmic Void, Interstellar Dust, Martian Red Dune, Jupiter Storm, Milky Way, Solar Flare, Dark Matter, Pulsar Beam...*
  * **Природа & Биомы** (14 тем): *Emerald Matrix Rainforest, Sakura Midnight Cherry, Volcanic Magma, Mariana Trench, Autumn Maple, Glacier Ice, Bamboo Forest Zen, Sahara Dune, Lavender Provence, Coral Reef, Thunderstorm, Deep Moss, Toxic Lime...*
  * **Ретро, Синтвейв & Винтаж** (13 тем): *Synthwave 84 Sunset, Vaporwave 90s, IBM Amber CRT Terminal, Commodore 64, Steampunk Brass, 8-Bit Arcade, Matrix Green Phosphor, VHS Glitch, Sepia Parchment, Y2K Cyber Grunge, Mac System 7, Outrun Highway...*
  * **Минералы & Драгоценности** (13 тем): *Amethyst Crystal, Royal Ruby, Royal Sapphire, Luxury Gold, Luxury Rose Gold, Imperial Jade, Titanium Silver, Opal Shimmer, Antique Bronze, Turquoise Lagoon, Onyx Marble, Lapis Lazuli, Garnet Burgundy...*
  * **Пастельные & Светлые** (10 тем): *Catppuccin Latte, GitHub Light Clean, Rosé Pine Dawn, Matcha Latte Soft, Lavender Milk, Nordic Snow, Solarized Light, Peach Sorbet, Mint Macaron, Vanilla Cream...*
* **🛠️ 15 настраиваемых зон UI**:
  * Фон сайдбара, цвет текста сайдбара, активный чат
  * Общий фон чата, текст ответов, заголовки и жирный шрифт
  * Фон пузырей пользователя, цвет текста сообщений, рамка
  * Фон блоков кода, рамки кода, фон блока рассуждений (Мысли)
  * Фон поля ввода (внутри), рамка ввода, глобальный акцентный цвет
* **⚡ 0ms задержки и 60 FPS плавность**:
  * Аппаратный GPU-CSS рендеринг без лагов при наборе текста.
  * Плавные микро-анимации наведения, вылета модального окна и смены цветов.
* **🪟 Нативная интеграция Windows DWM**:
  * Нативные кнопки окна (`— ▢ ✕`) и экран загрузки («Loading Antigravity») автоматически синхронизируются с темой.
* **💾 100% Вечное сохранение**:
  * Сохранение прямо в нативное хранилище Electron `app_storage.json`. Темы не сбрасываются при перезапусках.

---

## 🚀 Быстрая установка (1 клик)

### 1. Склонируйте репозиторий:
```bash
git clone https://github.com/your-username/antigravity-color-customizer.git
cd antigravity-color-customizer
```

### 2. Запустите скрипт установки:
```bash
python install.py
```
> Скрипт автоматически найдёт `app.asar`, создаст резервную копию `app.asar.bak`, установит мод и запакует архив обратно без необходимости сторонних утилит.

### 3. Откройте Antigravity:
* В правом верхнем углу (вместо кнопки *Install IDE*) появится кнопка **`🎨 Цвета`**.
* Нажмите на неё, выберите любую тему из 111 вариантов или настройте свои цвета!

---

## 🔄 Удаление / Откат

Чтобы вернуть оригинальное состояние приложения:
```bash
python uninstall.py
```

---

## 📂 Структура проекта

```
antigravity-color-customizer/
├── README.md               # Документация и руководство
├── LICENSE                 # MIT Лицензия
├── install.py              # Автоматический кроссплатформенный установщик
├── uninstall.py            # Утилита отката к оригинальной версии
├── .gitignore              # Исключения временных файлов сборки
└── src/
    ├── customizer.js       # Ядро кастомизатора, CSS-инжектор и модальное окно
    └── themes.json         # Каталог из 111 про-тем в формате JSON
```

---

## 📄 Лицензия

Распространяется под лицензией [MIT](LICENSE). Свободно для модификации и использования.
