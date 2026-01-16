import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  BarChart2,
  Link as LinkIcon,
  Clock,
  Calendar,
  Users,
  Grid,
  Share2,
  Settings,
  ExternalLink,
  GitGraph,
  Zap,
  LayoutDashboard
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        {/* User Profile / Brand Header */}
        <div className="sidebar-user">
          <div className="user-dropdown">
            <div className="user-avatar-circle">C</div>
            <span className="user-name">Cal.com Clone</span>
            <span className="chevron-down">▼</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <NavLink to="/admin/event-types" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LinkIcon size={18} />
            <span>Event types</span>
          </NavLink>

          <NavLink to="/admin/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Bookings</span>
          </NavLink>

          <NavLink to="/admin/availability" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock size={18} />
            <span>Availability</span>
          </NavLink>
        </nav>

        {/* Footer Navigation */}
        <div className="sidebar-footer-nav">
          <a href="/profile" target="_blank" className="nav-item">
            <ExternalLink size={18} />
            <span>View public page</span>
          </a>

          <button className="nav-item">
            <LinkIcon size={18} />
            <span>Copy public page link</span>
          </button>

          <div className="copyright">
            © 2026 Cal.com, Inc. clone
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
