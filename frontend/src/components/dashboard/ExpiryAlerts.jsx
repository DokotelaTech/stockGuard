import { Link } from "react-router-dom";
import { ArrowRight, BellRing, CalendarCheck2 } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function ExpiryAlerts({ showAllLink = true }) {
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
      <EmptyState>
        <CalendarCheck2 size={24} strokeWidth={1.7} />
        Expiry alerts will appear here when data is available.
      </EmptyState>
    </article>
  );
}
