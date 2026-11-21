import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  Menu,
} from "lucide-react";
import { auth, db } from "../../firebase";
import { getMedicines } from "../../services/inventoryService";
import { getMedicineAlertState } from "../../utils/stockCalculations";

export default function Navbar({ onMenuOpen }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let active = true;
    const user = auth.currentUser;
    if (!user) return undefined;

    Promise.all([
      getDoc(doc(db, "users", user.uid)).catch(() => null),
      getMedicines().catch(() => []),
    ]).then(([profileSnap, medicines]) => {
      if (!active) return;
      if (profileSnap?.exists() && profileSnap.data().clinic) {
        setClinicName(profileSnap.data().clinic);
      }

      const derived = medicines
        .map((med) => ({ med, state: getMedicineAlertState(med) }))
        .filter(({ state }) => state.isNearExpiry || state.criticalStock)
        .sort(
          (a, b) =>
            (a.state.daysUntilExpiry ?? 999) - (b.state.daysUntilExpiry ?? 999),
        )
        .slice(0, 5)
        .map(({ med, state }) => ({
          id: med.id,
          title: med.medicineName,
          detail: state.expired
            ? `Expired ${Math.abs(state.daysUntilExpiry)}d ago`
            : state.expiringSoon
              ? `Expires in ${state.daysUntilExpiry} days`
              : `Low stock: ${med.quantity} units left`,
          tone: state.isNearExpiry ? "expiry" : "stock",
          to: state.isNearExpiry ? "/expiry" : "/inventory",
        }));

      setAlerts(derived);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        aria-label="Open navigation"
        onClick={onMenuOpen}
      >
        <Menu size={20} strokeWidth={2} />
      </button>
      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={18} strokeWidth={1.9} />
            {alerts.length > 0 && (
              <span className="notification-count">{alerts.length}</span>
            )}
          </button>
          {notificationsOpen && (
            <div className="notification-popover">
              <div className="notification-popover-header">
                <strong>Notifications</strong>
                <span className="info-tag">
                  {alerts.length ? `${alerts.length} alerts` : "Up to date"}
                </span>
              </div>
              {alerts.length ? (
                <div className="notification-list">
                  {alerts.map((alert) => (
                    <Link
                      key={alert.id}
                      to={alert.to}
                      className="notification-item"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <span
                        className={`notification-item-icon ${alert.tone}`}
                      >
                        {alert.tone === "expiry" ? (
                          <CalendarClock size={14} strokeWidth={2} />
                        ) : (
                          <AlertTriangle size={14} strokeWidth={2} />
                        )}
                      </span>
                      <div>
                        <strong>{alert.title}</strong>
                        <small>{alert.detail}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>All clinic stock and expiry alerts are clear.</p>
              )}
            </div>
          )}
        </div>
        {clinicName && (
          <>
            <span className="topbar-divider" />
            <div className="clinic-switcher active-clinic" title={clinicName}>
              <Building2 size={16} strokeWidth={1.9} />
              <span>{clinicName}</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
