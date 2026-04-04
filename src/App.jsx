import React, { useState } from 'react';
import './styles/globals.css';

import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import UserDashboard    from './pages/UserDashboard';
import ProjectsListPage from './pages/ProjectsListPage';
import ProfilePage      from './pages/ProfilePage';
import AdminDashboard   from './pages/AdminDashboard';
import AnalyticsPage    from './pages/AnalyticsPage';
import { PROJECTS }     from './data/data';

// ── Page registry ─────────────────────────────────────────
const PAGES = {
  landing:           LandingPage,
  login:             LoginPage,
  register:          RegisterPage,
  dashboard:         UserDashboard,
  projects:          ProjectsListPage,
  explore:           ProjectsListPage,
  profile:           ProfilePage,
  admin:             AdminDashboard,
  'admin-analytics': AnalyticsPage,
};

function App() {
  const [page, setPage] = useState('landing');

  // ── Shared project state (lifted up so Dashboard + Explore stay in sync) ──
  const [projects, setProjects] = useState(PROJECTS);

  const navigate = (target) => {
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
    />
  );
}

export default App;
