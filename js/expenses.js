/* FinCaL Personal Expenses & Budget Controller */

let currentAnalyticsTab = 'category'; // 'category' | 'history'

// Helper function to parse transaction date string into timestamp
function parseTxDate(dateStr) {
    if (!dateStr) return 0;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const cleanStr = dateStr.replace(',', '');
    const parts = cleanStr.split(/\s+/);
    if (parts.length >= 2) {
        let day = parseInt(parts[0]) || 1;
        let monthName = parts[1];
        let monthIdx = months.indexOf(monthName);
        if (monthIdx === -1) {
            monthIdx = months.indexOf(parts[0]);
            if (monthIdx !== -1) day = parseInt(parts[1]) || 1;
        }
        if (monthIdx !== -1) {
            const currentYear = new Date().getFullYear();
            let hours = 12, minutes = 0;
            for (let i = 2; i < parts.length; i++) {
                if (parts[i].includes(':')) {
                    const timeParts = parts[i].split(':');
                    hours = parseInt(timeParts[0]) || 12;
                    minutes = parseInt(timeParts[1]) || 0;
                }
                if (parts[i].toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (parts[i].toUpperCase() === 'AM' && hours === 12) hours = 0;
            }
            return new Date(currentYear, monthIdx, day, hours, minutes).getTime();
        }
    }
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
}

// 1. Comprehensive 13-Category Classification Engine
function getCategoryForExpense(name) {
    const n = name.toLowerCase();
    
    // Food & Dining
    if (n.includes('food') || n.includes('lunch') || n.includes('dinner') || n.includes('breakfast') || 
        n.includes('restaurant') || n.includes('snack') || n.includes('coffee') || n.includes('cafe') || 
        n.includes('tea') || n.includes('chai') || n.includes('starbucks') || n.includes('zomato') || 
        n.includes('swiggy') || n.includes('bakery') || n.includes('pizza') || n.includes('burger')) {
        return { id: 'food', name: 'Food & Dining', icon: 'fa-utensils', color: '#f5a623' };
    }
    
    // Groceries & Supplies
    if (n.includes('grocery') || n.includes('supermarket') || n.includes('mart') || n.includes('fruit') || 
        n.includes('veg') || n.includes('vegetable') || n.includes('milk') || n.includes('dairy') || 
        n.includes('zepto') || n.includes('blinkit') || n.includes('instamart')) {
        return { id: 'grocery', name: 'Groceries', icon: 'fa-shopping-basket', color: '#7ec87e' };
    }
    
    // Transport & Fuel
    if (n.includes('fuel') || n.includes('gas') || n.includes('petrol') || n.includes('diesel') || 
        n.includes('taxi') || n.includes('cab') || n.includes('uber') || n.includes('lyft') || 
        n.includes('ola') || n.includes('rapido') || n.includes('parking') || n.includes('service') || n.includes('auto')) {
        return { id: 'transport', name: 'Transport & Fuel', icon: 'fa-car', color: '#3b82f6' };
    }
    
    // Travel & Transit
    if (n.includes('bus') || n.includes('train') || n.includes('metro') || n.includes('subway') || 
        n.includes('ticket') || n.includes('flight') || n.includes('airline') || n.includes('air') || 
        n.includes('hotel') || n.includes('stay') || n.includes('bnb') || n.includes('trip') || n.includes('irctc')) {
        return { id: 'travel', name: 'Travel & Transit', icon: 'fa-plane', color: '#06b6d4' };
    }
    
    // Bills & Utilities
    if (n.includes('bill') || n.includes('recharge') || n.includes('electric') || n.includes('water') || 
        n.includes('internet') || n.includes('wifi') || n.includes('broadband') || n.includes('mobile') || 
        n.includes('phone') || n.includes('dth') || n.includes('current')) {
        return { id: 'bills', name: 'Bills & Utilities', icon: 'fa-bolt', color: '#f5c842' };
    }
    
    // Housing & Rent
    if (n.includes('rent') || n.includes('home') || n.includes('house') || n.includes('maintenance') || 
        n.includes('society') || n.includes('pg') || n.includes('flat')) {
        return { id: 'housing', name: 'Housing & Rent', icon: 'fa-home', color: '#e8714a' };
    }
    
    // Shopping & Fashion
    if (n.includes('amazon') || n.includes('flipkart') || n.includes('shopping') || n.includes('buy') || 
        n.includes('store') || n.includes('cloth') || n.includes('shoe') || n.includes('wear') || 
        n.includes('jeans') || n.includes('shirt') || n.includes('myntra') || n.includes('dress')) {
        return { id: 'shopping', name: 'Shopping & Retail', icon: 'fa-shopping-cart', color: '#ec4899' };
    }
    
    // Entertainment & Gaming
    if (n.includes('movie') || n.includes('cinema') || n.includes('film') || n.includes('netflix') || 
        n.includes('prime') || n.includes('spotify') || n.includes('subscription') || n.includes('game') || 
        n.includes('steam') || n.includes('playstation') || n.includes('xbox') || n.includes('ott')) {
        return { id: 'entertainment', name: 'Entertainment', icon: 'fa-film', color: '#a855f7' };
    }
    
    // Health & Wellness
    if (n.includes('doctor') || n.includes('medical') || n.includes('pharmacy') || n.includes('med') || 
        n.includes('hospital') || n.includes('gym') || n.includes('fitness') || n.includes('yoga') || 
        n.includes('medicine') || n.includes('lab') || n.includes('test') || n.includes('apollo')) {
        return { id: 'health', name: 'Health & Wellness', icon: 'fa-notes-medical', color: '#10b981' };
    }
    
    // Education & Learning
    if (n.includes('book') || n.includes('course') || n.includes('fee') || n.includes('tuition') || 
        n.includes('school') || n.includes('college') || n.includes('udemy') || n.includes('exam') || 
        n.includes('class') || n.includes('stationer')) {
        return { id: 'education', name: 'Education & Learning', icon: 'fa-graduation-cap', color: '#6366f1' };
    }
    
    // Investment & Savings
    if (n.includes('sip') || n.includes('stock') || n.includes('mutual') || n.includes('fund') || 
        n.includes('crypto') || n.includes('gold') || n.includes('investment') || n.includes('zerodha') || 
        n.includes('groww') || n.includes('savings')) {
        return { id: 'investment', name: 'Investment & Savings', icon: 'fa-chart-line', color: '#14b8a6' };
    }
    
    // Personal Care & Beauty
    if (n.includes('salon') || n.includes('haircut') || n.includes('spa') || n.includes('beauty') || 
        n.includes('cosmetic') || n.includes('grooming') || n.includes('parlor')) {
        return { id: 'personal', name: 'Personal Care', icon: 'fa-scissors', color: '#f43f5e' };
    }
    
    // Default: General & Others
    return { id: 'general', name: 'General & Others', icon: 'fa-receipt', color: '#9ca3af' };
}

function getIconForExpense(name) {
    return getCategoryForExpense(name).icon;
}

function setBudget() {
    const input = document.getElementById('budgetInput');
    if (!input) return;
    const val = parseFloat(input.value);
    if (!isNaN(val) && val >= 0) { 
        expensesData.budget = val; 
        saveAll(); 
        renderExpenses(); 
    }
}

function addExpense() {
    const nameEl = document.getElementById('expenseName');
    const amtEl = document.getElementById('expenseAmount');
    if (!nameEl || !amtEl) return;
    
    const name = nameEl.value.trim();
    const amt = parseFloat(amtEl.value);
    if (!name || isNaN(amt) || amt <= 0) return;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const cat = getCategoryForExpense(name);
    
    expensesData.list.unshift({
        id: Date.now(), 
        name: name, 
        amount: amt,
        date: `${dateStr}, ${timeStr}`,
        icon: cat.icon
    });
    
    nameEl.value = ''; 
    amtEl.value = '';
    saveAll(); 
    renderExpenses();
}

function filterExpenses() {
    renderExpenses();
}

function changeExpensesSortOrder(order) {
    expensesSortOrder = order;
    saveAll();
    renderExpenses();
}

function toggleShowAllExpenses() {
    showAllExpenses = !showAllExpenses;
    renderExpenses();
}

function renderExpenses() {
    const searchInput = document.getElementById('expenseSearch');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });
    
    const sortSel = document.getElementById('selectExpensesSort');
    if (sortSel) sortSel.value = expensesSortOrder;
    
    let filtered = [...expensesData.list];
    if (query) {
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.date.toLowerCase().includes(query)
        );
    } else {
        filtered = filtered.filter(item => item.date.includes(currentMonth));
    }

    // Apply Sorting strictly based on Transaction Date
    filtered.sort((a, b) => {
        if (expensesSortOrder === 'date-asc') {
            const tA = parseTxDate(a.date);
            const tB = parseTxDate(b.date);
            return (tA - tB) || (a.id - b.id);
        }
        if (expensesSortOrder === 'amount-desc') return b.amount - a.amount;
        if (expensesSortOrder === 'amount-asc') return a.amount - b.amount;
        if (expensesSortOrder === 'name-asc') return a.name.localeCompare(b.name);
        
        // date-desc default: newest transaction date first
        const tA = parseTxDate(a.date);
        const tB = parseTxDate(b.date);
        return (tB - tA) || (b.id - a.id);
    });
    
    const liveMonthItems = expensesData.list.filter(item => item.date.includes(currentMonth));
    const liveMonthSpent = liveMonthItems.reduce((sum, item) => sum + item.amount, 0);
    
    const remaining = expensesData.budget - liveMonthSpent;
    const percent = expensesData.budget > 0 ? (liveMonthSpent / expensesData.budget) * 100 : 0;
    
    const ring = document.getElementById('ring-progress');
    if (ring) {
        ring.style.strokeDasharray = `${Math.max(0, 100 - percent)}, 100`;
        ring.style.stroke = remaining < 0 ? '#ff3333' : '#00f3ff';
    }
    
    const dispBal = document.getElementById('displayBalance');
    if (dispBal) dispBal.innerText = formatMoney(remaining);
    
    const dispSpent = document.getElementById('displaySpent');
    if (dispSpent) dispSpent.innerText = formatMoney(liveMonthSpent);
    
    const bInput = document.getElementById('budgetInput');
    if (bInput) bInput.value = expensesData.budget;
    
    const listEl = document.getElementById('expenseList');
    if (!listEl) return;
    
    const showMoreContainer = document.getElementById('showMoreContainer');
    const btnShowMore = document.getElementById('btnShowMore');
    const emptyState = document.getElementById('emptyState');
    
    listEl.innerHTML = '';
    
    if (filtered.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const pEl = emptyState.querySelector('p');
            if (pEl) pEl.innerText = query ? "No Match Found" : "No Recent Data";
        }
        if (showMoreContainer) showMoreContainer.classList.add('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        
        const displayList = showAllExpenses ? filtered : filtered.slice(0, 10);
        
        displayList.forEach(item => {
            listEl.innerHTML += `
                <div class="flex items-center justify-between px-6 py-5 hover:bg-white/[0.03] transition animate-slide-up border-b border-white/5 last:border-0">
                    <div class="flex items-center gap-5">
                        <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neonBlue">
                            <i class="fa-solid ${item.icon} text-lg"></i>
                        </div>
                        <div>
                            <p class="text-gray-200 text-base font-medium">${item.name}</p>
                            <p class="text-xs font-bold text-neonBlue uppercase tracking-widest mt-0.5 opacity-80">${item.date}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-white font-mono font-bold text-lg">₹${formatMoney(item.amount)}</p>
                        <div class="flex gap-2 justify-end mt-1">
                            <button onclick="openEditTxModal('expense', ${item.id})" class="text-[10px] text-neonBlue hover:text-white transition-colors uppercase">EDIT</button>
                            <span class="text-[10px] text-gray-700">|</span>
                            <button onclick="deleteExpense(${item.id})" class="text-[10px] text-gray-600 hover:text-red-500 transition-colors uppercase">DEL</button>
                        </div>
                    </div>
                </div>`;
        });

        if (filtered.length > 10) {
            if (showMoreContainer) showMoreContainer.classList.remove('hidden');
            if (btnShowMore) btnShowMore.innerText = showAllExpenses ? "Show Less" : "Show More";
        } else {
            if (showMoreContainer) showMoreContainer.classList.add('hidden');
        }
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

// 2. Category Aggregation Logic
function calculateCategoryBreakdown(expenseList) {
    const categoryTotals = {};
    let totalSpent = 0;
    
    expenseList.forEach(item => {
        const cat = getCategoryForExpense(item.name);
        if (!categoryTotals[cat.id]) {
            categoryTotals[cat.id] = {
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                spent: 0,
                count: 0
            };
        }
        categoryTotals[cat.id].spent += item.amount;
        categoryTotals[cat.id].count += 1;
        totalSpent += item.amount;
    });
    
    const categories = Object.values(categoryTotals);
    categories.forEach(cat => {
        cat.percent = totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0;
    });
    
    // Sort descending by highest spending ("in which types a person spends more")
    categories.sort((a, b) => b.spent - a.spent);
    
    return { categories, totalSpent };
}

// 3. View Analytics Modal with 3D Doughnut & Slice Percentage Bars
function showBudgetHistory() {
    const titleEl = document.getElementById('statsModalTitle');
    if (titleEl) titleEl.innerText = "Spending Analytics";
    
    renderAnalyticsModalContent();
    
    const modal = document.getElementById('monthlyStatsModal');
    if (modal) modal.classList.remove('hidden');
}

function switchAnalyticsTab(tab) {
    currentAnalyticsTab = tab;
    renderAnalyticsModalContent();
}

function renderAnalyticsModalContent() {
    const listEl = document.getElementById('monthlyStatsList');
    if (!listEl) return;
    listEl.innerHTML = '';
    
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });
    const liveMonthItems = expensesData.list.filter(item => item.date.includes(currentMonth));
    
    // Navigation Sub-Header Buttons inside Modal
    let navHtml = `
        <div class="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl border border-white/10">
            <button onclick="switchAnalyticsTab('category')" class="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${currentAnalyticsTab === 'category' ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,166,35,0.3)]' : 'text-gray-400 hover:text-white'}">Category Breakdown</button>
            <button onclick="switchAnalyticsTab('history')" class="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${currentAnalyticsTab === 'history' ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,166,35,0.3)]' : 'text-gray-400 hover:text-white'}">Monthly History</button>
        </div>
    `;
    
    if (currentAnalyticsTab === 'category') {
        const { categories, totalSpent } = calculateCategoryBreakdown(liveMonthItems);
        
        if (categories.length === 0) {
            listEl.innerHTML = navHtml + '<p class="text-center text-sm text-gray-500 py-10 uppercase tracking-widest">No Category Data Recorded</p>';
            return;
        }
        
        // Build Conic Gradient string for 3D Doughnut Chart
        let conicStops = [];
        let currentDeg = 0;
        categories.forEach(cat => {
            const deg = (cat.percent / 100) * 360;
            conicStops.push(`${cat.color} ${currentDeg.toFixed(1)}deg ${(currentDeg + deg).toFixed(1)}deg`);
            currentDeg += deg;
        });
        const conicGradientStyle = `background: conic-gradient(${conicStops.join(', ')});`;
        
        const topCategory = categories[0];
        
        // 3D Doughnut Visual
        let doughnutHtml = `
            <div class="doughnut-3d-wrapper">
                <div class="doughnut-3d-ring" style="${conicGradientStyle}"></div>
                <div class="doughnut-3d-center">
                    <span class="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Spent</span>
                    <span class="text-base font-bold font-mono text-white mt-0.5">₹${formatMoney(totalSpent)}</span>
                    <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full bg-white/5 border border-amber-400/20 truncate max-w-[120px]">
                        ${topCategory.name} (${topCategory.percent.toFixed(0)}%)
                    </span>
                </div>
            </div>
        `;
        
        // Slice-App Style Category Percentage Progress Bars
        let sliceBarsHtml = '<div class="slice-bars-wrapper">';
        categories.forEach(cat => {
            sliceBarsHtml += `
                <div class="slice-bar-card">
                    <div class="slice-bar-header">
                        <div class="slice-bar-info">
                            <div class="slice-bar-icon" style="color: ${cat.color}; border-color: ${cat.color}33; background: ${cat.color}15;">
                                <i class="fa-solid ${cat.icon}"></i>
                            </div>
                            <div>
                                <span class="slice-bar-title">${cat.name}</span>
                                <div class="text-[9px] text-gray-500 font-mono">${cat.count} transaction${cat.count > 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="slice-bar-amount">₹${formatMoney(cat.spent)}</div>
                            <span class="slice-bar-badge" style="color: ${cat.color}; border-color: ${cat.color}40;">${cat.percent.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="slice-bar-track">
                        <div class="slice-bar-fill" style="width: ${Math.max(2, cat.percent)}%; background: ${cat.color}; box-shadow: 0 0 10px ${cat.color}80;"></div>
                    </div>
                </div>
            `;
        });
        sliceBarsHtml += '</div>';
        
        listEl.innerHTML = navHtml + doughnutHtml + sliceBarsHtml;
        
    } else {
        // Monthly History Tab
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentLimit = expensesData.budget;
        const currentSpent = liveMonthItems.reduce((sum, item) => sum + item.amount, 0);
        
        const liveData = { month: currentMonth, limit: currentLimit, spent: currentSpent, balance: currentLimit - currentSpent };

        let allData = [];
        if (expensesData.historyStats) {
            Object.keys(expensesData.historyStats).forEach(m => {
                const h = expensesData.historyStats[m];
                allData.push({ month: m, limit: h.limit, spent: h.spent, balance: h.limit - h.spent });
            });
        }
        if (!allData.find(d => d.month === currentMonth)) allData.push(liveData);
        allData.sort((a,b) => months.indexOf(b.month) - months.indexOf(a.month));

        let historyHtml = '<div class="space-y-3 mt-2">';
        allData.forEach(d => {
            const isCurrent = d.month === currentMonth;
            historyHtml += `
            <div class="bg-white/5 p-5 rounded-xl border ${isCurrent ? 'border-neonBlue/30' : 'border-white/5'} relative">
                <button onclick="closeMonthlyStats(); openPastExpenseModal('${d.month}')" class="absolute top-4 right-4 text-[10px] text-neonGreen font-bold uppercase tracking-wider bg-white/5 border border-neonGreen/20 px-2.5 py-1 rounded hover:bg-neonGreen/10 flex items-center gap-1">
                    <i data-lucide="plus" class="w-3 h-3"></i> Add
                </button>
                <div class="flex justify-between items-center mb-3">
                    <span class="text-lg font-bold text-white uppercase tracking-widest">${d.month} ${isCurrent ? '<span class="text-[9px] bg-neonBlue text-black px-1.5 py-0.5 rounded ml-2">LIVE</span>' : ''}</span>
                    <span class="text-sm font-mono text-gray-400 mr-16">Limit: ₹${formatMoney(d.limit)}</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div><p class="text-[10px] text-gray-500 uppercase">Spent</p><p class="text-neonRed font-mono font-bold">₹${formatMoney(d.spent)}</p></div>
                    <div class="text-right"><p class="text-[10px] text-gray-500 uppercase">Balance</p><p class="text-neonGreen font-mono font-bold">₹${formatMoney(d.balance)}</p></div>
                </div>
            </div>`;
        });
        historyHtml += '</div>';
        
        listEl.innerHTML = navHtml + historyHtml;
    }
}

function showHistory() { 
    renderHistoryView(expensesData.list, 'Expense History', 'expense'); 
}

function renderHistoryView(dataList, title, mode) {
    const titleEl = document.getElementById('historyModalTitle');
    if (titleEl) titleEl.innerText = title;
    
    const grouped = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    dataList.forEach(item => {
        const parts = item.date.split(' ');
        let month = '';
        if (parts.length > 1) {
            const possibleMonth = parts[1].replace(',', '');
            if (months.includes(possibleMonth)) month = possibleMonth;
        }
        if (month) {
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(item);
        }
    });

    const container = document.getElementById('historyListContainer');
    if (!container) return;
    container.innerHTML = '';
    const sortedMonths = Object.keys(grouped).sort((a,b) => months.indexOf(b) - months.indexOf(a));

    if (sortedMonths.length === 0) {
        container.innerHTML = '<p class="text-center text-sm text-gray-500 py-6 uppercase tracking-widest">No History Available</p>';
    } else {
        sortedMonths.forEach(m => {
            let monthTotal = 0; let txHtml = ''; let dailyGroups = {};
            grouped[m].forEach(t => {
                monthTotal += t.amount;
                let dateKey = t.date.split(',')[0].trim();
                if (!dailyGroups[dateKey]) dailyGroups[dateKey] = { total: 0, list: [] };
                dailyGroups[dateKey].total += t.amount;
                dailyGroups[dateKey].list.push(t);
            });
            const sortedDays = Object.keys(dailyGroups).sort((a, b) => parseInt(b) - parseInt(a));
            sortedDays.forEach(day => {
                txHtml += `<div class="bg-white/5 px-3 py-2 mt-2 mb-1 rounded flex justify-between items-center border border-white/5"><span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${day}</span><span class="text-[10px] font-mono font-bold text-neonBlue">₹${formatMoney(dailyGroups[day].total)}</span></div>`;
                dailyGroups[day].list.forEach(t => {
                    if (mode === 'expense') {
                        txHtml += `<div class="flex justify-between items-center py-2 px-2 border-b border-white/5 last:border-0 pl-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neonBlue/70"><i class="fa-solid ${t.icon} text-xs"></i></div><div><p class="text-xs text-gray-300 font-bold">${t.name}</p><p class="text-[9px] text-gray-500">${t.date}</p></div></div><div class="text-right flex items-center gap-3"><span class="text-xs font-mono text-white">₹${formatMoney(t.amount)}</span><button onclick="closeHistory(); openEditTxModal('expense', ${t.id})" class="text-[9px] text-neonBlue uppercase">EDIT</button></div></div>`;
                    } else {
                        txHtml += `<div class="flex justify-between items-center py-2 px-2 border-b border-white/5 last:border-0 pl-4"><div><p class="text-xs text-gray-300 font-bold">${t.desc || (t.type==='GAVE'?'Gave':'Got')}</p><p class="text-[9px] font-bold ${t.type==='GAVE'?'text-neonBlue':'text-red-400'}">${t.type} • ${t.date}</p></div><div class="text-right flex items-center gap-3"><span class="text-xs font-mono text-white">₹${formatMoney(t.amount)}</span><button onclick="closeHistory(); openEditTxModal('ledger', ${t.id})" class="text-[9px] text-neonBlue uppercase">EDIT</button></div></div>`;
                    }
                });
            });
            container.innerHTML += `<div class="bg-white/5 rounded-2xl border border-white/5 overflow-hidden"><button onclick="toggleHistoryMonth('${m}')" class="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 transition"><div class="text-left"><span class="text-sm font-bold text-white uppercase tracking-widest block">${m}</span></div><div class="flex items-center gap-3 text-right"><div><span class="block text-neonGreen font-mono font-bold text-sm">₹${formatMoney(monthTotal)}</span><span class="block text-[9px] text-gray-500 uppercase tracking-widest">${grouped[m].length} Txns</span></div><i class="fa-solid fa-chevron-down text-gray-500 text-xs transition-transform" id="icon-${m}"></i></div></button><div id="hist-${m}" class="hidden p-2 bg-black/20">${txHtml}</div></div>`;
        });
    }
    const modal = document.getElementById('historyModal');
    if (modal) modal.classList.remove('hidden');
}

function toggleHistoryMonth(month) {
    const content = document.getElementById(`hist-${month}`);
    const icon = document.getElementById(`icon-${month}`);
    if (!content) return;
    if (content.classList.contains('hidden')) { 
        content.classList.remove('hidden'); 
        if (icon) icon.style.transform = 'rotate(180deg)'; 
    } else { 
        content.classList.add('hidden'); 
        if (icon) icon.style.transform = 'rotate(0deg)'; 
    }
}

function closeHistory() { 
    const modal = document.getElementById('historyModal');
    if (modal) modal.classList.add('hidden'); 
}

function openEditTxModal(mode, id) {
    editingTargetMode = mode;
    editingTxId = id;
    let currentName = "";
    let currentAmt = 0;

    if (mode === 'expense') {
        const item = expensesData.list.find(e => e.id === id);
        if (!item) return;
        currentName = item.name;
        currentAmt = item.amount;
    } else if (mode === 'ledger') {
        const p = peopleData.find(x => x.id === activePersonId);
        if (!p) return;
        const tx = p.transactions.find(t => t.id === id);
        if (!tx) return;
        currentName = tx.desc || "";
        currentAmt = tx.amount;
    }

    const nameEl = document.getElementById('editTxNameDesc');
    const amtEl = document.getElementById('editTxAmount');
    if (nameEl) nameEl.value = currentName;
    if (amtEl) amtEl.value = currentAmt;
    
    const modal = document.getElementById('editTxModal');
    if (modal) modal.classList.remove('hidden');
}

function closeEditTxModal() {
    const modal = document.getElementById('editTxModal');
    if (modal) modal.classList.add('hidden');
    editingTargetMode = null;
    editingTxId = null;
}

function submitEditedTx() {
    const nameEl = document.getElementById('editTxNameDesc');
    const amtEl = document.getElementById('editTxAmount');
    if (!nameEl || !amtEl) return;
    
    const newName = nameEl.value.trim();
    const newAmt = parseFloat(amtEl.value);
    if (isNaN(newAmt) || newAmt <= 0) return alert("Please enter a valid amount");

    if (editingTargetMode === 'expense') {
        const item = expensesData.list.find(e => e.id === editingTxId);
        if (item) {
            item.name = newName;
            item.amount = newAmt;
            item.icon = getIconForExpense(newName);
        }
    } else if (editingTargetMode === 'ledger') {
        const p = peopleData.find(x => x.id === activePersonId);
        if (p) {
            const tx = p.transactions.find(t => t.id === editingTxId);
            if (tx) {
                tx.desc = newName;
                tx.amount = newAmt;
            }
        }
    }

    saveAll();
    closeEditTxModal();
    
    if (expensesData.historyStats) {
        Object.keys(expensesData.historyStats).forEach(m => {
            const mItems = expensesData.list.filter(item => item.date.includes(m));
            expensesData.historyStats[m].spent = mItems.reduce((sum, i) => sum + i.amount, 0);
        });
    }

    if (location.hash.startsWith('#/expenses')) renderExpenses();
    const p = peopleData.find(x => x.id === activePersonId);
    const detailOverlay = document.getElementById('personDetailOverlay');
    if (p && detailOverlay && detailOverlay.classList.contains('open')) {
        renderPersonDetailsInternal(p);
    }
}

function openPastExpenseModal(month) {
    selectedPastMonth = month;
    const label = document.getElementById('pastTargetMonthLabel');
    if (label) label.innerText = `Target Month: ${month}`;
    
    const nameEl = document.getElementById('pastExpenseName');
    const amtEl = document.getElementById('pastExpenseAmount');
    const daySelect = document.getElementById('pastExpenseDay');
    
    if (nameEl) nameEl.value = "";
    if (amtEl) amtEl.value = "";
    
    // Populate Date numbers dropdown (1 to 31)
    if (daySelect) {
        daySelect.innerHTML = '';
        const todayNum = new Date().getDate();
        for (let i = 1; i <= 31; i++) {
            daySelect.innerHTML += `<option value="${i}" class="bg-black text-amber-400" ${i === todayNum ? 'selected' : ''}>${i}</option>`;
        }
    }

    const modal = document.getElementById('addPastExpenseModal');
    if (modal) modal.classList.remove('hidden');
}

function closePastExpenseModal() {
    const modal = document.getElementById('addPastExpenseModal');
    if (modal) modal.classList.add('hidden');
    selectedPastMonth = null;
}

function submitPastExpenseTx() {
    const nameEl = document.getElementById('pastExpenseName');
    const amtEl = document.getElementById('pastExpenseAmount');
    const daySelect = document.getElementById('pastExpenseDay');
    if (!nameEl || !amtEl) return;
    
    const name = nameEl.value.trim();
    const amt = parseFloat(amtEl.value);
    const selectedDay = daySelect ? daySelect.value : '15';
    
    if (!name || isNaN(amt) || amt <= 0) return alert("Valid name and amount required");

    const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'short' });
    const dateStr = `${selectedDay} ${selectedPastMonth}, 12:00 PM`;
    
    expensesData.list.unshift({
        id: Date.now(),
        name: name,
        amount: amt,
        date: dateStr,
        icon: getIconForExpense(name)
    });

    if (selectedPastMonth !== currentMonthName) {
        if (!expensesData.historyStats) expensesData.historyStats = {};
        if (!expensesData.historyStats[selectedPastMonth]) {
            expensesData.historyStats[selectedPastMonth] = { limit: 0, spent: 0 };
        }
        expensesData.historyStats[selectedPastMonth].spent += amt;
    }

    saveAll();
    closePastExpenseModal();
    if (location.hash.startsWith('#/expenses')) renderExpenses();
    showBudgetHistory(); 
}

function showMonthlyStats() {
    showBudgetHistory();
}

function closeMonthlyStats() { 
    const modal = document.getElementById('monthlyStatsModal');
    if (modal) modal.classList.add('hidden'); 
}

function exportCSV() {
    let csv = "Date,Name,Amount\n";
    expensesData.list.forEach(item => csv += `"${item.date}","${item.name}",${item.amount}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url); 
    a.setAttribute('download', `${currentUser ? currentUser.name : 'fincal'}_expenses.csv`); 
    a.click();
}

async function deleteExpense(id) { 
    if (await customConfirm("Delete Expense", "Remove this expense permanently?")) { 
        expensesData.list = expensesData.list.filter(e => e.id !== id); 
        saveAll(); 
        renderExpenses(); 
    } 
}

async function resetExpenses() { 
    if (await customConfirm("Clear Log", "Wipe all expenses for this month?")) { 
        expensesData.list = []; 
        saveAll(); 
        renderExpenses(); 
    } 
}
