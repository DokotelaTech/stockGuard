export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">StockGuard Workspace</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}
