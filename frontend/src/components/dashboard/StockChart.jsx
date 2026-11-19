import { Activity } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function StockChart() {
  return (
    <article className="card stock-card">
      <div className="card-heading">
        <div>
          <Activity size={19} className="heading-icon green-text" />
          <div>
            <h2>Stock Levels Trend</h2>
            <p>Current stock compared with recommended levels</p>
          </div>
        </div>
      </div>
      <div className="empty-chart">
        <EmptyState>
          Stock history will appear when inventory data is connected.
        </EmptyState>
      </div>
    </article>
  );
}
