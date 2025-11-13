import Window from './Window.js';
import AudioPlayer from './AudioPlayer.js';
import Terminal from './apps/Terminal.js';
import SnakeGame from './apps/SnakeGame.js';
import Notepad from './apps/Notepad.js';
import Cockpit from './apps/Cockpit.js';
import FocusApp from './apps/Focus.js'; 
import EasterEggs from './apps/EasterEggs.js';

class Desktop {
    constructor(desktopElement) {
        this.desktop = desktopElement;
        this.windows = new Map();
        this.activeApps = {};
        this.iconStorageKey = 'paras-icon-positions';

        this.iconMap = {
            'icon-projects': 'window-projects',
            'icon-about': 'window-about',
            'icon-tribute': 'window-tribute',
            'icon-terminal': 'window-terminal',
            'icon-settings': 'window-settings',
            'icon-snake': 'window-snake',
            'icon-notepad': 'window-notepad',
            'icon-pfd': 'window-pfd',
            'icon-legal': 'window-legal',
            'icon-help': 'window-help',
            'icon-focus': 'window-focus'
        };
        
        this.openEvent = 'dblclick'; // Desktop standard
    }

    init() {
        this.initWindows();
        this.initIcons();
        this.initThemeToggle();
        this.initKonamiCode();
        this.initEasterEggs();
        this.initDraggableIcons();
        console.log("System Online. Welcome Captain.");
    }

    initWindows() {
        this.desktop.querySelectorAll('.window').forEach(el => {
            const win = new Window(el, this);
            this.windows.set(el.id, win);

            const appId = el.id.replace('window-', '');
            if (appId === 'terminal') this.activeApps.terminal = new Terminal(win);
            if (appId === 'snake') this.activeApps.snake = new SnakeGame(win);
            if (appId === 'notepad') this.activeApps.notepad = new Notepad(win);
            if (appId === 'pfd') this.activeApps.pfd = new Cockpit(win); 
            if (appId === 'focus') this.activeApps.focus = new FocusApp(win);
        });
    }

    initIcons() {
        Object.keys(this.iconMap).forEach(iconId => {
            const icon = document.getElementById(iconId);
            const windowId = this.iconMap[iconId];
            const win = this.windows.get(windowId);

            if (icon && win) {
                icon.dataset.isDragging = 'false';
                icon.addEventListener(this.openEvent, () => {
                    if (icon.dataset.isDragging === 'true') return;
                    
                    // Integrity Check for Snake
                    if (iconId === 'icon-snake') {
                        const integrity = parseInt(localStorage.getItem('paras-system-integrity') || 100);
                        if (integrity < 30) {
                            alert("⛔ SYSTEM INTEGRITY CRITICAL. Fun is cancelled.");
                            return;
                        }
                    }
                    win.open();
                });
            }
        });
        
        document.querySelectorAll('.dock-icon').forEach(icon => {
            const win = this.windows.get(icon.dataset.window);
            if (win) icon.addEventListener('click', () => win.open());
        });
    }

    initDraggableIcons() {
        const icons = document.querySelectorAll('.desktop-icons .icon');
        const savedPositions = JSON.parse(localStorage.getItem(this.iconStorageKey)) || {};
        const padding = 32;
        
        icons.forEach((icon, index) => {
            const id = icon.dataset.iconId;
            if (savedPositions[id]) {
                icon.style.top = savedPositions[id].y;
                icon.style.left = savedPositions[id].x;
            } else {
                // Vertical Column Grid
                icon.style.top = `${padding + (index % 6) * 100}px`;
                icon.style.left = `${padding + Math.floor(index / 6) * 90}px`;
            }

            let isDragging = false;
            let offset = {x:0, y:0};

            const onMouseDown = (e) => {
                isDragging = false;
                offset.x = e.clientX - icon.offsetLeft;
                offset.y = e.clientY - icon.offsetTop;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e) => {
                isDragging = true;
                icon.dataset.isDragging = 'true';
                icon.style.left = `${e.clientX - offset.x}px`;
                icon.style.top = `${e.clientY - offset.y}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (isDragging) {
                    savedPositions[id] = { x: icon.style.left, y: icon.style.top };
                    localStorage.setItem(this.iconStorageKey, JSON.stringify(savedPositions));
                    setTimeout(() => icon.dataset.isDragging = 'false', 0);
                }
            };
            icon.addEventListener('mousedown', onMouseDown);
        });
    }

    initThemeToggle() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) document.body.className = savedTheme;
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.body.className = theme;
                localStorage.setItem('theme', theme);
            });
        });
    }

    initKonamiCode() { /* ... */ }
    initEasterEggs() { EasterEggs.initNameClick(); EasterEggs.initHoverTributes(); }
    focusWindow(win) { this.windows.forEach(w => w.setInactive()); win.setActive(); }
}
export default Desktop;