// ============== BASE DE DONNÉES SIMULÉE ==============
let database = {
    users: JSON.parse(localStorage.getItem('users')) || [
        { id: 1, name: 'Admin User', email: 'admin@ticket.com', password: 'admin123', role: 'admin' },
        { id: 2, name: 'Agent Test', email: 'agent@ticket.com', password: 'agent123', role: 'agent', approved: true },
        { id: 3, name: 'Client Test', email: 'client@ticket.com', password: 'client123', role: 'client' }
    ],
    tickets: JSON.parse(localStorage.getItem('tickets')) || [
        { id: 1, name: 'Concert Rock 2024', date: '2024-06-15T20:00', location: 'Paris Arena', price: 89.99, quantity: 500, sold: 150, createdBy: 2, status: 'approved', emoji: '🎸' },
        { id: 2, name: 'Festival Jazz', date: '2024-07-20T18:00', location: 'Lyon Jazz Hall', price: 45.00, quantity: 800, sold: 200, createdBy: 2, status: 'approved', emoji: '🎷' },
        { id: 3, name: 'Comédie Stand-up', date: '2024-06-01T21:00', location: 'Bordeaux Comedy Club', price: 35.00, quantity: 300, sold: 120, createdBy: 2, status: 'approved', emoji: '🎭' }
    ],
    sales: JSON.parse(localStorage.getItem('sales')) || [
        { id: 1, ticketId: 1, buyerId: 3, quantity: 2, amount: 179.98, date: '2024-05-10' },
        { id: 2, ticketId: 2, buyerId: 3, quantity: 1, amount: 45.00, date: '2024-05-12' }
    ],
    agents: JSON.parse(localStorage.getItem('agents')) || [
        { id: 1, userId: 2, email: 'agent@ticket.com', name: 'Agent Test', approved: true, reason: 'Agent de vente validé', date: '2024-01-01' }
    ]
};

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ============== SAUVEGARDE ==============
function saveDatabase() {
    localStorage.setItem('users', JSON.stringify(database.users));
    localStorage.setItem('tickets', JSON.stringify(database.tickets));
    localStorage.setItem('sales', JSON.stringify(database.sales));
    localStorage.setItem('agents', JSON.stringify(database.agents));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// ============== AUTHENTIFICATION ==============
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = database.users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        saveDatabase();
        closeModal('loginModal');
        updateUI();
        showAlert('Connexion réussie!', 'success');
    } else {
        showAlert('Email ou mot de passe incorrect', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    if (database.users.some(u => u.email === email)) {
        showAlert('Cet email est déjà utilisé', 'error');
        return;
    }

    const newUser = {
        id: Math.max(...database.users.map(u => u.id), 0) + 1,
        name,
        email,
        password,
        role,
        approved: role === 'client' ? true : false
    };

    database.users.push(newUser);
    saveDatabase();
    closeModal('signupModal');
    openModal('loginModal');
    showAlert('Inscription réussie! Veuillez vous connecter.', 'success');
}

function logout() {
    currentUser = null;
    saveDatabase();
    updateUI();
    showAlert('Déconnexion réussie', 'success');
}

// ============== GESTION DES MODALES ==============
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// ============== GESTION DES ALERTES ==============
function showAlert(message, type) {
    const alertId = type === 'success' ? 'successAlert' : type === 'error' ? 'errorAlert' : 'warningAlert';
    const alert = document.getElementById(alertId);
    alert.textContent = message;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 4000);
}

// ============== INTERFACE UTILISATEUR ==============
function updateUI() {
    const nav = document.querySelector('.nav-buttons');
    const clientSection = document.getElementById('clientSection');
    const agentSection = document.getElementById('agentSection');
    const adminSection = document.getElementById('adminSection');

    // Réinitialiser l'affichage
    clientSection.style.display = 'block';
    agentSection.style.display = 'none';
    adminSection.style.display = 'none';

    if (!currentUser) {
        nav.innerHTML = '<button class="btn-login" onclick="openModal(\'loginModal\')">Connexion</button><button class="btn-primary" onclick="openModal(\'signupModal\')">Inscription</button>';
    } else {
        nav.innerHTML = `<span style="margin-right: 15px;">Bienvenue, <strong>${currentUser.name}</strong> <span class="user-role">${currentUser.role.toUpperCase()}</span></span><button class="btn-login" onclick="logout()">Déconnexion</button>`;

        if (currentUser.role === 'agent' && currentUser.approved) {
            clientSection.style.display = 'none';
            agentSection.style.display = 'block';
            loadAgentDashboard();
        } else if (currentUser.role === 'admin') {
            clientSection.style.display = 'none';
            adminSection.style.display = 'block';
            loadAdminDashboard();
        } else {
            loadClientTickets();
        }
    }
}

// ============== TICKETS CLIENT ==============
function loadClientTickets() {
    const grid = document.getElementById('ticketsGrid');
    const approvedTickets = database.tickets.filter(t => t.status === 'approved');

    grid.innerHTML = approvedTickets.map(ticket => {
        const progress = (ticket.sold / ticket.quantity) * 100;
        return `
            <div class="ticket-card">
                <div class="ticket-image">${ticket.emoji}</div>
                <div class="ticket-info">
                    <div class="ticket-title">${ticket.name}</div>
                    <div class="ticket-date">📅 ${new Date(ticket.date).toLocaleDateString('fr-FR')} à ${new Date(ticket.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                    <div class="ticket-date">📍 ${ticket.location}</div>
                    <div class="ticket-price">${ticket.price}€</div>
                    <div class="ticket-stock">${ticket.quantity - ticket.sold} places disponibles</div>
                    <div class="stock-bar"><div class="stock-fill" style="width: ${progress}%"></div></div>
                    <button class="btn-buy" ${currentUser ? '' : 'onclick="openModal(\'loginModal\')"'} onclick="${currentUser ? `openBuyModal(${ticket.id})` : ''}">${currentUser ? 'Acheter' : 'Se connecter'}</button>
                </div>
            </div>
        `;
    }).join('');
}

function openBuyModal(ticketId) {
    const ticket = database.tickets.find(t => t.id === ticketId);
    const available = ticket.quantity - ticket.sold;
    
    let html = `
        <h3>${ticket.name}</h3>
        <p style="color: var(--text-secondary); margin: 10px 0;">📅 ${new Date(ticket.date).toLocaleDateString('fr-FR')}</p>
        <p style="color: var(--text-secondary); margin: 10px 0;">📍 ${ticket.location}</p>
        
        <label style="display: block; margin: 20px 0 10px 0;">Nombre de billets:</label>
        <div class="quantity-selector">
            <button type="button" class="qty-btn" onclick="changeQty(${ticketId}, -1)">−</button>
            <div class="qty-display" id="qty-${ticketId}">1</div>
            <button type="button" class="qty-btn" onclick="changeQty(${ticketId}, 1)">+</button>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px;">Places disponibles: ${available}</p>
        
        <div class="total-price">
            <span>Montant Total:</span>
            <span id="total-${ticketId}">${ticket.price}€</span>
        </div>
        
        <form onsubmit="completePurchase(event, ${ticketId})">
            <button type="submit" class="btn-primary" style="width: 100%;">Acheter les Billets</button>
        </form>
    `;
    
    document.getElementById('buyContent').innerHTML = html;
    openModal('buyModal');
}

function changeQty(ticketId, change) {
    const ticket = database.tickets.find(t => t.id === ticketId);
    const available = ticket.quantity - ticket.sold;
    let currentQty = parseInt(document.getElementById(`qty-${ticketId}`).textContent);
    const newQty = Math.max(1, Math.min(currentQty + change, available));
    
    document.getElementById(`qty-${ticketId}`).textContent = newQty;
    document.getElementById(`total-${ticketId}`).textContent = (ticket.price * newQty).toFixed(2) + '€';
}

function completePurchase(event, ticketId) {
    event.preventDefault();
    const ticket = database.tickets.find(t => t.id === ticketId);
    const qty = parseInt(document.getElementById(`qty-${ticketId}`).textContent);

    if (ticket.sold + qty > ticket.quantity) {
        showAlert('Quantité insuffisante disponible', 'error');
        return;
    }

    const newSale = {
        id: Math.max(...database.sales.map(s => s.id), 0) + 1,
        ticketId,
        buyerId: currentUser.id,
        quantity: qty,
        amount: ticket.price * qty,
        date: new Date().toISOString().split('T')[0]
    };

    ticket.sold += qty;
    database.sales.push(newSale);
    saveDatabase();
    closeModal('buyModal');
    loadClientTickets();
    showAlert(`Achat réussi! ${qty} billet(s) acheté(s). Montant: ${newSale.amount.toFixed(2)}€`, 'success');
}

// ============== DASHBOARD AGENT ==============
function loadAgentDashboard() {
    loadAgentTickets();
    loadValidationTable();
    loadSalesTable();
    loadAgentsTable();
}

function loadAgentTickets() {
    const tbody = document.getElementById('ticketsTable');
    const agentTickets = database.tickets.filter(t => t.createdBy === currentUser.id);

    tbody.innerHTML = agentTickets.map(ticket => `
        <tr>
            <td><strong>${ticket.name}</strong></td>
            <td>${ticket.price}€</td>
            <td>${ticket.quantity}</td>
            <td>${ticket.sold}</td>
            <td>${database.users.find(u => u.id === ticket.createdBy)?.name}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-edit" onclick="editTicket(${ticket.id})">Éditer</button>
                    <button class="btn-small btn-delete" onclick="deleteTicket(${ticket.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadValidationTable() {
    const tbody = document.getElementById('validationTable');
    const ticketsForValidation = database.tickets;

    const stats = {
        pending: ticketsForValidation.filter(t => t.status === 'pending').length,
        approved: ticketsForValidation.filter(t => t.status === 'approved').length,
        rejected: ticketsForValidation.filter(t => t.status === 'rejected').length
    };

    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('rejectedCount').textContent = stats.rejected;

    tbody.innerHTML = ticketsForValidation.map(ticket => `
        <tr>
            <td><strong>${ticket.name}</strong></td>
            <td>${database.users.find(u => u.id === ticket.createdBy)?.name}</td>
            <td>${new Date(ticket.date).toLocaleDateString('fr-FR')}</td>
            <td><span class="badge badge-${ticket.status}">${ticket.status === 'approved' ? 'APPROUVÉ' : ticket.status === 'pending' ? 'EN ATTENTE' : 'REJETÉ'}</span></td>
            <td>
                <div class="action-buttons">
                    ${ticket.status === 'pending' ? `
                        <button class="btn-small btn-approve" onclick="approveTicket(${ticket.id})">Approuver</button>
                        <button class="btn-small btn-reject" onclick="rejectTicket(${ticket.id})">Rejeter</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function loadSalesTable() {
    const tbody = document.getElementById('salesTable');
    const agentSales = database.sales.filter(sale => {
        const ticket = database.tickets.find(t => t.id === sale.ticketId);
        return ticket && ticket.createdBy === currentUser.id;
    });

    let totalSales = 0;
    let totalTickets = 0;

    tbody.innerHTML = agentSales.map(sale => {
        const ticket = database.tickets.find(t => t.id === sale.ticketId);
        const buyer = database.users.find(u => u.id === sale.buyerId);
        totalSales += sale.amount;
        totalTickets += sale.quantity;

        return `
            <tr>
                <td><strong>${ticket.name}</strong></td>
                <td>${buyer.name}</td>
                <td>${sale.quantity}</td>
                <td>${sale.amount.toFixed(2)}€</td>
                <td>${new Date(sale.date).toLocaleDateString('fr-FR')}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('totalSales').textContent = totalSales.toFixed(2) + '€';
    document.getElementById('totalTicketsSold').textContent = totalTickets;
    document.getElementById('totalEvents').textContent = database.tickets.filter(t => t.createdBy === currentUser.id).length;
}

function loadAgentsTable() {
    const tbody = document.getElementById('agentsTable');
    
    tbody.innerHTML = database.agents.map(agent => `
        <tr>
            <td>${agent.email}</td>
            <td><strong>${agent.name}</strong></td>
            <td>Agent</td>
            <td><span class="badge badge-${agent.approved ? 'approved' : 'pending'}">${agent.approved ? '✓ APPROUVÉ' : '⏳ EN ATTENTE'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-delete" onclick="removeAgent(${agent.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTicketModal() {
    document.getElementById('ticketModalTitle').textContent = 'Ajouter un Billet';
    document.getElementById('ticketName').value = '';
    document.getElementById('ticketDate').value = '';
    document.getElementById('ticketLocation').value = '';
    document.getElementById('ticketPrice').value = '';
    document.getElementById('ticketQuantity').value = '';
    document.getElementById('ticketDescription').value = '';
    openModal('ticketModal');
}

function handleAddTicket(event) {
    event.preventDefault();
    const ticket = {
        id: Math.max(...database.tickets.map(t => t.id), 0) + 1,
        name: document.getElementById('ticketName').value,
        date: document.getElementById('ticketDate').value,
        location: document.getElementById('ticketLocation').value,
        price: parseFloat(document.getElementById('ticketPrice').value),
        quantity: parseInt(document.getElementById('ticketQuantity').value),
        sold: 0,
        createdBy: currentUser.id,
        status: 'pending',
        emoji: ['🎸', '🎭', '🎪', '🎨', '🎬', '⚽', '🎾'][Math.floor(Math.random() * 7)]
    };

    database.tickets.push(ticket);
    saveDatabase();
    closeModal('ticketModal');
    loadAgentDashboard();
    showAlert('Billet créé et en attente d\'approbation', 'success');
}

function approveTicket(ticketId) {
    const ticket = database.tickets.find(t => t.id === ticketId);
    ticket.status = 'approved';
    saveDatabase();
    loadValidationTable();
    showAlert('Billet approuvé', 'success');
}

function rejectTicket(ticketId) {
    const ticket = database.tickets.find(t => t.id === ticketId);
    ticket.status = 'rejected';
    saveDatabase();
    loadValidationTable();
    showAlert('Billet rejeté', 'error');
}

function deleteTicket(ticketId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce billet?')) {
        database.tickets = database.tickets.filter(t => t.id !== ticketId);
        saveDatabase();
        loadAgentDashboard();
        showAlert('Billet supprimé', 'success');
    }
}

function editTicket(ticketId) {
    showAlert('Fonctionnalité en développement', 'warning');
}

function openAddAgentModal() {
    document.getElementById('agentEmail').value = '';
    document.getElementById('agentReason').value = '';
    openModal('agentModal');
}

function handleAddAgent(event) {
    event.preventDefault();
    const email = document.getElementById('agentEmail').value;
    const reason = document.getElementById('agentReason').value;

    const user = database.users.find(u => u.email === email);
    if (!user) {
        showAlert('Utilisateur non trouvé', 'error');
        return;
    }

    const existingAgent = database.agents.find(a => a.userId === user.id);
    if (existingAgent) {
        showAlert('Cet utilisateur est déjà un agent', 'warning');
        return;
    }

    const newAgent = {
        id: Math.max(...database.agents.map(a => a.id), 0) + 1,
        userId: user.id,
        email: user.email,
        name: user.name,
        approved: false,
        reason,
        date: new Date().toISOString().split('T')[0]
    };

    database.agents.push(newAgent);
    user.role = 'agent';
    saveDatabase();
    closeModal('agentModal');
    loadAgentDashboard();
    showAlert('Agent ajouté - en attente d\'approbation admin', 'success');
}

function removeAgent(agentId) {
    if (confirm('Supprimer cet agent?')) {
        database.agents = database.agents.filter(a => a.id !== agentId);
        saveDatabase();
        loadAgentDashboard();
        showAlert('Agent supprimé', 'success');
    }
}

// ============== DASHBOARD ADMIN ==============
function loadAdminDashboard() {
    const totalUsers = database.users.length;
    const totalAgents = database.agents.filter(a => a.approved).length;
    const totalRevenue = database.sales.reduce((sum, s) => sum + s.amount, 0);

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalAgents').textContent = totalAgents;
    document.getElementById('platformRevenue').textContent = totalRevenue.toFixed(2) + '€';

    loadAllUsersTable();
    loadPendingAgentsTable();
}

function loadAllUsersTable() {
    const tbody = document.getElementById('allUsersTable');
    tbody.innerHTML = database.users.map(user => `
        <tr>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="user-role">${user.role.toUpperCase()}</span></td>
            <td>${new Date().toLocaleDateString('fr-FR')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-delete" onclick="deleteUser(${user.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function loadPendingAgentsTable() {
    const tbody = document.getElementById('pendingAgentsTable');
    const pendingAgents = database.agents.filter(a => !a.approved);

    tbody.innerHTML = pendingAgents.map(agent => `
        <tr>
            <td>${agent.email}</td>
            <td><strong>${agent.name}</strong></td>
            <td><span class="badge badge-pending">⏳ EN ATTENTE</span></td>
            <td>${agent.reason}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-approve" onclick="adminApproveAgent(${agent.id})">Approuver</button>
                    <button class="btn-small btn-reject" onclick="adminRejectAgent(${agent.id})">Rejeter</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function adminApproveAgent(agentId) {
    const agent = database.agents.find(a => a.id === agentId);
    agent.approved = true;
    const user = database.users.find(u => u.id === agent.userId);
    user.approved = true;
    saveDatabase();
    loadAdminDashboard();
    showAlert('Agent approuvé', 'success');
}

function adminRejectAgent(agentId) {
    if (confirm('Rejeter cet agent?')) {
        database.agents = database.agents.filter(a => a.id !== agentId);
        saveDatabase();
        loadAdminDashboard();
        showAlert('Agent rejeté', 'error');
    }
}

function deleteUser(userId) {
    if (confirm('Supprimer cet utilisateur?')) {
        database.users = database.users.filter(u => u.id !== userId);
        database.agents = database.agents.filter(a => a.userId !== userId);
        saveDatabase();
        loadAdminDashboard();
        showAlert('Utilisateur supprimé', 'success');
    }
}

// ============== NAVIGATION ==============
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

document.getElementById('navLogin').onclick = () => openModal('loginModal');
document.getElementById('navProfile').onclick = () => currentUser ? updateUI() : openModal('loginModal');

// ============== INITIALISATION ==============
updateUI();
