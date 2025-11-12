/**
 * Logic for the Notepad window.
 * Saves content to localStorage.
 */
class Notepad {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.textarea = document.getElementById('notepad-textarea');
        this.storageKey = 'paras-notepad-content';
        
        this.init();
    }

    init() {
        this.load();
        
        // Save on keyup, using throttling
        this.textarea.addEventListener('keyup', this.throttle(this.save, 500));
    }

    /**
     * Public method to load content (called on window focus).
     */
    start() {
        this.load();
        this.textarea.focus();
    }

    load = () => {
        const content = localStorage.getItem(this.storageKey);
        if (content) {
            this.textarea.value = content;
        }
    }

    save = () => {
        localStorage.setItem(this.storageKey, this.textarea.value);
    }

    /**
     * Utility to prevent saving on every single keystroke.
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

export default Notepad;