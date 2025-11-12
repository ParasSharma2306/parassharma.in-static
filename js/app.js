import Desktop from './Desktop.js';
import AudioPlayer from './AudioPlayer.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const desktopElement = document.getElementById('desktop');
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.querySelector('.boot-screen p'); 
    
    if (desktopElement && bootScreen) {
        
        // Note the 'async' keyword here!
        const startSystem = async () => {
            console.log("User interaction detected. Initializing...");

            // 1. WAITING for Audio Engine to wake up
            try {
                await AudioPlayer.ensureContext();
                console.log("Audio Engine Ready.");
            } catch (err) {
                console.error("Audio failed to start:", err);
            }

            // 2. Play Sound (Now we know engine is ready)
            // We call the specific playChime function we made
            AudioPlayer.playChime();

            // 3. Visual Feedback
            if (bootText) {
                bootText.innerText = "System Initialized.";
                bootText.classList.remove('blink');
            }

            // 4. Transition to Desktop
            setTimeout(() => {
                bootScreen.classList.add('hidden'); 
                desktopElement.classList.add('is-ready');
                
                const desktop = new Desktop(desktopElement);
                desktop.init();

                setTimeout(() => {
                    bootScreen.style.display = 'none';
                }, 1000);

            }, 1000); 
        };

        // Listeners
        bootScreen.addEventListener('click', startSystem, { once: true });
        window.addEventListener('keydown', startSystem, { once: true });
        window.addEventListener('touchstart', startSystem, { once: true });

    } else {
        console.error("Elements not found.");
    }
});