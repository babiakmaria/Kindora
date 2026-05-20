const BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('kindora_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handle = async (res) => {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || `Помилка ${res.status}`);
  return data;
};

// Map backend row to the shape NotificationsPage expects
const TYPE_MAP = { user_joined: 'join' };

const deriveType = (row) => {
  const base = TYPE_MAP[row.type] || row.type;
  if (base !== 'task_completed') return base;
  const { hours, price } = row.payload || {};
  if (hours && price) return 'task_completed_both';
  if (hours)          return 'task_completed_time';
  if (price)          return 'task_completed_price';
  return 'task_completed';
};

export const mapNotif = (row) => ({
  id:           row.id,
  type:         deriveType(row),
  userName:     `${row.actor_first_name || ''} ${row.actor_last_name || ''}`.trim() || 'Користувач',
  initials:     `${(row.actor_first_name || '')[0] || ''}${(row.actor_last_name || '')[0] || ''}`.toUpperCase() || 'КР',
  avatarBg:     row.actor_avatar_color || '#FF6B9D',
  projectTitle: row.project_title || '',
  taskTitle:    row.payload?.task_title || '',
  loggedHours:  row.payload?.hours  ?? null,
  price:        row.payload?.price  ?? null,
  date:         row.created_at,
  read:         row.is_read,
});

export const fetchNotifications = async () => {
  const res = await fetch(`${BASE}/notifications`, { headers: headers() });
  const rows = await handle(res);
  return rows.map(mapNotif);
};

export const markNotifRead = async (id) => {
  const res = await fetch(`${BASE}/notifications/${id}/read`, { method: 'PATCH', headers: headers() });
  return handle(res);
};

export const markAllNotifsRead = async () => {
  const res = await fetch(`${BASE}/notifications/read-all`, { method: 'PATCH', headers: headers() });
  return handle(res);
};
