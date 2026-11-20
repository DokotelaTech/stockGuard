import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { getMedicines } from "../../services/inventoryService";

export default function StockChart() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMedicines()
      .then((items) => { if (active) setMedicines(items); })
      .catch((err) => { if (active) setError(err.message || "Unable to load stock data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const chartItems = medicines
    .map((medicine) => ({ ...medicine, chartQuantity: Math.max(0, Number(medicine.quantity) || 0) }))
    .sort((a, b) => b.chartQuantity - a.chartQuantity)
    .slice(0, 8);
  const maxQuantity = Math.max(1, ...chartItems.map((medicine) => medicine.chartQuantity));

  return (
    <article className="card stock-card">
      <div className="card-heading">
        <div>
          <Activity size={19} className="heading-icon green-text" />
          <div><h2>Current Stock by Medicine</h2><p>Live quantities from your Firestore inventory</p></div>
        </div>
      </div>
      <div className="stock-chart-list">
        {loading ? <p role="status">Loading stock data…</p>
          : error ? <p role="alert" className="form-error">{error}</p>
            : chartItems.length ? chartItems.map((medicine) => (
              <div className="stock-chart-row" key={medicine.id}>
                <span className="stock-chart-name" title={medicine.medicineName}>{medicine.medicineName}</span>
                <div className="stock-chart-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(2, (medicine.chartQuantity / maxQuantity) * 100)}%` }} />
                </div>
                <strong>{medicine.chartQuantity}</strong>
              </div>
            )) : <EmptyState>Add stock items to see the inventory graph.</EmptyState>}
      </div>
    </article>
  );
}
