import DataManager from '../data/DataManager.js';

class Terminal {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.container = document.getElementById('terminal-container');
        this.historyEl = document.getElementById('terminal-history');
        this.input = document.getElementById('terminal-input');
        
        this.history = [];
        this.historyIndex = -1;
        this.booted = false;
        
        this.init();
    }

    init() {
        // 1. Ensure clicking anywhere in the black box focuses the input
        this.window.el.addEventListener('click', () => {
            if (this.input) this.input.focus();
        });
        
        if (!this.input) {
            console.error("Terminal Error: Input element #terminal-input not found in DOM.");
            return;
        }

        // 2. Master Event Listener
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // CRITICAL FIX: Prevent default form submission or newline insertion
                e.preventDefault();
                
                const cmd = this.input.value;
                
                // A. Echo the user's command to the screen immediately
                this.print(`<span style="color:#32d74b">➜</span> <span style="color:#81a1c1">~</span> ${cmd}`);
                
                // B. Process Command (if not empty)
                if (cmd.trim()) {
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    
                    try {
                        this.handleCommand(cmd);
                    } catch (err) {
                        console.error(err);
                        this.print(`Shell Error: ${err.message}`, "color:#bf616a");
                    }
                }
                
                // C. Reset Input and Scroll
                this.input.value = '';
                this.scrollToBottom();
                this.input.focus(); // Keep focus active
            } 
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.historyIndex];
                }
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.input.value = '';
                }
            }
        });
    }

    start() {
        if (this.input) this.input.focus();
        
        if (!this.booted) {
            this.print("Last login: " + new Date().toLocaleString() + " on ttys000");
            this.print("ParasOS Kernel v1.4 initialized.");
            this.print("Type 'help' for commands.");
            this.print("<br>");
            this.booted = true;
        }
    }

    scrollToBottom() {
        if (this.container) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    }

    print(html, style = "") {
        const div = document.createElement('div');
        div.style.wordBreak = "break-word";
        div.style.marginBottom = "4px";
        if (style) div.style = style; // Apply custom inline styles if passed
        div.innerHTML = html;
        
        if (this.historyEl) {
            this.historyEl.appendChild(div);
            this.scrollToBottom();
        }
    }

    handleCommand(str) {
        const args = str.trim().split(/\s+/); // Split by spaces
        const cmd = args[0].toLowerCase();
        const desktop = this.window.desktop;
        const focusApp = desktop.activeApps.focus;

        switch(cmd) {
            case 'help':
                this.print(`
<span style="color:#ebcb8b">SYSTEM:</span>  status, open [app], close [app], reset, exit
<span style="color:#ebcb8b">TASKS:</span>   todo list, todo add, todo check, todo del
<span style="color:#ebcb8b">FOCUS:</span>   focus start, focus stop
<span style="color:#ebcb8b">SHELL:</span>   clear, ls, date, history, whoami
`);
                break;

            case 'random.rand':
                const min = parseInt(args[1]);
                const max = parseInt(args[2]);

                if (!isNaN(min) && !isNaN(max)) {
                    // Range Logic
                    const val = Math.floor(Math.random() * (max - min + 1)) + min;
                    this.print(`Random [${min}-${max}]: <span style="color:#a3be8c; font-weight:bold;">${val}</span>`);
                } else {
                    // Default 0-1
                    this.print(`Random (0-1): ${Math.random()}`);
                    this.print(`Tip: Use 'random.rand 1 100' for range.`, "color:#666");
                }
                break;

            case 'ls':
                this.print(`<span style="color:#88c0d0">Focus.app Terminal.app Projects.app Settings.cfg Help.app Snake.app</span>`);
                break;

            case 'clear':
                if (this.historyEl) this.historyEl.innerHTML = '';
                break;

            case 'whoami':
                this.print("root");
                break;

            case 'date':
                this.print(new Date().toString());
                break;

            case 'history':
                this.history.forEach((h, i) => this.print(`${i+1} ${h}`));
                break;

            case 'open':
                if (!args[1]) {
                    this.print("Usage: open <app>", "color:#bf616a");
                    return;
                }
                // Normalize app name (remove .app, .exe etc)
                const appName = args[1].toLowerCase().split('.')[0];
                const win = desktop.windows.get(`window-${appName}`);
                
                if (win) { 
                    win.open(); 
                    this.print(`Launching ${args[1]}...`); 
                } else {
                    this.print(`Error: App '${args[1]}' not found.`, "color:#bf616a");
                }
                break;

            case 'close':
                if (!args[1]) return;
                const closeName = args[1].toLowerCase().split('.')[0];
                const winClose = desktop.windows.get(`window-${closeName}`);
                if (winClose) { 
                    winClose.close(); 
                    this.print(`Terminated ${args[1]}.`); 
                } else {
                    this.print(`Process not found: ${args[1]}`);
                }
                break;

            case 'status':
                const days = DataManager.getDaysToExam();
                const score = DataManager.getIntegrityScore ? DataManager.getIntegrityScore() : "100";
                this.print(`--------------------------------`);
                this.print(`TARGET     : Feb 20 2026`);
                this.print(`T-MINUS    : ${days} Days`);
                this.print(`INTEGRITY  : ${score}%`);
                this.print(`--------------------------------`);
                break;

            // --- Focus / Timer Controls ---
            case 'focus':
                if (args[1] === 'start') {
                    // 1. Open the window first
                    desktop.windows.get('window-focus').open();
                    // 2. Trigger the App Logic
                    if (focusApp) {
                        // Use the Pre-Flight Check just like the GUI
                        focusApp.runQuiz(DataManager.getPreFlightCheck(), () => {
                            focusApp.startTimer();
                            this.print(">> TIMER STARTED", "color:#a3be8c");
                        });
                    } else {
                        this.print("Error: Focus subsystem not responding.", "color:#bf616a");
                    }
                } else if (args[1] === 'stop') {
                    if (focusApp) {
                        focusApp.stopTimer();
                        this.print(">> TIMER STOPPED", "color:#ebcb8b");
                    }
                } else {
                    this.print("Usage: focus start | stop");
                }
                break;

            // --- Todo Manager ---
            case 'todo':
                if (args[1] === 'list') {
                    const list = DataManager.getSyllabus();
                    if (list.length === 0) this.print("Task list is empty.");
                    
                    list.forEach(t => {
                        const m = DataManager.isCompleted(t.id) ? '<span style="color:#a3be8c">[✔]</span>' : '<span style="color:#bf616a">[ ]</span>';
                        this.print(`${m} <strong>${t.id}</strong>: ${t.title}`);
                    });
                } 
                else if (args[1] === 'add') {
                    // Syntax: todo add category taskname...
                    if (args.length < 4) {
                        this.print("Usage: todo add <Category> <Task Name>");
                        return;
                    }
                    const cat = args[2];
                    const title = args.slice(3).join(' ');
                    const id = DataManager.addTask(cat, title);
                    this.print(`Task Added: ${id}`, "color:#a3be8c");
                    // Refresh GUI
                    window.dispatchEvent(new Event('focus-data-update'));
                } 
                else if (args[1] === 'check') {
                    if (!args[2]) {
                        this.print("Usage: todo check <id>");
                        return;
                    }
                    // Toggle state directly
                    DataManager.toggleComplete(args[2]);
                    this.print(`Task ${args[2]} state updated.`, "color:#a3be8c");
                    window.dispatchEvent(new Event('focus-data-update'));
                } 
                else if (args[1] === 'del') {
                    if (!args[2]) return;
                    DataManager.deleteTask(args[2]);
                    this.print(`Task ${args[2]} deleted.`, "color:#bf616a");
                    window.dispatchEvent(new Event('focus-data-update'));
                }
                else {
                    this.print("Usage: todo list | add | check | del");
                }
                break;

            // --- REASSURANCE PROTOCOL ---
            case 'apologise':
                const priyoshiWin = desktop.windows.get('window-priyoshi');
                if (priyoshiWin) {
                    priyoshiWin.open();
                    this.print(">> Opening heartfelt apology...", "color:#bf616a");
                    this.print(">> Message Status: Delivered from the heart.");
                }
                break;

            case 'confidant':
                this.print(`<span style="color:#ebcb8b">DEFINITION: Confidant</span>`);
                this.print(`(noun) A person with whom one shares a secret or private matter, trusting them not to repeat it to others.`);
                this.print(`<br><em>"You are my best friend, my confidant, and my priority."</em>`);
                break;

            case 'compare':
                this.print(`<span style="color:#bf616a">>> ERROR: Comparison Impossible.</span>`);
                this.print(`Analysis: Other datasets (the_ones_selling_nudes) are irrelevant garbage data.`);
                this.print(`Current User (You) is the <span style="color:#a3be8c">Primary & Only Priority</span>.`);
                break;

            case 'tesla':
                this.print(`>> DELETING PREVIOUS RECORD...`);
                setTimeout(() => {
                    this.print(`>> "Dying alone" logic purged.`);
                    this.print(`<span style="color:#a3be8c">>> NEW ENTRY: Future is locked with Her.</span>`);
                }, 800);
                break;

            case 'sex':
                this.print(`>> CLARIFICATION:`);
                this.print(`You are not an object. You are the person I trust.`);
                this.print(`Intimacy is a byproduct of love, not the condition for it.`);
                break;

            // --- Easter Eggs ---
            case 'dikshita':
            case 'love':
                this.print(`<span style="color:#b48ead">>> ACCESSING SECURE VAULT...</span>`);
                setTimeout(() => {
                    this.print(`<span style="color:#fff">User: Dikshita verified.</span>`);
                    this.print(`<span style="color:#ff79c6">"You are the anchor in this chaotic system."</span>`);
                    this.print(`<span style="color:#ff79c6">"Thank you for keeping my code (and me) stable."</span>`);
                    this.print(`<span style="color:#88c0d0">Status: Forever Connected.</span>`);
                }, 600);
                break;
            
            case 'ping':
                if (args[1] === 'dikshita') {
                    this.print(`PING dikshita (127.0.0.1): 56 data bytes`);
                    setTimeout(() => this.print(`64 bytes from dikshita: icmp_seq=0 ttl=64 time=0.001 ms (Always connected)`), 500);
                    setTimeout(() => this.print(`64 bytes from dikshita: icmp_seq=1 ttl=64 time=0.001 ms (Zero latency heart link)`), 1000);
                    setTimeout(() => this.print(`<br><span style="color:#a3be8c">>> MESSAGE RECEIVED: Paras Loves You, Dikshita! <<</span>`), 1500);
                } else if (args[1] === 'parikshita') {
                    this.print(`PING parikshita (127.0.0.1): 56 data bytes`);
                    setTimeout(() => this.print(`64 bytes from parikshita: icmp_seq=0 ttl=64 time=0.001 ms (Heartbeat Detected)`), 500);
                    setTimeout(() => this.print(`64 bytes from parikshita: icmp_seq=1 ttl=64 time=0.001 ms (Syncing Emotions...)`), 1000);
                    setTimeout(() => {
                        this.print(`<br><span style="color:#e8a0bf">>> CONNECTION ESTABLISHED: Infinite Love Protocol <<</span>`);
                        this.print(`<span style="color:#ff79c6">"In a world of variables, you are my only constant."</span>`);
                        this.print(`Status: <span style="color:#a3be8c">Two souls, one kernel.</span>`);
                    }, 1800);
                } else if (args[1] === 'chinuk') {
                    this.print(`PING chinuk: 56 data bytes`);
                    setTimeout(() => this.print(`64 bytes from chinuk: icmp_seq=0 ttl=64 time=0.024 ms (Status: Radiating Jealousy)`), 500);
                    setTimeout(() => this.print(`64 bytes from chinuk: icmp_seq=1 ttl=64 time=0.021 ms`), 1000);
                    setTimeout(() => this.print(`<br><span style="color:#a3be8c">>> MESSAGE RECEIVED: She's just jealous! <<</span>`), 1500);
                } else if (args[1] === 'sonya') {
                    this.print(`PING sonya: 56 data bytes`);
                    setTimeout(() => this.print(`64 bytes from sonya: icmp_seq=0 ttl=64 time=0.027 ms (Status: Selling Nudes)`), 500);
                    setTimeout(() => this.print(`64 bytes from sonya: icmp_seq=1 ttl=64 time=0.029 ms`), 1000);
                    setTimeout(() => this.print(`<br><span style="color:#a3be8c">>> MESSAGE RECEIVED: She's a Rrraaand! <<</span>`), 1500);
                } else if (!args[1]) {
                    this.print("pong");
                } else {
                    this.print(`ping: cannot resolve ${args[1]}: Unknown host`);
                }
                break;

            case 'grep':
                if (args[1] === 'love' || args[1] === '"love"') {
                    this.print(`Binary file (Heart) matches: Dikshita`);
                } else {
                    this.print("grep: missing operand");
                }
                break;

            case 'man':
                if (args[1] === 'dikshita') {
                    this.print(`<span style="color:#88c0d0">NAME</span>`);
                    this.print(`    Dikshita - The source of all stability.`);
                    this.print(`<span style="color:#88c0d0">DESCRIPTION</span>`);
                    this.print(`    Critical system component. Do not disconnect.`);
                } else {
                    this.print("No manual entry found.");
                }
                break;

            case 'sudo':
                if (args[1] === 'su' && args[2] === 'dikshita') {
                    this.print(`<span style="color:#a3be8c">Access Granted. Welcome, Queen.</span>`);
                } else {
                    this.print("User is not in the sudoers file.");
                }
                break;

            case 'firstphone':
                this.print("Redmi Note 7S (Onyx Black). A brick with a soul.");
                break;

            case 'random.raand':
                this.print("Soniya Khalko", "color:#cd853f; font-weight:bold;"); 
                this.print(`Typo detected. Did you mean <span style="color:#a3be8c">random.rand</span>?`, "color:#bf616a");
                break;

            case 'analysis':
            case 'opinion':
            case 'friend':
                this.print(`<span style="color:#bf616a">>> SYSTEM ALERT: Jealousy Detected. <<</span>`);
                this.print(`Filter applied. Negative opinions from external sources are automatically redirected to /dev/null.`);
                break;
            case 'compelled':
                this.print(`<span style="color:#bf616a">Error: Variable 'Compulsion' not found.</span>`);
                this.print(`Action driven by 'Love' kernel module. Try again.`);
                break;
            case 'separation':
                this.print(`Operation failed. Entities 'Paras' and 'Dikshita' are merged at the binary level.`);
                break;

            case 'reset':
                this.print("WARNING: Factory Reset in 3 seconds...");
                localStorage.clear();
                setTimeout(() => window.location.reload(), 3000);
                break;

            case 'exit':
                this.window.close();
                break;

            default:
                this.print(`zsh: command not found: ${cmd}`, "color:#bf616a");
        }
    }
}

export default Terminal;