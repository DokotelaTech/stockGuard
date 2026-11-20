import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  CalendarClock,
  Pill,
  ShieldAlert,
} from "lucide-react";

const cards = [
  {
    label: "Total Medicines",
    kind: "medicines",
    icon: Pill,
    href: "/inventory",
  },
  {
    label: "Stockout Risks",
    kind: "risk",
    icon: ShieldAlert,
    href: "/inventory",
  },
  {
    label: "Near Expiry",
    kind: "expiry",
    icon: CalendarClock,
    href: "/expiry",
  },
  {
    label: "Pending Transfers",
    kind: "transfer",
    icon: ArrowLeftRight,
    href: "/transfers",
  },
];

export default function StockSummary() {
  return (
    <section className="metric-grid" aria-label="Stock summary">
      {cards.map(({ label, kind, icon: Icon, href }) => (
        <article className={`metric-card metric-${kind}`} key={kind}>
          <div className="metric-icon">
            <Icon size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>{label}</span>
            <strong aria-label="No data">—</strong>
            <Link to={href}>
              View details <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
