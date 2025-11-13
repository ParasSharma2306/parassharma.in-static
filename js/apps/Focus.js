import DataManager from '../data/DataManager.js';
import AudioPlayer from '../AudioPlayer.js';

class FocusApp {
    constructor(windowInstance) {
        this.window = windowInstance;
        
        // Targeting the IDs from YOUR HTML
        this.taskListEl = document.getElementById('focus-task-list');
        this.timerEl = document.getElementById('focus-timer-display');
        this.startBtn = document.getElementById('focus-start-btn');
        this.quoteEl = document.getElementById('focus-quote');
        
        this.timer = null;
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.audioCtx = null;
        this.noiseNode = null;

        this.init();
    }

    init() {
        this.renderUI();
        this.setupListeners();
        window.addEventListener('focus-data-update', () => this.renderUI());
    }

    renderUI() {
        if (this.quoteEl && this.quoteEl.innerText === '"Loading inspiration..."') {
            this.quoteEl.innerText = `"${DataManager.getRandomQuote()}"`;
        }
        this.renderTasks();
    }

    renderTasks() {
        if (!this.taskListEl) return;
        this.taskListEl.innerHTML = '';

        const syllabus = DataManager.getSyllabus();
        const categories = [...new Set(syllabus.map(t => t.category))];

        categories.forEach(cat => {
            const group = document.createElement('div');
            group.className = 'task-group';
            
            // Header
            const header = document.createElement('div');
            header.className = 'group-header';
            header.innerHTML = `<h3>${cat}</h3>`;
            
            // Delete Subject Button
            const delSubBtn = document.createElement('button');
            delSubBtn.innerText = '×';
            delSubBtn.className = 'btn-tiny-delete';
            delSubBtn.onclick = (e) => {
                e.stopPropagation();
                if(confirm(`Delete subject '${cat}'?`)) {
                    DataManager.deleteSubject(cat);
                    this.renderUI();
                }
            };
            header.appendChild(delSubBtn);
            group.appendChild(header);

            // Tasks
            syllabus.filter(t => t.category === cat).forEach(task => {
                const isDone = DataManager.isCompleted(task.id);
                const row = document.createElement('div');
                row.className = `task-item ${isDone ? 'done' : ''}`;
                row.dataset.id = task.id;
                
                // IMPORTANT: Structure matches CSS
                row.innerHTML = `
                    <div class="task-checkbox-wrapper">
                        <input type="checkbox" ${isDone ? 'checked' : ''} style="pointer-events:none;"> 
                        <label style="margin-left:10px; pointer-events:none;">${task.title}</label>
                    </div>
                    <button class="btn-tiny-delete" data-action="del-task">×</button>
                `;
                group.appendChild(row);
            });
            this.taskListEl.appendChild(group);
        });
    }

    setupListeners() {
        // 1. Task List Delegation
        this.taskListEl.addEventListener('click', (e) => {
            const row = e.target.closest('.task-item');
            if (!row) return;
            const id = row.dataset.id;

            // Handle Delete
            if (e.target.dataset.action === 'del-task') {
                e.stopPropagation();
                if(confirm("Delete task?")) {
                    DataManager.deleteTask(id);
                    this.renderUI();
                }
                return;
            }

            // Handle Check/Uncheck
            e.stopPropagation();
            if (DataManager.isCompleted(id)) {
                DataManager.toggleComplete(id);
                this.renderUI();
            } else {
                // Launch Quiz
                this.runQuiz(DataManager.getIntegrityCheck(), () => {
                    DataManager.toggleComplete(id);
                    this.renderUI();
                    AudioPlayer.play(880, 0.1, 'sine');
                });
            }
        });

        // 2. Timer Button
        if (this.startBtn) {
            this.startBtn.replaceWith(this.startBtn.cloneNode(true)); // Clear old listeners
            this.startBtn = document.getElementById('focus-start-btn'); // Re-select
            
            this.startBtn.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stopTimer();
                } else {
                    this.runQuiz(DataManager.getPreFlightCheck(), () => this.startTimer());
                }
            });
        }
    }

    // --- Timer & Audio ---
    startTimer() {
        this.isRunning = true;
        this.startBtn.innerText = "PAUSE";
        this.startBtn.classList.add('active');
        this.startNoise();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.stopTimer();
                alert("SESSION COMPLETE.");
            }
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        this.startBtn.innerText = "START FOCUS";
        this.startBtn.classList.remove('active');
        this.stopNoise();
        clearInterval(this.timer);
    }

    updateTimerDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.timerEl.innerText = `${m}:${s}`;
    }

    async startNoise() {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        await this.audioCtx.resume();
        const buf = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 2, this.audioCtx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        
        this.noiseNode = this.audioCtx.createBufferSource();
        this.noiseNode.buffer = buf;
        this.noiseNode.loop = true;
        this.noiseNode.connect(this.audioCtx.destination);
        this.noiseNode.start();
    }

    stopNoise() {
        if (this.noiseNode) {
            this.noiseNode.stop();
            this.noiseNode = null;
        }
    }

    // --- Modal ---
    runQuiz(qData, cb) {
        if (document.querySelector('.quiz-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'quiz-modal';
        modal.innerHTML = `
            <div class="quiz-content">
                <h3>SYSTEM QUERY</h3>
                <p>${qData.q}</p>
                <div class="quiz-options">
                    ${qData.options.map((opt,i) => `<button data-i="${i}" class="quiz-btn">${opt}</button>`).join('')}
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('quiz-btn')) {
                document.body.removeChild(modal);
                cb(); // Pass logic
            }
        });
        document.body.appendChild(modal);
    }
}

export default FocusApp;