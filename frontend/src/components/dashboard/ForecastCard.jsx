import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";
import { getForecast } from "../../services/forecastService";

export default function ForecastCard() {
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const missingUsage = forecast?.results?.length > 0 && forecast.results.every((item) => item.predicted_daily_demand === 0);

  useEffect(() => {
    let active = true;
    getForecast({ horizon_days: 14 })
      .then((data) => { if (active) setForecast(data); })
      .catch((err) => { if (active) setError(err.message || "Forecast unavailable."); });
    return () => { active = false; };
  }, []);

  return (
    <article className="forecast-card">
      <div className="forecast-overline"><Activity size={17} /> AI Forecast</div>
      <h2>{forecast ? `${forecast.high_risk_count} high-risk items` : error ? "Forecast unavailable" : "Calculating demand…"}</h2>
      <p>{forecast?.headline_alert || error || (missingUsage
        ? "Add average daily usage to inventory for useful predictions."
        : "14-day demand and stockout risk from your inventory usage.")}</p>
      <Link to="/forecasts" className="button button-light">Open forecasts <ArrowRight size={15} /></Link>
    </article>
  );
}
