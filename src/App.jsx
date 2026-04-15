import React, { useState } from 'react';
import './styles/globals.css';

import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import ProjectsListPage    from './pages/ProjectsListPage';
import ProjectDetailPage   from './pages/ProjectDetailPage';
import ProfilePage         from './pages/ProfilePage';
import AdminDashboard      from './pages/AdminDashboard';
import AnalyticsPage       from './pages/AnalyticsPage';
import NotificationsPage   from './pages/NotificationsPage';
import MyProjectsPage      from './pages/MyProjectsPage';
import { PROJECTS }        from './data/data';

// ── Page registry ─────────────────────────────────────────
const PAGES = {
  landing:            LandingPage,
  login:              LoginPage,
  register:           RegisterPage,
  'forgot-password':  ForgotPasswordPage,
  'reset-password':   ResetPasswordPage,
  projects:           MyProjectsPage,
  explore:           ProjectsListPage,
  'project-detail':  ProjectDetailPage,
  profile:           ProfilePage,
  admin:             AdminDashboard,
  'admin-analytics': AnalyticsPage,
  notifications:     NotificationsPage,
};

function App() {
  const [page,            setPage]           = useState('landing');
  const [selectedProject, setSelectedProject] = useState(null);
  const [resetTokenStatus, setResetTokenStatus] = useState('valid');

  // ── Shared project state (lifted up so Dashboard + Explore stay in sync) ──
  const [projects, setProjects] = useState(PROJECTS);

  const navigate = (target, payload) => {
    if (target === 'project-detail' && payload) {
      setSelectedProject(payload);
    }
    if (target === 'reset-password' && payload) {
      setResetTokenStatus(payload); // payload: 'valid' | 'expired' | 'used' | 'invalid'
    }
    if (PAGES[target]) setPage(target);
  };

  const handleAddProject = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleToggleJoin = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, joined: !p.joined } : p))
    );
  };

  const CurrentPage = PAGES[page] || LandingPage;

  return (
    <CurrentPage
      onNavigate={navigate}
      projects={projects}
      onAddProject={handleAddProject}
      onToggleJoin={handleToggleJoin}
      project={selectedProject}
      tokenStatus={resetTokenStatus}
    />
  );
}

export default App;
