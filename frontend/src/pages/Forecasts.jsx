import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart2,
  CalendarDays,
  PackageOpen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import { getForecast } from "../services/forecastService";

const quantity = (value) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Forecasts() {
  const [horizon, setHorizon] = useState(14);
  const [state, setState] = useState({
    loadedHorizon: null,
    forecast: null,
    error: "",
  });

  useEffect(() => {
    let active = true;
    getForecast({ horizon_days: horizon })
      .then((data) => {
        if (active) {
          setState({ loadedHorizon: horizon, forecast: data, error: "" });
        }
      })
      .catch((err) => {
        if (active) {
          setState({
            loadedHorizon: horizon,
            forecast: null,
            error: err.message || "Unable to load forecasts.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, [horizon]);

  const loading = state.loadedHorizon !== horizon;
  const { forecast, error } = state;
  const missingUsage =
    forecast?.results?.length > 0 &&
    forecast.results.every((item) => item.predicted_daily_demand === 0);

  return (
    <>
      <PageHeader
        title="AI Forecast"
        description="Predicted medicine demand and stockout risk from your inventory usage."
      />

      {error && (
        <div className="alert-banner error" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <div className="forecast-page-grid">

        {/* MEDICINE CALCUATION CARD */}

        {/*  
        <section className="card forecast-summary">
          <div className="forecast-summary-icon">
            <Sparkles size={22} strokeWidth={1.9} />
          </div>
          <span className="eyebrow">Demand prediction</span>
          <h2>
            {loading
              ? "Calculating forecast…"
              : `${forecast?.high_risk_count ?? 0} high-risk items`}
          </h2>
          <p>
            {forecast?.headline_alert ||
              (missingUsage
                ? "No usage data is recorded yet. Add average daily usage to inventory for useful demand predictions."
                : "Forecasts use usage history or the average daily usage saved with each medicine.")}
          </p>
          <span className="info-tag">
            <BarChart2 size={14} strokeWidth={2} />
            {forecast?.results?.length ?? 0} medicines analysed
          </span>
        </section>
        */}

        <section className="card demand-chart-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge blue">
                <TrendingUp size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Demand prediction</h2>
                <p>Expected usage and stockout risk over selected horizon</p>
              </div>
            </div>
            <label className="forecast-horizon">
              <CalendarDays size={15} strokeWidth={2} />
              <span>Horizon</span>
              <select
                value={horizon}
                onChange={(event) => setHorizon(Number(event.target.value))}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="loader-center">
              <Loader label="Loading AI forecast…" />
            </div>
          ) : forecast?.results?.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Stock</th>
                    <th>Daily demand</th>
                    <th>{horizon}-day demand</th>
                    <th>Days to stockout</th>
                    <th>Risk</th>
                    <th>Recommended level</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.results.map((item) => (
                    <tr key={`${item.clinic_id}-${item.medicine_id}`}>
                      <td>
                        <strong>{item.medicine_name}</strong>
                      </td>
                      <td>{quantity(item.current_stock)}</td>
                      <td>{quantity(item.predicted_daily_demand)}</td>
                      <td>{quantity(item.predicted_horizon_demand)}</td>
                      <td>
                        {item.days_until_stockout == null
                          ? "—"
                          : `${quantity(item.days_until_stockout)} d`}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${item.stockout_risk.toLowerCase()}`}
                        >
                          <i aria-hidden="true" />
                          {item.stockout_risk}
                        </span>
                      </td>
                      <td>
                        <strong>{quantity(item.recommended_level)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>
              <PackageOpen size={24} strokeWidth={1.7} />
              Add medicines to inventory to see a demand forecast.
            </EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
