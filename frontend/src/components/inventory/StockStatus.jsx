export default function StockStatus({ status }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase();
  const tone =
    normalized.includes("expired") ||
    normalized.includes("expiring") ||
    normalized.includes("critical") ||
    normalized.includes("out")
      ? "expired"
      : normalized.includes("low") || normalized.includes("watch")
        ? "stock-low"
        : "available";

  return (
    <span className={`stock-pill ${tone}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}
