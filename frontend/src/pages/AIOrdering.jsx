import { useEffect, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import { getForecast } from "../services/forecastService";

export default function AIOrdering() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getForecast({ horizon_days: 14 })
      .then((data) => {
        if (active) setItems(data.results || []);
      })
      .catch((err) => {
        if (active)
          setError(err.message || "Unable to load order recommendations.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recommendations = items
    .map((item) => ({
      ...item,
      orderQuantity: Math.max(
        0,
        Math.ceil(item.recommended_level - item.current_stock),
      ),
    }))
    .filter((item) => item.orderQuantity > 0)
    .sort(
      (a, b) =>
        (a.days_until_stockout ?? Infinity) -
        (b.days_until_stockout ?? Infinity),
    );

  return (
    <>
      <PageHeader
        title="AI Ordering"
        description="Review suggested replenishment quantities based on demand and lead time."
      />

      {error && (
        <div className="alert-banner error" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <section className="card ai-banner">
        <div className="ai-banner-left">
          <span className="icon-badge emerald">
            <Sparkles size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h2>AI-assisted replenishment suggestions</h2>
            <p>
              Suggestions are for review only; no purchase orders are placed
              automatically. Add average daily usage to inventory to refine
              demand-based quantities.
            </p>
          </div>
        </div>
        <span className="info-tag">
          <ShoppingCart size={14} strokeWidth={2} />
          {recommendations.length} suggested{" "}
          {recommendations.length === 1 ? "order" : "orders"}
        </span>
      </section>

      <section className="card table-card">
        <div className="table-toolbar">
          <div>
            <strong className="toolbar-title">Recommended orders</strong>
            <p>Prioritised by earliest projected stockout window</p>
          </div>
          <span className="results-count">
            {recommendations.length} items to replenish
          </span>
        </div>

        {loading ? (
          <div className="loader-center">
            <Loader label="Calculating order suggestions…" />
          </div>
        ) : recommendations.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Current stock</th>
                  <th>Recommended level</th>
                  <th>Suggested order</th>
                  <th>Stockout risk</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((item) => (
                  <tr key={`${item.clinic_id}-${item.medicine_id}`}>
                    <td>
                      <strong>{item.medicine_name}</strong>
                    </td>
                    <td>{Number(item.current_stock).toLocaleString()}</td>
                    <td>{Number(item.recommended_level).toLocaleString()}</td>
                    <td>
                      <strong className="green-text">
                        +{item.orderQuantity.toLocaleString()} units
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${item.stockout_risk.toLowerCase()}`}
                      >
                        <i aria-hidden="true" />
                        {item.stockout_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>
            <ClipboardList size={24} strokeWidth={1.7} />
            No replenishment is currently suggested.
          </EmptyState>
        )}
      </section>
    </>
  );
}
