import StockStatus from "./StockStatus";

const columns = [
  "Medicine",
  "Batch number",
  "Expiry date",
  "Stock on hand",
  "Status",
];

export default function MedicineTable({ medicines = [], emptyMessage }) {
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
            medicines.map((medicine) => (
              <tr key={medicine.id}>
                <td>
                  <strong>{medicine.name}</strong>
                </td>
                <td>{medicine.batchNumber}</td>
                <td>{medicine.expiryDate}</td>
                <td>{medicine.quantity}</td>
                <td>
                  <StockStatus status={medicine.status} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="empty-state" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
