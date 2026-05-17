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

// ── Shape mapper: backend project_summary → frontend card ──────
const STATUS_LABELS = {
  new:         'Новий',
  active:      'Активний',
  in_progress: 'В процесі',
  completed:   'Завершено',
  archived:    'Архів',
};

const MEMBER_COLORS = ['#FF6B9D', '#4CAF7D', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const mapProject = (p, currentUserId) => ({
  id:           p.id,
  icon:         p.icon        || '🌿',
  iconBg:       p.icon_bg     || '#EAF7F0',
  title:        p.title,
  desc:         p.description || '',
  status:       p.status      || 'new',
  statusLabel:  STATUS_LABELS[p.status] || 'Новий',
  category:     p.category_name || 'Загальне',
  members:      Number(p.active_members_count) || 1,
  memberColors: MEMBER_COLORS.slice(0, Math.min(Number(p.active_members_count) || 1, 5)),
  progress:     p.progress    || 0,
  due:          p.end_date
    ? new Date(p.end_date).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' })
    : 'TBD',
  joined:       currentUserId && p.created_by === currentUserId,
  createdBy:    p.created_by,
  startDate:    p.start_date,
  endDate:      p.end_date,
});

// GET /api/projects
export const fetchProjects = async () => {
  const res = await fetch(`${BASE}/projects`, { headers: headers() });
  return handleResponse(res);
};

// POST /api/projects
export const createProject = async (data) => {
  const res = await fetch(`${BASE}/projects`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// PATCH /api/projects/:id
export const updateProject = async (projectId, data) => {
  const res = await fetch(`${BASE}/projects/${projectId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// GET /api/categories
export const fetchCategories = async () => {
  const res = await fetch(`${BASE}/categories`, { headers: headers() });
  return handleResponse(res);
};
