class AudioPlayer {
    constructor() {
        if (AudioPlayer.instance) return AudioPlayer.instance;

        this.audioCtx = null;
        
        // Create context immediately, but it will start in 'suspended' state
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {
            console.warn("Web Audio API not supported");
        }

        AudioPlayer.instance = this;
    }

    /**
     * Ensures the audio context is running. 
     * Must be called inside a click/keydown event.
     */
    async ensureContext() {
        if (!this.audioCtx) return;
        
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
            console.log("🔊 Audio Engine Woke Up. State:", this.audioCtx.state);
        }
    }

    /**
     * Plays a raw sound. No fancy fading. Just beep.
     */
    play(freq, duration, type = 'triangle', delay = 0) {
        if (!this.audioCtx) return;

        // Safety: If somehow we aren't running, try to resume (might fail if no user gesture)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(e => console.log("Auto-resume failed:", e));
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        // --- HARD VOLUME (No Fades) ---
        // Set volume to 30%. 
        gain.gain.value = 0.3; 

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        // Schedule play
        // We add 0.05s buffer to ensure we don't schedule in the past
        const now = this.audioCtx.currentTime;
        const startTime = now + delay + 0.05; 
        const endTime = startTime + duration;

        osc.start(startTime);
        osc.stop(endTime);
    }

    // --- PRESET SOUNDS ---

    playChime() {
        console.log("🎵 Playing Chime...");
        // C4 then C5
        this.play(261.63, 0.3, 'triangle', 0);
        this.play(523.25, 0.6, 'triangle', 0.3); 
    }

    playKonamiReward() {
        this.play(261.63, 0.1, 'square', 0);
        this.play(329.63, 0.1, 'square', 0.1);
        this.play(392.00, 0.1, 'square', 0.2);
        this.play(523.25, 0.2, 'square', 0.3);
    }

    playWindowOpen() {
        this.play(880, 0.1, 'sine'); // High Beep
    }

    playWindowMinimize() {
        this.play(440, 0.1, 'triangle'); // Mid Beep
    }

    playWindowClose() {
        this.play(220, 0.1, 'sawtooth'); // Low Beep
    }
    
    playBloop() {
        this.play(1046.50, 0.1, 'sine'); 
    }
}

export default new AudioPlayer();