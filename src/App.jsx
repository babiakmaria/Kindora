import React, { useState, useEffect } from 'react';
import './styles/globals.css';

import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ProjectsListPage    from './pages/ProjectsListPage';
import ProjectDetailPage   from './pages/ProjectDetailPage';
import ProfilePage         from './pages/ProfilePage';
import UserProfilePage     from './pages/UserProfilePage';
import AdminDashboard      from './pages/AdminDashboard';
import AnalyticsPage       from './pages/AnalyticsPage';
import NotificationsPage   from './pages/NotificationsPage';
import MyProjectsPage      from './pages/MyProjectsPage';
import { PROJECTS }        from './data/data';
import { getMe }           from './api/auth';
import { fetchProjects, createProject, mapProject, updateProject, deleteProject, joinProject, leaveProject } from './api/projects';

// ── Page registry ─────────────────────────────────────────
const PAGES = {
  landing:            LandingPage,
  login:              LoginPage,
  register:           RegisterPage,
  projects:           MyProjectsPage,
  explore:            ProjectsListPage,
  'project-detail':   ProjectDetailPage,
  profile:            ProfilePage,
  'user-profile':     UserProfilePage,
  admin:              AdminDashboard,
  'admin-analytics':  AnalyticsPage,
  notifications:      NotificationsPage,
};

// Pages that don't require authentication
const PUBLIC_PAGES = new Set(['landing', 'login', 'register']);

function App() {
  const [page,             setPage]            = useState('landing');
  const [previousPage,     setPreviousPage]     = useState('projects');
  const [selectedProject,  setSelectedProject]  = useState(null);
  const [selectedUser,     setSelectedUser]     = useState(null);

  // ── Auth state ─────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Shared project state ───────────────────────────────
  // Start with mock data; replaced by API response once loaded
  const [projects,      setProjects]      = useState(PROJECTS);
  const [projectsReady, setProjectsReady] = useState(false);

  // ── Restore session on mount ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('kindora_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }
    getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => localStorage.removeItem('kindora_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Load projects from API once user is known ──────────
  useEffect(() => {
    if (authLoading) return; // wait until session is resolved
    fetchProjects()
      .then((rows) => {
        setProjects(rows.map((p) => mapProject(p, currentUser?.id)));
        setProjectsReady(true);
      })
      .catch(() => {
        // Backend not running — fall back to mock data silently
        setProjectsReady(true);
      });
  }, [authLoading, currentUser?.id]);

  // ── Auth handlers ──────────────────────────────────────
  const handleLogin = ({ token, user }) => {
    localStorage.setItem('kindora_token', token);
    setCurrentUser(user);
  };

  const handleUserUpdate = (updatedFields) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const handleLogout = () => {
    localStorage.removeItem('kindora_token');
    setCurrentUser(null);
    setProjects(PROJECTS);
    setProjectsReady(false);
    setPage('landing');
  };

  // ── Navigation ─────────────────────────────────────────
  const navigate = (target, payload) => {
    if (!PUBLIC_PAGES.has(target) && !currentUser) {
      setPage('login');
      return;
    }
    if (target === 'project-detail' && payload) {
      setSelectedProject(payload);
      setPreviousPage(page);
    }
    if (target === 'user-profile' && payload) {
      setSelectedUser(payload);
    }
    if (PAGES[target]) setPage(target);
  };

  // ── Add project — calls API, maps response, updates state ─
  const handleAddProject = async (formData) => {
    try {
      const created = await createProject(formData);
      const mapped  = mapProject(created, currentUser?.id);
      // Creator is always joined to their own project
      setProjects((prev) => [{ ...mapped, joined: true }, ...prev]);
    } catch (err) {
      console.error('Не вдалося створити проєкт:', err.message);
      throw err; // re-throw so the modal can show the error
    }
  };

  // Local-only state sync (no API call) — used to keep card progress in sync with task list
  const handleSyncProject = (id, fields) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...fields } : p))
    );
  };

  const handleToggleJoin = async (id) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const wasJoined = project.joined;

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, joined: !wasJoined } : p))
    );

    try {
      if (wasJoined) {
        await leaveProject(id);
      } else {
        await joinProject(id);
      }
    } catch (err) {
      // Revert on failure
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, joined: wasJoined } : p))
      );
      console.error('Не вдалося змінити участь у проєкті:', err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProject(id);
    } catch (err) {
      console.error('Не вдалося видалити проєкт:', err.message);
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      const updated = await updateProject(id, data);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...mapProject(updated, currentUser?.id),
                // keep joined flag since mapProject can't compute it without member query
                joined: p.joined,
              }
            : p
        )
      );
      // Sync selectedProject so project detail page reflects the new status
      setSelectedProject((prev) =>
        prev?.id === id ? { ...prev, status: updated.status ?? data.status ?? prev.status } : prev
      );
    } catch (err) {
      console.error('Не вдалося оновити проєкт:', err.message);
      throw err;
    }
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', color: 'var(--text2)', fontSize: 15,
      }}>
        Завантаження…
      </div>
    );
  }

  const CurrentPage = PAGES[page] || LandingPage;

  return (
    <CurrentPage
      onNavigate={navigate}
      projects={projects}
      onAddProject={handleAddProject}
      onToggleJoin={handleToggleJoin}
      onUpdateProject={handleUpdateProject}
      onDeleteProject={handleDeleteProject}
      onSyncProject={handleSyncProject}
      project={selectedProject}
      fromPage={previousPage}
      user={selectedUser}
      currentUser={currentUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}

export default App;
