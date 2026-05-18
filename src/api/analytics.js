const BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('kindora_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Помилка ${res.status}`);
  }
  return data;
};

// GET /api/analytics/stats
// Returns { totalVolunteers, activeProjects, completedProjects, completedTasks }
export const fetchAnalyticsStats = async () => {
  const res = await fetch(`${BASE}/analytics/stats`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/analytics/spending?months=N
// Returns [{ month: 'YYYY-MM', total: number }, ...] ordered oldest → newest
export const fetchSpending = async (months = 6) => {
  const res = await fetch(`${BASE}/analytics/spending?months=${months}`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/analytics/categories
// Returns [{ label: string, value: number }, ...] sorted by count descending
export const fetchProjectsByCategory = async () => {
  const res = await fetch(`${BASE}/analytics/categories`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/analytics/platform
// Returns platform-wide totals: total_projects, total_users, pending_applications, completion_rate
export const fetchPlatformStats = async () => {
  const res = await fetch(`${BASE}/analytics/platform`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/analytics/key-metrics
// Returns { avgProgress, activeThisWeek, avgMembersPerProject }
export const fetchKeyMetrics = async () => {
  const res = await fetch(`${BASE}/analytics/key-metrics`, { headers: headers() });
  return handleResponse(res);
};

// GET /api/analytics/report
// Returns [{ title, status, members, totalHours, totalSpent }, ...]
export const fetchReport = async () => {
  const res = await fetch(`${BASE}/analytics/report`, { headers: headers() });
  return handleResponse(res);
};
