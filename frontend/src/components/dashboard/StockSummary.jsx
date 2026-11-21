import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  CalendarClock,
  Pill,
  ShieldAlert,
} from "lucide-react";

export default function StockSummary({
  totalMedicines = 0,
  stockoutRisks = 0,
  nearExpiry = 0,
  pendingTransfers = 0,
  totalUnits = 0,
  loading = false,
}) {
  const cards = [
    {
      label: "Total Medicines",
      value: loading ? "—" : totalMedicines.toLocaleString(),
      subtext: loading ? "" : `${totalUnits.toLocaleString()} units in stock`,
      kind: "medicines",
      icon: Pill,
      href: "/inventory",
    },
    {
      label: "Stockout Risks",
      value: loading ? "—" : stockoutRisks.toLocaleString(),
      subtext: loading ? "" : "Low or fast-depleting stock",
      kind: "risk",
      icon: ShieldAlert,
      href: "/forecasts",
    },
    {
      label: "Near Expiry",
      value: loading ? "—" : nearExpiry.toLocaleString(),
      subtext: loading ? "" : "Expiring within 30 days",
      kind: "expiry",
      icon: CalendarClock,
      href: "/expiry",
    },
    {
      label: "Pending Transfers",
      value: loading ? "—" : pendingTransfers.toLocaleString(),
      subtext: loading ? "" : "Active clinic dispatches",
      kind: "transfer",
      icon: ArrowLeftRight,
      href: "/transfers",
    },
  ];

  return (
    <section className="metric-grid" aria-label="Stock summary">
      {cards.map(({ label, value, subtext, kind, icon: Icon, href }) => (
        <article className={`metric-card metric-${kind}`} key={kind}>
          <div className="metric-icon">
            <Icon size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>{label}</span>
            <strong>{value}</strong>
            {subtext && <span className="metric-subtext">{subtext}</span>}
            <Link to={href}>
              View details <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
