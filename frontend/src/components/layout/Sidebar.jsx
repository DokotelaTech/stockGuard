import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/scan", label: "Scan Batch", icon: QrCode },
  { to: "/forecasts", label: "Forecasts", icon: Activity },
  { to: "/ordering", label: "AI Ordering", icon: Sparkles },
  { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/blockchain", label: "Blockchain Trace", icon: ShieldCheck },
  { to: "/expiry", label: "Expiry Alerts", icon: AlertTriangle },
];

export default function Sidebar({ open, onClose, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <NavLink to="/dashboard" className="brand" onClick={onClose}>
          <span className="brand-mark">
            <ShieldCheck size={29} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            Stock<span>Guard</span>
          </span>
          <span className="brand-tagline">
            Safe Stock. Healthy Communities.
          </span>
        </NavLink>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-avatar">
            <UserRound size={17} />
          </div>
          <div className="profile-copy">
            <strong>Account</strong>
            <span>Profile details load from your account</span>
          </div>
          <button
            className="icon-button logout-button"
            aria-label="Log out"
            title="Log out"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
