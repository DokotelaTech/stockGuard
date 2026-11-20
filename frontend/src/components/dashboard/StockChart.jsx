import { useEffect, useState } from "react";
import { BarChart3, PackageOpen } from "lucide-react";
import EmptyState from "../common/EmptyState";
import Loader from "../common/Loader";
import { getMedicines } from "../../services/inventoryService";

export default function StockChart() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMedicines()
      .then((items) => {
        if (active) setMedicines(items);
      })
      .catch((err) => {
        if (active) setError(err.message || "Unable to load stock data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const chartItems = medicines
    .map((medicine) => ({
      ...medicine,
      chartQuantity: Math.max(0, Number(medicine.quantity) || 0),
    }))
    .sort((a, b) => b.chartQuantity - a.chartQuantity)
    .slice(0, 8);
  const maxQuantity = Math.max(
    1,
    ...chartItems.map((medicine) => medicine.chartQuantity),
  );

  return (
    <article className="card stock-card">
      <div className="card-heading">
        <div>
          <span className="icon-badge emerald">
            <BarChart3 size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h2>Current Stock by Medicine</h2>
            <p>Live quantities from your Firestore inventory</p>
          </div>
        </div>
      </div>
      <div className="stock-chart-list">
        {loading ? (
          <div className="loader-center">
            <Loader label="Loading stock data…" />
          </div>
        ) : error ? (
          <p role="alert" className="form-error">
            {error}
          </p>
        ) : chartItems.length ? (
          chartItems.map((medicine) => (
            <div className="stock-chart-row" key={medicine.id}>
              <span className="stock-chart-name" title={medicine.medicineName}>
                {medicine.medicineName}
              </span>
              <div className="stock-chart-track" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(3, (medicine.chartQuantity / maxQuantity) * 100)}%`,
                  }}
                />
              </div>
              <strong>{medicine.chartQuantity.toLocaleString()}</strong>
            </div>
          ))
        ) : (
          <EmptyState>
            <PackageOpen size={24} strokeWidth={1.7} />
            Add stock items to see the inventory graph.
          </EmptyState>
        )}
      </div>
    </article>
  );
}
