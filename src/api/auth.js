const BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('kindora_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.message || data?.error || `Помилка ${res.status}`;
    throw new Error(message);
  }
  return data;
};

// POST /api/auth/register
export const register = async ({ firstName, lastName, email, password, role }) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      first_name:  firstName,
      last_name:   lastName,
      email,
      password,
      system_role: role === 'admin' ? 'admin' : 'volunteer',
    }),
  });
  return handleResponse(res); // { token, user }
};

// POST /api/auth/login
export const login = async ({ email, password }) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res); // { token, user }
};

// GET /api/auth/me
export const getMe = async () => {
  const res = await fetch(`${BASE}/auth/me`, { headers: headers() });
  return handleResponse(res);
};

// POST /api/auth/forgot-password
export const forgotPassword = async ({ email }) => {
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(res); // { sent: true, reset_token? }
};

// POST /api/auth/reset-password
export const resetPassword = async ({ token, password }) => {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(res); // { success: true }
};
