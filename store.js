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

// Universal Sorting State across all pages
let expensesSortOrder = 'date-desc'; // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc'
let personTxSortOrder = 'date-desc'; // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

let activePersonId = null;
let activeTxType = 'GAVE';
let currentAddMode = null;
let editingTargetMode = null; 
let editingTxId = null;
let selectedPastMonth = null;
let activeNoteViewingId = null; 
let showAllExpenses = false;
let currentTab = 'expenses';

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
    
    const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'short' });
    if (expensesData.lastActiveMonth && expensesData.lastActiveMonth !== currentMonthName) {
        const prevMonth = expensesData.lastActiveMonth; 
        const prevSpent = expensesData.list.filter(item => item.date.includes(prevMonth)).reduce((sum, i) => sum + i.amount, 0);
        if (!expensesData.historyStats) expensesData.historyStats = {};
        expensesData.historyStats[prevMonth] = { limit: expensesData.budget, spent: prevSpent };
        expensesData.budget = 0;
    }
    expensesData.lastActiveMonth = currentMonthName; 
    saveAll();
}

async function resetSystem() { 
    if (await customConfirm("Total Reset", "DANGER: Delete ALL users and data?")) { 
        localStorage.clear(); 
        window.location.hash = '';
        window.location.reload(); 
    } 
}
