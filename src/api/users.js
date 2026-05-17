const BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('kindora_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || `Помилка ${res.status}`);
  return data;
};

// PATCH /api/users/me — update own profile fields
export const updateProfile = async (fields) => {
  const res = await fetch(`${BASE}/users/me`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(fields),
  });
  return handleResponse(res);
};

// GET /api/users/:id/skills
export const fetchUserSkills = async (userId) => {
  const res = await fetch(`${BASE}/users/${userId}/skills`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/users/:id/projects
export const fetchUserProjects = async (userId) => {
  const res = await fetch(`${BASE}/users/${userId}/projects`, { headers: headers() });
  return handleResponse(res);
};
