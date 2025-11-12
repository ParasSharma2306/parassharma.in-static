// Import the main Desktop class
import Desktop from './Desktop.js';
import AudioPlayer from './AudioPlayer.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    const desktopElement = document.getElementById('desktop');
    const bootScreen = document.getElementById('boot-screen');
    
    if (desktopElement && bootScreen) {
        
        // 1. Play boot sound
        AudioPlayer.play(261.63, 0.2, 'sine', 0); // C4
        AudioPlayer.play(523.25, 0.4, 'sine', 200); // C5
        
        // 2. Hide boot screen after a delay
        setTimeout(() => {
            bootScreen.classList.add('is-hidden');
            desktopElement.classList.add('is-ready');
            
            // 3. Initialize the Desktop *after* it's visible
            const desktop = new Desktop(desktopElement);
            desktop.init();

        }, 2000); // 2-second boot time

    } else {
        console.error("Fatal: Main desktop or boot-screen element not found.");
    }

});