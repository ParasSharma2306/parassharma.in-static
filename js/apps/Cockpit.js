import DataManager from '../data/DataManager.js';

/**
 * A320neo High-Fidelity Glass Cockpit.
 * PFD: Attitude & System Integrity.
 * ND: Days remaining to Exam.
 */
class Cockpit {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.canvas = document.getElementById('pfd-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationFrame = null;
        this.roll = 0; this.pitch = 0;
        this.targetRoll = 0; this.targetPitch = 0;
        
        const contentArea = this.window.el.querySelector('.window-content');
        new ResizeObserver(() => this.resize()).observe(contentArea);
        this.resize();
    }

    start() { if (!this.animationFrame) this.draw(); }
    stop() { if (this.animationFrame) cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }

    resize() {
        const container = this.window.el.querySelector('.window-content');
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
    }

    draw = () => {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // Panel Background
        ctx.fillStyle = '#181818';
        ctx.fillRect(0, 0, w, h);

        // 3 Screens Layout: PFD | ECAM | ND
        const gap = 4;
        const bezel = 8;
        const screenW = (w - (4 * gap)) / 3;
        const screenH = h - (2 * gap);

        this.drawScreen(gap, gap, screenW, screenH, 'PFD');
        this.drawScreen(gap * 2 + screenW, gap, screenW, screenH, 'ECAM');
        this.drawScreen(gap * 3 + screenW * 2, gap, screenW, screenH, 'ND');

        this.updatePhysics();
        this.animationFrame = requestAnimationFrame(this.draw);
    }

    updatePhysics() {
        const integrity = parseInt(localStorage.getItem('paras-system-integrity') || 100);
        let factor = (100 - integrity) / 200; // Low integrity = turbulence
        if (factor < 0) factor = 0;

        if (Math.random() > 0.9) {
            this.targetRoll = (Math.random() - 0.5) * (factor * 60);
            this.targetPitch = (Math.random() - 0.5) * (factor * 20);
        }
        this.roll += (this.targetRoll - this.roll) * 0.05;
        this.pitch += (this.targetPitch - this.pitch) * 0.05;
    }

    drawScreen(x, y, w, h, type) {
        const ctx = this.ctx;
        
        // Bezel
        ctx.fillStyle = '#333';
        ctx.fillRect(x-4, y-4, w+8, h+8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, w, h);
        
        ctx.save();
        ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

        if (type === 'PFD') this.renderPFD(x, y, w, h);
        if (type === 'ECAM') this.renderECAM(x, y, w, h);
        if (type === 'ND') this.renderND(x, y, w, h);

        ctx.restore();
    }

    renderPFD(x, y, w, h) {
        const ctx = this.ctx;
        const cx = x + w/2; const cy = y + h/2;

        // Artificial Horizon
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.roll * Math.PI/180);
        ctx.translate(0, this.pitch * 4);
        
        ctx.fillStyle = '#0078D7'; ctx.fillRect(-w, -h, w*2, h); // Sky
        ctx.fillStyle = '#6B4226'; ctx.fillRect(-w, 0, w*2, h); // Ground
        ctx.strokeStyle = '#FFF'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-w,0); ctx.lineTo(w,0); ctx.stroke();
        ctx.restore();

        // Flight Director Crosshairs
        ctx.strokeStyle = '#0F0'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx-30, cy); ctx.lineTo(cx-10, cy); ctx.moveTo(cx+10, cy); ctx.lineTo(cx+30, cy);
        ctx.moveTo(cx, cy-20); ctx.lineTo(cx, cy-5); ctx.stroke();

        // FMA (Flight Mode Annunciator)
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x, y, w, 25);
        ctx.fillStyle = '#0F0'; ctx.font = 'bold 12px monospace'; ctx.fillText('MAN TOGA', x+10, y+18);
        
        // Speed Tape (Left)
        ctx.fillStyle = 'rgba(40,40,40,0.8)'; ctx.fillRect(x, y+30, 35, h-30);
        ctx.fillStyle = '#FFF'; ctx.font = '12px monospace'; ctx.fillText('250', x+5, cy);
        ctx.strokeStyle='#FF0'; ctx.beginPath(); ctx.moveTo(x+35, cy); ctx.lineTo(x+25, cy-5); ctx.lineTo(x+25, cy+5); ctx.closePath(); ctx.stroke();

        // Alt Tape (Right)
        ctx.fillStyle = 'rgba(40,40,40,0.8)'; ctx.fillRect(x+w-35, y+30, 35, h-30);
        ctx.fillStyle = '#FFF'; ctx.fillText('FL350', x+w-30, cy);
    }

    renderECAM(x, y, w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF'; ctx.font = '12px monospace'; ctx.fillText('E/WD', x+5, y+15);
        
        // N1 Gauges
        this.drawGauge(x+w/4, y+60, 20, 88.5, 'N1');
        this.drawGauge(x+w*0.75, y+60, 20, 88.5, 'N1');
        
        // EGT
        this.drawBar(x+w/4, y+100, 40, 6, 400, 'EGT');
        this.drawBar(x+w*0.75, y+100, 40, 6, 400, 'EGT');

        // MEMO
        const integrity = parseInt(localStorage.getItem('paras-system-integrity') || 100);
        ctx.fillStyle = '#0F0'; ctx.font='11px monospace';
        ctx.fillText('LDG GEAR ...... DN', x+10, y+h-60);
        ctx.fillText('SIGNS ......... ON', x+10, y+h-45);
        
        if(integrity < 40) {
            ctx.fillStyle = '#FFA500'; ctx.fillText('INTEGRITY ..... LOW', x+10, y+h-30);
        } else {
             ctx.fillStyle = '#0FF'; ctx.fillText('INTEGRITY ..... NORM', x+10, y+h-30);
        }
    }

    renderND(x, y, w, h) {
        const ctx = this.ctx;
        const cx = x + w/2; 
        const cy = y + h - 30;
        const daysLeft = DataManager.getDaysToExam();

        // Compass Arc
        ctx.strokeStyle = '#FFF'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cx, cy, w/2-10, Math.PI, 0); ctx.stroke();
        
        // Ticks
        for(let i=0; i<=180; i+=30) {
             const rad = (Math.PI) + (i * Math.PI/180);
             const tx = cx + (w/2 - 10) * Math.cos(rad);
             const ty = cy + (w/2 - 10) * Math.sin(rad);
             ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); 
             // just drawing lines from center looks like VOR mode
             // let's just draw ticks on edge
             const ix = cx + (w/2 - 20) * Math.cos(rad);
             const iy = cy + (w/2 - 20) * Math.sin(rad);
             ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(tx, ty); ctx.stroke();
        }

        // Plane Symbol
        ctx.strokeStyle = '#FF0'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(cx, cy-5); ctx.lineTo(cx-8, cy+10); ctx.lineTo(cx+8, cy+10); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy-5); ctx.lineTo(cx, cy-25); ctx.stroke(); // Line ahead

        // Route to Exam
        ctx.strokeStyle = '#0F0'; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(cx, cy-25); ctx.lineTo(cx + 30, y+40); ctx.stroke(); ctx.setLineDash([]);

        // Waypoint Info
        ctx.fillStyle = '#F0F'; ctx.font = 'bold 12px monospace';
        ctx.fillText('WPT: 20 FEB', x + w - 80, y + 20);
        
        ctx.fillStyle = '#FFF';
        ctx.fillText(`DIST: ${daysLeft} NM`, x + w - 80, y + 35);
        ctx.fillStyle = '#0FF';
        ctx.fillText(`ETA: 09:00`, x + w - 80, y + 50);
        
        ctx.fillStyle = '#0F0'; ctx.font='10px monospace';
        ctx.fillText('GS 420', x+5, y+20);
        ctx.fillText('TAS 450', x+5, y+35);
    }

    drawGauge(x, y, r, val, label) {
        const ctx = this.ctx;
        ctx.strokeStyle='#555'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI); ctx.stroke();
        ctx.strokeStyle='#0F0'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,r, -Math.PI/2, -Math.PI/2 + (val/100)*Math.PI*1.5); ctx.stroke();
        ctx.fillStyle='#FFF'; ctx.textAlign='center'; ctx.fillText(val, x, y+4);
        ctx.font='10px monospace'; ctx.fillText(label, x, y-r-5);
    }
    
    drawBar(x, y, w, h, val, label) {
        // horizontal bar for EGT
        const ctx = this.ctx;
        ctx.fillStyle='#555'; ctx.fillRect(x-w/2, y, w, h);
        ctx.fillStyle='#0F0'; ctx.fillRect(x-w/2, y, w*0.8, h); // static 80%
        ctx.fillStyle='#FFF'; ctx.fillText(label, x, y+h+10);
    }
}
export default Cockpit;