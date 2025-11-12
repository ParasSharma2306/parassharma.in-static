import AudioPlayer from '../AudioPlayer.js';

/**
 * Logic for the Snake Game window.
 */
class SnakeGame {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('snake-score');
        
        this.gridSize = 20;
        this.snake = [];
        this.food = {};
        this.score = 0;
        this.direction = 'right';
        this.gameLoop = null;
        this.touchStart = { x: 0, y: 0 };
        this.observer = null;

        this.init();
    }

    init() {
        // Observe resizing
        const contentArea = this.window.el.querySelector('.window-content');
        this.observer = new ResizeObserver(() => {
            if (this.gameLoop) {
                this.gameOver("Window resized. Focus to restart.");
            }
            this.resizeCanvas();
        });
        this.observer.observe(contentArea);
    }

    /**
     * Public method to start the game (called on window focus).
     */
    start() {
        this.stop(); // Clear previous game
        this.resizeCanvas(); // Set initial size

        this.snake = [{ x: 10, y: 10 }];
        this.food = this.spawnFood();
        this.score = 0;
        this.direction = 'right';
        this.scoreEl.textContent = 'Score: 0';
        
        this.gameLoop = setInterval(() => this.update(), 100); // 10 fps
        
        document.addEventListener('keydown', this.handleKeys);
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    /**
     * Public method to stop the game (on close, minimize).
     */
    stop() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.removeEventListener('keydown', this.handleKeys);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    /**
     * Public method to be called by Window on resize/maximize.
     */
    onResize() {
        if (this.gameLoop) {
            this.gameOver("Window resized. Focus to restart.");
        }
        this.resizeCanvas();
    }

    resizeCanvas() {
        const contentArea = this.window.el.querySelector('.window-content');
        this.canvas.width = contentArea.clientWidth;
        this.canvas.height = contentArea.clientHeight - 40; // - score height
        this.draw(); // Redraw immediately
    }

    update() {
        if (!this.gameLoop) return; // Stop if gameLoop was cleared

        const head = { ...this.snake[0] };
        if (this.direction === 'right') head.x++;
        if (this.direction === 'left') head.x--;
        if (this.direction === 'up') head.y--;
        if (this.direction === 'down') head.y++;

        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        
        // Wall collision
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            this.gameOver();
            return;
        }
        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Food collision
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreEl.textContent = `Score: ${this.score}`;
            this.food = this.spawnFood();
            AudioPlayer.play(523.25, 0.05, 'square'); // C5 eat
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.snake || this.snake.length === 0) return;

        // Draw snake
        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent-blue').trim();
        this.snake.forEach(part => {
            this.ctx.fillRect(part.x * this.gridSize, part.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });

        // Draw food
        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--close-btn').trim();
        if (this.food) {
            this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize, this.gridSize);
        }
    }

    spawnFood() {
        const gridWidth = Math.floor(this.canvas.width / this.gridSize);
        const gridHeight = Math.floor(this.canvas.height / this.gridSize);
        if (gridWidth <= 0 || gridHeight <= 0) return null; // Avoid errors on tiny canvas
        return {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
    }
    
    gameOver(message = `Game Over! Score: ${this.score}. Focusing to restart.`) {
        this.scoreEl.textContent = message;
        if (this.gameLoop) { // Only play sound if game was active
            AudioPlayer.play(261.63, 0.2, 'sawtooth'); // C4 lose
        }
        this.stop();
    }

    // --- Event Handlers (Bound to 'this') ---
    
    handleKeys = (e) => {
        if (!this.window.el.classList.contains('is-active')) return;
        
        if (e.key === 'ArrowUp' && this.direction !== 'down') { this.direction = 'up'; e.preventDefault(); }
        if (e.key === 'ArrowDown' && this.direction !== 'up') { this.direction = 'down'; e.preventDefault(); }
        if (e.key === 'ArrowLeft' && this.direction !== 'right') { this.direction = 'left'; e.preventDefault(); }
        if (e.key === 'ArrowRight' && this.direction !== 'left') { this.direction = 'right'; e.preventDefault(); }
    }
    
    handleTouchStart = (e) => {
        e.preventDefault();
        this.touchStart.x = e.changedTouches[0].screenX;
        this.touchStart.y = e.changedTouches[0].screenY;
    }
    
    handleTouchEnd = (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - this.touchStart.x;
        const deltaY = touchEndY - this.touchStart.y;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0 && this.direction !== 'left') this.direction = 'right';
            else if (deltaX < 0 && this.direction !== 'right') this.direction = 'left';
        } else {
            if (deltaY > 0 && this.direction !== 'up') this.direction = 'down';
            else if (deltaY < 0 && this.direction !== 'down') this.direction = 'up';
        }
    }
}

export default SnakeGame;