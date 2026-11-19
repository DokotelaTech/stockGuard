export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">StockGuard workspace</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
