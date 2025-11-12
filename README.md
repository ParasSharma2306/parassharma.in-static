# ParasOS 🖥️✈️

**Live Demo:** [parassharma.in](https://parassharma.in)

> A personal, interactive website built to resemble a retro-style desktop operating system. It is not just a portfolio; it's a digital world built from scratch.

## 📖 About

**ParasOS** transforms the standard portfolio experience into an exploration. Instead of scrolling through a static page, visitors interact with a custom desktop environment. They can open apps, play games, write notes, and discover hidden secrets.

It blends professional interests (coding, aviation) with deep personal tributes, featuring a custom-built A320neo-style Primary Flight Display (PFD) and a classic Snake game.

## 🚀 Why I Built This

This project is built on two foundations:

### 1. A Love for Technology 💻
This is a "from-scratch" celebration of what is possible with code. It serves as a playground for my obsession with technology, featuring everything from retro gaming to flight simulation logic.

### 2. A Tribute to My Foundation ❤️
More importantly, this site is a living thank-you note to the people who built me:
* **For my Grandpa:** A dedicated tribute to my champion, the man who bought my first phone and always stood up for me.
* **For my Grandma, Garima Didi, and Dikshita:** A digital space to honor the love and support of my "foundation" and my "lighthouse."

## 🛠️ The Tech Stack

ParasOS is built entirely from scratch. **No frameworks. No libraries.**

* **Vanilla JavaScript (ESM):** Code is structured into modern, modular classes (`Desktop`, `Window`, `Terminal`, `PFD`) that communicate via an event bus.
* **HTML5 Canvas:** The "Snake" game and the "PFD" (Primary Flight Display) are rendered in real-time on `<canvas>` elements for smooth, high-performance animation.
* **Web Audio API:** There are no `.mp3` files here. All sound effects (UI clicks, Konami rewards, easter eggs) are synthesized live in the browser using the Web Audio API.
* **LocalStorage:** State persistence. Your icon positions, notepad content, and theme preferences are saved locally, so the OS remembers exactly how you left it.

## 🕹️ User Guide

### Desktop Interaction
* **Open Apps:** Double-click an icon.
* **Organize:** Click and drag icons to rearrange the desktop (positions are saved).
* **Window Management:** Use the traffic light buttons:
    * 🔴 **Red:** Close
    * 🟡 **Yellow:** Minimize (sends to dock)
    * 🟢 **Green:** Maximize

### Mobile Interaction
* **Open Apps:** Single tap.
* **Close Apps:** Tap the Red close button in the navigation bar (apps open full-screen).

## 🕵️‍♀️ Secrets & Easter Eggs

ParasOS is full of hidden features. Here is the complete cheat sheet:

### 1. The Konami Code 🎮
Enter the classic cheat code to trigger a special reward.
* **Desktop:** `↑` `↑` `↓` `↓` `←` `→` `←` `→` `b` `a`
* **Mobile:** `Swipe Up` (x2), `Swipe Down` (x2), `Swipe Left`, `Swipe Right`, `Swipe Left`, `Swipe Right`, `Tap`, `Tap`
* **Effect:** Plays a melodic "success" chime.

### 2. Terminal Secrets 📟
Open the **Terminal.sh** app to use these commands:

| Command | Description |
| :--- | :--- |
| `firstphone` | Reveals the humorous, heartfelt story about my grandpa and my Redmi Note 7S. |
| `reset` | **Factory Reset:** Wipes all `localStorage` (icon positions, notes, themes) and reloads the site. |

### 3. Interactive Tributes ❤️
In the **About.me** app:
* **Hover** over "My Grandma", "Garima Didi", or "Dikshita" to trigger a heart animation and a soft chime.
* **Click** my name ("Paras Sharma") **5 times** in a row to make it shimmer and play a "bloop" sound.

### 4. The Developer Greeting 👨‍💻
Open your browser's **Developer Tools** (F12 / Ctrl+Shift+I) and check the Console for a hidden message from me to you.

---

**© 2025 Paras Sharma**
*Built with code, caffeine, and love.*