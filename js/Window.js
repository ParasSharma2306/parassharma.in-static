import AudioPlayer from './AudioPlayer.js';

/**
 * Represents a single draggable, closable, minimizable window.
 */
class Window {
    constructor(element, desktop) {
        this.el = element;
        this.id = element.id;
        this.desktop = desktop; // Reference to the main Desktop class
        this.dockIcon = document.getElementById(this.el.getAttribute('data-dock-icon'));
        
        this.header = this.el.querySelector('.window-header');
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Store last position
        this.lastPosition = { 
            top: element.style.top || `${100 + Math.random() * 100}px`, 
            left: element.style.left || `${150 + Math.random() * 100}px` 
        };
        this.el.style.top = this.lastPosition.top;
        this.el.style.left = this.lastPosition.left;


        this.initControls();
        this.initDraggable();
    }

    /**
     * Sets up listeners for close, minimize, and maximize buttons.
     */
    initControls() {
        const closeBtn = this.el.querySelector('.btn-close');
        const minBtn = this.el.querySelector('.btn-min');
        const maxBtn = this.el.querySelector('.btn-max');

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }
        
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimize();
            });
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMaximize();
            });
        }
        
        this.el.addEventListener('mousedown', () => {
             this.desktop.focusWindow(this);
        }, { capture: true }); 
    }

    /**
     * Sets up listeners for dragging the window by its header.
     */
    initDraggable() {
        if (!this.header) return;

        const onMouseDown = (e) => {
            if (e.button !== 0 || this.desktop.isMobile || this.el.classList.contains('is-maximized')) {
                return;
            }
            
            this.isDragging = true;
            this.desktop.focusWindow(this);
            
            this.dragOffset.x = e.clientX - this.el.offsetLeft;
            this.dragOffset.y = e.clientY - this.el.offsetTop;
            
            this.header.style.cursor = 'grabbing';
            this.el.style.zIndex = 100; 
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!this.isDragging) return;

            let newX = e.clientX - this.dragOffset.x;
            let newY = e.clientY - this.dragOffset.y;
            
            // **BOUNDS FIX**: Constrain to 0,0 and parent width/height
            const maxX = this.desktop.desktop.clientWidth - this.el.clientWidth;
            const maxY = this.desktop.desktop.clientHeight - this.el.clientHeight;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX > maxX) newX = maxX;
            if (newY > maxY) newY = maxY;

            this.el.style.left = `${newX}px`;
            this.el.style.top = `${newY}px`;
        };

        const onMouseUp = () => {
            this.isDragging = false;
            this.header.style.cursor = 'grab';
            this.el.style.zIndex = this.el.classList.contains('is-active') ? 99 : 10;
            
            // Store last position
            this.lastPosition.top = this.el.style.top;
            this.lastPosition.left = this.el.style.left;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.header.addEventListener('mousedown', onMouseDown);
    }
    
    /**
     * Opens or restores the window.
     */
    open() {
        if (this.el.classList.contains('is-minimized')) {
            // Restore from minimized
            this.el.classList.remove('is-minimized');
            this.dockIcon?.classList.remove('is-minimized');
            // Restore to last known position
            this.el.style.top = this.lastPosition.top;
            this.el.style.left = this.lastPosition.left;
        } else {
            // Standard open
            this.el.style.display = 'block';
            this.el.classList.add('is-opening');
            AudioPlayer.playWindowOpen(); // Play sound
            setTimeout(() => this.el.classList.remove('is-opening'), 200);
        }
        this.desktop.focusWindow(this);
    }
    
    /**
     * Closes the window.
     */
    close() {
        this.el.style.display = 'none';
        this.el.classList.remove('is-maximized');
        this.setInactive();
        AudioPlayer.playWindowClose(); // Play sound
        
        // Notify app logic to stop
        const appId = this.id.replace('window-', '');
        this.desktop.activeApps[appId]?.stop?.();
    }
    
    /**
     * Minimizes the window.
     */
    minimize() {
        // Store position before minimizing
        this.lastPosition.top = this.el.style.top;
        this.lastPosition.left = this.el.style.left;

        this.el.classList.add('is-minimized');
        this.el.classList.remove('is-maximized');
        this.dockIcon?.classList.add('is-minimized');
        this.setInactive();
        AudioPlayer.playWindowMinimize(); // Play sound
        
        // Notify app logic to stop
        const appId = this.id.replace('window-', '');
        this.desktop.activeApps[appId]?.stop?.();
    }
    
    /**
     * Toggles the maximized state.
     */
    toggleMaximize() {
        const isMaximized = this.el.classList.toggle('is-maximized');
        
        if (isMaximized) {
            // Store position before maximizing
            this.lastPosition.top = this.el.style.top;
            this.lastPosition.left = this.el.style.left;
        } else {
            // Restore to last position
            this.el.style.top = this.lastPosition.top;
            this.el.style.left = this.lastPosition.left;
        }
        
        // Notify app logic to resize
        setTimeout(() => {
            const appId = this.id.replace('window-', '');
            this.desktop.activeApps[appId]?.onResize?.();
        }, 200);
    }

    /**
     * Sets the window to active state (front z-index, active dock).
     */
    setActive() {
        this.el.classList.add('is-active');
        this.el.style.zIndex = 99;
        this.dockIcon?.classList.add('is-active');
        
        // Notify app logic to start/focus
        const appId = this.id.replace('window-', '');
        this.desktop.activeApps[appId]?.start?.();
    }
    
    /**
     * Sets the window to inactive state.
     */
    setInactive() {
        this.el.classList.remove('is-active');
        this.el.style.zIndex = 10;
        this.dockIcon?.classList.remove('is-active');
    }
}

export default Window;