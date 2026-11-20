import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import { getExpiryInsights } from "../services/forecastService";

const columns = ["Medicine", "Batch number", "Time to expiry", "Estimated waste", "Risk", "Suggested action"];

export default function ExpiryAlerts() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getExpiryInsights()
      .then((data) => { if (active) setInsights(data); })
      .catch((err) => { if (active) setError(err.message || "Unable to load expiry insights."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <PageHeader
        title="Expiry Alerts"
        description="Review expiry risk and suggested actions for your batches."
        action={<span className="filter-select"><Filter size={15} /> {insights?.near_expiry_count ?? 0} near expiry</span>}
      />
      {error && <p role="alert" className="form-error">{error}</p>}
      <section className="card table-card">
        <div className="table-scroll">
          <table>
            <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={columns.length}><p role="status">Analysing expiry dates…</p></td></tr>
                : insights?.batches?.length ? insights.batches.map((batch) => (
                  <tr key={`${batch.batch_code}-${batch.medicine_name}`}>
                    <td>{batch.medicine_name}</td>
                    <td>{batch.batch_code}</td>
                    <td>{batch.days_until_expiry < 0 ? `Expired ${Math.abs(batch.days_until_expiry)} days ago` : `${batch.days_until_expiry} days`}</td>
                    <td>{batch.estimated_waste_units}</td>
                    <td><span className={`status-pill ${batch.expiry_risk.toLowerCase()}`}>{batch.expiry_risk}</span></td>
                    <td>{batch.recommended_action}</td>
                  </tr>
                )) : <tr><td className="empty-state" colSpan={columns.length}><EmptyState>Add inventory with expiry dates to see alerts.</EmptyState></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {insights?.transfer_suggestions?.length > 0 && (
        <section className="card" style={{ marginTop: 16, padding: 20 }}>
          <h2>Transfer suggestions</h2>
          {insights.transfer_suggestions.map((suggestion, index) => (
            <p key={`${suggestion.batch_code}-${index}`}>
              <strong>{suggestion.suggested_units} units of {suggestion.medicine_name}</strong>: {suggestion.reason} Suggested destination: {suggestion.to_clinic}.
            </p>
          ))}
        </section>
      )}
    </>
  );
}
