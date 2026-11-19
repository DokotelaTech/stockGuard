export default function EmptyState({ children, className = "" }) {
  return (
    <div className={`data-empty-state ${className}`.trim()}>{children}</div>
  );
}
