import Window from './Window.js';
import AudioPlayer from './AudioPlayer.js';
// Import all the apps
import Terminal from './apps/Terminal.js';
import SnakeGame from './apps/SnakeGame.js';
import Notepad from './apps/Notepad.js';
import PFD from './apps/Radar.js'; 
import EasterEggs from './apps/EasterEggs.js';

/**
 * Manages the entire desktop environment, including icons, windows,
 * and global event listeners.
 */
class Desktop {
    constructor(desktopElement) {
        this.desktop = desktopElement;
        this.windows = new Map(); // Stores all Window instances
        this.activeApps = {}; // Stores instances of app logic
        this.iconStorageKey = 'paras-icon-positions';

        // Define icon-to-window mapping
        this.iconMap = {
            'icon-projects': 'window-projects',
            'icon-about': 'window-about',
            'icon-tribute': 'window-tribute',
            'icon-terminal': 'window-terminal',
            'icon-settings': 'window-settings',
            'icon-snake': 'window-snake',
            'icon-notepad': 'window-notepad',
            'icon-pfd': 'window-pfd', // Updated ID
            'icon-legal': 'window-legal',
            'icon-help': 'window-help'
        };
        
        this.isMobile = window.innerWidth <= 768;
        this.openEvent = this.isMobile ? 'click' : 'dblclick';
    }

    /**
     * Initializes the desktop, sets up all listeners.
     */
    init() {
        this.initWindows();
        this.initIcons();
        this.initThemeToggle();
        this.initKonamiCode();
        this.initEasterEggs();
        this.initConsoleLog();
        if (!this.isMobile) {
            this.initDraggableIcons();
        }
    }

    /**
     * Finds all window elements and creates Window objects for them.
     */
    initWindows() {
        const windowElements = this.desktop.querySelectorAll('.window');
        
        windowElements.forEach(el => {
            const windowInstance = new Window(el, this);
            this.windows.set(el.id, windowInstance);

            // Initialize app logic for specific windows
            const appId = el.id.replace('window-', '');
            if (appId === 'terminal') {
                this.activeApps.terminal = new Terminal(windowInstance);
            }
            if (appId === 'snake') {
                this.activeApps.snake = new SnakeGame(windowInstance);
            }
            if (appId === 'notepad') {
                this.activeApps.notepad = new Notepad(windowInstance);
            }
            if (appId === 'pfd') {
                this.activeApps.pfd = new PFD(windowInstance); 
            }
        });
    }

    /**
     * Sets up click listeners for all desktop and dock icons.
     */
    initIcons() {
        Object.keys(this.iconMap).forEach(iconId => {
            const icon = document.getElementById(iconId);
            const windowId = this.iconMap[iconId];
            const windowInstance = this.windows.get(windowId);

            if (icon && windowInstance) {
                // This is a flag to check if a drag happened
                icon.dataset.isDragging = 'false'; 
                
                icon.addEventListener(this.openEvent, (e) => {
                    // **CLICK BUG FIX**: Only open if not dragging
                    if (icon.dataset.isDragging === 'true') {
                        icon.dataset.isDragging = 'false';
                        return;
                    }
                    windowInstance.open();
                });
            }
        });
        
        // Dock icons
        document.querySelectorAll('.dock-icon').forEach(dockIcon => {
            const windowId = dockIcon.getAttribute('data-window');
            const windowInstance = this.windows.get(windowId);
            if (windowInstance) {
                dockIcon.addEventListener('click', () => {
                    windowInstance.open(); // `open` handles restore logic
                });
            }
        });
    }

    /**
     * Makes desktop icons draggable and saves their position.
     */
    initDraggableIcons() {
        const icons = document.querySelectorAll('.desktop-icons .icon');
        const savedPositions = JSON.parse(localStorage.getItem(this.iconStorageKey)) || {};
        const desktopPadding = 32; // 2rem

        // **ICON LAYOUT FIX**: Calculate default grid
        const iconHeight = 110; // 80px + 1.5rem gap
        const iconWidth = 90; // 80px + gap
        const iconsPerColumn = Math.max(1, Math.floor((this.desktop.clientHeight - desktopPadding * 2) / iconHeight));

        icons.forEach((icon, index) => {
            const iconId = icon.dataset.iconId;
            
            // 1. Set Initial Position
            if (savedPositions[iconId]) {
                icon.style.top = savedPositions[iconId].y;
                icon.style.left = savedPositions[iconId].x;
            } else {
                // **FIXED**: Default grid layout
                const col = Math.floor(index / iconsPerColumn);
                const row = index % iconsPerColumn;
                const top = desktopPadding + (row * iconHeight);
                const left = desktopPadding + (col * iconWidth);
                icon.style.top = `${top}px`;
                icon.style.left = `${left}px`;
            }

            let offset = { x: 0, y: 0 };
            let isDragging = false; // Local flag

            const onMouseDown = (e) => {
                if (e.button !== 0) return;
                
                isDragging = false; // Reset drag flag
                icon.classList.add('is-dragging'); // Add visual style
                
                offset.x = e.clientX - icon.offsetLeft;
                offset.y = e.clientY - icon.offsetTop;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e) => {
                isDragging = true; // **CLICK BUG FIX**: It's a drag now
                icon.dataset.isDragging = 'true'; // Set flag for click handler
                
                let newX = e.clientX - offset.x;
                let newY = e.clientY - offset.y;

                // Constrain to desktop bounds
                const maxX = this.desktop.clientWidth - icon.clientWidth - desktopPadding;
                const maxY = this.desktop.clientHeight - icon.clientHeight - desktopPadding;

                if (newX < desktopPadding) newX = desktopPadding;
                if (newY < desktopPadding) newY = desktopPadding;
                if (newX > maxX) newX = maxX;
                if (newY > maxY) newY = maxY;

                icon.style.left = `${newX}px`;
                icon.style.top = `${newY}px`;
            };

            const onMouseUp = () => {
                icon.classList.remove('is-dragging'); // Remove visual style
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (isDragging) {
                    // Save new position
                    savedPositions[iconId] = {
                        x: icon.style.left,
                        y: icon.style.top
                    };
                    localStorage.setItem(this.iconStorageKey, JSON.stringify(savedPositions));
                }
                
                // **CLICK BUG FIX**: Reset flag *after* click event fires
                setTimeout(() => {
                    icon.dataset.isDragging = 'false';
                }, 0);
            };

            icon.addEventListener('mousedown', onMouseDown);
        });
    }

    /**
     * Sets up the theme switcher in the Settings window.
     */
    initThemeToggle() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme;
        }
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(button => {
            const isActive = (button.getAttribute('data-theme') === savedTheme) || (!savedTheme && button.getAttribute('data-theme') === "");
            button.classList.toggle('active', isActive);
            button.addEventListener('click', () => {
                const theme = button.getAttribute('data-theme');
                document.body.className = theme;
                localStorage.setItem('theme', theme);
                themeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    /**
     * Sets up global listeners for Konami code (keys and swipes).
     */
    initKonamiCode() {
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let keySequence = [];
        const swipeCode = ['SwipeUp', 'SwipeUp', 'SwipeDown', 'SwipeDown', 'SwipeLeft', 'SwipeRight', 'SwipeLeft', 'SwipeRight', 'Tap', 'Tap'];
        let swipeSequence = [];
        let touchStartX = 0, touchStartY = 0;
        
        document.addEventListener('keydown', (e) => {
            keySequence.push(e.key);
            keySequence = keySequence.slice(-konamiCode.length);
            if (keySequence.join('') === konamiCode.join('')) {
                AudioPlayer.playKonamiReward();
                keySequence = [];
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            const minSwipeDist = 30;

            if (absDeltaX < minSwipeDist && absDeltaY < minSwipeDist) {
                swipeSequence.push('Tap');
            } else if (absDeltaX > absDeltaY) {
                swipeSequence.push(deltaX > 0 ? 'SwipeRight' : 'SwipeLeft');
            } else {
                swipeSequence.push(deltaY > 0 ? 'SwipeDown' : 'SwipeUp');
            }
            
            swipeSequence = swipeSequence.slice(-swipeCode.length);
            
            if (swipeSequence.join('') === swipeCode.join('')) {
                AudioPlayer.playKonamiReward();
                swipeSequence = [];
            }
        }, { passive: true });
    }

    /**
     * Initializes all other easter eggs.
     */
    initEasterEggs() {
        EasterEggs.initNameClick();
        EasterEggs.initHoverTributes();
    }
    
    /**
     * Prints the welcome message to the browser console.
     */
    initConsoleLog() {
        console.log(
            "%cHey, you found me!",
            "font-size: 1.5rem; color: #b4869f; font-family: 'Inter', sans-serif; font-weight: bold;"
        );
        console.log(
            "Thanks for checking out my site. You're clearly a curious person, just like my grandpa. - Paras"
        );
    }
    
    /**
     * Brings a specific window to the front.
     * @param {Window} windowInstance - The window to focus.
     */
    focusWindow(windowInstance) {
        this.windows.forEach(win => win.setInactive());
        windowInstance.setActive();
    }
}

export default Desktop;