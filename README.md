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
├── store.js                 # State store, offline caching & MongoDB sync
├── auth.js                  # User authentication & identity management
├── expenses.js              # Expense manager & budget calculations
├── people.js                # Ledgers, interest calculators, & group splits
├── notes.js                 # Notes manager & text-to-speech audio engine
├── server.js                # Production Express + MongoDB simultaneous server
├── package.json             # NPM dependencies and run scripts
├── .env.example             # Environment configuration template
└── README.md                # Documentation and setup
```

## 🚀 Features

- **Personal Budget Manager**: Interactive doughnut SVG progress ring, real-time balance calculations, expense history timelines, past-month expense injection, and CSV exports.
- **Multi-Category Ledgers**:
  - **Normal**: Personal lending tracker linked with personal budget deductions.
  - **General**: Business/isolated record keeping independent of budget.
  - **Interest**: Simple & Compound interest calculation engine with rate, frequency, and duration.
  - **Group**: Equal split-wise logic auto-distributing transactions across member ledgers.
- **Notes & Voice Memos**: Tagged memo cards, pin sorting, search filters, document viewer overlays, and SpeechSynthesis text-to-speech playback.
- **Security & Multi-User Identity**: 4-digit PIN authentication per user identity with database sync and offline caching.
- **MongoDB Cloud / Local Persistence**: Asynchronous auto-sync to MongoDB with instant local cache fallback for zero-latency UI interactions.
- **Simultaneous Production Server**: Single unified server serving both the high-performance REST API (`/api/*`) and the static frontend application on a single port.

## ⚡ Quick Start (Production & Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fincal
```

### 3. Run Simultaneously
To run the production server (both frontend and backend served together):
```bash
npm start
```
Or with automatic live reload for development:
```bash
npm run dev
```

Open your browser at **`http://localhost:5000`**. You will see the **🟢 MongoDB** live connection badge in the application header.
