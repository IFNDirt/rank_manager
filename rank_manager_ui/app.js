window.GMOD = window.GMOD || {};

// Medal data from server
window.RANK_MANAGER_MEDAL_DATA = {};

function handleMedalData(medalJson) {
    try {
        window.RANK_MANAGER_MEDAL_DATA = JSON.parse(medalJson);
    } catch (error) {
        console.error("Error processing medal data:", error);
    }
}

// Permissions system
window.RANK_MANAGER_PERMISSIONS = {
    currentPlayer: null,
    permissions: {},
    
    setCurrentPlayer(player) {
        this.currentPlayer = player;
        this.permissions = player.permissions || {};
    },
    
    isOwnProfile(targetPlayer) {
        if (!this.currentPlayer || !targetPlayer) return false;
        return this.currentPlayer.id === targetPlayer.id;
    },
    
    can(action, targetPlayer, faction) {
        if (!this.currentPlayer) return false;
        return this.permissions[action] || false;
    },
    
    getAvailableActions(targetPlayer, faction) {
        if (!this.currentPlayer) return [];
        
        const actions = [];
        for (const [action, hasPermission] of Object.entries(this.permissions)) {
            if (hasPermission) {
                actions.push(action);
            }
        }
        return actions;
    }
};

// Modal system
class SimpleModal {
    constructor() {
        this.currentModal = null;
    }
    
    createModal(title, content) {
        this.close();
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'simple-modal-container';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'simple-modal-content';
        
        const header = document.createElement('div');
        header.className = 'simple-modal-header';
        
        const titleEl = document.createElement('h3');
        titleEl.textContent = title;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'simple-modal-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => this.close();
        
        const body = document.createElement('div');
        body.className = 'simple-modal-body';
        body.innerHTML = content;
        
        header.appendChild(titleEl);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
        
        this.currentModal = modalContainer;
        
        // Close on escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Close on overlay click
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                this.close();
            }
        });
    }
    
    close() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }
}

// State management
class RankManager {
    constructor() {
        this.state = {
            players: [],
            currentPlayer: null,
            currentFaction: null,
            history: [],
            historyPage: 1,
            historyLoading: false
        };
        this.listeners = [];
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
    
    createPlayerCard(player) {
        const avatar = player.avatar || 'https://via.placeholder.com/40';
        const name = player.name || 'Unknown Player';
        const rank = player.rank || 'Unknown Rank';
        
        return `
            <div class="player-card" onclick="showPlayerDetail('${player.id}')">
                <img src="${avatar}" alt="${name}" class="player-avatar">
                <div class="player-info">
                    <div class="player-name">${name}</div>
                    <div class="player-rank">${rank}</div>
                </div>
            </div>
        `;
    }
    
    createFormField(label, value, type = "text", options = []) {
        let input = '';
        
        if (type === "select") {
            input = `<select class="form-input">`;
            options.forEach(option => {
                const selected = option.value === value ? 'selected' : '';
                input += `<option value="${option.value}" ${selected}>${option.label}</option>`;
            });
            input += `</select>`;
        } else {
            input = `<input type="${type}" class="form-input" value="${value || ''}">`;
        }
        
        return `
            <div class="form-group">
                <label>${label}</label>
                ${input}
            </div>
        `;
    }
    
    createButton(text, onClick, className = "") {
        return `<button class="btn ${className}" onclick="${onClick}">${text}</button>`;
    }
    
    showNotification(message, type = "info") {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Action methods
    promote(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.promote(steamID, faction);
    }
    
    demote(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.demote(steamID, faction);
    }
    
    setRank(steamID, faction, rank) {
        if (typeof rankmgr !== 'undefined') rankmgr.setRank(steamID, faction, rank);
    }
    
    setMedals(steamID, faction, medals) {
        if (typeof rankmgr !== 'undefined') rankmgr.setMedals(steamID, faction, medals);
    }
    
    setQualifications(steamID, faction, quals) {
        if (typeof rankmgr !== 'undefined') rankmgr.setQualifications(steamID, faction, quals);
    }
    
    setSubbranch(steamID, faction, subbranch, subrank) {
        if (typeof rankmgr !== 'undefined') rankmgr.setSubbranch(steamID, faction, subbranch, subrank);
    }
    
    setUnit(steamID, faction, unit) {
        if (typeof rankmgr !== 'undefined') rankmgr.setUnit(steamID, faction, unit);
    }
    
    setBaseName(steamID, baseName) {
        if (typeof rankmgr !== 'undefined') rankmgr.setBaseName(steamID, baseName);
    }
    
    inviteBranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.inviteBranch(steamID, faction);
    }
    
    transferBranch(steamID, faction, newBranch) {
        if (typeof rankmgr !== 'undefined') rankmgr.transferBranch(steamID, faction, newBranch);
    }
    
    requestHistory(steamID, faction, page) {
        if (typeof rankmgr !== 'undefined') rankmgr.requestHistory(steamID, faction, page);
    }
    
    leaveSubbranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.leaveSubbranch(steamID, faction);
    }
    
    inviteToSubbranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.inviteToSubbranch(steamID, faction);
    }
    
    promoteSubbranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.promoteSubbranch(steamID, faction);
    }
    
    demoteSubbranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.demoteSubbranch(steamID, faction);
    }
    
    kickSubbranch(steamID, faction) {
        if (typeof rankmgr !== 'undefined') rankmgr.kickSubbranch(steamID, faction);
    }
    
    forceSubbranch(steamID, faction, subbranch) {
        if (typeof rankmgr !== 'undefined') rankmgr.forceSubbranch(steamID, faction, subbranch);
    }
}

// Global instances
window.RankManager = new RankManager();
window.UI = new SimpleModal();

// Initialize players from server data
function initPlayers(json) {
    try {
        const players = JSON.parse(json);
        RankManager.setState({ players });
        renderPlayerList();
    } catch (error) {
        console.error("Error parsing player data:", error);
    }
}

// Render the player list
function renderPlayerList() {
    const container = document.getElementById('player-list');
    if (!container) return;
    
    const playerCards = RankManager.state.players.map(player => 
        RankManager.createPlayerCard(player)
    ).join('');
    
    container.innerHTML = playerCards;
}

// Show player detail view
function showPlayerDetail(playerId) {
    const player = RankManager.state.players.find(p => p.id === playerId);
    if (!player) return;
    
    RankManager.setState({ currentPlayer: player });
    
    const container = document.getElementById('player-detail');
    if (!container) return;
    
    const factions = Object.keys(player.factions || {});
    
    let content = `
        <div class="preview-header">
            <img src="${player.avatar || 'https://via.placeholder.com/60'}" alt="${player.name}" class="preview-avatar">
            <div class="preview-name">${player.name}</div>
            <button class="close-btn" onclick="closePreview()">×</button>
        </div>
    `;
    
    if (factions.length > 1) {
        content += renderFactionTabs(container, factions);
    }
    
    const currentFaction = RankManager.state.currentFaction || factions[0];
    content += renderFactionDetails(container, player, currentFaction);
    
    container.innerHTML = content;
    document.body.classList.add('preview-active');
}

// Render faction tabs
function renderFactionTabs(container, factionKeys) {
    const tabs = factionKeys.map(faction => {
        const isActive = faction === (RankManager.state.currentFaction || factionKeys[0]);
        return `<button class="faction-tab ${isActive ? 'active' : ''}" onclick="switchFaction('${faction}')">${faction}</button>`;
    }).join('');
    
    return `<div class="faction-tabs">${tabs}</div>`;
}

// Render faction details
function renderFactionDetails(container, player, faction) {
    const data = player.factions && player.factions[faction];
    if (!data) return '<p>No data available for this faction.</p>';
    
    const content = `
        <div class="preview-content">
            <div class="preview-left">
                ${createInfoSection(data)}
                ${createActionButtons(player.id, faction, data)}
            </div>
            <div class="preview-right">
                ${createEditSection(player.id, faction, data)}
            </div>
        </div>
    `;
    
    return content;
}

// Create info section
function createInfoSection(data) {
    return `
        <div class="info-section">
            <h3>Information</h3>
            <p><strong>Rank:</strong> ${data.rank || 'Unknown'}</p>
            <p><strong>Branch:</strong> ${data.branch || 'None'}</p>
            <p><strong>Subbranch:</strong> ${data.subbranch || 'None'}</p>
            <p><strong>Unit:</strong> ${data.unit || 'None'}</p>
            <p><strong>Base Name:</strong> ${data.baseName || 'None'}</p>
        </div>
    `;
}

// Create action buttons
function createActionButtons(playerId, faction, data) {
    const buttons = [];
    
    if (RANK_MANAGER_PERMISSIONS.can('promote', null, faction)) {
        buttons.push(`<button class="btn-promote" onclick="RankManager.promote('${playerId}', '${faction}')">Promote</button>`);
    }
    
    if (RANK_MANAGER_PERMISSIONS.can('demote', null, faction)) {
        buttons.push(`<button class="btn-demote" onclick="RankManager.demote('${playerId}', '${faction}')">Demote</button>`);
    }
    
    if (RANK_MANAGER_PERMISSIONS.can('set_rank', null, faction)) {
        buttons.push(`<button class="btn-set-rank" onclick="manageSetRank('${playerId}', '${faction}')">Set Rank</button>`);
    }
    
    if (RANK_MANAGER_PERMISSIONS.can('invite_branch', null, faction)) {
        buttons.push(`<button class="btn-invite-branch" onclick="manageInviteBranch('${playerId}', '${faction}')">Invite to Branch</button>`);
    }
    
    if (RANK_MANAGER_PERMISSIONS.can('transfer_branch', null, faction)) {
        buttons.push(`<button class="btn-transfer-branch" onclick="manageTransferBranch('${playerId}', '${faction}')">Transfer Branch</button>`);
    }
    
    if (RANK_MANAGER_PERMISSIONS.can('force_subbranch', null, faction)) {
        buttons.push(`<button class="btn-force-subbranch" onclick="manageForceSubbranch('${playerId}', '${faction}')">Force Sub Branch</button>`);
    }
    
    return `
        <div class="action-buttons">
            ${buttons.join('')}
        </div>
    `;
}

// Create edit section
function createEditSection(playerId, faction, data) {
    return `
        <div class="edit-section">
            <h3>Edit</h3>
            ${createPanel('Medals', renderMedals(data.medals || []), false, 'Manage', () => manageMedals(playerId, faction), faction)}
            ${createPanel('Qualifications', renderQualifications(data.qualifications || []), false, 'Manage', () => manageQualifications(playerId, faction), faction)}
            ${createPanel('Sub Branch', renderSubbranch(data.subbranch, data.subrank), false, 'Manage', () => manageSubbranch(playerId, faction), faction)}
            ${createPanel('History', renderHistory(), true)}
        </div>
    `;
}

// Render medals
function renderMedals(medals) {
    if (!medals || medals.length === 0) {
        return '<p>No medals awarded.</p>';
    }
    
    const medalHtml = medals.map(medal => {
        const medalData = window.RANK_MANAGER_MEDAL_DATA[medal];
        const imageUrl = medalData ? medalData.image : '';
        return `<span class="medal" title="${medal}"><img src="${imageUrl}" alt="${medal}" class="medal-image"></span>`;
    }).join('');
    
    return `<div class="medal-strip">${medalHtml}</div>`;
}

// Render qualifications
function renderQualifications(quals) {
    if (!quals || quals.length === 0) {
        return '<p>No qualifications.</p>';
    }
    
    const qualHtml = quals.map(qual => `<span class="qual">${qual}</span>`).join(', ');
    return `<p>${qualHtml}</p>`;
}

// Render subbranch
function renderSubbranch(subbranch, subrank) {
    if (!subbranch) return '<p>No subbranch assigned.</p>';
    return `<p><strong>${subbranch}</strong> - ${subrank || 'No rank'}</p>`;
}

// Render history
function renderHistory() {
    if (RankManager.state.historyLoading) {
        return '<div class="history-loading">Loading history...</div>';
    }
    
    if (!RankManager.state.history || RankManager.state.history.length === 0) {
        return '<div class="history-empty">No history available.</div>';
    }
    
    const historyHtml = RankManager.state.history.map(entry => 
        renderHistoryEntry(entry)
    ).join('');
    
    return `<div class="history-content">${historyHtml}</div>`;
}

// Create panel with management button
function createPanel(titleText, contentHtml, fill = false, manageButtonText = null, manageButtonCallback = null, factionValue = null) {
    let manageButton = '';
    let historyControls = '';
    
    if (titleText === "History") {
        historyControls = `
            <div class="history-controls-inline">
                <button id="history-prev" class="history-nav-btn-inline" onclick="loadHistoryPage(-1)">←</button>
                <span id="history-page-info" class="history-page-info-inline">Page 1</span>
                <button id="history-next" class="history-nav-btn-inline" onclick="loadHistoryPage(1)">→</button>
            </div>
        `;
    }
    
    if (manageButtonText && manageButtonCallback) {
        const callbackStr = manageButtonCallback.toString();
        const match = callbackStr.match(/\(\)\s*=>\s*(\w+)\(([^)]+)\)/);
        
        if (match && factionValue) {
            const funcName = match[1];
            const globalFuncName = `RM_${funcName}`;
            manageButton = `<button class="panel-manage-btn" onclick="${globalFuncName}('${factionValue}')">${manageButtonText}</button>`;
        } else {
            manageButton = `<button class="panel-manage-btn" onclick="${manageButtonCallback}">${manageButtonText}</button>`;
        }
    }
    
    return `
        <div class="panel${fill ? ' fill' : ''}">
            <div class="panel-title">
                <span>${titleText}</span>
                <div class="panel-header-layout">
                    ${historyControls}
                    ${manageButton}
                </div>
            </div>
            <div class="panel-content">${contentHtml}</div>
        </div>
    `;
}

// Management functions
function manageMedals(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        const availableFactions = Object.keys(player.factions || {});
        if (availableFactions.length > 0) {
            const firstFaction = availableFactions[0];
            const firstFactionData = player.factions[firstFaction];
            
            if (firstFactionData) {
                showMedalsModal(steamID, firstFaction, firstFactionData);
                return;
            }
        }
        
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    showMedalsModal(steamID, faction, data);
}

function showMedalsModal(steamID, faction, data) {
    const currentMedals = data.medals || [];
    const availableMedals = Object.keys(window.RANK_MANAGER_MEDAL_DATA);
    
    const medalOptions = availableMedals.map(medal => {
        const isChecked = currentMedals.includes(medal);
        const medalData = window.RANK_MANAGER_MEDAL_DATA[medal];
        const imageUrl = medalData ? medalData.image : '';
        
        return `
            <div class="modal-checkbox-item">
                <input type="checkbox" id="medal-${medal}" ${isChecked ? 'checked' : ''}>
                <label for="medal-${medal}">
                    <img src="${imageUrl}" alt="${medal}" class="medal-image-large">
                    ${medal}
                </label>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">Select the medals to award to this player.</p>
            </div>
            <div class="modal-form-layout">
                <div class="modal-checkbox-group">
                    ${medalOptions}
                </div>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-primary" onclick="saveMedals('${steamID}', '${faction}')">Save Medals</button>
            </div>
        </div>
    `;
    
    UI.createModal("Manage Medals", content);
}

function manageQualifications(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    showQualificationsModal(steamID, faction, data);
}

function showQualificationsModal(steamID, faction, data) {
    const currentQuals = data.qualifications || [];
    const availableQuals = ['Recruiter', 'Instructor', 'Leader', 'Specialist'];
    
    const qualOptions = availableQuals.map(qual => {
        const isChecked = currentQuals.includes(qual);
        return `
            <div class="modal-checkbox-item">
                <input type="checkbox" id="qual-${qual}" ${isChecked ? 'checked' : ''}>
                <label for="qual-${qual}">${qual}</label>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">Select the qualifications for this player.</p>
            </div>
            <div class="modal-form-layout">
                <div class="modal-checkbox-group">
                    ${qualOptions}
                </div>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-primary" onclick="saveQualifications('${steamID}', '${faction}')">Save Qualifications</button>
            </div>
        </div>
    `;
    
    UI.createModal("Manage Qualifications", content);
}

function manageSetRank(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    // Get available ranks from config
    const factionConfig = window.RANK_MANAGER_CONFIG && window.RANK_MANAGER_CONFIG.FACTIONS && window.RANK_MANAGER_CONFIG.FACTIONS[faction];
    const availableRanks = factionConfig ? Object.keys(factionConfig.RANKS || {}) : [];
    
    if (availableRanks.length === 0) {
        UI.showNotification("No ranks available for this faction", "error");
        return;
    }
    
    showSetRankModalWithRanks(steamID, faction, data, availableRanks);
}

function showSetRankModalWithRanks(steamID, faction, data, availableRanks) {
    const currentRank = data.rank || '';
    
    const rankOptions = availableRanks.map(rank => {
        const isSelected = rank === currentRank;
        return `
            <div class="modal-branch-item">
                <input type="radio" name="rank" id="rank-${rank}" value="${rank}" ${isSelected ? 'checked' : ''}>
                <label for="rank-${rank}" class="${isSelected ? 'current' : ''}">${rank}</label>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">Select the new rank for this player.</p>
            </div>
            <div class="modal-form-layout">
                <div class="modal-branch-list">
                    ${rankOptions}
                </div>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-primary" onclick="saveSetRank('${steamID}', '${faction}')">Set Rank</button>
            </div>
        </div>
    `;
    
    UI.createModal("Set Rank", content);
}

function manageSubbranch(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    showSubbranchModal(steamID, faction, data);
}

function showSubbranchModal(steamID, faction, data) {
    const currentSubbranch = data.subbranch || '';
    const currentSubrank = data.subrank || '';
    const hasSubbranch = currentSubbranch && currentSubbranch !== '';
    const isOwnProfile = RANK_MANAGER_PERMISSIONS.isOwnProfile(RankManager.state.currentPlayer);
    
    let actionButtons = '';
    
    if (hasSubbranch) {
        if (isOwnProfile && RANK_MANAGER_PERMISSIONS.can('leave_subbranch', null, faction)) {
            actionButtons += `<button class="btn-danger" onclick="leaveSubbranch('${steamID}', '${faction}')">Leave Sub Branch</button>`;
        }
        
        if (RANK_MANAGER_PERMISSIONS.can('promote_subbranch', null, faction)) {
            actionButtons += `<button class="btn-success" onclick="promoteSubbranch('${steamID}', '${faction}')">Promote</button>`;
        }
        
        if (RANK_MANAGER_PERMISSIONS.can('demote_subbranch', null, faction)) {
            actionButtons += `<button class="btn-warning" onclick="demoteSubbranch('${steamID}', '${faction}')">Demote</button>`;
        }
        
        if (RANK_MANAGER_PERMISSIONS.can('kick_subbranch', null, faction)) {
            actionButtons += `<button class="btn-danger" onclick="kickSubbranch('${steamID}', '${faction}')">Kick</button>`;
        }
    } else {
        if (RANK_MANAGER_PERMISSIONS.can('invite_subbranch', null, faction)) {
            actionButtons += `<button class="btn-success" onclick="inviteToSubbranch('${steamID}', '${faction}')">Invite to Sub Branch</button>`;
        }
    }
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-status-box">
                <p class="modal-info-text">
                    <strong>Current Sub Branch:</strong> ${currentSubbranch || 'None'}<br>
                    <strong>Sub Branch Rank:</strong> ${currentSubrank || 'None'}
                </p>
            </div>
            <div class="modal-actions-layout">
                ${actionButtons}
                <button class="btn-secondary" onclick="UI.close()">Close</button>
            </div>
        </div>
    `;
    
    UI.createModal("Manage Sub Branch", content);
}

// Subbranch actions
function leaveSubbranch(steamID, faction) {
    RankManager.leaveSubbranch(steamID, faction);
    UI.close();
}

function inviteToSubbranch(steamID, faction) {
    RankManager.inviteToSubbranch(steamID, faction);
    UI.close();
}

function promoteSubbranch(steamID, faction) {
    RankManager.promoteSubbranch(steamID, faction);
    UI.close();
}

function demoteSubbranch(steamID, faction) {
    RankManager.demoteSubbranch(steamID, faction);
    UI.close();
}

function kickSubbranch(steamID, faction) {
    RankManager.kickSubbranch(steamID, faction);
    UI.close();
}

// Update player data from server
function updatePlayerData(json) {
    try {
        const playerData = JSON.parse(json);
        const players = RankManager.state.players.map(player => 
            player.id === playerData.id ? { ...player, ...playerData } : player
        );
        
        RankManager.setState({ players });
        
        if (RankManager.state.currentPlayer && RankManager.state.currentPlayer.id === playerData.id) {
            RankManager.setState({ currentPlayer: { ...RankManager.state.currentPlayer, ...playerData } });
            showPlayerDetail(playerData.id);
        }
        
        renderPlayerList();
    } catch (error) {
        console.error("Error updating player data:", error);
    }
}

// Utility functions
function showError(msg) {
    UI.showNotification(msg, "error");
}

function showSuccess(msg) {
    UI.showNotification(msg, "success");
}

// Initialize the interface
function tryInit() {
    if (typeof rankmgr !== 'undefined') {
        rankmgr.ready();
    }
}

// History functions
function loadHistoryPage(direction) {
    const newPage = RankManager.state.historyPage + direction;
    if (newPage < 1) return;
    
    RankManager.setState({ historyPage: newPage });
    loadHistory();
}

function loadHistory() {
    const player = RankManager.state.currentPlayer;
    if (!player) return;
    
    const faction = RankManager.state.currentFaction || Object.keys(player.factions || {})[0];
    if (!faction) return;
    
    RankManager.setState({ historyLoading: true });
    RankManager.requestHistory(player.id, faction, RankManager.state.historyPage);
}

function renderHistoryEntry(entry) {
    const actionClass = `history-action-${entry.action}`;
    const timeAgo = getTimeAgo(entry.timestamp);
    
    return `
        <div class="history-entry">
            <div class="history-entry-header">
                <span class="history-action ${actionClass}">${entry.action}</span>
                <span class="history-entry-time">${timeAgo}</span>
            </div>
            <div class="history-entry-details">
                <span class="history-actor">${entry.actor}</span> ${entry.description}
            </div>
        </div>
    `;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return then.toLocaleDateString();
}

// Branch management functions
function manageInviteBranch(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    showInviteBranchModal(steamID, faction, data);
}

function showInviteBranchModal(steamID, faction, data) {
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">This will send an invitation to join the ${faction} branch.</p>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-success" onclick="sendBranchInvite('${steamID}', '${faction}')">Send Invitation</button>
            </div>
        </div>
    `;
    
    UI.createModal("Invite to Branch", content);
}

function sendBranchInvite(steamID, faction) {
    RankManager.inviteBranch(steamID, faction);
    UI.close();
}

function manageTransferBranch(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    // Get available branches from config
    const factionConfig = window.RANK_MANAGER_CONFIG && window.RANK_MANAGER_CONFIG.FACTIONS && window.RANK_MANAGER_CONFIG.FACTIONS[faction];
    const availableBranches = factionConfig ? Object.keys(factionConfig.BRANCHES || {}) : [];
    
    if (availableBranches.length === 0) {
        UI.showNotification("No branches available for this faction", "error");
        return;
    }
    
    showTransferBranchModalWithBranches(steamID, faction, data, availableBranches);
}

function manageForceSubbranch(steamID, faction) {
    const player = RankManager.state.currentPlayer;
    if (!player) {
        UI.showNotification("No player selected", "error");
        return;
    }
    
    const data = player.factions && player.factions[faction];
    if (!data) {
        UI.showNotification("No faction data available", "error");
        return;
    }
    
    // Get available subbranches from server
    if (typeof rankmgr !== 'undefined') {
        rankmgr.getAvailableSubbranches(steamID, faction);
    }
}

function showTransferBranchModalWithBranches(steamID, faction, data, availableBranches) {
    const currentBranch = data.branch || '';
    
    const branchOptions = availableBranches.map(branch => {
        const isSelected = branch === currentBranch;
        return `
            <div class="modal-branch-item">
                <input type="radio" name="branch" id="branch-${branch}" value="${branch}" ${isSelected ? 'checked' : ''}>
                <label for="branch-${branch}" class="${isSelected ? 'current' : ''}">${branch}</label>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">Select the new branch for this player.</p>
            </div>
            <div class="modal-form-layout">
                <div class="modal-branch-list">
                    ${branchOptions}
                </div>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-primary" onclick="saveTransferBranch('${steamID}', '${faction}')">Transfer Branch</button>
            </div>
        </div>
    `;
    
    UI.createModal("Transfer Branch", content);
}

function showForceSubbranchModalWithSubbranches(steamID, faction, data, availableSubbranches) {
    const currentSubbranch = data.subbranch || '';
    
    const subbranchOptions = availableSubbranches.map(subbranch => {
        const isSelected = subbranch === currentSubbranch;
        return `
            <div class="modal-branch-item">
                <input type="radio" name="subbranch" id="subbranch-${subbranch}" value="${subbranch}" ${isSelected ? 'checked' : ''}>
                <label for="subbranch-${subbranch}" class="${isSelected ? 'current' : ''}">${subbranch}</label>
            </div>
        `;
    }).join('');
    
    const content = `
        <div class="modal-content-layout">
            <div class="modal-info-box">
                <p class="modal-info-text">Select the subbranch to assign to this player.</p>
            </div>
            <div class="modal-form-layout">
                <div class="modal-branch-list">
                    ${subbranchOptions}
                </div>
            </div>
            <div class="modal-actions-layout">
                <button class="btn-secondary" onclick="UI.close()">Cancel</button>
                <button class="btn-primary" onclick="saveForceSubbranch('${steamID}', '${faction}')">Force Sub Branch</button>
            </div>
        </div>
    `;
    
    UI.createModal("Force Sub Branch", content);
}

// Permission handling
function requestTargetPermissions(targetSteamID, faction) {
    if (typeof rankmgr !== 'undefined') {
        rankmgr.requestTargetPermissions(targetSteamID, faction);
    }
}

function updatePreviewUI() {
    const player = RankManager.state.currentPlayer;
    if (!player) return;
    
    const container = document.getElementById('player-detail');
    if (!container) return;
    
    const factions = Object.keys(player.factions || {});
    const currentFaction = RankManager.state.currentFaction || factions[0];
    
    const content = renderFactionDetails(container, player, currentFaction);
    container.innerHTML = content;
}

// Global wrapper functions for button clicks
window.RM_manageMedals = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageMedals(player.id, faction);
    }
};

window.RM_manageQualifications = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageQualifications(player.id, faction);
    }
};

window.RM_manageSubbranch = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageSubbranch(player.id, faction);
    }
};

window.RM_manageSetRank = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageSetRank(player.id, faction);
    }
};

window.RM_manageInviteBranch = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageInviteBranch(player.id, faction);
    }
};

window.RM_manageTransferBranch = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageTransferBranch(player.id, faction);
    }
};

window.RM_manageForceSubbranch = function(faction) {
    const player = RankManager.state.currentPlayer;
    if (player) {
        manageForceSubbranch(player.id, faction);
    }
};

// Utility functions
function switchFaction(faction) {
    RankManager.setState({ currentFaction: faction });
    updatePreviewUI();
}

function closePreview() {
    document.body.classList.remove('preview-active');
    RankManager.setState({ currentPlayer: null, currentFaction: null });
}

// Save functions
function saveMedals(steamID, faction) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedMedals = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id.replace('medal-', ''));
    
    RankManager.setMedals(steamID, faction, selectedMedals);
    UI.close();
}

function saveQualifications(steamID, faction) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedQuals = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id.replace('qual-', ''));
    
    RankManager.setQualifications(steamID, faction, selectedQuals);
    UI.close();
}

function saveSetRank(steamID, faction) {
    const selectedRank = document.querySelector('input[name="rank"]:checked');
    if (!selectedRank) {
        UI.showNotification("Please select a rank", "error");
        return;
    }
    
    RankManager.setRank(steamID, faction, selectedRank.value);
    UI.close();
}

function saveTransferBranch(steamID, faction) {
    const selectedBranch = document.querySelector('input[name="branch"]:checked');
    if (!selectedBranch) {
        UI.showNotification("Please select a branch", "error");
        return;
    }
    
    RankManager.transferBranch(steamID, faction, selectedBranch.value);
    UI.close();
}

function saveForceSubbranch(steamID, faction) {
    const selectedSubbranch = document.querySelector('input[name="subbranch"]:checked');
    if (!selectedSubbranch) {
        UI.showNotification("Please select a subbranch", "error");
        return;
    }
    
    RankManager.forceSubbranch(steamID, faction, selectedSubbranch.value);
    UI.close();
}

// Handle available subbranches from server
window.handleAvailableSubbranches = function(steamID, faction, subbranches) {
    const player = RankManager.state.currentPlayer;
    if (!player) return;
    
    const data = player.factions && player.factions[faction];
    if (!data) return;
    
    showForceSubbranchModalWithSubbranches(steamID, faction, data, subbranches);
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', tryInit);