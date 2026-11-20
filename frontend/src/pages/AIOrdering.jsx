import { useEffect, useState } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import { getForecast } from "../services/forecastService";

export default function AIOrdering() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getForecast({ horizon_days: 14 })
      .then((data) => { if (active) setItems(data.results || []); })
      .catch((err) => { if (active) setError(err.message || "Unable to load order recommendations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const recommendations = items
    .map((item) => ({
      ...item,
      orderQuantity: Math.max(0, Math.ceil(item.recommended_level - item.current_stock)),
    }))
    .filter((item) => item.orderQuantity > 0)
    .sort((a, b) => (a.days_until_stockout ?? Infinity) - (b.days_until_stockout ?? Infinity));

  return (
    <>
      <PageHeader title="AI Ordering" description="Review suggested replenishment quantities based on demand and lead time." />
      {error && <p role="alert" className="form-error">{error}</p>}
      <section className="card forecast-summary ordering-summary">
        <div className="forecast-summary-icon"><Sparkles size={21} /></div>
        <h2>Suggested replenishment</h2>
        <p>Suggestions are for review; no purchase orders are placed automatically. Add average daily usage to inventory to calculate demand-based quantities.</p>
        {loading ? <p role="status">Calculating order suggestions…</p> : recommendations.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Medicine</th><th>Current stock</th><th>Recommended level</th><th>Suggested order</th><th>Stockout risk</th></tr></thead>
              <tbody>{recommendations.map((item) => (
                <tr key={`${item.clinic_id}-${item.medicine_id}`}>
                  <td>{item.medicine_name}</td>
                  <td>{item.current_stock}</td>
                  <td>{item.recommended_level}</td>
                  <td><strong>{item.orderQuantity} units</strong></td>
                  <td><span className={`status-pill ${item.stockout_risk.toLowerCase()}`}>{item.stockout_risk}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <EmptyState><ClipboardList size={20} /> No replenishment is currently suggested.</EmptyState>
        )}
        <span className="info-tag">{recommendations.length} suggested orders</span>
      </section>
    </>
  );
}
