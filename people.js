/* FinCaL Ledgers & People Controller */

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

function openManual() {
    const modal = document.getElementById('manualModal');
    if (modal) modal.classList.remove('hidden');
}

function closeManual() {
    const modal = document.getElementById('manualModal');
    if (modal) modal.classList.add('hidden');
}

function renderPeopleGrid() {
    updateNormalReceivableDisplay();
    const grid = document.getElementById('peopleGrid'); 
    if (!grid) return;
    grid.innerHTML = '';
    
    const emptyState = document.getElementById('peopleEmptyState');
    
    if (peopleData.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        peopleData.forEach(p => {
            let bal = 0;
            if (p.isGroup) {
                p.members.forEach(mId => {
                    const m = peopleData.find(x => x.id === mId);
                    if (m) m.transactions.forEach(t => { 
                        if (t.desc && t.desc.startsWith(`(Group: ${p.name})`)) bal += (t.type==='GAVE'?t.amount:-t.amount); 
                    });
                });
            } else {
                p.transactions.forEach(t => bal += (t.type==='GAVE'?t.amount:-t.amount));
            }
            let badge = '';
            if (p.isGroup) badge = `<span class="absolute top-4 right-4 text-[9px] text-neonGreen border border-neonGreen/30 px-2.5 py-1 rounded-full uppercase tracking-wider bg-black/60 font-mono font-bold">Group</span>`;
            else if (p.isGeneral) badge = `<span class="absolute top-4 right-4 text-[9px] text-neonYellow border border-neonYellow/30 px-2.5 py-1 rounded-full uppercase tracking-wider bg-black/60 font-mono font-bold">General</span>`;
            else if (p.interestMode && p.interestMode !== 'none') badge = `<span class="absolute top-4 right-4 text-[9px] text-neonPurple border border-neonPurple/30 px-2.5 py-1 rounded-full uppercase tracking-wider bg-black/60 font-mono font-bold">${p.interestMode}</span>`;
            else if (p.id === 'myself') badge = `<span class="absolute top-4 right-4 text-[9px] text-white border border-white/30 px-2.5 py-1 rounded-full uppercase tracking-wider bg-black/60 font-mono font-bold">Me</span>`;
            
            const targetId = p.id === 'myself' ? 'myself' : p.id;
            grid.innerHTML += `<div onclick="navigateToPersonDetails('${targetId}')" class="glass-card-floating p-6 border ${bal >= 0 ? 'border-neonBlue/30' : 'border-red-500/30'} cursor-pointer relative">${badge}<h3 class="text-xl font-bold mb-1">${p.name}</h3><p class="text-3xl font-mono ${bal >= 0 ? 'text-neonBlue' : 'text-red-500'}">₹${formatMoney(Math.abs(bal))}</p></div>`;
        });
    }
}

function updateNormalReceivableDisplay() {
    let totalOthersOweMe = 0;
    peopleData.forEach(p => {
        if (!p.isGroup && (!p.interestMode || p.interestMode === 'none') && p.id !== 'myself' && !p.isGeneral) {
            let bal = 0; 
            p.transactions.forEach(t => bal += (t.type === 'GAVE' ? t.amount : -t.amount));
            if (bal > 0) totalOthersOweMe += bal;
        }
    });
    const el = document.getElementById('displayNormalReceivable');
    if (el) el.innerText = formatMoney(totalOthersOweMe);
}

function openAddPersonMode(mode) {
    currentAddMode = mode; 
    const container = document.getElementById('addPersonContainer');
    if (container) container.classList.remove('hidden');
    
    const nameEl = document.getElementById('newPersonName');
    if (nameEl) nameEl.value = ''; 
    
    const intOpts = document.getElementById('interestOptions');
    if (intOpts) intOpts.classList.add('hidden');
    
    const grpOpts = document.getElementById('groupOptions');
    if (grpOpts) grpOpts.classList.add('hidden'); 
    
    const titleEl = document.getElementById('addPersonTitle');
    if (titleEl) {
        titleEl.innerText = 'Adding Normal';
        if (mode === 'general') titleEl.innerText = 'Adding General Record';
        else if (mode === 'interest') titleEl.innerText = 'Adding w/ Interest';
        else if (mode === 'group') titleEl.innerText = 'Creating Group';
    }
    
    if (mode === 'interest' && intOpts) {
        intOpts.classList.remove('hidden'); 
        const rate = document.getElementById('interestRate');
        const time = document.getElementById('interestTime');
        if (rate) rate.value = ''; 
        if (time) time.value = '';
    } else if (mode === 'group' && grpOpts) {
        grpOpts.classList.remove('hidden'); 
        populateGroupMemberList();
    }
}

function populateGroupMemberList() {
    const list = document.getElementById('groupMemberList'); 
    if (!list) return;
    list.innerHTML = '';
    const eligible = peopleData.filter(p => !p.isGroup && (!p.interestMode || p.interestMode === 'none') && !p.isGeneral);
    if (eligible.length === 0) list.innerHTML = '<p class="text-center text-xs text-gray-500 font-mono">No normal members found.</p>';
    else eligible.forEach(p => { 
        list.innerHTML += `<label class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer"><input type="checkbox" class="group-member-cb accent-neonGreen w-4 h-4" value="${p.id}"><span class="text-sm text-gray-300 font-bold">${p.name}</span></label>`; 
    });
}

function cancelAddPerson() { 
    const container = document.getElementById('addPersonContainer');
    if (container) container.classList.add('hidden'); 
    currentAddMode = null; 
}

function confirmAddPerson() {
    const nameEl = document.getElementById('newPersonName');
    if (!nameEl) return;
    const name = nameEl.value.trim(); 
    if (!name) return;
    
    let personObj = { id: Date.now(), name: name, transactions: [], interestMode: 'none', interestRate: 0, timeValue: 0, timeUnit: 'years', interestFreq: 'yearly', isGroup: false, members: [], isGeneral: false };
    if (currentAddMode === 'general') personObj.isGeneral = true;
    else if (currentAddMode === 'interest') {
        const typeEl = document.getElementById('interestType');
        const rateEl = document.getElementById('interestRate');
        const timeEl = document.getElementById('interestTime');
        const unitEl = document.getElementById('interestTimeUnit');
        const freqEl = document.getElementById('interestFreq');
        
        const type = typeEl ? typeEl.value : 'simple';
        const rate = parseFloat(rateEl ? rateEl.value : 0);
        const timeVal = parseFloat(timeEl ? timeEl.value : 0); 
        const timeUnit = unitEl ? unitEl.value : 'years';
        const freq = freqEl ? freqEl.value : 'yearly'; 
        
        if (isNaN(rate) || rate < 0 || isNaN(timeVal) || timeVal < 0) return alert("Valid rate and duration required");
        personObj.interestMode = type; 
        personObj.interestRate = rate; 
        personObj.timeValue = timeVal; 
        personObj.timeUnit = timeUnit; 
        personObj.interestFreq = freq;
    } else if (currentAddMode === 'group') {
        const checkboxes = document.querySelectorAll('.group-member-cb:checked'); 
        if (checkboxes.length < 2) return alert("Select at least 2 members");
        personObj.isGroup = true; 
        checkboxes.forEach(cb => personObj.members.push(cb.value === 'myself' ? 'myself' : parseInt(cb.value)));
    }
    
    peopleData.push(personObj); 
    saveAll(); 
    renderPeopleGrid(); 
    cancelAddPerson();
}

function openEditInterestModal() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p) return;
    
    const typeEl = document.getElementById('editInterestType');
    const rateEl = document.getElementById('editInterestRate');
    const timeEl = document.getElementById('editInterestTime');
    const unitEl = document.getElementById('editInterestTimeUnit');
    const freqEl = document.getElementById('editInterestFreq');
    
    if (typeEl) typeEl.value = p.interestMode; 
    if (rateEl) rateEl.value = p.interestRate;
    if (timeEl) timeEl.value = p.timeValue; 
    if (unitEl) unitEl.value = p.timeUnit;
    if (freqEl) freqEl.value = p.interestFreq; 
    
    const modal = document.getElementById('editInterestModal');
    if (modal) modal.classList.remove('hidden');
}

function closeEditInterestModal() { 
    const modal = document.getElementById('editInterestModal');
    if (modal) modal.classList.add('hidden'); 
}

function updateInterestDetails() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p) return;
    
    const rateEl = document.getElementById('editInterestRate');
    const timeEl = document.getElementById('editInterestTime');
    const rate = parseFloat(rateEl ? rateEl.value : 0); 
    const timeVal = parseFloat(timeEl ? timeEl.value : 0);
    
    if (isNaN(rate) || rate < 0 || isNaN(timeVal) || timeVal < 0) return alert("Invalid inputs");
    
    const typeEl = document.getElementById('editInterestType');
    const unitEl = document.getElementById('editInterestTimeUnit');
    const freqEl = document.getElementById('editInterestFreq');
    
    p.interestMode = typeEl ? typeEl.value : 'simple'; 
    p.interestRate = rate; 
    p.timeValue = timeVal; 
    p.timeUnit = unitEl ? unitEl.value : 'years'; 
    p.interestFreq = freqEl ? freqEl.value : 'yearly';
    
    saveAll(); 
    closeEditInterestModal(); 
    renderPersonDetailsInternal(p);
}

function navigateToPersonDetails(id) {
    location.hash = `#/people/${id}`;
}

function openPersonDetails(id) {
    let targetId = id;
    if (typeof id === 'string' && id !== 'myself') {
        targetId = parseInt(id) || id;
    }
    const p = peopleData.find(x => x.id === targetId);
    if (!p) return;
    activePersonId = targetId;
    
    const nameEl = document.getElementById('detailPersonName');
    if (nameEl) nameEl.innerText = p.name;
    
    const searchInput = document.getElementById('personTxSearch');
    if (searchInput) searchInput.value = ''; 
    
    renderPersonDetailsInternal(p);
    
    const overlay = document.getElementById('personDetailOverlay');
    if (overlay) overlay.classList.replace('closed', 'open');
}

function closePersonDetails() { 
    const overlay = document.getElementById('personDetailOverlay');
    if (overlay) overlay.classList.replace('open', 'closed'); 
    activePersonId = null;
    if (location.hash.startsWith('#/people/')) {
        location.hash = '#/people';
    }
    renderPeopleGrid(); 
}

function filterPersonTransactions() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (p) renderPersonDetailsInternal(p);
}

function changePersonTxSortOrder(order) {
    personTxSortOrder = order;
    saveAll();
    const p = peopleData.find(x => x.id === activePersonId);
    if (p) renderPersonDetailsInternal(p);
}

function renderPersonDetailsInternal(p) {
    const searchInput = document.getElementById('personTxSearch');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    const sortSel = document.getElementById('selectPersonTxSort');
    if (sortSel) sortSel.value = personTxSortOrder;
    
    let principal = 0; 
    
    const detailCard = document.getElementById('detailedInterestCard'); 
    const groupCard = document.getElementById('detailedGroupMembers');
    if (detailCard) detailCard.classList.add('hidden'); 
    if (groupCard) groupCard.classList.add('hidden');
    
    const list = document.getElementById('personHistoryList'); 
    if (!list) return;
    list.innerHTML = '';

    if (p.isGroup) {
        if (groupCard) groupCard.classList.remove('hidden'); 
        const membersDiv = document.getElementById('groupMembersDisplay'); 
        if (membersDiv) membersDiv.innerHTML = '';
        
        p.members.forEach(mId => {
            const m = peopleData.find(x => x.id === mId);
            if (m) {
                let mBal = 0; 
                m.transactions.forEach(t => { 
                    if (t.desc && t.desc.startsWith(`(Group: ${p.name})`)) mBal += (t.type==='GAVE'?t.amount:-t.amount); 
                });
                if (membersDiv) membersDiv.innerHTML += `<div class="flex justify-between items-center bg-white/5 p-2 px-3 rounded-xl border border-white/10"><span class="text-xs text-gray-300 font-bold">${m.name}</span><span class="text-xs font-mono font-bold ${mBal >= 0 ? 'text-neonBlue' : 'text-red-500'}">₹${formatMoney(Math.abs(mBal))}</span></div>`;
                principal += mBal; 
            }
        });
        list.innerHTML = '<p class="text-center text-xs text-gray-500 font-mono py-4">Transactions split in member ledgers.</p>';
        const balEl = document.getElementById('detailBalance');
        if (balEl) balEl.innerText = `₹${formatMoney(Math.abs(principal))}`;
        const statusEl = document.getElementById('detailStatus');
        if (statusEl) statusEl.innerText = principal > 0 ? 'GROUP OWES' : (principal < 0 ? 'YOU OWE' : 'SETTLED');
        return; 
    }

    p.transactions.forEach(t => principal += (t.type==='GAVE'?t.amount:-t.amount));
    let finalAmount = principal;

    if (p.interestMode && p.interestMode !== 'none' && Math.abs(principal) > 0 && detailCard) {
        let monthsPerCycle = 1; 
        if (p.interestFreq === 'quarterly') monthsPerCycle = 3; 
        else if (p.interestFreq === 'half-yearly') monthsPerCycle = 6; 
        else if (p.interestFreq === 'yearly') monthsPerCycle = 12;
        
        let durationInMonths = p.timeUnit === 'years' ? p.timeValue * 12 : p.timeValue; 
        let totalCycles = durationInMonths / monthsPerCycle;
        let r = p.interestRate / 100; 
        let debt = Math.abs(principal); 
        let interestAmount = 0;
        
        if (p.interestMode === 'simple') interestAmount = debt * r * totalCycles; 
        else interestAmount = (debt * Math.pow((1 + r), totalCycles)) - debt;
        
        finalAmount = principal > 0 ? principal + interestAmount : principal - interestAmount;
        detailCard.innerHTML = `<button onclick="openEditInterestModal()" class="absolute top-3 right-3 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-pen text-xs"></i></button><div class="grid grid-cols-2 gap-y-3 text-[10px] uppercase tracking-widest font-mono"><div class="text-gray-400">Principal</div><div class="text-right font-bold text-white text-xs font-mono">₹${formatMoney(debt)}</div><div class="text-gray-400">Rate</div><div class="text-right font-bold text-white">${p.interestRate}% / ${p.interestFreq}</div><div class="text-gray-400">Interest</div><div class="text-right font-bold text-neonPurple text-sm font-mono">₹${formatMoney(interestAmount)}</div></div>`;
        detailCard.classList.remove('hidden');
    } 

    const balEl = document.getElementById('detailBalance');
    if (balEl) balEl.innerText = `₹${formatMoney(Math.abs(finalAmount))}`;
    
    const statusEl = document.getElementById('detailStatus');
    if (statusEl) statusEl.innerText = finalAmount > 0 ? 'OWES YOU' : (finalAmount < 0 ? 'YOU OWE' : 'SETTLED');
    
    const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });
    let filteredTx = [...p.transactions];
    if (searchQuery) {
        filteredTx = filteredTx.filter(t => (t.desc && t.desc.toLowerCase().includes(searchQuery)) || t.date.toLowerCase().includes(searchQuery) || t.type.toLowerCase().includes(searchQuery));
    } else {
        filteredTx = filteredTx.filter(t => t.date.includes(currentMonth));
    }

    // Apply Sorting strictly based on Transaction Date
    filteredTx.sort((a, b) => {
        if (personTxSortOrder === 'date-asc') {
            const tA = parseTxDate(a.date);
            const tB = parseTxDate(b.date);
            return (tA - tB) || (a.id - b.id);
        }
        if (personTxSortOrder === 'amount-desc') return b.amount - a.amount;
        if (personTxSortOrder === 'amount-asc') return a.amount - b.amount;
        
        // date-desc default
        const tA = parseTxDate(a.date);
        const tB = parseTxDate(b.date);
        return (tB - tA) || (b.id - a.id);
    });

    filteredTx.forEach(t => {
        const isGave = t.type === 'GAVE';
        list.innerHTML += `<div class="bg-white/5 p-5 rounded-2xl flex justify-between items-center border border-white/10 animate-slide-up"><div class="flex items-center gap-4"><div class="text-center bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 w-auto min-w-[65px]"><p class="text-xs font-black text-white uppercase leading-tight font-mono">${t.date}</p></div><div><p class="text-sm font-bold text-gray-200">${t.desc || (isGave ? 'Sent Cash' : 'Received')}</p><p class="text-[10px] font-bold ${isGave ? 'text-neonBlue' : 'text-red-400'} uppercase font-mono">${t.type}</p></div></div><div class="text-right"><p class="text-base font-mono font-bold text-white">₹${formatMoney(t.amount)}</p><div class="flex gap-2 justify-end mt-1"><button onclick="openEditTxModal('ledger', ${t.id})" class="text-[10px] text-neonBlue hover:text-white transition-colors">EDIT</button><span class="text-[10px] text-gray-700">|</span><button onclick="delTx(${t.id})" class="text-[10px] text-gray-600 hover:text-red-500">DEL</button></div></div></div>`;
    });
    
    if (filteredTx.length === 0) {
        list.innerHTML = `<p class="text-center text-xs text-gray-500 font-mono py-6 uppercase tracking-widest">${searchQuery ? 'No Match Found' : 'No Recent Transactions'}</p>`;
    }
}

function showPersonMonthlyStats() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p || p.isGroup) return alert("Monthly stats available for individual ledgers only.");
    const stats = {}; 
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    p.transactions.forEach(t => {
        const parts = t.date.split(' '); 
        let month = '';
        if (parts.length > 1) { 
            const possibleMonth = parts[1].replace(',', ''); 
            if (months.includes(possibleMonth)) month = possibleMonth; 
        }
        if (month) { 
            if (!stats[month]) stats[month] = { gave: 0, got: 0 }; 
            if (t.type === 'GAVE') stats[month].gave += t.amount; 
            else stats[month].got += t.amount; 
        }
    });
    const listEl = document.getElementById('monthlyStatsList'); 
    if (!listEl) return;
    listEl.innerHTML = '';
    const sortedMonths = Object.keys(stats).sort((a,b) => months.indexOf(a) - months.indexOf(b));
    if (sortedMonths.length === 0) listEl.innerHTML = '<p class="text-center text-sm text-gray-500 font-mono py-6 uppercase tracking-widest">No Transactions Found</p>';
    else sortedMonths.forEach(m => { 
        listEl.innerHTML += `<div class="bg-white/5 p-4 rounded-2xl border border-white/10 mb-2"><div class="flex justify-between items-center mb-2"><span class="text-base font-bold text-gray-300 uppercase tracking-widest">${m}</span></div><div class="flex justify-between text-xs font-mono"><span class="text-neonBlue">Gave: ₹${formatMoney(stats[m].gave)}</span><span class="text-red-500">Got: ₹${formatMoney(stats[m].got)}</span></div></div>`; 
    });
    const modal = document.getElementById('monthlyStatsModal');
    if (modal) modal.classList.remove('hidden');
}

function showPersonHistory() {
    const p = peopleData.find(x => x.id === activePersonId);
    if (!p) return;

    let txs = p.transactions || [];
    if (p.isGroup && p.members) {
        txs = [];
        p.members.forEach(mId => {
            const m = peopleData.find(x => x.id === mId);
            if (m && m.transactions) {
                m.transactions.filter(t => t.desc && t.desc.startsWith(`(Group: ${p.name})`)).forEach(t => {
                    txs.push({ ...t, desc: `${m.name}: ${t.desc}` });
                });
            }
        });
    }

    renderHistoryView(txs, `${p.name} History`, 'ledger');
}

function exportPersonCSV() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p) return; 
    if (p.isGroup) return alert("Export not available for groups yet.");
    let csv = "Date,Type,Description,Amount\n"; 
    p.transactions.forEach(t => csv += `${t.date},${t.type},"${t.desc || ''}",${t.amount}\n`);
    const blob = new Blob([csv], { type: 'text/csv' }); 
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.setAttribute('href', url); 
    a.setAttribute('download', `${p.name}_ledger.csv`); 
    a.click();
}

async function clearPersonHistory() {
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p) return; 
    if (p.isGroup) return alert("Cannot clear group history directly.");
    if (await customConfirm("Clear History", `Delete all transactions with ${p.name}?`)) {
        p.transactions = []; 
        saveAll(); 
        renderPersonDetailsInternal(p);
    }
}

async function delTx(id) { 
    if (await customConfirm("Delete Record", "Delete this transaction permanently?")) { 
        const p = peopleData.find(x => x.id === activePersonId); 
        if (p && !p.isGroup) { 
            p.transactions = p.transactions.filter(t => t.id !== id); 
            saveAll(); 
            renderPersonDetailsInternal(p); 
        }
    } 
}

async function deleteCurrentPerson() { 
    if (activePersonId === 'myself') return alert("Cannot delete 'Myself' ledger.");
    if (await customConfirm("Delete Ledger", "Delete this ledger and all history?")) { 
        peopleData = peopleData.filter(x => x.id !== activePersonId); 
        saveAll(); 
        closePersonDetails(); 
    } 
}

function openTransactionModal(type) { 
    activeTxType = type; 
    const modalType = document.getElementById('txModalType');
    if (modalType) modalType.innerText = type; 
    const modal = document.getElementById('txInputModal');
    if (modal) modal.classList.remove('hidden'); 
}

function closeTxModal() { 
    const modal = document.getElementById('txInputModal');
    if (modal) modal.classList.add('hidden'); 
    const desc = document.getElementById('txDesc');
    const amt = document.getElementById('txAmt');
    if (desc) desc.value = ''; 
    if (amt) amt.value = ''; 
}

function submitPersonTx() {
    const amtEl = document.getElementById('txAmt');
    if (!amtEl) return;
    const amt = parseFloat(amtEl.value); 
    if (isNaN(amt) || amt <= 0) return;
    
    const p = peopleData.find(x => x.id === activePersonId); 
    if (!p) return;
    
    const descEl = document.getElementById('txDesc');
    const desc = descEl ? descEl.value : '';
    const now = Date.now(); 
    const d = new Date();
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    if (activeTxType === 'GAVE') {
        const isNormalPerson = !p.isGroup && (!p.interestMode || p.interestMode === 'none');
        if ((isNormalPerson || p.id === 'myself' || p.isGroup) && !p.isGeneral) {
            expensesData.list.unshift({ 
                id: Date.now() + 1, 
                name: `subtracted from ${p.name}`, 
                amount: amt, 
                date: dateStr, 
                icon: 'fa-money-bill-transfer' 
            });
        }
    }
    
    if (p.isGroup) {
        const splitAmt = amt / p.members.length;
        p.members.forEach(mId => { 
            const m = peopleData.find(x => x.id === mId); 
            if (m) m.transactions.push({ id: now + Math.random(), type: activeTxType, amount: splitAmt, desc: `(Group: ${p.name}) ${desc}`, date: dateStr }); 
        });
    } else {
        p.transactions.push({ id: now, type: activeTxType, amount: amt, desc: desc, date: dateStr });
    }
    
    saveAll(); 
    closeTxModal(); 
    renderPersonDetailsInternal(p); 
    if (location.hash.startsWith('#/expenses')) renderExpenses();
}
