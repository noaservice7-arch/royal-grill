const API = 'http://127.0.0.1:5000/api';
const ADMIN_CODE = '1234';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-login').addEventListener('click', () => {
    const code = document.getElementById('admin-code').value.trim();
    const msg  = document.getElementById('login-message');

    if (code == ADMIN_CODE) {
      document.getElementById('page-login').style.display = 'none';
      document.getElementById('page-admin').style.display = 'flex';
      chargerDashboard();
    } else {
      msg.style.color = '#E24B4A';
      msg.textContent = '⚠️ Code incorrect.';
    }
  });

  document.getElementById('admin-code').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('btn-login').click();
  });
});

function deconnexion() {
  document.getElementById('page-admin').style.display = 'none';
  document.getElementById('page-login').style.display = 'flex';
  document.getElementById('admin-code').value = '';
}

function switchPage(page, btn) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  btn.classList.add('active');

  if (page === 'dashboard')  chargerDashboard();
  if (page === 'tables')     chargerTablesEtClients();
  if (page === 'historique') chargerHistorique();
  if (page === 'avis')       chargerAvis();
}

async function chargerDashboard() {
  try {
    const [tablesRes, resRes, clientsRes] = await Promise.all([
      fetch(`${API}/tables/`),
      fetch(`${API}/reservations/`),
      fetch(`${API}/clients/`)
    ]);

    const tablesData   = await tablesRes.json();
    const resData      = await resRes.json();
    const clientsData  = await clientsRes.json();

    const tables       = tablesData.tables       || [];
    const reservations = resData.reservations     || [];
    const clients      = clientsData.clients      || [];

    const libres   = tables.filter(t => t[4] === 'libre').length;
    const occupees = tables.filter(t => t[4] === 'occupee').length;

    document.getElementById('stat-total-tables').textContent    = tables.length;
    document.getElementById('stat-tables-libres').textContent   = libres;
    document.getElementById('stat-tables-occupees').textContent = occupees;
    document.getElementById('stat-total-res').textContent       = reservations.length;
    document.getElementById('stat-total-clients').textContent   = clients.length;

    const liste = document.getElementById('liste-reservations');
    if (reservations.length === 0) {
      liste.innerHTML = '<div class="empty-msg">Aucune réservation pour le moment.</div>';
      return;
    }

    liste.innerHTML = reservations.slice(0, 10).map(r => `
      <div class="res-item">
        <div class="res-info">
          <div class="res-name">${r[3]}</div>
          <div class="res-meta">
            📅 ${new Date(r[6]).toLocaleDateString('fr-FR')} &nbsp;·&nbsp;
            🍽️ ${r[7].toUpperCase()} &nbsp;·&nbsp;
            🎉 ${r[8]} &nbsp;·&nbsp;
            📱 ${r[5]}
          </div>
        </div>
        <span class="statut-badge statut-${r[9]}">${r[9]}</span>
        <div class="res-actions">
          <button class="btn-confirmer" onclick="changerStatut(${r[0]}, 'confirmee')">✓ Confirmer</button>
          <button class="btn-annuler"   onclick="changerStatut(${r[0]}, 'annulee')">✗ Annuler</button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erreur dashboard:', error);
  }
}

async function changerStatut(id, statut) {
  try {
    await fetch(`${API}/reservations/statut/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut })
    });
    chargerDashboard();
  } catch (error) {
    console.error('Erreur statut:', error);
  }
}

async function chargerTablesEtClients() {
  try {
    const [tablesRes, clientsRes] = await Promise.all([
      fetch(`${API}/tables/`),
      fetch(`${API}/clients/`)
    ]);

    const tablesData  = await tablesRes.json();
    const clientsData = await clientsRes.json();

    const tables  = tablesData.tables   || [];
    const clients = clientsData.clients || [];

    const listeTables = document.getElementById('liste-tables');
    listeTables.innerHTML = tables.map(t => `
      <div class="table-item">
        <div class="res-info">
          <div class="res-name">${t[1]}</div>
          <div class="res-meta">
            👥 ${t[2]} personnes &nbsp;·&nbsp;
            🍽️ ${t[3].toUpperCase()} &nbsp;·&nbsp;
            <span style="color:${t[4]==='libre'?'#1D9E75':'#E24B4A'}">
              ${t[4] === 'libre' ? '🟢 Libre' : '🔴 Occupée'}
            </span>
          </div>
        </div>
        <div class="res-actions">
          <button class="btn-confirmer" onclick="changerStatutTable(${t[0]}, 'libre')">Libérer</button>
          <button class="btn-annuler"   onclick="changerStatutTable(${t[0]}, 'occupee')">Occuper</button>
          <button class="btn-supprimer" onclick="supprimerTable(${t[0]})">🗑️</button>
        </div>
      </div>
    `).join('');

    const listeClients = document.getElementById('liste-clients');
    listeClients.innerHTML = clients.map(c => `
      <div class="client-item">
        <div class="res-info">
          <div class="res-name">${c[1]}</div>
          <div class="res-meta">📧 ${c[2]}</div>
        </div>
        <button class="btn-supprimer" onclick="supprimerClient(${c[0]})">🗑️ Supprimer</button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erreur tables/clients:', error);
  }
}

async function ajouterTable() {
  const nom      = document.getElementById('new-table-nom').value.trim();
  const capacite = document.getElementById('new-table-capacite').value;
  const formule  = document.getElementById('new-table-formule').value;

  if (!nom) { alert('Veuillez entrer un nom de table.'); return; }

  await fetch(`${API}/tables/ajouter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, capacite, formule })
  });

  document.getElementById('new-table-nom').value = '';
  chargerTablesEtClients();
}

async function changerStatutTable(id, statut) {
  await fetch(`${API}/tables/statut/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut })
  });
  chargerTablesEtClients();
}

async function supprimerTable(id) {
  if (!confirm('Supprimer cette table ?')) return;
  await fetch(`${API}/tables/supprimer/${id}`, { method: 'DELETE' });
  chargerTablesEtClients();
}

async function supprimerClient(id) {
  if (!confirm('Supprimer ce client ?')) return;
  await fetch(`${API}/clients/supprimer/${id}`, { method: 'DELETE' });
  chargerTablesEtClients();
}

async function chargerHistorique() {
  try {
    const res  = await fetch(`${API}/reservations/`);
    const data = await res.json();
    const reservations = data.reservations || [];

    const liste = document.getElementById('liste-historique');
    if (reservations.length === 0) {
      liste.innerHTML = '<div class="empty-msg">Aucune réservation.</div>';
      return;
    }

    liste.innerHTML = reservations.map(r => `
      <div class="res-item">
        <div class="res-info">
          <div class="res-name">${r[3]}</div>
          <div class="res-meta">
            📅 ${new Date(r[6]).toLocaleDateString('fr-FR')} &nbsp;·&nbsp;
            🕐 ${new Date(r[6]).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})} &nbsp;·&nbsp;
            🍽️ ${r[7].toUpperCase()} &nbsp;·&nbsp;
            🎉 ${r[8]} &nbsp;·&nbsp;
            📧 ${r[4]}
          </div>
        </div>
        <span class="statut-badge statut-${r[9]}">${r[9]}</span>
        <button class="btn-supprimer" onclick="supprimerReservation(${r[0]})">🗑️</button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erreur historique:', error);
  }
}

async function supprimerReservation(id) {
  if (!confirm('Supprimer cette réservation ?')) return;
  await fetch(`${API}/reservations/supprimer/${id}`, { method: 'DELETE' });
  chargerHistorique();
}

async function chargerAvis() {
  try {
    const res  = await fetch(`${API}/avis/`);
    const data = await res.json();
    const avis = data.avis || [];

    const liste = document.getElementById('liste-avis');

    if (avis.length === 0) {
      liste.innerHTML = '<div class="empty-msg">Aucun avis pour le moment.</div>';
      return;
    }

    liste.innerHTML = avis.map(a => `
      <div class="res-item">
        <div class="res-info">
          <div class="res-name">${a[5]} 
            <span style="color:var(--gold)">
              ${'⭐'.repeat(a[2])}
            </span>
          </div>
          <div class="res-meta">💬 ${a[3]}</div>
          <div class="res-meta">📅 ${new Date(a[4]).toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erreur avis:', error);
  }
}