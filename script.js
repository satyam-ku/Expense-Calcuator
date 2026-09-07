/* FinCaL Application Orchestrator & Initialization Entry Point */

window.addEventListener('DOMContentLoaded', async () => {
    await initSystem();
    initSwipeListeners();
    handleRoute();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});
