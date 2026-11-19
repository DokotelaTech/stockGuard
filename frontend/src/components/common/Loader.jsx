export default function Loader({ label = "Loading" }) {
  return (
    <div className="loader" role="status" aria-label={label}>
      <span className="loader-spinner" />
      <span>{label}</span>
    </div>
  );
}
