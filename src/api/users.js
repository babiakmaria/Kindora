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

// GET /api/users/:id/activity?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
export const fetchUserActivity = async (userId, dateFrom, dateTo) => {
  const params = new URLSearchParams();
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo)   params.set('date_to',   dateTo);
  const res = await fetch(`${BASE}/users/${userId}/activity?${params}`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/users/:id/team
export const fetchUserTeam = async (userId) => {
  const res = await fetch(`${BASE}/users/${userId}/team`, { headers: headers() });
  return handleResponse(res);
};

// POST /api/users/me/team  { member_id }
export const addTeamMember = async (memberId) => {
  const res = await fetch(`${BASE}/users/me/team`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ member_id: memberId }),
  });
  return handleResponse(res);
};

// DELETE /api/users/me/team/:memberId
export const removeTeamMember = async (memberId) => {
  const res = await fetch(`${BASE}/users/me/team/${memberId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (res.status === 204) return;
  return handleResponse(res);
};
