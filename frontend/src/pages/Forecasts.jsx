import { Activity, ChevronDown, Sparkles } from "lucide-react";
import PageHeader from "../components/common/PageHeader";

export default function Forecasts() {
  return (
    <>
      <PageHeader
        title="AI Forecast"
        description="Plan ahead with medicine demand predictions."
      />
      <div className="forecast-page-grid">
        <section className="card forecast-summary">
          <div className="forecast-summary-icon">
            <Sparkles size={21} />
          </div>
          <span className="eyebrow">Demand prediction</span>
          <h2>Forecasts will appear here</h2>
          <p>
            Connect your forecasting service to show clinic-specific demand
            predictions.
          </p>
          <span className="info-tag">Awaiting API</span>
        </section>
        <section className="card demand-chart-card">
          <div className="card-heading">
            <div>
              <Activity size={19} className="heading-icon blue-text" />
              <div>
                <h2>Demand prediction</h2>
                <p>Actual and predicted usage</p>
              </div>
            </div>
            <button className="select-button" disabled>
              Time period <ChevronDown size={14} />
            </button>
          </div>
          <div className="empty-chart">
            <span>Forecast chart data will appear here when available.</span>
          </div>
        </section>
      </div>
    </>
  );
}
