/* FinCaL Section Router & Gesture Navigation Engine */

let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
const sectionCache = {};

async function loadSectionHTML(sectionName) {
    const container = document.getElementById('section-container');
    if (!container) return;
    
    // Attempt fetch from sections/<sectionName>.html
    if (!sectionCache[sectionName]) {
        try {
            const res = await fetch(`sections/${sectionName}.html`);
            if (res.ok) {
                sectionCache[sectionName] = await res.text();
            }
        } catch (e) {
            console.warn("Local file protocol fetch note: section content will load via embedded container if fetch is blocked.", e);
        }
    }
    
    if (sectionCache[sectionName]) {
        container.innerHTML = sectionCache[sectionName];
    }
}

function updateActiveTabButtons(tab) {
    currentTab = tab; 
    const btnExp = document.getElementById('btn-tab-expenses');
    const btnPeo = document.getElementById('btn-tab-people');
    const btnNot = document.getElementById('btn-tab-notes');
    
    if (btnExp) btnExp.classList.remove('active');
    if (btnPeo) btnPeo.classList.remove('active');
    if (btnNot) btnNot.classList.remove('active');
    
    const activeBtn = document.getElementById(`btn-tab-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');
}

async function handleRoute() {
    const hash = window.location.hash || '#/login';
    
    // Auth Check Guard
    if (!currentUser) {
        if (hash === '#/register') {
            await loadSectionHTML('login');
            renderAuthScreen();
            showRegister();
        } else {
            await loadSectionHTML('login');
            renderAuthScreen();
            showLogin();
        }
        return;
    }
    
    // Display Authenticated App Shell
    const loginView = document.getElementById('login-view');
    if (loginView) {
        loginView.style.display = 'none';
        loginView.classList.add('view-hidden');
    }
    
    const appView = document.getElementById('app-view');
    if (appView) appView.classList.remove('view-hidden');
    
    const userHeader = document.getElementById('headerUsername');
    if (userHeader) userHeader.innerText = currentUser.name;
    
    if (hash === '#/login' || hash === '#/register') {
        window.location.hash = '#/expenses';
        return;
    }
    
    if (hash.startsWith('#/people/')) {
        const id = hash.replace('#/people/', '');
        updateActiveTabButtons('people');
        await loadSectionHTML('people');
        renderPeopleGrid();
        openPersonDetails(id);
        return;
    } else {
        const overlay = document.getElementById('personDetailOverlay');
        if (overlay && overlay.classList.contains('open') && !hash.startsWith('#/people/')) {
            overlay.classList.replace('open', 'closed');
        }
    }
    
    if (hash.startsWith('#/notes/')) {
        const id = hash.replace('#/notes/', '');
        updateActiveTabButtons('notes');
        await loadSectionHTML('notes');
        renderNotes();
        openNoteViewerOverlay(id);
        return;
    } else {
        const overlay = document.getElementById('noteInlineViewerOverlay');
        if (overlay && !overlay.classList.contains('hidden') && !hash.startsWith('#/notes/')) {
            overlay.classList.add('hidden');
        }
    }
    
    if (hash === '#/people') {
        updateActiveTabButtons('people');
        await loadSectionHTML('people');
        renderPeopleGrid();
    } else if (hash === '#/notes') {
        updateActiveTabButtons('notes');
        await loadSectionHTML('notes');
        renderNotes();
    } else if (hash === '#/expenses' || hash === '#/' || hash === '') {
        updateActiveTabButtons('expenses');
        await loadSectionHTML('expenses');
        showAllExpenses = false;
        renderExpenses();
    } else {
        window.location.hash = '#/expenses';
    }
}

function initSwipeListeners() {
    const appView = document.getElementById('app-view');
    if (!appView) return;
    appView.addEventListener('touchstart', e => { 
        touchStartX = e.changedTouches[0].screenX; 
        touchStartY = e.changedTouches[0].screenY; 
    }, { passive: true });
    
    appView.addEventListener('touchend', e => { 
        touchEndX = e.changedTouches[0].screenX; 
        touchEndY = e.changedTouches[0].screenY; 
        handleSwipe(); 
    }, { passive: true });
}

function handleSwipe() {
    const pOverlay = document.getElementById('personDetailOverlay');
    if (pOverlay && pOverlay.classList.contains('open')) return;
    
    const modals = ['monthlyStatsModal', 'editInterestModal', 'txInputModal', 'addPersonContainer', 'historyModal', 'manualModal', 'editTxModal', 'addPastExpenseModal', 'noteInlineViewerOverlay'];
    for (let id of modals) {
        const el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) return;
    }

    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) { 
        if (xDiff > 0) {
            if (currentTab === 'expenses') window.location.hash = '#/people';
            else if (currentTab === 'people') window.location.hash = '#/notes';
        } else {
            if (currentTab === 'notes') window.location.hash = '#/people';
            else if (currentTab === 'people') window.location.hash = '#/expenses';
        }
    }
}

window.addEventListener('hashchange', handleRoute);
