// =========================================================================
// === Antigravity Granular Color Customizer (111 Themes Engine) ===
// =========================================================================

(function() {
    if (typeof window === 'undefined') return;
    if (window.__ANTIGRAVITY_COLORIZER_INITIALIZED__) return;
    window.__ANTIGRAVITY_COLORIZER_INITIALIZED__ = true;

    console.log('[Antigravity Mod] Initializing Granular Color Customizer...');

    const electron_1 = require("electron");

    // =====================================================================
    // 1. PALETTE DEFINITIONS & THEMES DATABASE
    // =====================================================================
    const DEFAULT_PALETTE = {
        sidebarBg: '#09090b',
        sidebarText: '#a1a1aa',
        sidebarActive: '#ffffff',
        chatBg: '#121215',
        userBubbleBg: '#27272a',
        userBubbleText: '#f4f4f5',
        userBubbleBorder: '#3f3f46',
        assistantText: '#f4f4f5',
        headingsText: '#60a5fa',
        codeBg: '#18181b',
        codeBorder: '#27272a',
        thoughtBg: '#18181b',
        inputBg: '#18181b',
        inputBorder: '#3f3f46',
        accentColor: '#3b82f6'
    };

    let currentPalette = { ...DEFAULT_PALETTE };
    let PRESETS = {};

    try {
        PRESETS = require('./themes.json');
    } catch (e) {
        PRESETS = {
            default: { name: '🖤 Стандартная (Тёмная)', group: 'IDE & Редакторы', colors: { ...DEFAULT_PALETTE } }
        };
    }

    // =====================================================================
    // 2. PERSISTENCE ENGINE (Native Storage IPC)
    // =====================================================================
    async function loadPaletteFromStorage() {
        try {
            const items = await electron_1.ipcRenderer.invoke('storage:get-items');
            if (items && items['agy_custom_palette_v1']) {
                const parsed = typeof items['agy_custom_palette_v1'] === 'string'
                    ? JSON.parse(items['agy_custom_palette_v1'])
                    : items['agy_custom_palette_v1'];
                currentPalette = { ...DEFAULT_PALETTE, ...parsed };
                applyPalette(currentPalette);
                styleDynamicElements();
                updateInputsUI();
            }
        } catch (e) {}
    }

    async function savePalette(pal) {
        currentPalette = { ...pal };
        try {
            await electron_1.ipcRenderer.invoke('storage:update-items', {
                'agy_custom_palette_v1': JSON.stringify(currentPalette)
            });
        } catch (e) {}

        applyPalette(currentPalette);
        styleDynamicElements();
    }

    // =====================================================================
    // 3. DYNAMIC STYLING & SELF-STYLING UI
    // =====================================================================
    function updateModalStyles(pal) {
        const modal = document.getElementById('agy-colorizer-modal');
        if (!modal) return;
        modal.style.setProperty('background', `${pal.sidebarBg}f5`, 'important');
        modal.style.setProperty('border', `1px solid ${pal.userBubbleBorder}`, 'important');
        modal.style.setProperty('color', pal.assistantText, 'important');
        
        const header = modal.querySelector('div:first-child');
        if (header) {
            header.style.setProperty('border-bottom', `1px solid ${pal.userBubbleBorder}60`, 'important');
            const titleSpan = header.querySelector('span:last-child');
            if (titleSpan) titleSpan.style.setProperty('color', pal.headingsText, 'important');
        }

        const presetBar = modal.querySelector('#agy-preset-select')?.parentElement;
        if (presetBar) {
            presetBar.style.setProperty('border-bottom', `1px solid ${pal.userBubbleBorder}60`, 'important');
        }

        const presetSelect = modal.querySelector('#agy-preset-select');
        if (presetSelect) {
            presetSelect.style.setProperty('background', pal.inputBg, 'important');
            presetSelect.style.setProperty('border', `1px solid ${pal.inputBorder}`, 'important');
            presetSelect.style.setProperty('color', pal.assistantText, 'important');
        }

        modal.querySelectorAll('#agy-color-list > div[style*="text-transform"]').forEach(gh => {
            gh.style.setProperty('color', pal.headingsText, 'important');
            gh.style.setProperty('border-bottom', `1px solid ${pal.userBubbleBorder}40`, 'important');
        });

        modal.querySelectorAll('input[type="text"]').forEach(inp => {
            inp.style.setProperty('background', pal.inputBg, 'important');
            inp.style.setProperty('border', `1px solid ${pal.inputBorder}`, 'important');
            inp.style.setProperty('color', pal.assistantText, 'important');
        });

        const saveBtn = modal.querySelector('#agy-save-btn');
        if (saveBtn) {
            saveBtn.style.setProperty('background', pal.accentColor, 'important');
            saveBtn.style.setProperty('color', '#ffffff', 'important');
        }

        const resetBtn = modal.querySelector('#agy-reset-btn');
        if (resetBtn) {
            resetBtn.style.setProperty('background', pal.inputBg, 'important');
            resetBtn.style.setProperty('border', `1px solid ${pal.inputBorder}`, 'important');
        }

        const colorBtn = document.getElementById('agy-colorizer-btn');
        if (colorBtn) {
            colorBtn.style.setProperty('color', pal.sidebarActive || pal.headingsText, 'important');
        }
    }

    function styleDynamicElements() {
        // Never interrupt active typing in prompt inputs
        if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable)) return;

        const pal = currentPalette;

        // 1. Target user message turn cards (with uploaded images/attachments)
        const userImages = document.querySelectorAll('main img[src*="media_"], main img[src*="user_uploaded"], main img[src*="blob:"]');
        userImages.forEach(img => {
            let p = img.parentElement;
            while (p && p.tagName !== 'MAIN') {
                if (p.classList && (p.className.includes('rounded') || p.className.includes('bg-') || p.className.includes('card') || p.className.includes('turn'))) {
                    if (p.dataset.agyUserStyled !== 'true') {
                        p.dataset.agyUserStyled = 'true';
                        p.style.setProperty('background-color', pal.userBubbleBg, 'important');
                        p.style.setProperty('border', `1px solid ${pal.userBubbleBorder}`, 'important');
                        p.querySelectorAll('div, p, span, strong').forEach(child => {
                            if (!child.querySelector('img')) {
                                child.style.setProperty('background-color', 'transparent', 'important');
                            }
                            child.style.setProperty('color', pal.userBubbleText, 'important');
                        });
                    }
                    break;
                }
                p = p.parentElement;
            }
        });

        // 2. Target text-only user message cards
        document.querySelectorAll('main > div, main div[class*="chat"] > div').forEach(card => {
            if (card.dataset.agyUserStyled === 'true') return;
            const isAssistant = card.querySelector('[data-testid*="tool"], pre, h1, h2, h3, button[title*="Copy"]');
            const isComposer = card.querySelector('textarea, [contenteditable="true"]') || card.closest('[class*="composer"]');
            if (!isAssistant && !isComposer && card.querySelector('p') && card.parentElement?.tagName !== 'BUTTON') {
                card.dataset.agyUserStyled = 'true';
                card.style.setProperty('background-color', pal.userBubbleBg, 'important');
                card.style.setProperty('border', `1px solid ${pal.userBubbleBorder}`, 'important');
                card.querySelectorAll('p, span, div').forEach(el => {
                    if (!el.querySelector('img')) {
                        el.style.setProperty('background-color', 'transparent', 'important');
                    }
                    el.style.setProperty('color', pal.userBubbleText, 'important');
                });
            }
        });

        // 3. Update Customizer Modal Component Styles
        updateModalStyles(pal);
    }

    function applyPalette(pal) {
        // Update TitleBar Overlay (Minimize, Maximize, Close buttons in Windows DWM)
        try {
            electron_1.ipcRenderer.invoke('window:set-title-bar-overlay', {
                color: pal.sidebarBg || pal.chatBg,
                symbolColor: pal.sidebarActive || pal.headingsText || '#ffffff'
            });
        } catch (e) {}

        // Reset styled markers so new colors apply instantly
        document.querySelectorAll('[data-agy-user-styled]').forEach(el => el.removeAttribute('data-agy-user-styled'));

        let styleTag = document.getElementById('agy-customizer-dynamic-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'agy-customizer-dynamic-style';
            document.head.appendChild(styleTag);
        }

        const css = `
            /* === AGY DYNAMIC CUSTOMIZER STYLES WITH ULTRA-SMOOTH ANIMATIONS === */
            
            /* Root CSS variable overrides for Tailwind & Radix UI */
            :root {
                --background: ${pal.chatBg} !important;
                --foreground: ${pal.assistantText} !important;
                --sidebar-bg: ${pal.sidebarBg} !important;
                --card: ${pal.userBubbleBg} !important;
                --card-foreground: ${pal.userBubbleText} !important;
                --popover: ${pal.sidebarBg} !important;
                --popover-foreground: ${pal.sidebarText} !important;
                --primary: ${pal.accentColor} !important;
                --primary-foreground: #ffffff !important;
                --secondary: ${pal.userBubbleBg} !important;
                --secondary-foreground: ${pal.userBubbleText} !important;
                --muted: ${pal.thoughtBg} !important;
                --muted-foreground: ${pal.sidebarText} !important;
                --accent: ${pal.accentColor} !important;
                --accent-foreground: #ffffff !important;
                --border: ${pal.userBubbleBorder} !important;
                --input: ${pal.inputBg} !important;
                --ring: ${pal.accentColor} !important;

                --agy-input-bg: ${pal.inputBg} !important;
                --agy-input-border: ${pal.inputBorder} !important;
            }

            /* 1. Global Smooth Micro-Interactions (60 FPS) */
            body, main, aside, header, [role="tooltip"], [data-radix-popper-content-wrapper] > div {
                transition: background-color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                            color 0.2s ease,
                            border-color 0.2s ease !important;
            }

            /* 2. Sidebar items smooth hover animations */
            aside button, [class*="sidebar"] button, aside a {
                transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
                border-radius: 6px !important;
            }
            aside button:hover, [class*="sidebar"] button:hover, aside a:hover {
                transform: translateX(2px);
                background-color: rgba(255,255,255,0.06) !important;
            }
            aside [class*="active"], [class*="sidebar"] [class*="active"], [aria-current="page"] {
                color: ${pal.sidebarActive} !important;
                font-weight: 600;
            }

            /* 3. Loading Overlay / Splash Screen */
            #loading-overlay, [class*="loading"], [class*="splash"] {
                background-color: ${pal.chatBg} !important;
                color: ${pal.assistantText} !important;
            }

            /* 4. Left Sidebar Navigation & Header */
            aside, [data-sidebar], [class*="sidebar"], header {
                background-color: ${pal.sidebarBg} !important;
                color: ${pal.sidebarText} !important;
            }
            aside button, [class*="sidebar"] button, aside a, header button, header span {
                color: ${pal.sidebarText} !important;
            }

            /* 5. Floating Popovers, Tooltips & Menus */
            [role="tooltip"], [data-radix-popper-content-wrapper] > div, [class*="popover"], [class*="tooltip"], [class*="dropdown"], [role="menu"] {
                background-color: ${pal.sidebarBg} !important;
                border: 1px solid ${pal.userBubbleBorder} !important;
                color: ${pal.sidebarText} !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                border-radius: 8px !important;
                animation: agyTooltipFade 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes agyTooltipFade {
                from { opacity: 0; transform: translateY(-4px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            [role="tooltip"] *, [class*="popover"] *, [class*="tooltip"] * {
                color: ${pal.sidebarText} !important;
            }
            [role="tooltip"] h1, [role="tooltip"] h2, [role="tooltip"] h3, [role="tooltip"] strong,
            [class*="popover"] h1, [class*="popover"] strong {
                color: ${pal.sidebarActive} !important;
            }

            /* 6. Main Chat Canvas & Background */
            body, main, [class*="chat-container"], [class*="canvas"] {
                background-color: ${pal.chatBg} !important;
            }

            /* 7. User Message Bubble */
            [data-message-author="user"], [data-testid*="user-message"], [data-role="user"] {
                background-color: ${pal.userBubbleBg} !important;
                color: ${pal.userBubbleText} !important;
                border: 1px solid ${pal.userBubbleBorder} !important;
                border-radius: 14px !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
            }

            /* 8. Assistant Text & Headings */
            main p, main li, main ol, main ul {
                color: ${pal.assistantText} !important;
            }
            main h1, main h2, main h3, main h4, main h5, main h6, main strong, main b {
                color: ${pal.headingsText} !important;
            }
            main a, main [class*="link"] {
                color: ${pal.accentColor} !important;
                transition: color 0.15s ease !important;
            }
            main a:hover {
                opacity: 0.85;
            }

            /* 9. Code Blocks with Smooth Hover */
            pre, pre code, [class*="code-block"], [class*="syntax"] {
                background-color: ${pal.codeBg} !important;
                border: 1px solid ${pal.codeBorder} !important;
                border-radius: 10px !important;
                transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
            }
            pre:hover, [class*="code-block"]:hover {
                border-color: ${pal.accentColor}80 !important;
                box-shadow: 0 4px 18px rgba(0,0,0,0.3) !important;
            }
            :not(pre) > code {
                background-color: ${pal.codeBg} !important;
                border: 1px solid ${pal.codeBorder} !important;
                color: ${pal.accentColor} !important;
                border-radius: 4px;
                padding: 1px 4px;
            }

            /* 10. Thought / Thinking Block & Action Pills */
            [data-testid*="thought"], [class*="thought-container"], [class*="reasoning-container"],
            summary, button:has(> span:contains("Worked")), button:has(> span:contains("Thought")) {
                background-color: ${pal.thoughtBg} !important;
                border: 1px solid ${pal.codeBorder} !important;
                border-radius: 8px !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }

            /* 11. Clean Seamless Pill Composer */
            form, [class*="prompt-input"], [class*="input-container"], [class*="composer"] {
                background-color: ${pal.inputBg} !important;
                border: 1px solid ${pal.inputBorder} !important;
                border-radius: 16px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
                transition: border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease !important;
            }
            form:focus-within, [class*="composer"]:focus-within {
                border-color: ${pal.accentColor} !important;
                box-shadow: 0 0 0 2px ${pal.accentColor}33, 0 8px 30px rgba(0,0,0,0.35) !important;
            }
            form div, [class*="composer"] div, div:has(> textarea), div:has(> [contenteditable="true"]) {
                background: transparent !important;
                background-color: transparent !important;
                border: none !important;
                border-color: transparent !important;
                box-shadow: none !important;
            }
            textarea, [contenteditable="true"] {
                background: transparent !important;
                background-color: transparent !important;
                color: ${pal.assistantText} !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                padding-top: 2px !important;
            }

            /* 12. Accent buttons & scrollbars */
            ::-webkit-scrollbar-thumb {
                background-color: ${pal.inputBorder} !important;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color: ${pal.accentColor}aa !important;
            }
        `;

        styleTag.textContent = css;
        updateModalStyles(pal);
    }

    // =====================================================================
    // 4. COLORIZER UI MODAL & TRIGGER BUTTON
    // =====================================================================
    const COLOR_ITEMS = [
        { key: 'sidebarBg', label: 'Фон сайдбара и кнопок окна', group: 'Сайдбар и Окно' },
        { key: 'sidebarText', label: 'Текст в сайдбаре и меню', group: 'Сайдбар и Окно' },
        { key: 'sidebarActive', label: 'Активный чат и кнопки окна', group: 'Сайдбар и Окно' },

        { key: 'chatBg', label: 'Общий фон чата и загрузки', group: 'Чат и Текст' },
        { key: 'assistantText', label: 'Основной текст ответов', group: 'Чат и Текст' },
        { key: 'headingsText', label: 'Заголовки и жирный текст', group: 'Чат и Текст' },

        { key: 'userBubbleBg', label: 'Фон твоих сообщений', group: 'Твои сообщения' },
        { key: 'userBubbleText', label: 'Текст твоих сообщений', group: 'Твои сообщения' },
        { key: 'userBubbleBorder', label: 'Рамка твоих сообщений', group: 'Твои сообщения' },

        { key: 'codeBg', label: 'Фон блоков кода', group: 'Код и Мысли' },
        { key: 'codeBorder', label: 'Рамки блоков кода', group: 'Код и Мысли' },
        { key: 'thoughtBg', label: 'Фон блока «Мысли» и действий', group: 'Код и Мысли' },

        { key: 'inputBg', label: 'Фон поля ввода (внутри)', group: 'Ввод и Акценты' },
        { key: 'inputBorder', label: 'Рамка поля ввода', group: 'Ввод и Акценты' },
        { key: 'accentColor', label: 'Акцентный цвет (кнопки, ссылки)', group: 'Ввод и Акценты' }
    ];

    function updateInputsUI() {
        const modal = document.getElementById('agy-colorizer-modal');
        if (!modal) return;
        COLOR_ITEMS.forEach(item => {
            const hexInput = modal.querySelector(`#hex-${item.key}`);
            const pickerInput = modal.querySelector(`#picker-${item.key}`);
            const val = currentPalette[item.key] || DEFAULT_PALETTE[item.key];
            if (hexInput) hexInput.value = val.toUpperCase();
            if (pickerInput) pickerInput.value = val;
        });
        updateModalStyles(currentPalette);
    }

    function createColorizerUI() {
        if (document.getElementById('agy-colorizer-btn')) return;

        // Find "Install IDE" button in header
        const allBtns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const ideBtn = allBtns.find(b => {
            const txt = (b.innerText || b.textContent || '').trim();
            return txt.includes('Install IDE');
        });

        const btn = document.createElement('button');
        btn.id = 'agy-colorizer-btn';
        btn.type = 'button';
        btn.innerHTML = '<span style="margin-right: 4px;">🎨</span><span>Цвета</span>';
        btn.title = 'Настроить цвета интерфейса (111 тем)';

        if (ideBtn && ideBtn.parentElement) {
            btn.className = ideBtn.className;
            btn.style.cssText = ideBtn.style.cssText;
            btn.style.cursor = 'pointer';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.padding = '4px 10px';
            btn.style.borderRadius = '6px';
            btn.style.fontSize = '12px';
            btn.style.fontWeight = '500';
            btn.style.userSelect = 'none';
            btn.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';

            ideBtn.style.display = 'none';
            ideBtn.parentElement.insertBefore(btn, ideBtn);
        } else {
            const headerRight = document.querySelector('header > div:last-child') || document.querySelector('header');
            if (headerRight) {
                btn.style.cssText = 'padding: 4px 10px; font-size: 12px; border-radius: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; cursor: pointer; display: inline-flex; align-items: center; margin-right: 8px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);';
                headerRight.prepend(btn);
            } else {
                return;
            }
        }

        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });

        // Settings Modal Panel
        let modal = document.getElementById('agy-colorizer-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'agy-colorizer-modal';
            modal.className = 'agy-colorizer-panel';
            modal.style.cssText = [
                'display: none',
                'position: fixed',
                'width: 380px',
                'max-height: 84vh',
                'backdrop-filter: blur(24px)',
                'border-radius: 14px',
                'box-shadow: 0 24px 60px rgba(0,0,0,0.8)',
                'z-index: 100000',
                'font-family: system-ui, -apple-system, sans-serif',
                'flex-direction: column',
                'overflow: hidden',
                'box-sizing: border-box',
                'transition: background 0.2s, border-color 0.2s'
            ].join(';');

            // Generate option tags
            let optHTML = '<option value="">-- Выбрать готовую тему (111 тем) --</option>';
            const grouped = {};
            for (const [k, v] of Object.entries(PRESETS)) {
                const grp = v.group || 'Темы';
                if (!grouped[grp]) grouped[grp] = [];
                grouped[grp].push({ key: k, name: v.name });
            }
            for (const [grp, list] of Object.entries(grouped)) {
                optHTML += `<optgroup label="✨ ${grp}">`;
                for (const item of list) {
                    optHTML += `<option value="${item.key}">${item.name}</option>`;
                }
                optHTML += `</optgroup>`;
            }

            modal.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.03);">
                    <div style="font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                        <span>🎨</span> <span>Цвета интерфейса (111 тем)</span>
                    </div>
                    <button id="agy-modal-close" style="background: none; border: none; color: inherit; opacity: 0.7; cursor: pointer; font-size: 16px; padding: 4px; line-height: 1; transition: opacity 0.15s ease;">✕</button>
                </div>
                
                <!-- Preset selection with categorized optgroups -->
                <div style="padding: 8px 16px; background: rgba(0,0,0,0.25); display: flex; gap: 6px; align-items: center;">
                    <span style="font-size: 11px; opacity: 0.8; font-weight: 600;">Пресет:</span>
                    <select id="agy-preset-select" style="flex: 1; border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 500; outline: none; cursor: pointer; transition: all 0.2s ease;">
                        ${optHTML}
                    </select>
                </div>

                <!-- Color controls list -->
                <div id="agy-color-list" style="padding: 10px 16px; overflow-y: auto; max-height: calc(84vh - 145px); display: flex; flex-direction: column; gap: 10px;">
                </div>

                <!-- Footer actions -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);">
                    <button id="agy-reset-btn" style="color: #ef4444; border-radius: 6px; padding: 5px 12px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s ease;">Сбросить всё</button>
                    <button id="agy-save-btn" style="border: none; border-radius: 6px; padding: 5px 16px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">Готово</button>
                </div>
            `;

            document.body.appendChild(modal);

            // Populate Color Rows
            const listContainer = modal.querySelector('#agy-color-list');
            let currentGroup = '';
            
            COLOR_ITEMS.forEach(item => {
                if (item.group !== currentGroup) {
                    currentGroup = item.group;
                    const groupHeader = document.createElement('div');
                    groupHeader.style.cssText = 'font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px; padding-bottom: 3px;';
                    groupHeader.innerText = currentGroup;
                    listContainer.appendChild(groupHeader);
                }

                const row = document.createElement('div');
                row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 8px;';

                const val = currentPalette[item.key] || DEFAULT_PALETTE[item.key] || '#ffffff';

                row.innerHTML = `
                    <span style="font-size: 12px; opacity: 0.9;">${item.label}</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <input type="text" id="hex-${item.key}" value="${val}" style="width: 65px; font-family: monospace; font-size: 11px; border-radius: 4px; padding: 3px 5px; text-transform: uppercase; transition: border-color 0.15s ease;">
                        <input type="color" id="picker-${item.key}" value="${val}" style="width: 26px; height: 24px; border: none; border-radius: 4px; background: transparent; cursor: pointer; padding: 0;">
                    </div>
                `;

                listContainer.appendChild(row);

                const hexInput = row.querySelector(`#hex-${item.key}`);
                const pickerInput = row.querySelector(`#picker-${item.key}`);

                pickerInput.addEventListener('input', (e) => {
                    const newColor = e.target.value;
                    hexInput.value = newColor.toUpperCase();
                    currentPalette[item.key] = newColor;
                    applyPalette(currentPalette);
                    styleDynamicElements();
                });

                pickerInput.addEventListener('change', () => {
                    savePalette(currentPalette);
                });

                hexInput.addEventListener('change', (e) => {
                    let hex = e.target.value.trim();
                    if (!hex.startsWith('#')) hex = '#' + hex;
                    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                        pickerInput.value = hex;
                        currentPalette[item.key] = hex;
                        savePalette(currentPalette);
                    }
                });
            });

            // Modal Handlers
            modal.querySelector('#agy-modal-close').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            modal.querySelector('#agy-save-btn').addEventListener('click', () => {
                savePalette(currentPalette);
                modal.style.display = 'none';
            });

            modal.querySelector('#agy-reset-btn').addEventListener('click', () => {
                savePalette(DEFAULT_PALETTE);
                updateInputsUI();
            });

            modal.querySelector('#agy-preset-select').addEventListener('change', (e) => {
                const key = e.target.value;
                if (PRESETS[key]) {
                    savePalette(PRESETS[key].colors);
                    updateInputsUI();
                }
            });
        }

        // Button Click -> Position and toggle modal nicely under the button
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('agy-colorizer-modal');
            if (!modal) return;
            const isVisible = modal.style.display === 'flex';
            if (isVisible) {
                modal.style.display = 'none';
            } else {
                updateInputsUI();
                const rect = btn.getBoundingClientRect();
                modal.style.top = (rect.bottom + 6) + 'px';
                modal.style.right = Math.max(16, (window.innerWidth - rect.right)) + 'px';
                modal.style.display = 'flex';
            }
        });
    }

    // =====================================================================
    // 5. OBSERVER & INITIALIZATION
    // =====================================================================
    let debounceTimer = null;
    function initAll() {
        loadPaletteFromStorage();
        applyPalette(currentPalette);
        styleDynamicElements();
        createColorizerUI();

        // Scope observer ONLY to main chat area
        const targetNode = document.querySelector('main') || document.body;

        const observer = new MutationObserver((mutations) => {
            // NEVER interrupt active typing
            if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || 
                document.activeElement.tagName === 'INPUT' || 
                document.activeElement.isContentEditable)) {
                return;
            }

            let hasNewContent = false;
            for (let i = 0; i < mutations.length; i++) {
                const m = mutations[i];
                if (m.target && m.target.closest && m.target.closest('form, textarea, [contenteditable="true"], .agy-colorizer-panel, #agy-colorizer-modal')) {
                    continue;
                }
                if (m.addedNodes.length > 0) {
                    hasNewContent = true;
                    break;
                }
            }

            if (hasNewContent) {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable)) return;
                    styleDynamicElements();
                    createColorizerUI();
                }, 500);
            }
        });

        if (targetNode) {
            observer.observe(targetNode, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
// =========================================================================
