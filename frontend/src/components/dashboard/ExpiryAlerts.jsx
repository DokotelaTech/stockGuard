import { Link } from "react-router-dom";
import { ArrowRight, BellRing } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function ExpiryAlerts({ showAllLink = true }) {
  return (
    <article className="card expiry-card">
      <div className="card-heading">
        <div>
          <BellRing size={19} className="heading-icon red-text" />
          <div>
            <h2>Expiry Alerts</h2>
            <p>Medicines requiring attention</p>
          </div>
        </div>
        {showAllLink && (
          <Link className="text-link" to="/expiry">
            View all <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <EmptyState>
        Expiry alerts will appear here when data is available.
      </EmptyState>
    </article>
  );
}
