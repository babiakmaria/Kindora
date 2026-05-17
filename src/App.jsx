import React, { useState, useEffect } from 'react';
import './styles/globals.css';

import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
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
import { fetchProjects, createProject, mapProject } from './api/projects';

// ── Page registry ─────────────────────────────────────────
const PAGES = {
  landing:            LandingPage,
  login:              LoginPage,
  register:           RegisterPage,
  'forgot-password':  ForgotPasswordPage,
  'reset-password':   ResetPasswordPage,
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
const PUBLIC_PAGES = new Set(['landing', 'login', 'register', 'forgot-password', 'reset-password']);

function App() {
  const [page,             setPage]            = useState('landing');
  const [previousPage,     setPreviousPage]     = useState('projects');
  const [selectedProject,  setSelectedProject]  = useState(null);
  const [selectedUser,     setSelectedUser]     = useState(null);
  const [resetTokenStatus, setResetTokenStatus] = useState('valid');
  const [resetToken,       setResetToken]       = useState(null);

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
    if (target === 'reset-password' && payload) {
      if (typeof payload === 'object') {
        setResetTokenStatus(payload.status || 'valid');
        setResetToken(payload.token || null);
      } else {
        setResetTokenStatus(payload);
        setResetToken(null);
      }
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

  const handleToggleJoin = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, joined: !p.joined } : p))
    );
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
      project={selectedProject}
      fromPage={previousPage}
      user={selectedUser}
      tokenStatus={resetTokenStatus}
      resetToken={resetToken}
      currentUser={currentUser}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}

export default App;
