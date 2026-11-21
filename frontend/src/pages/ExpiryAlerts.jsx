import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CalendarCheck2,
  CalendarClock,
  Flame,
  PackageX,
} from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import { getExpiryInsights } from "../services/forecastService";

const columns = [
  "Medicine",
  "Batch number",
  "Time to expiry",
  "Estimated waste",
  "Risk",
  "Suggested action",
];

function getExpiryRowTone(batch) {
  const risk = String(batch.expiry_risk || "").toLowerCase();
  if (risk === "high" || batch.days_until_expiry <= 30) return "row-danger";
  if (risk === "medium" || batch.days_until_expiry <= 60) return "row-warning";
  return "row-success";
}

export default function ExpiryAlerts() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getExpiryInsights()
      .then((data) => {
        if (active) setInsights(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load expiry insights.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const batches = insights?.batches ?? [];
  const highRiskCount = batches.filter(
    (b) =>
      String(b.expiry_risk || "").toLowerCase() === "high" ||
      b.days_until_expiry <= 30,
  ).length;
  const totalWaste = batches.reduce(
    (sum, b) => sum + Number(b.estimated_waste_units || 0),
    0,
  );

  return (
    <>
      <PageHeader
        title="Expiry Alerts"
        description="Review expiry risk and suggested actions for your medicine batches."
      />

      {error && (
        <div className="alert-banner error" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <section className="metric-grid cols-3" aria-label="Expiry risk summary">
        <article className="metric-card metric-expiry">
          <div className="metric-icon">
            <CalendarClock size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Near Expiry Batches</span>
            <strong>
              {(insights?.near_expiry_count ?? 0).toLocaleString()}
            </strong>
            <span className="metric-subtext">Approaching expiry window</span>
          </div>
        </article>

        <article className="metric-card metric-risk">
          <div className="metric-icon">
            <Flame size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>High Risk Batches</span>
            <strong>{highRiskCount.toLocaleString()}</strong>
            <span className="metric-subtext">Immediate action recommended</span>
          </div>
        </article>

        <article className="metric-card metric-medicines">
          <div className="metric-icon">
            <PackageX size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Estimated Waste</span>
            <strong>{totalWaste.toLocaleString()}</strong>
            <span className="metric-subtext">Projected units at risk</span>
          </div>
        </article>
      </section>

      <section className="card table-card">
        <div className="table-toolbar">
          <div>
            <strong className="toolbar-title">Batch expiry watchlist</strong>
            <p>AI-evaluated expiry windows and mitigation recommendations</p>
          </div>

          {/* <span className="results-count">{batches.length} batches</span> */}
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="loader-center">
                      <Loader label="Analysing expiry dates…" />
                    </div>
                  </td>
                </tr>
              ) : batches.length ? (
                batches.map((batch) => (
                  <tr
                    key={`${batch.batch_code}-${batch.medicine_name}`}
                    className={getExpiryRowTone(batch)}
                  >
                    <td>
                      <strong>{batch.medicine_name}</strong>
                    </td>
                    <td>
                      <span className="mono-badge">{batch.batch_code}</span>
                    </td>
                    <td>
                      <strong>
                        {batch.days_until_expiry < 0
                          ? `Expired ${Math.abs(batch.days_until_expiry)} days ago`
                          : `${batch.days_until_expiry} days`}
                      </strong>
                    </td>
                    <td>
                      <strong>
                        {Number(
                          batch.estimated_waste_units || 0,
                        ).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${batch.expiry_risk.toLowerCase()}`}
                      >
                        <i aria-hidden="true" />
                        {batch.expiry_risk}
                      </span>
                    </td>
                    <td>{batch.recommended_action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={columns.length}>
                    <EmptyState>
                      <CalendarCheck2 size={24} strokeWidth={1.7} />
                      Add inventory with expiry dates to see alerts.
                    </EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {insights?.transfer_suggestions?.length > 0 && (
        <section className="card suggestions-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge emerald">
                <ArrowLeftRight size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Transfer suggestions</h2>
                <p>Recommended redistributions to minimise expiry waste</p>
              </div>
            </div>
          </div>

          <div className="suggestions-list">
            {insights.transfer_suggestions.map((suggestion, index) => (
              <div
                className="suggestion-row"
                key={`${suggestion.batch_code}-${index}`}
              >
                <span className="icon-badge blue">
                  <ArrowLeftRight size={17} strokeWidth={1.9} />
                </span>
                <p>
                  <strong>
                    {suggestion.suggested_units} units of{" "}
                    {suggestion.medicine_name}
                  </strong>
                  : {suggestion.reason} Suggested destination:{" "}
                  <strong>{suggestion.to_clinic}</strong>.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
