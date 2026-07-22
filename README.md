# FinCaL | Financial Operating System

A futuristic, high-performance financial management operating system built with glassmorphism design, real-time budget tracking, intelligent ledger categorizations, split-wise group transactions, compound/simple interest calculators, and voice-synthesized note memo tracking.

## 📁 Directory & Architecture Layout

```
FINCAL/
├── assets/                  # Media assets, logos, and icons
│   └── logo.png
├── sections/                # Modular HTML section view templates
│   ├── login.html           # Authentication & Registration view section
│   ├── expenses.html        # Personal budget & Expense tracking section
│   ├── people.html          # Ledgers (Normal, General, Interest, Group) section
│   └── notes.html           # Memos, Notes, & Voice synthesis section
├── index.html               # Main application shell & section viewport
├── style.css                # Master styling, glassmorphism theme, & animations
├── script.js                # Main application entry point & initialization
├── router.js                # Hash router (`#/`) & dynamic section loader
├── store.js                 # State store & localStorage persistence layer
├── auth.js                  # User authentication & identity management
├── expenses.js              # Expense manager & budget calculations
├── people.js                # Ledgers, interest calculators, & group splits
├── notes.js                 # Notes manager & text-to-speech audio engine
└── README.md                # Documentation
```

## 🚀 Features

- **Personal Budget Manager**: Interactive doughnut SVG progress ring, real-time balance calculations, expense history timelines, past-month expense injection, and CSV exports.
- **Multi-Category Ledgers**:
  - **Normal**: Personal lending tracker linked with personal budget deductions.
  - **General**: Business/isolated record keeping independent of budget.
  - **Interest**: Simple & Compound interest calculation engine with rate, frequency, and duration.
  - **Group**: Equal split-wise logic auto-distributing transactions across member ledgers.
- **Notes & Voice Memos**: Tagged memo cards, pin sorting, search filters, document viewer overlays, and SpeechSynthesis text-to-speech playback.
- **Security & Multi-User Identity**: 4-digit PIN authentication per user identity stored in browser `localStorage`.
