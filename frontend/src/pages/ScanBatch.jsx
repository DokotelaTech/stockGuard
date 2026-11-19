import { useState } from "react";
import { FileSearch, QrCode, ShieldCheck, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";

export default function ScanBatch() {
  const [batchNumber, setBatchNumber] = useState("");
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Scan Batch"
        description="Verify a medicine batch using its QR code or batch number."
      />
      <div className="scan-layout">
        <section className="card scan-card">
          <div className="card-heading">
            <div>
              <QrCode size={19} className="heading-icon green-text" />
              <div>
                <h2>Scan a medicine batch</h2>
                <p>Position a batch QR code in the frame to verify it.</p>
              </div>
            </div>
          </div>
          <div className="scanner-view scanner-disabled">
            <div className="scan-corners" />
            <QrCode size={68} strokeWidth={1.3} />
            <span>Camera scanner</span>
            <small>
              Camera integration will be connected with the scan service.
            </small>
          </div>
          <div className="scan-divider">
            <span />
            or enter batch details
            <span />
          </div>
          <label className="field-label" htmlFor="batch-number">
            Batch number
          </label>
          <div className="batch-entry">
            <input
              id="batch-number"
              value={batchNumber}
              onChange={(event) => setBatchNumber(event.target.value)}
              placeholder="Enter a batch number"
            />
            <Button
              type="button"
              disabled={!batchNumber.trim()}
              onClick={() =>
                navigate(`/batches/${encodeURIComponent(batchNumber.trim())}`)
              }
            >
              <FileSearch size={16} />
              View batch
            </Button>
          </div>
          <p className="form-hint">
            Batch verification will be available when the backend service is
            connected.
          </p>
        </section>
        <aside className="card scan-guide">
          <div className="guide-icon">
            <ShieldCheck size={24} />
          </div>
          <h2>Verify every batch</h2>
          <p>
            Review product, batch, origin, and expiry information as part of
            your receiving workflow.
          </p>
          <ul>
            <li>
              <Check size={15} />
              Confirm product and batch details
            </li>
            <li>
              <Check size={15} />
              Review origin and expiry information
            </li>
            <li>
              <Check size={15} />
              Record each scan
            </li>
          </ul>
          <div className="info-tag">Awaiting scan service</div>
        </aside>
      </div>
    </>
  );
}
