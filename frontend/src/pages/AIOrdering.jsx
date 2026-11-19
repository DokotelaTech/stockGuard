import { ClipboardList, Sparkles } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";

export default function AIOrdering() {
  return (
    <>
      <PageHeader
        title="AI Ordering"
        description="Review suggested replenishment once forecasting data is connected."
      />
      <section className="card forecast-summary ordering-summary">
        <div className="forecast-summary-icon">
          <Sparkles size={21} />
        </div>
        <h2>Order recommendations will appear here</h2>
        <EmptyState>
          <ClipboardList size={20} />
          No ordering data is available.
        </EmptyState>
        <span className="info-tag">Awaiting API</span>
      </section>
    </>
  );
}
