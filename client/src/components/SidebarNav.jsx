import { NavLink } from 'react-router-dom';
import { logout } from '../utils/auth';

const SidebarNav = () => {
  return (
    <aside className="sidebar-nav">
      <h2>Navigation</h2>
      <nav className="sidebar-links">
        <NavLink to="/dashboard#add-data" className="sidebar-link">
          Ajouter data
        </NavLink>
        <NavLink to="/dashboard" end className="sidebar-link">
          Dashboard
        </NavLink>
        <NavLink to="/admin" className="sidebar-link">
          Admin
        </NavLink>
        <button type="button" className="sidebar-logout" onClick={logout}>
          Déconnexion
        </button>
      </nav>
    </aside>
  );
};

export default SidebarNav;
