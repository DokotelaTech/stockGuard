import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";

export default function ForecastCard() {
  return (
    <article className="forecast-card">
      <div className="forecast-overline">
        <Activity size={17} /> AI Forecast
      </div>
      <h2>Demand forecast</h2>
      <p>
        Forecast details will appear when the forecasting service is connected.
      </p>
      <Link to="/forecasts" className="button button-light">
        Open forecasts <ArrowRight size={15} />
      </Link>
    </article>
  );
}
