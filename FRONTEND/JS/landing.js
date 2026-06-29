const API = 'http://127.0.0.1:5000/api';

// ── Vérifier si le client est déjà connecté
window.addEventListener('DOMContentLoaded', () => {
  const client = JSON.parse(localStorage.getItem('rg_client'));
  if (client) {
    document.getElementById('btn-reserver').disabled = false;
  }
});

// ── Ouvrir / Fermer le modal
function ouvrirModalCompte() {
  document.getElementById('modal-compte').style.display = 'flex';
}

function fermerModalCompte() {
  document.getElementById('modal-compte').style.display = 'none';
  document.getElementById('compte-message').textContent = '';
}

// ── Créer un compte client
async function creerCompte() {
  const nom   = document.getElementById('compte-nom').value.trim();
  const email = document.getElementById('compte-email').value.trim();
  const code  = document.getElementById('compte-code').value.trim();
  const msg   = document.getElementById('compte-message');

  // Validation
  if (!nom || !email || !code) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Veuillez remplir tous les champs.';
    return;
  }

  if (code.length !== 4 || isNaN(code)) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Le code doit contenir exactement 4 chiffres.';
    return;
  }

  try {
    const response = await fetch(`${API}/clients/creer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, code })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('rg_client', JSON.stringify({ nom, email, code }));

      msg.style.color = '#1D9E75';
      msg.textContent = '✅ Compte créé avec succès !';

      document.getElementById('btn-reserver').disabled = false;

      setTimeout(() => fermerModalCompte(), 2000);

    } else {
      msg.style.color = '#E24B4A';
      msg.textContent = '⚠️ ' + data.erreur;
    }

  } catch (error) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Erreur de connexion au serveur.';
  }
}

// ── Fermer le modal en cliquant dehors
document.getElementById('modal-compte').addEventListener('click', function(e) {
  if (e.target === this) fermerModalCompte();
});

// ── Aller à la page réservation
function allerReserver() {
  window.location.href = 'reservation.html';
}