import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";

export default function BlockchainTrace() {
  const [batchId, setBatchId] = useState("");
  return (
    <>
      <PageHeader
        title="Blockchain Trace"
        description="Review medicine provenance and batch milestones."
      />
      <section className="card trace-card">
        <div className="trace-search">
          <label>
            <Search size={17} />
            <input
              value={batchId}
              onChange={(event) => setBatchId(event.target.value)}
              placeholder="Enter batch number"
            />
          </label>
          <Button disabled={!batchId.trim()}>
            <ShieldCheck size={16} />
            Verify batch
          </Button>
        </div>
        <div className="empty-chart">
          <EmptyState>
            Batch provenance will appear here after the traceability service is
            connected.
          </EmptyState>
        </div>
      </section>
      <section className="info-card">
        <div className="info-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong>Traceability is ready to connect</strong>
          <p>
            Connect your blockchain service to load batch milestones and
            verification details.
          </p>
        </div>
        <span className="info-tag">Awaiting API</span>
      </section>
    </>
  );
}
