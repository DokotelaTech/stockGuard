import { Link } from "react-router-dom";
import { ArrowRight, BellRing, CalendarCheck2, Pill } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { getMedicineAlertState } from "../../utils/stockCalculations";

export default function ExpiryAlerts({ medicines = [], showAllLink = true }) {
  const alerts = medicines
    .map((medicine) => ({
      medicine,
      alert: getMedicineAlertState(medicine),
    }))
    .filter(({ alert }) => alert.daysUntilExpiry !== null)
    .sort(
      (a, b) =>
        (a.alert.daysUntilExpiry ?? Infinity) -
        (b.alert.daysUntilExpiry ?? Infinity),
    )
    .slice(0, 4);

  return (
    <article className="card expiry-card">
      <div className="card-heading">
        <div>
          <span className="icon-badge red">
            <BellRing size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h2>Expiry Alerts</h2>
            <p>Medicines requiring attention</p>
          </div>
        </div>
        {showAllLink && (
          <Link className="text-link" to="/expiry">
            View all <ArrowRight size={14} strokeWidth={2.2} />
          </Link>
        )}
      </div>

      {alerts.length ? (
        <div className="dash-list">
          {alerts.map(({ medicine, alert }) => {
            const pillClass =
              alert.expired || alert.expiringSoon
                ? "high"
                : alert.expiryWatch
                  ? "medium"
                  : "low";
            const pillLabel = alert.expired
              ? "Expired"
              : alert.expiringSoon
                ? "High"
                : alert.expiryWatch
                  ? "Watch"
                  : "Safe";
            const rowClass =
              alert.expired || alert.expiringSoon
                ? "dash-item-danger"
                : alert.expiryWatch
                  ? "dash-item-warning"
                  : "";

            return (
              <div className={`dash-list-row ${rowClass}`} key={medicine.id}>
                <span className={`dash-item-icon ${pillClass}`}>
                  <Pill size={15} strokeWidth={1.9} />
                </span>
                <div className="dash-item-copy">
                  <strong title={medicine.medicineName}>
                    {medicine.medicineName}
                  </strong>
                  <span>
                    {alert.expired
                      ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                      : `Expires in ${alert.daysUntilExpiry} days`}{" "}
                    · {medicine.batchNumber}
                  </span>
                </div>
                <span className={`status-pill ${pillClass}`}>
                  <i aria-hidden="true" />
                  {pillLabel}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState>
          <CalendarCheck2 size={24} strokeWidth={1.7} />
          Expiry alerts will appear here when data is available.
        </EmptyState>
      )}
    </article>
  );
}
