const API = 'http://127.0.0.1:5000/api';

// Initialiser EmailJS
emailjs.init('3NQzyux_YGk8QvN7M');

// ── Récupérer le client connecté
const client = JSON.parse(localStorage.getItem('rg_client'));

// ── Si pas connecté, rediriger
window.addEventListener('DOMContentLoaded', () => {
  if (!client) {
    window.location.href = 'index.html';
    return;
  }
  document.getElementById('res-nom').value   = client.nom;
  document.getElementById('res-email').value = client.email;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('res-date').min = today;
});

// ── Afficher options VVIP
function afficherOptionsVVIP() {
  const formule = document.getElementById('res-formule').value;
  const vvip    = document.getElementById('vvip-options');
  vvip.style.display = formule === 'vvip' ? 'block' : 'none';
}

// ── Soumettre la réservation
async function soumettreReservation() {
  const nom      = document.getElementById('res-nom').value.trim();
  const email    = document.getElementById('res-email').value.trim();
  const whatsapp = document.getElementById('res-whatsapp').value.trim();
  const capacite = document.getElementById('res-capacite').value;
  const date     = document.getElementById('res-date').value;
  const heure    = document.getElementById('res-heure').value;
  const formule  = document.getElementById('res-formule').value;
  const occasion = document.getElementById('res-occasion').value;
  const msg      = document.getElementById('res-message');

  // Validation
  if (!nom || !email || !whatsapp || !capacite || !date || !heure || !formule || !occasion) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Veuillez remplir tous les champs.';
    return;
  }

  const boisson_accueil = document.getElementById('res-boisson')?.value.trim() || null;
  const decor_table     = document.getElementById('res-decor')?.value.trim()   || null;
  const ambiance        = document.getElementById('res-ambiance')?.value.trim() || null;
  const surprise_fin    = document.getElementById('res-surprise')?.value.trim() || null;

  const date_reservation = `${date} ${heure}:00`;

  try {
    // 1 — Trouver une table disponible
    const tablesRes  = await fetch(`${API}/tables/`);
    const tablesData = await tablesRes.json();

    const table = tablesData.tables.find(t =>
      t[3] === formule &&
      t[2] == capacite &&
      t[4] === 'libre'
    );

    if (!table) {
      msg.style.color = '#E24B4A';
      msg.textContent = '⚠️ Aucune table disponible pour cette formule et capacité.';
      return;
    }

    // 2 — Créer la réservation
    const response = await fetch(`${API}/reservations/creer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 1,
        table_id: table[0],
        nom, email, whatsapp,
        date_reservation,
        formule, occasion,
        boisson_accueil,
        decor_table,
        ambiance,
        surprise_fin
      })
    });

    const data = await response.json();

    if (response.ok) {
      // 3 — Marquer la table comme occupée
      await fetch(`${API}/tables/statut/${table[0]}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'occupee' })
      });

      // 4 — Envoyer email au client
      await emailjs.send('service_ztew6fc', 'template_r63kq8a', {
        nom:      nom,
        email:    email,
        date:     date,
        heure:    heure,
        formule:  formule,
        capacite: capacite,
        occasion: occasion
      });

      msg.style.color = '#1D9E75';
      msg.textContent = '✅ Réservation envoyée ! Un email de confirmation vous a été envoyé.';
      afficherSectionAvis();

      afficherSectionAvis();

    } else {
      msg.style.color = '#E24B4A';
      msg.textContent = '⚠️ ' + data.erreur;
    }

  } catch (error) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Erreur : ' + error.message;
  }
}

// ── Afficher section avis
function afficherSectionAvis() {
  document.getElementById('section-avis').style.display = 'block';
  document.getElementById('section-avis').scrollIntoView({ behavior: 'smooth' });
}

// ── Soumettre un avis
async function soumettreAvis() {
  const note        = document.getElementById('avis-note').value;
  const commentaire = document.getElementById('avis-commentaire').value.trim();
  const msg         = document.getElementById('avis-message');
  const client      = JSON.parse(localStorage.getItem('rg_client'));

  if (!commentaire) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Veuillez écrire un commentaire.';
    return;
  }

  try {
    const response = await fetch(`${API}/avis/ajouter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:   1,
        note:        note,
        commentaire: commentaire
      })
    });

    const data = await response.json();

    if (response.ok) {
      msg.style.color = '#1D9E75';
      msg.textContent = '✅ Merci pour votre avis !';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      msg.style.color = '#E24B4A';
      msg.textContent = '⚠️ ' + data.erreur;
    }

  } catch (error) {
    msg.style.color = '#E24B4A';
    msg.textContent = '⚠️ Erreur de connexion au serveur.';
  }
}