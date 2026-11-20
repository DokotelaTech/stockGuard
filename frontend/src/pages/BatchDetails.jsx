import { useParams } from "react-router-dom";
import { Package, Tag } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";

export default function BatchDetails() {
  const { batchId } = useParams();

  return (
    <>
      <PageHeader
        title="Batch Details"
        description="Medicine batch information and traceability."
      />
      <section className="card scan-guide batch-details-card">
        <div className="guide-icon">
          <Package size={24} strokeWidth={1.9} />
        </div>
        <h2>Batch details are not available yet</h2>
        <EmptyState>
          Connect the inventory or traceability service to load this batch.
        </EmptyState>
        <span className="info-tag">
          <Tag size={14} strokeWidth={2} />
          {batchId}
        </span>
      </section>
    </>
  );
}
