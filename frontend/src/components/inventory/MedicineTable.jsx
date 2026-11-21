import { PackageOpen, PencilLine, Pill, Trash2 } from "lucide-react";
import EmptyState from "../common/EmptyState";
import { getMedicineAlertState } from "../../utils/stockCalculations";
import StockStatus from "./StockStatus";

export default function MedicineTable({
  medicines = [],
  onEdit,
  onDelete,
  emptyMessage = "No medicines found.",
}) {
  const hasActions = Boolean(onEdit || onDelete);

  const columns = [
    "Medicine",
    "Category",
    "Batch Number",
    "Stock on Hand",
    "Unit Price",
    "Expiry Date",
    "Status",
    ...(hasActions ? ["Actions"] : []),
  ];

  return (
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
          {medicines.length ? (
            medicines.map((medicine) => {
              const name = medicine.medicineName || medicine.name || "Unnamed";
              const alert = getMedicineAlertState(medicine);
              const derivedStatus = medicine.status || alert.status;

              const expiryNote =
                alert.daysUntilExpiry === null
                  ? ""
                  : alert.expired
                    ? `Expired ${Math.abs(alert.daysUntilExpiry)}d ago`
                    : `${alert.daysUntilExpiry}d left`;

              return (
                <tr key={medicine.id} className={alert.rowTone}>
                  <td>
                    <span className="medicine-cell">
                      <span className="table-medicine-icon">
                        <Pill size={15} strokeWidth={1.9} />
                      </span>
                      <strong>{name}</strong>
                    </span>
                  </td>
                  <td>
                    {medicine.category ? (
                      <span className="category-tag">{medicine.category}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className="mono-badge">
                      {medicine.batchNumber || "—"}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {Number(medicine.quantity ?? 0).toLocaleString()}
                    </strong>
                  </td>
                  <td>
                    {medicine.unitPrice !== undefined &&
                    medicine.unitPrice !== ""
                      ? `R ${Number(medicine.unitPrice).toFixed(2)}`
                      : "—"}
                  </td>
                  <td>
                    <div className="expiry-cell">
                      <span>{medicine.expiryDate || "—"}</span>
                      {expiryNote && <small>{expiryNote}</small>}
                    </div>
                  </td>
                  <td>
                    <StockStatus status={derivedStatus} />
                  </td>
                  {hasActions && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <button
                            type="button"
                            className="table-icon-btn"
                            onClick={() => onEdit(medicine)}
                            title="Edit medicine"
                            aria-label={`Edit ${name}`}
                          >
                            <PencilLine size={15} strokeWidth={2} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="table-icon-btn danger"
                            onClick={() => onDelete(medicine.id)}
                            title="Delete medicine"
                            aria-label={`Delete ${name}`}
                          >
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="empty-state" colSpan={columns.length}>
                <EmptyState>
                  <PackageOpen size={24} strokeWidth={1.7} />
                  {emptyMessage}
                </EmptyState>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
