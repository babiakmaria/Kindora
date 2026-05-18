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

// GET /api/projects/:projectId/tasks
export const fetchTasks = async (projectId) => {
  const res = await fetch(`${BASE}/projects/${projectId}/tasks`, { headers: headers() });
  return handleResponse(res);
};

// POST /api/projects/:projectId/tasks
export const createTask = async (projectId, data) => {
  const res = await fetch(`${BASE}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// PATCH /api/projects/:projectId/tasks/:taskId  (status toggle or any field update)
export const updateTask = async (projectId, taskId, data) => {
  const res = await fetch(`${BASE}/projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// DELETE /api/projects/:projectId/tasks/:taskId
export const deleteTask = async (projectId, taskId) => {
  const res = await fetch(`${BASE}/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (res.status === 204) return;
  return handleResponse(res);
};

// GET /api/projects/:projectId/members
export const fetchProjectMembers = async (projectId) => {
  const res = await fetch(`${BASE}/projects/${projectId}/members`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/users/search?q=<query>
export const searchUsers = async (query) => {
  const res = await fetch(
    `${BASE}/users/search?q=${encodeURIComponent(query)}`,
    { headers: headers() },
  );
  return handleResponse(res);
};

// POST /api/projects/:projectId/members  { user_id }
export const addProjectMember = async (projectId, userId) => {
  const res = await fetch(`${BASE}/projects/${projectId}/members`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse(res);
};

// DELETE /api/projects/:projectId/members/:userId
export const removeProjectMember = async (projectId, userId) => {
  const res = await fetch(`${BASE}/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (res.status === 204) return;
  return handleResponse(res);
};

// GET /api/projects/:projectId/calendar?year=YYYY&month=M  (month is 1-based)
// Returns { 'YYYY-MM-DD': [{ userId, initials, name, color, tasks, totalMinutes }] }
export const fetchCalendar = async (projectId, year, month) => {
  const res = await fetch(
    `${BASE}/projects/${projectId}/calendar?year=${year}&month=${month}`,
    { headers: headers() },
  );
  return handleResponse(res);
};
