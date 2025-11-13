# ParasOS v1.1 - System Core

**Live Demo:** [parassharma.in](https://parassharma.in)

A high-fidelity personal operating system built on the web. It gamifies productivity by treating your study routine as a critical system process, complete with integrity checks, audio masking, and flight-deck visualizations.

---

## 🚀 System Modules

### 1. Focus.exe (Integrity Monitor)
The heart of the system. It replaces the standard "To-Do" list with a rigid protocol.
* **Integrity Check:** You cannot simply "check" a box. The system challenges you with a query (e.g., *"Did you actually finish this or are you lying?"*) to ensure honest progress.
* **Brown Noise Daemon:** A built-in audio generator that masks external distractions during study sessions.
* **Exam Vector:** Live countdown to **Feb 20, 2026**.

### 2. Terminal (The Shell)
A fully simulated Zsh-style environment.
* **True Shell:** Supports command history (`↑` / `↓`), screen clearing, and complex argument parsing.
* **Control:** You can launch apps, manage your syllabus, and control the system timer entirely via text.

### 3. Cockpit (Visualization)
* **PFD (Primary Flight Display):** Visualizes your "System Integrity" (consistency). If you skip tasks, the system stability drops.

---

## 📟 Terminal Command Manual

The CLI is the power-user way to navigate ParasOS.

### Productivity
| Command | Usage | Description |
| :--- | :--- | :--- |
| `todo` | `todo list` | Display the full syllabus task queue. |
| | `todo add <Cat> <Name>` | Add a manual task (e.g., `todo add Physics Optics`). |
| | `todo check <ID>` | Verify and complete a task by ID. |
| | `todo del <ID>` | Remove a task from the register. |
| `focus` | `focus start` | Initiate the Focus Daemon (Timer + Audio). |
| | `focus stop` | Abort the current session. |
| `status` | `status` | Report Days to Exam and Integrity Score. |

### System
| Command | Usage | Description |
| :--- | :--- | :--- |
| `open` | `open <app>` | Launch an app (e.g., `open snake`, `open terminal`). |
| `close` | `close <app>` | Force terminate a window. |
| `clear` | `clear` | Clear the terminal buffer. |
| `reset` | `reset` | **Factory Reset:** Wipes all local data and reboots. |
| `ls` | `ls` | List installed applications. |

### Easter Eggs & Secrets
| Command | Effect |
| :--- | :--- |
| `dikshita` | Access the secure heart vault. |
| `love` | (Alias for above). |
| `firstphone` | Reveal hardware history. |
| `sudo` | Attempt privilege escalation. |

---

## 🎹 Shortcuts & Interaction
* **Konami Code:** `↑ ↑ ↓ ↓ ← → ← → b a` (System Unlock).
* **Double Click:** Open desktop icons.
* **Drag:** Move windows via the header bar.

---

**© 2025 Paras Sharma**
*Built with Vanilla JS, HTML5, and CSS3.*