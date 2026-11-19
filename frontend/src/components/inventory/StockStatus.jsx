export default function StockStatus({ status }) {
  if (!status) return null;
  return <span className="stock-pill">{status}</span>;
}
