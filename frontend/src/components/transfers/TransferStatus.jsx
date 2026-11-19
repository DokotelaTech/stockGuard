export default function TransferStatus({ status }) {
  if (!status) return null;
  return <span className="status-pill">{status}</span>;
}
