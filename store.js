/* FinCaL State Store & Persistence Layer */

let currentUser = null; 
let userRegistry = [];
let expensesData = { budget: 0, list: [], lastActiveMonth: '', historyStats: {} };
let peopleData = []; 
let notesData = []; 

// Notes App Extended State
let userNoteCategories = ['Personal', 'Work', 'Study', 'Ideas'];
let notesViewMode = 'grid'; // 'grid' | 'list'
let notesSortOrder = 'date-desc'; // 'date-desc' | 'date-asc' | 'title' | 'category'
let activeNoteFilter = 'all'; // 'all' | 'favorites' | 'archive' | 'trash' | categoryName

// Universal Sorting & Filtering State across all pages
let expensesSortOrder = 'date-desc'; // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc'
let personTxSortOrder = 'date-desc'; // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
let expensesMonthFilter = 'current'; // 'current' | 'all' | specific 'MMM YYYY'
let personTxMonthFilter = 'current'; // 'current' | 'all'

let activePersonId = null;
let activeTxType = 'GAVE';
let currentAddMode = null;
let editingTargetMode = null; 
let editingTxId = null;
let selectedPastMonth = null;
let selectedPastYear = null;
let activeNoteViewingId = null; 
let showAllExpenses = false;
let currentTab = 'expenses';

// --- Shared Date & Month-Year Engine ---
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCurrentDateTime(d = new Date()) {
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year}, ${timeStr}`;
}

function formatCurrentMonthYear(d = new Date()) {
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// Robustly extracts { day, month, monthIdx, year, monthYearKey }
// Fully backwards-compatible with legacy "DD MMM, hh:mm A" and new "DD MMM YYYY, hh:mm A"
function extractDateParts(dateStr, fallbackTimestamp = null) {
    if (!dateStr || typeof dateStr !== 'string') {
        const fallback = fallbackTimestamp ? new Date(fallbackTimestamp) : new Date();
        const m = MONTH_NAMES[fallback.getMonth()];
        const y = fallback.getFullYear();
        return { day: fallback.getDate(), month: m, monthIdx: fallback.getMonth(), year: y, monthYearKey: `${m} ${y}` };
    }

    const cleanStr = dateStr.replace(/,/g, ' ');
    const parts = cleanStr.trim().split(/\s+/);
    
    let monthIdx = -1;
    let monthName = '';
    let day = 1;
    let year = null;

    for (let part of parts) {
        const cleanPart = part.replace(/[^a-zA-Z0-9]/g, '');
        if (/^(19\d\d|20\d\d|2100)$/.test(cleanPart)) {
            year = parseInt(cleanPart);
            continue;
        }
        const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === cleanPart.toLowerCase().slice(0, 3));
        if (idx !== -1 && monthIdx === -1) {
            monthIdx = idx;
            monthName = MONTH_NAMES[idx];
            continue;
        }
        if (/^\d{1,2}$/.test(cleanPart) && day === 1 && !year) {
            day = parseInt(cleanPart);
        }
    }

    if (monthIdx === -1 && parts.length > 0) {
        const idx0 = MONTH_NAMES.findIndex(m => m.toLowerCase() === parts[0].toLowerCase().slice(0, 3));
        if (idx0 !== -1) { monthIdx = idx0; monthName = MONTH_NAMES[idx0]; }
        else if (parts.length > 1) {
            const idx1 = MONTH_NAMES.findIndex(m => m.toLowerCase() === parts[1].toLowerCase().slice(0, 3));
            if (idx1 !== -1) { monthIdx = idx1; monthName = MONTH_NAMES[idx1]; }
        }
    }

    if (!year) {
        if (fallbackTimestamp && !isNaN(fallbackTimestamp) && fallbackTimestamp > 1000000000000) {
            year = new Date(fallbackTimestamp).getFullYear();
        } else {
            year = new Date().getFullYear();
        }
    }

    if (monthIdx === -1) {
        monthIdx = new Date().getMonth();
        monthName = MONTH_NAMES[monthIdx];
    }

    return {
        day,
        month: monthName,
        monthIdx,
        year,
        monthYearKey: `${monthName} ${year}`
    };
}

function parseMonthYearKey(key) {
    if (!key) return { month: 'Jan', monthIdx: 0, year: new Date().getFullYear() };
    const parts = String(key).trim().split(/\s+/);
    let monthIdx = 0;
    let year = new Date().getFullYear();
    if (parts.length >= 2) {
        const mIdx = MONTH_NAMES.indexOf(parts[0]);
        if (mIdx !== -1) monthIdx = mIdx;
        const y = parseInt(parts[1]);
        if (!isNaN(y)) year = y;
    } else if (parts.length === 1) {
        const mIdx = MONTH_NAMES.indexOf(parts[0]);
        if (mIdx !== -1) monthIdx = mIdx;
    }
    return { month: MONTH_NAMES[monthIdx], monthIdx, year };
}

function compareMonthYearDesc(keyA, keyB) {
    const pA = parseMonthYearKey(keyA);
    const pB = parseMonthYearKey(keyB);
    if (pA.year !== pB.year) return pB.year - pA.year;
    return pB.monthIdx - pA.monthIdx;
}

function isItemInMonthYear(item, targetMonthYearKey) {
    const itemParts = extractDateParts(item.date, item.id);
    const target = parseMonthYearKey(targetMonthYearKey);
    return itemParts.monthIdx === target.monthIdx && itemParts.year === target.year;
}

function formatMoney(amount) { 
    return parseFloat(amount).toFixed(2); 
}

function customConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-cancel');

        if (!modal || !titleEl || !messageEl || !yesBtn || !noBtn) {
            resolve(confirm(`${title}: ${message}`));
            return;
        }

        titleEl.innerText = title;
        messageEl.innerText = message;
        modal.classList.remove('hidden');

        const cleanup = (val) => {
            modal.classList.add('hidden');
            yesBtn.onclick = null;
            noBtn.onclick = null;
            resolve(val);
        };

        yesBtn.onclick = () => cleanup(true);
        noBtn.onclick = () => cleanup(false);
    });
}

function initSystem() {
    const registry = localStorage.getItem('neonFlux_registry');
    if (registry) userRegistry = JSON.parse(registry);
}

function saveAll() {
    if (!currentUser) return;
    localStorage.setItem('neonFlux_expenses_' + currentUser.id, JSON.stringify(expensesData));
    localStorage.setItem('neonFlux_people_' + currentUser.id, JSON.stringify(peopleData));
    localStorage.setItem('neonFlux_notes_' + currentUser.id, JSON.stringify(notesData));
    localStorage.setItem('neonFlux_noteCats_' + currentUser.id, JSON.stringify(userNoteCategories));
    localStorage.setItem('neonFlux_noteViewMode_' + currentUser.id, notesViewMode);
    localStorage.setItem('neonFlux_noteSort_' + currentUser.id, notesSortOrder);
    localStorage.setItem('neonFlux_expensesSort_' + currentUser.id, expensesSortOrder);
    localStorage.setItem('neonFlux_personTxSort_' + currentUser.id, personTxSortOrder);
}

function loadData() {
    if (!currentUser) return;
    expensesData = { budget: 0, list: [], lastActiveMonth: '', historyStats: {} }; 
    peopleData = []; 
    notesData = [];
    userNoteCategories = ['Personal', 'Work', 'Study', 'Ideas'];
    notesViewMode = 'grid';
    notesSortOrder = 'date-desc';
    activeNoteFilter = 'all';
    expensesSortOrder = 'date-desc';
    personTxSortOrder = 'date-desc';
    
    const e = localStorage.getItem('neonFlux_expenses_' + currentUser.id); 
    if (e) expensesData = { ...expensesData, ...JSON.parse(e) };
    
    const p = localStorage.getItem('neonFlux_people_' + currentUser.id); 
    if (p) peopleData = JSON.parse(p);
    
    const n = localStorage.getItem('neonFlux_notes_' + currentUser.id); 
    if (n) notesData = JSON.parse(n);
    
    const cats = localStorage.getItem('neonFlux_noteCats_' + currentUser.id);
    if (cats) userNoteCategories = JSON.parse(cats);
    
    const vm = localStorage.getItem('neonFlux_noteViewMode_' + currentUser.id);
    if (vm) notesViewMode = vm;
    
    const sort = localStorage.getItem('neonFlux_noteSort_' + currentUser.id);
    if (sort) notesSortOrder = sort;
    
    const eSort = localStorage.getItem('neonFlux_expensesSort_' + currentUser.id);
    if (eSort) expensesSortOrder = eSort;
    
    const pSort = localStorage.getItem('neonFlux_personTxSort_' + currentUser.id);
    if (pSort) personTxSortOrder = pSort;
    
    if (!peopleData.some(x => x.id === 'myself')) { 
        peopleData.push({ id: 'myself', name: 'Myself', transactions: [], interestMode: 'none', isGroup: false }); 
        saveAll(); 
    }
    
    // Migrate legacy bare month keys in historyStats (e.g., 'Jul' -> 'Jul 2026')
    if (expensesData.historyStats) {
        const currentYear = new Date().getFullYear();
        const migratedStats = {};
        Object.keys(expensesData.historyStats).forEach(key => {
            if (!key.includes(' ') && MONTH_NAMES.includes(key)) {
                migratedStats[`${key} ${currentYear}`] = expensesData.historyStats[key];
            } else {
                migratedStats[key] = expensesData.historyStats[key];
            }
        });
        expensesData.historyStats = migratedStats;
    }

    const currentMonthYear = formatCurrentMonthYear();
    // Normalize lastActiveMonth if legacy bare month
    if (expensesData.lastActiveMonth && !expensesData.lastActiveMonth.includes(' ') && MONTH_NAMES.includes(expensesData.lastActiveMonth)) {
        expensesData.lastActiveMonth = `${expensesData.lastActiveMonth} ${new Date().getFullYear()}`;
    }

    if (expensesData.lastActiveMonth && expensesData.lastActiveMonth !== currentMonthYear) {
        const prevMonthKey = expensesData.lastActiveMonth; 
        const prevSpent = expensesData.list.filter(item => isItemInMonthYear(item, prevMonthKey)).reduce((sum, i) => sum + i.amount, 0);
        if (!expensesData.historyStats) expensesData.historyStats = {};
        expensesData.historyStats[prevMonthKey] = { limit: expensesData.budget, spent: prevSpent };
        expensesData.budget = 0;
    }
    expensesData.lastActiveMonth = currentMonthYear; 
    saveAll();
}

async function resetSystem() { 
    if (await customConfirm("Total Reset", "DANGER: Delete ALL users and data?")) { 
        localStorage.clear(); 
        window.location.hash = '';
        window.location.reload(); 
    } 
}
