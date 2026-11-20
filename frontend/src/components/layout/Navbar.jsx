import { useState } from "react";
import { Bell, Building2, ChevronDown, LogOut, Menu } from "lucide-react";
import SearchBar from "../common/SearchBar";

export default function Navbar({ onMenuOpen, query, onSearch, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        aria-label="Open navigation"
        onClick={onMenuOpen}
      >
        <Menu size={20} strokeWidth={2} />
      </button>
      <SearchBar
        value={query}
        onChange={onSearch}
        placeholder="Search medicine, batch or clinic..."
      />
      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={18} strokeWidth={1.9} />
          </button>
          {notificationsOpen && (
            <div className="notification-popover">
              <div className="notification-popover-header">
                <strong>Notifications</strong>
                <span className="info-tag">Up to date</span>
              </div>
              <p>Notifications will appear here when data is available.</p>
            </div>
          )}
        </div>
        <span className="topbar-divider" />
        <button className="clinic-switcher" disabled>
          <Building2 size={16} strokeWidth={1.9} />
          <span>Select a clinic</span>
          <ChevronDown size={15} strokeWidth={2} />
        </button>
        <button
          className="user-menu"
          aria-label="Log out"
          title="Log out"
          onClick={onLogout}
        >
          <LogOut size={16} strokeWidth={1.9} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
