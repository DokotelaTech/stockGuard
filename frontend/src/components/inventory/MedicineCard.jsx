import { Package } from "lucide-react";
import StockStatus from "./StockStatus";

export default function MedicineCard({ medicine }) {
  if (!medicine) return null;
  return (
    <article className="card medicine-result-card">
      <div className="table-medicine-icon">
        <Package size={16} />
      </div>
      <h2>{medicine.name}</h2>
      <p>{medicine.batchNumber}</p>
      <StockStatus status={medicine.status} />
    </article>
  );
}
