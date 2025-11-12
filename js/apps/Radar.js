/**
 * Logic for the PFD (Primary Flight Display) window.
 */
class PFD {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.canvas = document.getElementById('pfd-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.observer = null;
        this.animationFrame = null;
        
        // Flight parameters
        this.roll = 0;
        this.pitch = 0;
        this.speed = 250;
        this.altitude = 10000;
        this.heading = 360;

        // Animation targets
        this.targetRoll = 0;
        this.targetPitch = 0;

        this.init();
    }

    init() {
        const contentArea = this.window.el.querySelector('.window-content');
        this.observer = new ResizeObserver(this.onResize);
        this.observer.observe(contentArea);
        
        // Randomize initial targets
        this.updateTargets();
    }

    /**
     * Public method to start animation (called on window focus).
     */
    start() {
        this.onResize(); // Set initial size
        if (!this.animationFrame) {
            this.draw();
        }
    }

    /**
     * Public method to stop animation (on close, minimize).
     */
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * Public method to be called by Window on resize/maximize.
     */
    onResize = () => {
        const container = this.window.el.querySelector('.window-content');
        if (!container) return;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        if (!this.animationFrame && this.window.el.classList.contains('is-active')) {
            this.draw();
        }
    }

    /**
     * Main animation loop
     */
    draw = () => {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const center = { x: w / 2, y: h / 2 };
        
        // Update simulated values
        const now = Date.now();
        this.altitude += Math.sin(now / 5000) * 0.5;
        this.speed += Math.cos(now / 3000) * 0.1;
        this.heading = (this.heading + 0.05) % 360;
        
        // Smoothly interpolate pitch and roll
        this.roll += (this.targetRoll - this.roll) * 0.02;
        this.pitch += (this.targetPitch - this.pitch) * 0.02;

        // Check if targets are met
        if (Math.abs(this.targetRoll - this.roll) < 0.1 && Math.abs(this.targetPitch - this.pitch) < 0.1) {
            this.updateTargets();
        }

        // --- Start Drawing ---
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, w, h);

        // 1. Draw Attitude Indicator (ADI)
        this.drawADI(center, w, h);

        // 2. Draw Tapes
        this.drawSpeedTape(w, h);
        this.drawAltitudeTape(w, h);
        
        // 3. Draw Heading
        this.drawHeading(w, h);
        
        // 4. Draw static aircraft symbol
        this.drawAircraftSymbol(center);

        this.animationFrame = requestAnimationFrame(this.draw);
    }

    updateTargets() {
        this.targetRoll = (Math.random() - 0.5) * 60; // +/- 30 degrees roll
        this.targetPitch = (Math.random() - 0.5) * 20; // +/- 10 degrees pitch
    }

    drawADI(center, w, h) {
        const pixelsPerDegree = 10;
        const rollRad = this.roll * (Math.PI / 180);
        
        this.ctx.save();
        
        // Clip to a circle
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, h * 0.4, 0, 2 * Math.PI);
        this.ctx.clip();

        // Rotate canvas for roll
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(rollRad);
        this.ctx.translate(-center.x, -center.y);
        
        // Calculate pitch translation
        const pitchOffset = this.pitch * pixelsPerDegree;
        this.ctx.translate(0, pitchOffset);

        // Draw Sky
        this.ctx.fillStyle = '#007FFF'; // Bright blue
        this.ctx.fillRect(center.x - w, center.y - h, w * 2, h);
        
        // Draw Ground
        this.ctx.fillStyle = '#8B4513'; // Brown
        this.ctx.fillRect(center.x - w, center.y, w * 2, h);

        // Draw Horizon Line
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - w, center.y);
        this.ctx.lineTo(center.x + w, center.y);
        this.ctx.stroke();

        // Draw Pitch Ladder
        this.ctx.lineWidth = 2;
        for (let i = -90; i <= 90; i += 5) {
            if (i === 0) continue;
            const y = center.y - i * pixelsPerDegree;
            const width = (i % 10 === 0) ? 100 : 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(center.x - width / 2, y);
            this.ctx.lineTo(center.x + width / 2, y);
            this.ctx.stroke();
            
            if (i % 10 === 0) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.font = '14px Source Code Pro';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(Math.abs(i), center.x - width / 2 - 10, y + 5);
                this.ctx.textAlign = 'left';
                this.ctx.fillText(Math.abs(i), center.x + width / 2 + 10, y + 5);
            }
        }
        
        this.ctx.restore();
    }
    
    drawAircraftSymbol(center) {
        this.ctx.strokeStyle = '#FFFF00'; // Bright Yellow
        this.ctx.lineWidth = 4;
        
        // Main wings
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - 80, center.y);
        this.ctx.lineTo(center.x - 30, center.y);
        this.ctx.lineTo(center.x - 20, center.y + 10); // Winglet
        this.ctx.moveTo(center.x + 80, center.y);
        this.ctx.lineTo(center.x + 30, center.y);
        this.ctx.lineTo(center.x + 20, center.y + 10); // Winglet
        
        // Center dot
        this.ctx.moveTo(center.x, center.y);
        this.ctx.arc(center.x, center.y, 4, 0, 2 * Math.PI);
        
        this.ctx.stroke();
    }

    drawSpeedTape(w, h) {
        const tapeWidth = 60;
        const tapeX = w * 0.15;
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.fillRect(tapeX - tapeWidth / 2, h * 0.2, tapeWidth, h * 0.6);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Source Code Pro';
        this.ctx.textAlign = 'center';
        
        const pixelsPerKnot = 5;
        const currentSpeed = Math.round(this.speed);
        
        // Draw Ticks
        for (let i = -10; i <= 10; i++) {
            const speedVal = Math.round(currentSpeed / 10) * 10 + i * 10;
            const yOffset = (currentSpeed - speedVal) * pixelsPerKnot;
            const y = h / 2 + yOffset;
            
            if (y > h * 0.2 && y < h * 0.8) {
                this.ctx.beginPath();
                this.ctx.moveTo(tapeX + 10, y);
                this.ctx.lineTo(tapeX + 20, y);
                this.ctx.stroke();
                this.ctx.fillText(speedVal, tapeX - 10, y + 5);
            }
        }
        
        // Pointer
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.moveTo(tapeX + 20, h / 2);
        this.ctx.lineTo(tapeX + 30, h / 2 - 5);
        this.ctx.lineTo(tapeX + 30, h / 2 + 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(currentSpeed, tapeX + 20, h / 2 + 6);

    }
    
    drawAltitudeTape(w, h) {
        const tapeWidth = 60;
        const tapeX = w * 0.85;
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.fillRect(tapeX - tapeWidth / 2, h * 0.2, tapeWidth, h * 0.6);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Source Code Pro';
        this.ctx.textAlign = 'center';
        
        const pixelsPer100Ft = 10;
        const currentAlt = Math.round(this.altitude);
        
        for (let i = -10; i <= 10; i++) {
            const altVal = Math.round(currentAlt / 100) * 100 + i * 100;
            const yOffset = (currentAlt - altVal) * (pixelsPer100Ft / 100);
            const y = h / 2 + yOffset;
            
            if (y > h * 0.2 && y < h * 0.8) {
                this.ctx.beginPath();
                this.ctx.moveTo(tapeX - 10, y);
                this.ctx.lineTo(tapeX - 20, y);
                this.ctx.stroke();
                this.ctx.fillText(altVal, tapeX + 10, y + 5);
            }
        }
        
        // Pointer
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.moveTo(tapeX - 20, h / 2);
        this.ctx.lineTo(tapeX - 30, h / 2 - 5);
        this.ctx.lineTo(tapeX - 30, h / 2 + 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(currentAlt, tapeX - 20, h / 2 + 6);
    }
    
    drawHeading(w, h) {
        const tapeHeight = 40;
        const tapeY = h * 0.85;
        const tapeWidth = w * 0.6;
        const tapeX = w / 2 - tapeWidth / 2;
        
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.fillRect(tapeX, tapeY, tapeWidth, tapeHeight);
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(tapeX, tapeY, tapeWidth, tapeHeight);
        this.ctx.clip();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Source Code Pro';
        this.ctx.textAlign = 'center';
        
        const pixelsPerDeg = 5;
        const currentHeading = this.heading;
        const labels = { 0: 'N', 360: 'N', 90: 'E', 180: 'S', 270: 'W' };
        
        for (let i = -45; i <= 45; i++) {
            let headingVal = Math.round(currentHeading) + i;
            if (headingVal < 0) headingVal += 360;
            if (headingVal > 360) headingVal -= 360;
            
            const xOffset = (i) * pixelsPerDeg;
            const x = w / 2 + xOffset;
            
            if (headingVal % 10 === 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, tapeY);
                this.ctx.lineTo(x, tapeY + 20);
                this.ctx.stroke();
                
                let label = labels[headingVal] || (headingVal % 30 === 0 ? headingVal / 10 : '');
                this.ctx.fillText(label, x, tapeY + 35);
            } else if (headingVal % 5 === 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, tapeY);
                this.ctx.lineTo(x, tapeY + 10);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
        
        // Pointer
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.beginPath();
        this.ctx.moveTo(w / 2, tapeY);
        this.ctx.lineTo(w / 2 - 5, tapeY - 5);
        this.ctx.lineTo(w / 2 + 5, tapeY - 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(Math.round(currentHeading), w/2, tapeY - 10);
    }
}

export default PFD;