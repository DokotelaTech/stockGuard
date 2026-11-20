import { useEffect, useState } from "react";
import { Activity, Sparkles } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import { getForecast } from "../services/forecastService";

const quantity = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Forecasts() {
  const [horizon, setHorizon] = useState(14);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const missingUsage = forecast?.results?.length > 0 && forecast.results.every((item) => item.predicted_daily_demand === 0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getForecast({ horizon_days: horizon })
      .then((data) => { if (active) setForecast(data); })
      .catch((err) => { if (active) setError(err.message || "Unable to load forecasts."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [horizon]);

  return (
    <>
      <PageHeader title="AI Forecast" description="Predicted medicine demand and stockout risk from your inventory usage." />
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="forecast-page-grid">
        <section className="card forecast-summary">
          <div className="forecast-summary-icon"><Sparkles size={21} /></div>
          <span className="eyebrow">Demand prediction</span>
          <h2>{loading ? "Calculating forecast…" : `${forecast?.high_risk_count ?? 0} high-risk items`}</h2>
          <p>{forecast?.headline_alert || (missingUsage
            ? "No usage data is recorded yet. Add average daily usage to inventory for useful demand predictions."
            : "Forecasts use usage history or the average daily usage saved with each medicine.")}</p>
          <span className="info-tag">{forecast?.results?.length ?? 0} medicines analysed</span>
        </section>

        <section className="card demand-chart-card">
          <div className="card-heading">
            <div>
              <Activity size={19} className="heading-icon blue-text" />
              <div><h2>Demand prediction</h2><p>Expected use and stockout risk</p></div>
            </div>
            <label className="forecast-horizon">
              Horizon
              <select value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
          </div>
          {loading ? <p role="status">Loading AI forecast…</p> : forecast?.results?.length ? (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Medicine</th><th>Stock</th><th>Daily demand</th><th>{horizon}-day demand</th><th>Days to stockout</th><th>Risk</th><th>Recommended level</th></tr></thead>
                <tbody>{forecast.results.map((item) => (
                  <tr key={`${item.clinic_id}-${item.medicine_id}`}>
                    <td>{item.medicine_name}</td>
                    <td>{quantity(item.current_stock)}</td>
                    <td>{quantity(item.predicted_daily_demand)}</td>
                    <td>{quantity(item.predicted_horizon_demand)}</td>
                    <td>{item.days_until_stockout == null ? "—" : quantity(item.days_until_stockout)}</td>
                    <td><span className={`status-pill ${item.stockout_risk.toLowerCase()}`}>{item.stockout_risk}</span></td>
                    <td>{quantity(item.recommended_level)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState>Add medicines to inventory to see a demand forecast.</EmptyState>}
        </section>
      </div>
    </>
  );
}
