import TransferStatus from "./TransferStatus";

export default function TransferCard({ transfer }) {
  if (!transfer) return null;
  return (
    <article className="card transfer-card">
      <h2>{transfer.medicine}</h2>
      <p>
        {transfer.from} → {transfer.to}
      </p>
      <TransferStatus status={transfer.status} />
    </article>
  );
}
