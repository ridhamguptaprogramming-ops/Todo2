const API_BASE = localStorage.getItem('apiBase') || `${window.location.protocol}//${window.location.hostname}:5000/api`;

const state = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  events: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw new Error(`Cannot reach backend at ${API_BASE}. Start the backend on port 5000.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const formData = (form) => Object.fromEntries(new FormData(form).entries());

const toast = (message) => {
  const element = $('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 3200);
};

const saveSession = (token, user) => {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  renderSession();
};

const clearSession = () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  renderSession();
};

const renderSession = () => {
  const isAdmin = state.user?.role === 'admin';
  $('#logoutButton').classList.toggle('hidden', !state.token);
  $('#adminPanel').classList.toggle('hidden', !isAdmin);

  $('#sessionInfo').innerHTML = state.user
    ? `<strong>${state.user.firstName} ${state.user.lastName}</strong><br><span class="muted">${state.user.email} - ${state.user.role}</span>`
    : 'Login to register for events.';
};

const renderEvents = () => {
  const grid = $('#eventGrid');

  if (!state.events.length) {
    grid.innerHTML = '<div class="muted">No events found.</div>';
    return;
  }

  grid.innerHTML = state.events.map((event) => {
    const date = event.date ? new Date(event.date).toLocaleDateString() : 'Date pending';
    const venue = event.venue?.name || event.venue?.city || 'Venue pending';
    const seats = `${event.registered || 0}/${event.capacity || 0} registered`;
    return `
      <article class="event-card">
        <div class="meta">
          <span class="pill">${event.category || 'event'}</span>
          <span class="pill">${event.status || 'draft'}</span>
        </div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="meta">
          <span class="pill">${date}</span>
          <span class="pill">${venue}</span>
          <span class="pill">${seats}</span>
        </div>
        <button data-register="${event._id}" type="button" ${!state.token ? 'disabled' : ''}>Register</button>
      </article>
    `;
  }).join('');

  $$('[data-register]').forEach((button) => {
    button.addEventListener('click', () => registerForEvent(button.dataset.register));
  });
};

const loadEvents = async () => {
  const search = $('#searchInput').value.trim();
  const category = $('#categoryFilter').value;
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const data = await request(`/events?${params.toString()}`);
  state.events = data.events || [];
  renderEvents();
};

const registerForEvent = async (eventId) => {
  try {
    const data = await request('/attendance/register', {
      method: 'POST',
      body: JSON.stringify({ eventId })
    });
    toast(`${data.message}. Check-in ID: ${data.attendance.uniqueId}`);
    await loadEvents();
  } catch (error) {
    toast(error.message);
  }
};

const setupAuthTabs = () => {
  $$('[data-auth-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      $$('[data-auth-tab]').forEach((tab) => tab.classList.remove('active'));
      $$('.auth-form').forEach((form) => form.classList.add('hidden'));
      button.classList.add('active');
      $(`#${button.dataset.authTab}Form`).classList.remove('hidden');
    });
  });
};

const setupForms = () => {
  $('#googleLoginButton').addEventListener('click', async () => {
    try {
      const firebaseConfig = window.FIREBASE_CONFIG || {};
      if (!window.firebase || !firebaseConfig.apiKey) {
        throw new Error('Add your Firebase Web API key in frontend/firebase-config.js');
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);
      const idToken = await result.user.getIdToken();
      const data = await request('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken })
      });

      saveSession(data.token, data.user);
      toast(data.message);
      await loadEvents();
    } catch (error) {
      toast(error.message);
    }
  });

  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData(event.currentTarget))
      });
      saveSession(data.token, data.user);
      toast(data.message);
    } catch (error) {
      toast(error.message);
    }
  });

  $('#signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget);
      if (!payload.phone) delete payload.phone;
      const data = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast(data.message);
      event.currentTarget.reset();
    } catch (error) {
      toast(error.message);
    }
  });

  $('#verifyForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(formData(event.currentTarget))
      });
      toast(data.message);
    } catch (error) {
      toast(error.message);
    }
  });

  $('#eventForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = formData(event.currentTarget);
      const data = await request('/events', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
          date: payload.date,
          capacity: Number(payload.capacity),
          category: payload.category,
          status: 'published',
          venue: { name: payload.venueName }
        })
      });
      toast(data.message);
      event.currentTarget.reset();
      await loadEvents();
    } catch (error) {
      toast(error.message);
    }
  });

  $('#checkinForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await request('/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify(formData(event.currentTarget))
      });
      toast(data.message);
      event.currentTarget.reset();
      await loadEvents();
    } catch (error) {
      toast(error.message);
    }
  });
};

const setupControls = () => {
  $('#logoutButton').addEventListener('click', clearSession);
  $('#refreshEvents').addEventListener('click', () => loadEvents().catch((error) => toast(error.message)));
  $('#searchInput').addEventListener('input', () => loadEvents().catch((error) => toast(error.message)));
  $('#categoryFilter').addEventListener('change', () => loadEvents().catch((error) => toast(error.message)));
  $('#themeToggle').addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });
};

const verifyFromUrl = async () => {
  const token = new URLSearchParams(window.location.search).get('verifyToken');
  if (!token) return;

  try {
    const data = await request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    toast(data.message);
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (error) {
    toast(error.message);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';
  setupAuthTabs();
  setupForms();
  setupControls();
  renderSession();
  await verifyFromUrl();
  loadEvents().catch((error) => toast(error.message));
});
