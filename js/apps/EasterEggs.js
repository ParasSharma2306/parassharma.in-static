import AudioPlayer from '../AudioPlayer.js';

/**
 * A module to initialize various easter eggs.
 */
const EasterEggs = {
    
    /**
     * Initializes the 5-click-on-name easter egg.
     */
    initNameClick() {
        const nameEl = document.getElementById('paras-name-easter-egg');
        if (nameEl) {
            let nameClickCount = 0;
            nameEl.addEventListener('click', () => {
                nameClickCount++;
                if (nameClickCount === 5) {
                    nameEl.classList.add('is-shimmering');
                    AudioPlayer.playBloop();
                    setTimeout(() => {
                        nameEl.classList.remove('is-shimmering');
                    }, 1000);
                    nameClickCount = 0;
                }
            });
        }
    },

    /**
     * Initializes the hover-tribute easter egg.
     */
    initHoverTributes() {
        document.querySelectorAll('[data-hover-tribute]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                AudioPlayer.playChime();
            });
        });
    }
};

export default EasterEggs;