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
