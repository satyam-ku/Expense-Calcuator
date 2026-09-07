/* FinCaL Memos & Notes Engine (Full Notes App Subsystem) */

let editingNoteId = null;

function parseTxDate(dateStr) {
    if (!dateStr) return 0;
    const parts = extractDateParts(dateStr);
    const cleanStr = String(dateStr).replace(/,/g, ' ');
    const tokens = cleanStr.trim().split(/\s+/);
    let hours = 12, minutes = 0;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].includes(':')) {
            const timeParts = tokens[i].split(':');
            hours = parseInt(timeParts[0]) || 12;
            minutes = parseInt(timeParts[1]) || 0;
        }
        if (tokens[i].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (tokens[i].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    return new Date(parts.year, parts.monthIdx, parts.day, hours, minutes).getTime();
}

// 1. Schema Migration & Data Normalization
function migrateNotesSchema() {
    if (!Array.isArray(notesData)) notesData = [];
    notesData.forEach(n => {
        if (!n.category) n.category = 'Personal';
        if (typeof n.isPinned === 'undefined') n.isPinned = false;
        if (typeof n.isFavorite === 'undefined') n.isFavorite = false;
        if (typeof n.isArchived === 'undefined') n.isArchived = false;
        if (typeof n.isTrashed === 'undefined') n.isTrashed = false;
        if (!n.colorCode) n.colorCode = 'neonBlue';
    });
}

// 2. Character Counter & Speech Reader
function updateNoteCharCount(fieldId, counterId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const content = field.value;
    const counter = document.getElementById(counterId);
    if (counter) counter.innerText = `${content.length} chars`;
}

function triggerSpeechPlayback(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textCleanup = text.replace(/<\/?[^>]+(>|$)/g, "");
        const utterance = new SpeechSynthesisUtterance(textCleanup);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Audio playback synthesis engine missing or unvetted.");
    }
}

// 3. Category & Folder Pill Navigation Bar
function renderCategoryPills() {
    const container = document.getElementById('notesCategoryPillsContainer');
    if (!container) return;
    
    migrateNotesSchema();
    
    // Core Folder & Category List
    const defaultCats = ['Personal', 'Work', 'Study', 'Ideas'];
    const customCats = userNoteCategories.filter(c => !defaultCats.includes(c));
    
    let html = '';
    
    // All Pill
    const isAll = activeNoteFilter === 'all';
    html += `
        <button onclick="setNotesFilter('all')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isAll ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}">
            <i class="fa-solid fa-layer-group mr-1.5 text-[10px]"></i> All
        </button>
    `;
    
    // Standard Categories
    const catIcons = {
        'Personal': 'fa-user',
        'Work': 'fa-briefcase',
        'Study': 'fa-graduation-cap',
        'Ideas': 'fa-lightbulb'
    };
    
    defaultCats.forEach(cat => {
        const isActive = activeNoteFilter === cat;
        const icon = catIcons[cat] || 'fa-tag';
        html += `
            <button onclick="setNotesFilter('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isActive ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}">
                <i class="fa-solid ${icon} mr-1.5 text-[10px]"></i> ${cat}
            </button>
        `;
    });
    
    // Custom Categories
    customCats.forEach(cat => {
        const isActive = activeNoteFilter === cat;
        html += `
            <button onclick="setNotesFilter('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isActive ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,166,35,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}">
                <i class="fa-solid fa-tag mr-1.5 text-[10px]"></i> ${cat}
            </button>
        `;
    });
    
    // Special Folders (Favorites, Archive, Trash)
    const isFav = activeNoteFilter === 'favorites';
    html += `
        <button onclick="setNotesFilter('favorites')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isFav ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-white/5 text-yellow-400/80 border-yellow-400/20 hover:bg-yellow-400/10'}">
            <i class="fa-solid fa-star mr-1.5 text-[10px]"></i> Favorites
        </button>
    `;
    
    const isArch = activeNoteFilter === 'archive';
    html += `
        <button onclick="setNotesFilter('archive')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isArch ? 'bg-sky-400 text-black border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]' : 'bg-white/5 text-sky-400/80 border-sky-400/20 hover:bg-sky-400/10'}">
            <i class="fa-solid fa-box-archive mr-1.5 text-[10px]"></i> Archive
        </button>
    `;
    
    const isTrash = activeNoteFilter === 'trash';
    html += `
        <button onclick="setNotesFilter('trash')" class="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${isTrash ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-red-400/80 border-red-400/20 hover:bg-red-400/10'}">
            <i class="fa-solid fa-trash-can mr-1.5 text-[10px]"></i> Trash
        </button>
    `;
    
    container.innerHTML = html;
}

function setNotesFilter(filter) {
    activeNoteFilter = filter;
    
    const headingEl = document.getElementById('notesViewHeading');
    if (headingEl) {
        if (filter === 'all') headingEl.innerText = "All Notes";
        else if (filter === 'favorites') headingEl.innerText = "Favorite Notes ⭐";
        else if (filter === 'archive') headingEl.innerText = "Archived Notes 📦";
        else if (filter === 'trash') headingEl.innerText = "Trash Bin 🗑️";
        else headingEl.innerText = `Category: ${filter}`;
    }
    
    const trashBanner = document.getElementById('trashBanner');
    if (trashBanner) {
        if (filter === 'trash') trashBanner.classList.remove('hidden');
        else trashBanner.classList.add('hidden');
    }
    
    renderCategoryPills();
    renderNotes();
}

// 4. View Mode Toggle (Grid vs List)
function toggleNotesViewMode() {
    notesViewMode = notesViewMode === 'grid' ? 'list' : 'grid';
    saveAll();
    updateViewModeButton();
    renderNotes();
}

function updateViewModeButton() {
    const icon = document.getElementById('iconViewMode');
    const label = document.getElementById('labelViewMode');
    if (icon && label) {
        if (notesViewMode === 'grid') {
            icon.className = "fa-solid fa-table-cells";
            label.innerText = "Grid";
        } else {
            icon.className = "fa-solid fa-list-ul";
            label.innerText = "List";
        }
    }
}

// 5. Sort Order Handler
function changeNotesSortOrder(order) {
    notesSortOrder = order;
    saveAll();
    renderNotes();
}

// 6. Main Notes Grid / List Rendering Engine
function renderNotes() {
    migrateNotesSchema();
    renderCategoryPills();
    updateViewModeButton();

    const sortSel = document.getElementById('selectNotesSort');
    if (sortSel) sortSel.value = notesSortOrder;

    const searchInput = document.getElementById('noteSearch');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const grid = document.getElementById('notesGrid');
    if (!grid) return;
    
    // Apply Grid vs List layout classes to container
    if (notesViewMode === 'list') {
        grid.className = "flex flex-col gap-3 min-h-[250px]";
    } else {
        grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[250px]";
    }
    
    grid.innerHTML = '';

    // Filter Logic
    let filtered = [...notesData];
    
    if (activeNoteFilter === 'all') {
        filtered = filtered.filter(n => !n.isArchived && !n.isTrashed);
    } else if (activeNoteFilter === 'favorites') {
        filtered = filtered.filter(n => n.isFavorite && !n.isTrashed);
    } else if (activeNoteFilter === 'archive') {
        filtered = filtered.filter(n => n.isArchived && !n.isTrashed);
    } else if (activeNoteFilter === 'trash') {
        filtered = filtered.filter(n => n.isTrashed);
    } else {
        // Specific Category Filter
        filtered = filtered.filter(n => n.category === activeNoteFilter && !n.isTrashed && !n.isArchived);
    }

    // Search Query Filter
    if (query) {
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(query) || 
            n.content.toLowerCase().includes(query) ||
            n.category.toLowerCase().includes(query)
        );
    }

    // Sort Logic strictly based on Note Date
    filtered.sort((a, b) => {
        // Pinned notes always float to top!
        const pA = a.isPinned ? 1 : 0;
        const pB = b.isPinned ? 1 : 0;
        if (pB !== pA) return pB - pA;
        
        if (notesSortOrder === 'date-asc') {
            const tA = parseTxDate(a.date);
            const tB = parseTxDate(b.date);
            return (tA - tB) || (a.id - b.id);
        }
        if (notesSortOrder === 'title') return a.title.localeCompare(b.title);
        if (notesSortOrder === 'category') return a.category.localeCompare(b.category);
        
        // date-desc default: newest note date first
        const tA = parseTxDate(a.date);
        const tB = parseTxDate(b.date);
        return (tB - tA) || (b.id - a.id);
    });

    const emptyState = document.getElementById('notesEmptyState');

    if (filtered.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const iconEl = document.getElementById('emptyStateIcon');
            const textEl = document.getElementById('emptyStateText');
            if (iconEl && textEl) {
                if (activeNoteFilter === 'trash') {
                    iconEl.className = "fa-solid fa-trash-can text-3xl text-gray-600";
                    textEl.innerText = "Trash Bin is Empty";
                } else if (activeNoteFilter === 'archive') {
                    iconEl.className = "fa-solid fa-box-archive text-3xl text-gray-600";
                    textEl.innerText = "No Archived Memos";
                } else if (activeNoteFilter === 'favorites') {
                    iconEl.className = "fa-solid fa-star text-3xl text-gray-600";
                    textEl.innerText = "No Favorite Notes";
                } else {
                    iconEl.className = "fa-solid fa-note-sticky text-3xl text-gray-600";
                    textEl.innerText = query ? "No Match Found" : "No Notes Available";
                }
            }
        }
    } else {
        if (emptyState) emptyState.classList.add('hidden');
        
        filtered.forEach(note => {
            let borderClass = 'border-amber-500/30';
            let textClass = 'text-amber-400';
            if (note.colorCode === 'neonGreen') { borderClass = 'border-neonGreen/30'; textClass = 'text-neonGreen'; }
            else if (note.colorCode === 'neonPurple') { borderClass = 'border-neonPurple/30'; textClass = 'text-neonPurple'; }
            else if (note.colorCode === 'neonPink') { borderClass = 'border-neonPink/30'; textClass = 'text-neonPink'; }

            const inTrash = note.isTrashed;
            const inArchive = note.isArchived;

            if (notesViewMode === 'list') {
                // List Row View
                grid.innerHTML += `
                    <div onclick="navigateToNoteViewer(${note.id})" class="glass-card-floating p-4 border ${borderClass} flex items-center justify-between relative group cursor-pointer hover:bg-white/5 transition-all ${note.isPinned ? 'shadow-[0_0_15px_rgba(245,166,35,0.15)]' : ''}">
                        <div class="flex items-center gap-4 min-w-0 flex-1">
                            <button onclick="event.stopPropagation(); togglePinNoteState(${note.id})" class="text-xs ${note.isPinned ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}"><i class="fa-solid fa-thumbtack"></i></button>
                            <button onclick="event.stopPropagation(); toggleFavoriteNote(${note.id})" class="text-xs ${note.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}"><i class="fa-solid fa-star"></i></button>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="text-sm font-bold text-white uppercase tracking-wide truncate max-w-[200px]">${note.title}</h4>
                                    <span class="text-[9px] font-bold font-mono ${textClass} bg-black/50 border border-white/10 px-2 py-0.5 rounded-full uppercase truncate">${note.category}</span>
                                </div>
                                <p class="text-xs text-gray-400 truncate mt-0.5">${note.content}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 ml-4 shrink-0" onclick="event.stopPropagation();">
                            <span class="text-[9px] text-gray-500 font-mono hidden sm:inline-block">${note.date}</span>
                            ${inTrash ? `
                                <button onclick="restoreNote(${note.id})" title="Restore Note" class="text-xs text-neonGreen hover:text-white uppercase"><i class="fa-solid fa-rotate-left mr-1"></i>Restore</button>
                                <button onclick="deletePermanently(${note.id})" title="Delete Permanently" class="text-xs text-red-500 hover:text-white uppercase ml-2"><i class="fa-solid fa-xmark mr-1"></i>Wipe</button>
                            ` : `
                                <button onclick="openEditNoteModal(${note.id})" title="Edit" class="text-xs text-neonBlue hover:text-white"><i class="fa-solid fa-pen"></i></button>
                                <button onclick="${inArchive ? `unarchiveNote(${note.id})` : `archiveNote(${note.id})`}" title="${inArchive ? 'Unarchive' : 'Archive'}" class="text-xs text-sky-400 hover:text-white"><i class="fa-solid ${inArchive ? 'fa-box-open' : 'fa-box-archive'}"></i></button>
                                <button onclick="trashNote(${note.id})" title="Trash" class="text-xs text-gray-600 hover:text-red-500"><i class="fa-solid fa-trash-can"></i></button>
                            `}
                        </div>
                    </div>
                `;
            } else {
                // Multi-Column Grid View Card
                grid.innerHTML += `
                    <div onclick="navigateToNoteViewer(${note.id})" class="glass-card-floating p-6 border ${borderClass} flex flex-col justify-between relative group cursor-pointer ${note.isPinned ? 'shadow-[0_0_20px_rgba(245,166,35,0.18)] border-amber-400/40' : ''}">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2 max-w-[70%]">
                                    <h4 class="text-base font-bold text-white uppercase tracking-wide truncate">${note.title}</h4>
                                </div>
                                <div class="flex gap-1.5 items-center" onclick="event.stopPropagation();">
                                    <button onclick="togglePinNoteState(${note.id})" title="Pin Note" class="text-xs p-1 ${note.isPinned ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}"><i class="fa-solid fa-thumbtack"></i></button>
                                    <button onclick="toggleFavoriteNote(${note.id})" title="Favorite" class="text-xs p-1 ${note.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}"><i class="fa-solid fa-star"></i></button>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <span class="text-[9px] font-bold font-mono tracking-widest ${textClass} bg-black/50 border border-white/10 px-2.5 py-0.5 rounded-full uppercase">${note.category}</span>
                            </div>

                            <p class="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 truncate line-clamp-3">${note.content}</p>
                        </div>

                        <div class="flex justify-between items-center pt-3 border-t border-white/10" onclick="event.stopPropagation();">
                            <span class="text-[10px] text-gray-500 font-mono font-bold uppercase">${note.date}</span>
                            
                            <div class="flex items-center gap-3">
                                ${inTrash ? `
                                    <button onclick="restoreNote(${note.id})" class="text-[10px] text-neonGreen hover:text-white font-mono font-bold uppercase"><i class="fa-solid fa-rotate-left mr-1"></i>Restore</button>
                                    <button onclick="deletePermanently(${note.id})" class="text-[10px] text-red-500 hover:text-white font-mono font-bold uppercase"><i class="fa-solid fa-xmark mr-1"></i>Wipe</button>
                                ` : `
                                    <button onclick="openEditNoteModal(${note.id})" class="text-[10px] text-neonBlue hover:text-white font-mono font-bold uppercase">Edit</button>
                                    <span class="text-[10px] text-gray-700">|</span>
                                    <button onclick="${inArchive ? `unarchiveNote(${note.id})` : `archiveNote(${note.id})`}" class="text-[10px] text-sky-400 hover:text-white font-mono font-bold uppercase">${inArchive ? 'Unarchive' : 'Archive'}</button>
                                    <span class="text-[10px] text-gray-700">|</span>
                                    <button onclick="trashNote(${note.id})" class="text-[10px] text-gray-500 hover:text-red-500 font-mono font-bold uppercase">Trash</button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// 7. Note Lifecycle Actions
function togglePinNoteState(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isPinned = !note.isPinned;
        saveAll();
        renderNotes();
    }
}

function toggleFavoriteNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isFavorite = !note.isFavorite;
        saveAll();
        renderNotes();
    }
}

function archiveNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isArchived = true;
        saveAll();
        renderNotes();
    }
}

function unarchiveNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isArchived = false;
        saveAll();
        renderNotes();
    }
}

function trashNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isTrashed = true;
        saveAll();
        renderNotes();
    }
}

function restoreNote(id) {
    const note = notesData.find(n => n.id === id);
    if (note) {
        note.isTrashed = false;
        saveAll();
        renderNotes();
    }
}

async function deletePermanently(id) {
    if (await customConfirm("Permanent Delete", "Wipe this note permanently from memory?")) {
        notesData = notesData.filter(n => n.id !== id);
        saveAll();
        renderNotes();
    }
}

async function emptyTrashBin() {
    const trashedCount = notesData.filter(n => n.isTrashed).length;
    if (trashedCount === 0) return alert("Trash bin is already empty.");
    
    if (await customConfirm("Empty Trash", `Permanently wipe ${trashedCount} trashed note(s)?`)) {
        notesData = notesData.filter(n => !n.isTrashed);
        saveAll();
        renderNotes();
    }
}

// 8. Create & Edit Note Modal
function openCreateNoteModal(id = null) {
    editingNoteId = id;
    migrateNotesSchema();
    
    const headerTitle = document.getElementById('noteModalHeaderTitle');
    const titleInput = document.getElementById('noteModalTitle');
    const contentInput = document.getElementById('noteModalContent');
    const catSelect = document.getElementById('noteModalCategory');
    const colorSelect = document.getElementById('noteModalColor');
    const pinnedCheck = document.getElementById('noteModalPinned');
    const favCheck = document.getElementById('noteModalFavorite');
    
    // Populate Category Select Dropdown
    if (catSelect) {
        catSelect.innerHTML = '';
        userNoteCategories.forEach(cat => {
            catSelect.innerHTML += `<option value="${cat}" class="bg-black">${cat}</option>`;
        });
    }

    if (id !== null) {
        // Edit Mode
        const note = notesData.find(n => n.id === id);
        if (!note) return;
        
        if (headerTitle) headerTitle.innerText = "Edit Note";
        if (titleInput) titleInput.value = note.title;
        if (contentInput) contentInput.value = note.content;
        if (catSelect) catSelect.value = note.category || 'Personal';
        if (colorSelect) colorSelect.value = note.colorCode || 'neonBlue';
        if (pinnedCheck) pinnedCheck.checked = !!note.isPinned;
        if (favCheck) favCheck.checked = !!note.isFavorite;
    } else {
        // Create Mode
        if (headerTitle) headerTitle.innerText = "Create Note";
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        if (catSelect) catSelect.value = activeNoteFilter !== 'all' && activeNoteFilter !== 'favorites' && activeNoteFilter !== 'archive' && activeNoteFilter !== 'trash' ? activeNoteFilter : 'Personal';
        if (colorSelect) colorSelect.value = 'neonBlue';
        if (pinnedCheck) pinnedCheck.checked = false;
        if (favCheck) favCheck.checked = false;
    }
    
    updateNoteCharCount('noteModalContent', 'noteModalCharCounter');
    
    const modal = document.getElementById('createEditNoteModal');
    if (modal) modal.classList.remove('hidden');
}

function closeCreateEditNoteModal() {
    const modal = document.getElementById('createEditNoteModal');
    if (modal) modal.classList.add('hidden');
    editingNoteId = null;
}

function submitSaveNoteModal() {
    const titleInput = document.getElementById('noteModalTitle');
    const contentInput = document.getElementById('noteModalContent');
    const catSelect = document.getElementById('noteModalCategory');
    const colorSelect = document.getElementById('noteModalColor');
    const pinnedCheck = document.getElementById('noteModalPinned');
    const favCheck = document.getElementById('noteModalFavorite');
    
    if (!titleInput || !contentInput) return;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const category = catSelect ? catSelect.value : 'Personal';
    const colorCode = colorSelect ? colorSelect.value : 'neonBlue';
    const isPinned = pinnedCheck ? pinnedCheck.checked : false;
    const isFavorite = favCheck ? favCheck.checked : false;
    
    if (!title || !content) return alert("Note Title and Content required.");
    
    const now = new Date();
    const timestamp = formatCurrentDateTime(now);
    
    if (editingNoteId !== null) {
        // Update Existing
        const note = notesData.find(n => n.id === editingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.category = category;
            note.colorCode = colorCode;
            note.isPinned = isPinned;
            note.isFavorite = isFavorite;
            note.date = timestamp + " (Edited)";
        }
    } else {
        // Create New
        notesData.unshift({
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            colorCode: colorCode,
            date: timestamp,
            isPinned: isPinned,
            isFavorite: isFavorite,
            isArchived: false,
            isTrashed: false
        });
    }
    
    saveAll();
    closeCreateEditNoteModal();
    renderNotes();
}

function openEditNoteModal(id) {
    openCreateNoteModal(id);
}

// 9. Custom Category Creator Modal
function openCustomCategoryModal() {
    const input = document.getElementById('customCategoryInput');
    if (input) input.value = '';
    const modal = document.getElementById('addCustomCategoryModal');
    if (modal) modal.classList.remove('hidden');
}

function closeCustomCategoryModal() {
    const modal = document.getElementById('addCustomCategoryModal');
    if (modal) modal.classList.add('hidden');
}

function submitCustomCategory() {
    const input = document.getElementById('customCategoryInput');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return alert("Category name required.");
    
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    if (!userNoteCategories.includes(formatted)) {
        userNoteCategories.push(formatted);
        saveAll();
    }
    
    closeCustomCategoryModal();
    activeNoteFilter = formatted;
    renderNotes();
}

// 10. Notes Settings Modal & Export Utilities
function openNotesSettingsModal() {
    const modal = document.getElementById('notesSettingsModal');
    if (modal) modal.classList.remove('hidden');
}

function closeNotesSettingsModal() {
    const modal = document.getElementById('notesSettingsModal');
    if (modal) modal.classList.add('hidden');
}

function exportNotesJSON() {
    const jsonStr = JSON.stringify(notesData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${currentUser ? currentUser.name : 'fincal'}_notes.json`);
    a.click();
}

function exportNotesTXT() {
    let txt = "=== FINCAL NOTES EXPORT ===\n\n";
    notesData.forEach((n, idx) => {
        txt += `[#${idx + 1}] ${n.title.toUpperCase()}\n`;
        txt += `Category: ${n.category} | Date: ${n.date}\n`;
        txt += `Status: ${n.isPinned ? 'Pinned ' : ''}${n.isFavorite ? 'Favorite ' : ''}${n.isArchived ? 'Archived ' : ''}${n.isTrashed ? 'Trashed ' : ''}\n`;
        txt += `----------------------------------------\n`;
        txt += `${n.content}\n\n`;
    });
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${currentUser ? currentUser.name : 'fincal'}_notes.txt`);
    a.click();
}

// 11. Viewer Overlay Route Integration (#/notes/:id)
function navigateToNoteViewer(id) {
    location.hash = `#/notes/${id}`;
}

function openNoteViewerOverlay(id) {
    let targetId = id;
    if (typeof id === 'string') {
        targetId = parseInt(id) || id;
    }
    const targetNote = notesData.find(n => n.id === targetId);
    if (!targetNote) return;

    activeNoteViewingId = targetId;
    const titleField = document.getElementById('noteViewTitleField');
    const contentField = document.getElementById('noteViewContentField');
    const tagSel = document.getElementById('noteViewTagSelector');
    
    if (titleField) titleField.value = targetNote.title;
    if (contentField) contentField.value = targetNote.content;
    if (tagSel) tagSel.value = targetNote.colorCode || 'neonBlue';
    
    const pinBtn = document.getElementById('noteViewPinBtn');
    if (pinBtn) {
        pinBtn.className = targetNote.isPinned ? "text-xs text-amber-400" : "text-xs text-gray-500 hover:text-amber-400";
        pinBtn.onclick = function(e) {
            e.stopPropagation();
            togglePinNoteState(targetId);
            const updated = notesData.find(n => n.id === targetId);
            if (updated && pinBtn) pinBtn.className = updated.isPinned ? "text-xs text-amber-400" : "text-xs text-gray-500 hover:text-amber-400";
        };
    }

    const speechBtn = document.getElementById('noteViewSpeechBtn');
    if (speechBtn) {
        speechBtn.onclick = function(e) {
            e.stopPropagation();
            const textVal = contentField ? contentField.value : '';
            triggerSpeechPlayback(textVal);
        };
    }

    const metaLabel = document.getElementById('noteViewMetaLabel');
    if (metaLabel) metaLabel.innerText = `Logged: ${targetNote.date} [${targetNote.category}]`;
    updateNoteCharCount('noteViewContentField', 'noteViewCharCounter');
    
    const overlay = document.getElementById('noteInlineViewerOverlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeNoteViewerOverlay() {
    const overlay = document.getElementById('noteInlineViewerOverlay');
    if (overlay) overlay.classList.add('hidden');
    activeNoteViewingId = null;
    if (location.hash.startsWith('#/notes/')) {
        location.hash = '#/notes';
    }
}

function commitNoteViewerSave() {
    if (activeNoteViewingId === null) return;
    const titleField = document.getElementById('noteViewTitleField');
    const contentField = document.getElementById('noteViewContentField');
    const tagSel = document.getElementById('noteViewTagSelector');
    if (!titleField || !contentField || !tagSel) return;
    
    const newTitle = titleField.value.trim();
    const newContent = contentField.value.trim();
    const newTag = tagSel.value;

    if (!newTitle || !newContent) return alert("Note inputs cannot remain blank.");

    const targetIdx = notesData.findIndex(n => n.id === activeNoteViewingId);
    if (targetIdx !== -1) {
        const now = new Date();
        const timestamp = formatCurrentDateTime(now);
        
        notesData[targetIdx].title = newTitle;
        notesData[targetIdx].content = newContent;
        notesData[targetIdx].colorCode = newTag;
        notesData[targetIdx].date = timestamp + " (Edited)";
    }

    saveAll();
    closeNoteViewerOverlay();
    renderNotes();
}
