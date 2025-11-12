/**
 * A singleton class to manage the Web Audio API context
 * and play sounds.
 */
class AudioPlayer {
    constructor() {
        if (AudioPlayer.instance) {
            return AudioPlayer.instance;
        }
        // Try to create context
        try {
             this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser.");
            this.audioCtx = null;
        }
       
        AudioPlayer.instance = this;
    }

    /**
     * Plays a sound with a given frequency, duration, type, and delay.
     */
    play(freq, duration, type = 'square', delay = 0) {
        if (!this.audioCtx) return;
        
        // Resume context if it's suspended (e.g., on user interaction)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        setTimeout(() => {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain(); 
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            // Set initial volume
            gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime); // Lowered volume
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration - 0.01);

            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + duration);
        }, delay);
    }

    /**
     * Plays the Konami reward chime.
     */
    playKonamiReward() {
        console.log("Konami Code Activated!");
        const baseFreq = 261.63; // C4
        const fifth = baseFreq * 1.5; // G4
        const octave = baseFreq * 2; // C5
        const majThird = baseFreq * 1.25; // E4
        
        this.play(baseFreq, 0.1, 'triangle', 0);
        this.play(majThird, 0.1, 'triangle', 100);
        this.play(fifth, 0.1, 'triangle', 200);
        this.play(octave, 0.1, 'triangle', 300);
        this.play(octave * 1.5, 0.2, 'sine', 450);
        this.play(octave * 2, 0.3, 'sine', 500);
    }

    /**
     * Plays a simple "bloop" sound.
     */
    playBloop() {
        this.play(1046.50, 0.1, 'sine'); // C6
    }

    /**
     * Plays a gentle "chime" sound.
     */
    playChime() {
        this.play(880.00, 0.2, 'sine'); // A5
        this.play(1046.50, 0.2, 'sine', 100); // C6
    }

    // --- UI Sounds ---

    /**
     * Plays a "window open" sound.
     */
    playWindowOpen() {
        this.play(880, 0.05, 'sine'); // A5
    }

    /**
     * Plays a "window minimize" sound.
     */
    playWindowMinimize() {
        this.play(440, 0.05, 'triangle'); // A4
    }

    /**
     * Plays a "window close" sound.
     */
    playWindowClose() {
        this.play(220, 0.05, 'sawtooth'); // A3
    }
}

// Export a single instance of the AudioPlayer
export default new AudioPlayer();