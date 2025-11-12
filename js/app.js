import Desktop from './Desktop.js';
import AudioPlayer from './AudioPlayer.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const desktopElement = document.getElementById('desktop');
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.querySelector('.boot-screen p'); 
    
    if (desktopElement && bootScreen) {
        
        // Define the boot logic as an ASYNC function
        const startSystem = async () => {
            console.log("User interaction. Booting...");

            // 1. WAKE UP AUDIO ENGINE
            // We wait for this to finish before trying to play sounds
            await AudioPlayer.ensureContext();

            // 2. PLAY YOUR CHIME
            // (A5 -> C6 defined in AudioPlayer.js)
            AudioPlayer.playChime();

            // 3. UPDATE TEXT
            if (bootText) {
                bootText.innerText = "System Initialized. Welcome, Paras.";
                bootText.classList.remove('blink');
            }

            // 4. SHOW DESKTOP (Transition)
            setTimeout(() => {
                bootScreen.classList.add('hidden'); 
                desktopElement.classList.add('is-ready');
                
                const desktop = new Desktop(desktopElement);
                desktop.init();

                // Remove boot screen from DOM after fade
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                }, 1000);

            }, 1000); // 1s delay
        };

        // Listeners for that crucial first click
        bootScreen.addEventListener('click', startSystem, { once: true });
        window.addEventListener('keydown', startSystem, { once: true });
        window.addEventListener('touchstart', startSystem, { once: true });

    } else {
        console.error("Fatal: Main desktop or boot-screen element not found.");
    }
});