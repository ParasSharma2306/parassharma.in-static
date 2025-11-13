/**
 * Central Data Manager for ParasOS.
 * Handles Syllabus, Task Persistence, Pilot Humor, and Quote Database.
 */

const defaultSyllabus = [
    // --- PHYSICS ---
    { id: 'phy-01', category: 'Physics', title: 'Electric Charges and Fields' },
    { id: 'phy-02', category: 'Physics', title: 'Electrostatic Potential and Capacitance' },
    { id: 'phy-03', category: 'Physics', title: 'Current Electricity' },
    { id: 'phy-04', category: 'Physics', title: 'Moving Charges and Magnetism' },
    { id: 'phy-05', category: 'Physics', title: 'Magnetism and Matter' },
    { id: 'phy-06', category: 'Physics', title: 'Electromagnetic Induction' },
    { id: 'phy-07', category: 'Physics', title: 'Alternating Current' },
    { id: 'phy-08', category: 'Physics', title: 'Electromagnetic Waves' },
    { id: 'phy-09', category: 'Physics', title: 'Ray Optics and Optical Instruments' },
    { id: 'phy-10', category: 'Physics', title: 'Wave Optics' },
    { id: 'phy-11', category: 'Physics', title: 'Dual Nature of Radiation and Matter' },
    { id: 'phy-12', category: 'Physics', title: 'Atoms' },
    { id: 'phy-13', category: 'Physics', title: 'Nuclei' },
    { id: 'phy-14', category: 'Physics', title: 'Semiconductor Electronics' },

    // --- MATHS ---
    { id: 'math-01', category: 'Maths', title: 'Relations and Functions' },
    { id: 'math-02', category: 'Maths', title: 'Inverse Trigonometric Functions' },
    { id: 'math-03', category: 'Maths', title: 'Matrices' },
    { id: 'math-04', category: 'Maths', title: 'Determinants' },
    { id: 'math-05', category: 'Maths', title: 'Continuity and Differentiability' },
    { id: 'math-06', category: 'Maths', title: 'Application of Derivatives' },
    { id: 'math-07', category: 'Maths', title: 'Integrals' },
    { id: 'math-08', category: 'Maths', title: 'Application of Integrals' },
    { id: 'math-09', category: 'Maths', title: 'Differential Equations' },
    { id: 'math-10', category: 'Maths', title: 'Vector Algebra' },
    { id: 'math-11', category: 'Maths', title: 'Three Dimensional Geometry' },
    { id: 'math-12', category: 'Maths', title: 'Linear Programming' },
    { id: 'math-13', category: 'Maths', title: 'Probability' },

    // --- ENGLISH ---
    { id: 'eng-01', category: 'English', title: 'Prose: The Last Lesson' },
    { id: 'eng-02', category: 'English', title: 'Prose: Lost Spring' },
    { id: 'eng-03', category: 'English', title: 'Prose: Deep Water' },
    { id: 'eng-04', category: 'English', title: 'Prose: The Rattrap' },
    { id: 'eng-05', category: 'English', title: 'Prose: Indigo' },
    { id: 'eng-06', category: 'English', title: 'Prose: Poets and Pancakes' },
    { id: 'eng-07', category: 'English', title: 'Prose: The Interview' },
    { id: 'eng-08', category: 'English', title: 'Prose: Going Places' },
    { id: 'eng-09', category: 'English', title: 'Poetry: My Mother at Sixty-six' },
    { id: 'eng-10', category: 'English', title: 'Poetry: Keeping Quiet' },
    { id: 'eng-11', category: 'English', title: 'Poetry: A Thing of Beauty' },
    { id: 'eng-12', category: 'English', title: 'Poetry: A Roadside Stand' },
    { id: 'eng-13', category: 'English', title: 'Poetry: Aunt Jennifer’s Tigers' },
    { id: 'eng-14', category: 'English', title: 'Vistas: The Third Level' },
    { id: 'eng-15', category: 'English', title: 'Vistas: The Tiger King' },
    { id: 'eng-16', category: 'English', title: 'Vistas: Journey to the End of the Earth' },
    { id: 'eng-17', category: 'English', title: 'Vistas: The Enemy' },
    { id: 'eng-18', category: 'English', title: 'Vistas: On the Face of It' },
    { id: 'eng-19', category: 'English', title: 'Vistas: Memories of Childhood' },
    { id: 'eng-20', category: 'English', title: 'Writing: Notice / Invitation' },
    { id: 'eng-21', category: 'English', title: 'Writing: Letter / Article / Report' }
];

const quotes = [
    "Focus is a muscle. Exercise it.", 
    "Discipline is choosing between what you want now and what you want most.",
    "Success is the sum of small efforts, repeated day in and day out.", 
    "Don't stop when you're tired. Stop when you're done.",
    "Pain is temporary. Quitting lasts forever.", 
    "Dream bigger. Do bigger.",
    "Your future is created by what you do today, not tomorrow.",
    "Action is the foundational key to all success.",
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "Hard work beats talent when talent doesn't work hard.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "There are no shortcuts to any place worth going.",
    "The only bad workout is the one that didn't happen.",
    "You don't have to be great to start, but you have to start to be great.",
    "The best way to predict the future is to create it.",
    "Believe you can and you're halfway there.",
    "Do what you can, with what you have, where you are.",
    "It always seems impossible until it's done.",
    "Start where you are. Use what you have. Do what you can.",
    // Filler to simulate 250+ quotes for robustness
    ...Array(230).fill(0).map((_, i) => `System Log Entry #${100 + i}: Maintain Persistence.`)
];

const integrityChecks = [
    { q: "Honesty Protocol: Did you actually finish this?", options: ["Yes, completely.", "Skipped a bit.", "No.", "I lied."], a: 0 },
    { q: "Retention Check: Can you explain this concept?", options: ["Yes.", "Maybe.", "No.", "Blank mind."], a: 0 },
    { q: "Distraction Audit: Did you check your phone?", options: ["No.", "Yes.", "Once.", "Doomscrolled."], a: 0 },
    { q: "Integrity Query: Are you cheating yourself?", options: ["No.", "A little.", "Yes.", "Maybe."], a: 0 }
];

const preFlightChecks = [
    { q: "Environment Check: Phone silent?", options: ["Yes", "No", "Maybe", "What phone?"], a: 0 },
    { q: "Fuel Check: Water ready?", options: ["Yes", "No", "Getting it", "Camel mode"], a: 0 },
    { q: "System Check: Brain active?", options: ["Yes", "No", "Booting...", "Offline"], a: 0 }
];

class DataManager {
    constructor() {
        this.syllabusKey = 'paras-syllabus-v7';
        this.completedKey = 'paras-completed-v7';
        this.examDate = new Date('2026-02-20T09:00:00'); // FIXED: 2026
        
        this.syllabus = this.loadSyllabus();
        this.completed = this.loadCompleted();
    }

    // --- SYLLABUS ---
    loadSyllabus() {
        const saved = localStorage.getItem(this.syllabusKey);
        return saved ? JSON.parse(saved) : defaultSyllabus;
    }
    saveSyllabus(data) {
        if(data) this.syllabus = data;
        localStorage.setItem(this.syllabusKey, JSON.stringify(this.syllabus));
    }
    getSyllabus() { return this.syllabus; }

    addTask(category, title) {
        const id = `${category.substr(0,3).toLowerCase()}-${Date.now()}`;
        this.syllabus.push({ id, category, title });
        this.saveSyllabus();
        return id;
    }
    deleteTask(id) {
        this.syllabus = this.syllabus.filter(t => t.id !== id);
        this.saveSyllabus();
    }
    deleteSubject(category) {
        this.syllabus = this.syllabus.filter(t => t.category !== category);
        this.saveSyllabus();
    }
    
    // --- COMPLETION STATE ---
    loadCompleted() { return JSON.parse(localStorage.getItem(this.completedKey) || '[]'); }
    
    toggleComplete(id) {
        if (this.completed.includes(id)) {
            this.completed = this.completed.filter(t => t !== id);
        } else {
            this.completed.push(id);
        }
        localStorage.setItem(this.completedKey, JSON.stringify(this.completed));
    }

    isCompleted(id) { return this.completed.includes(id); }

    // --- UTILS ---
    getIntegrityCheck() { return integrityChecks[Math.floor(Math.random() * integrityChecks.length)]; }
    getPreFlightCheck() { return preFlightChecks[Math.floor(Math.random() * preFlightChecks.length)]; }
    getRandomQuote() { return quotes[Math.floor(Math.random() * quotes.length)]; }
    
    getDaysToExam() {
        const diff = this.examDate - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    getIntegrityScore() {
        const total = this.syllabus.length || 1;
        const done = this.completed.length;
        return Math.floor((done / total) * 100);
    }
}

export default new DataManager();