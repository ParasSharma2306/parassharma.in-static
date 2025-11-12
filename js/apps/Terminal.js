/**
 * Logic for the Terminal window.
 */
class Terminal {
    constructor(windowInstance) {
        this.window = windowInstance;
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        
        this.init();
    }

    init() {
        this.window.el.addEventListener('mousedown', () => this.focusInput());
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value;
                // Print the user's command with the prompt
                this.printToTerminal(`<span class="prompt-echo">paras@home:~$ ${command}</span>`);
                this.handleCommand(command);
                this.input.value = '';
                this.focusInput();
            }
        });
    }

    /**
     * Public method to be called by Window class on focus.
     */
    start() {
        this.focusInput();
    }

    focusInput() {
        // Only focus if not disabled (e.g. during reset)
        if (!this.input.disabled) {
            this.input.focus();
            this.output.scrollTop = this.output.scrollHeight;
        }
    }

    printToTerminal(text) {
        this.output.innerHTML += `<p>${text}</p>`;
        this.output.scrollTop = this.output.scrollHeight;
    }

    handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        const desktop = this.window.desktop; 
        
        switch (cmd) {
            case 'help':
                this.printToTerminal(
`Available commands:
  help       - Shows this help message
  guide      - Opens the 'Help.app'
  about      - Opens the 'About.me' window
  tribute    - Opens the 'Tribute.dat' window
  projects   - Opens the 'Projects.exe' window
  settings   - Opens the 'Settings.cfg' window
  snake      - Opens the 'Snake.gm' game
  notepad    - Opens the 'Notepad.txt' app
  pfd        - Opens the 'PFD.app' (Flight Display)
  legal      - Opens the 'Legal.txt' info
  socials    - Displays my social media links
  contact    - Displays my contact email
  clear      - Clears the terminal screen
  reset      - Resets the OS to factory defaults
  exit       - Closes the terminal

  (P.S. There might be a secret command... try 'firstphone'?)`
                );
                break;
                
            case 'about':
                this.printToTerminal("Opening About.me...");
                desktop.windows.get('window-about')?.open();
                break;
                
            case 'tribute':
                this.printToTerminal("Opening Tribute.dat...");
                desktop.windows.get('window-tribute')?.open();
                break;
                
            case 'projects':
                this.printToTerminal("Opening Projects.exe...");
                desktop.windows.get('window-projects')?.open();
                break;
                
            case 'settings':
                this.printToTerminal("Opening Settings.cfg...");
                desktop.windows.get('window-settings')?.open();
                break;
                
            case 'snake':
                this.printToTerminal("Opening Snake.gm... Use Arrow Keys to play.");
                desktop.windows.get('window-snake')?.open();
                break;

            case 'notepad':
                this.printToTerminal("Opening Notepad.txt...");
                desktop.windows.get('window-notepad')?.open();
                break;

            case 'pfd':
                this.printToTerminal("Opening PFD.app...");
                desktop.windows.get('window-pfd')?.open();
                break;

            case 'legal':
                this.printToTerminal("Opening Legal.txt...");
                desktop.windows.get('window-legal')?.open();
                break;

            case 'guide':
                this.printToTerminal("Opening Help.app...");
                desktop.windows.get('window-help')?.open();
                break;

            case 'socials':
                this.printToTerminal(
`GitHub:     <a href="https://github.com/ParasSharma2306" target="_blank">github.com/ParasSharma2306</a>
X (Twitter):<a href="https://x.com/ParasSharma_23" target="_blank">x.com/ParasSharma_23</a>
Instagram:  <a href="https://instagram.com/parassharma2306" target="_blank">instagram.com/parassharma2306</a>`
                );
                break;

            case 'contact':
                this.printToTerminal('Email: <a href="mailto:contact@parassharma.in">contact@parassharma.in</a>');
                break;

            case 'clear':
                this.output.innerHTML = '';
                break;
            
            case 'reset':
                // 1. Lock input immediately
                this.input.disabled = true;
                this.printToTerminal("System reset initiated...");
                
                // 2. Clear data
                localStorage.removeItem('paras-icon-positions');
                localStorage.removeItem('paras-notepad-content');
                localStorage.removeItem('theme');

                // 3. Show confirmation text
                this.printToTerminal("Clearing local caches...");
                
                // 4. Reload after a delay (allows user to read text)
                setTimeout(() => {
                    this.printToTerminal("Rebooting...");
                    setTimeout(() => window.location.reload(), 500);
                }, 1500);
                break;

            case 'exit':
                this.printToTerminal("Closing terminal...");
                this.window.close();
                break;
            
            case 'firstphone':
                this.printToTerminal("Ah, the legend. It was a Redmi Note 7S (Onyx Black, 3/32GB) from 2019.");
                this.printToTerminal("It had more patience than I did... and probably weighed less than my grandpa's love. (It was a brick.)");
                break;

            case '':
                // Ignore empty enter keys
                break;

            default:
                this.printToTerminal(`<span class="error">Command not found: ${command}. Type 'help' for a list of commands.</span>`);
        }
    }
}

export default Terminal;