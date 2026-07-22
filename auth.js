/* FinCaL Auth & User Registry Controller */

function renderAuthScreen() {
    const appView = document.getElementById('app-view');
    if (appView) appView.classList.add('view-hidden');
    
    const loginView = document.getElementById('login-view');
    if (loginView) {
        loginView.style.display = 'flex';
        loginView.classList.remove('view-hidden');
    }
    
    if (userRegistry.length === 0) showRegister(); 
    else showLogin();
}

function showRegister() { 
    if (!location.hash.includes('register')) {
        location.hash = '#/register';
    }
    const loginAuth = document.getElementById('login-auth');
    const loginReg = document.getElementById('login-register');
    if (loginAuth) loginAuth.classList.add('view-hidden'); 
    if (loginReg) loginReg.classList.remove('view-hidden'); 
}

function showLogin() {
    if (!location.hash.includes('login') && location.hash !== '' && location.hash !== '#/') {
        location.hash = '#/login';
    }
    const loginReg = document.getElementById('login-register');
    const loginAuth = document.getElementById('login-auth');
    if (loginReg) loginReg.classList.add('view-hidden');
    if (loginAuth) loginAuth.classList.remove('view-hidden');
    
    const select = document.getElementById('userSelect');
    if (select) {
        select.innerHTML = '';
        userRegistry.forEach(u => { 
            const opt = document.createElement('option'); 
            opt.value = u.id; 
            opt.text = u.name; 
            select.appendChild(opt); 
        });
    }
}

function registerUser() {
    const nameEl = document.getElementById('regName');
    const pinEl = document.getElementById('regPin');
    if (!nameEl || !pinEl) return;
    
    const name = nameEl.value.trim();
    const pin = pinEl.value.trim();
    if (!name || pin.length !== 4) return alert("Name & 4-digit PIN required");
    
    const newUser = { id: 'u_' + Date.now(), name: name, pin: pin };
    userRegistry.push(newUser);
    localStorage.setItem('neonFlux_registry', JSON.stringify(userRegistry));
    currentUser = newUser;
    loadApp();
}

function authenticateUser() {
    const select = document.getElementById('userSelect');
    const pinField = document.getElementById('authPin');
    if (!select || !pinField) return;
    
    const selectedId = select.value;
    const user = userRegistry.find(u => u.id === selectedId);
    if (user && pinField.value.trim() === user.pin) {
        currentUser = user;
        loadApp();
        pinField.value = '';
    } else {
        pinField.classList.add('animate-shake');
        setTimeout(() => pinField.classList.remove('animate-shake'), 400);
        pinField.value = '';
    }
}

function loadApp() {
    const loginView = document.getElementById('login-view');
    if (loginView) {
        loginView.style.display = 'none';
        loginView.classList.add('view-hidden');
    }
    
    const appView = document.getElementById('app-view');
    if (appView) appView.classList.remove('view-hidden');
    
    const userHeader = document.getElementById('headerUsername');
    if (userHeader) userHeader.innerText = currentUser.name;
    
    loadData(); 
    if (!location.hash.startsWith('#/expenses') && !location.hash.startsWith('#/people') && !location.hash.startsWith('#/notes')) {
        location.hash = '#/expenses';
    } else {
        if (typeof handleRoute === 'function') handleRoute();
    }
}

async function logout() { 
    if (await customConfirm("Logout", "Are you sure you want to exit?")) {
        currentUser = null; 
        const appView = document.getElementById('app-view');
        if (appView) appView.classList.add('view-hidden'); 
        location.hash = '#/login';
        renderAuthScreen(); 
    }
}
