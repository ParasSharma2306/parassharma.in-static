/**
 * A singleton class to manage the Web Audio API context.
 * Optimized for immediate playback and volume visibility.
 */
class AudioPlayer {
    constructor() {
        if (AudioPlayer.instance) {
            return AudioPlayer.instance;
        }
        
        this.audioCtx = null;
        
        // 1. Initialize Context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio API is not supported.");
        }
        
        AudioPlayer.instance = this;
    }

    /**
     * CRITICAL: Must be called inside a user interaction event (click).
     * Wakes up the audio engine.
     */
    async ensureContext() {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
            console.log("🔊 Audio Engine Resumed.");
        }
    }

    /**
     * Plays a sound.
     * UPGRADES:
     * 1. Volume boosted to 0.5 (was 0.2)
     * 2. Uses Web Audio Clock (accurate) instead of setTimeout (laggy)
     */
    play(freq, duration, type = 'square', delayMs = 0) {
        if (!this.audioCtx) return;

        // Convert ms delay to seconds for Web Audio API
        const delaySec = delayMs / 1000;
        const startTime = this.audioCtx.currentTime + delaySec;
        const endTime = startTime + duration;

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, startTime);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // --- VOLUME & FADE ---
        // Start at 0 (silence) to avoid popping
        gainNode.gain.setValueAtTime(0, startTime);
        // Attack: Go to 50% volume quickly (0.02s)
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
        // Release: Fade to silence at end
        gainNode.gain.linearRampToValueAtTime(0.001, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
    }

    // --- SPECIFIC SOUNDS ---

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

    playBloop() {
        this.play(1046.50, 0.1, 'sine'); // C6
    }

    playChime() {
        // original chime (A5 then C6)
        this.play(880.00, 0.2, 'sine', 0);   // A5
        this.play(1046.50, 0.2, 'sine', 100); // C6
    }

    // --- UI Sounds ---

    playWindowOpen() {
        this.play(880, 0.05, 'sine'); // A5
    }

    playWindowMinimize() {
        this.play(440, 0.05, 'triangle'); // A4
    }

    playWindowClose() {
        this.play(220, 0.05, 'sawtooth'); // A3
    }
}

export default new AudioPlayer();