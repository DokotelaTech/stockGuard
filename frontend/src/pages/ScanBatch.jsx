import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSearch,
  QrCode,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import { verifyMedicineBatch } from "../services/inventoryService";

export default function ScanBatch() {
  const [batchNumber, setBatchNumber] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!batchNumber.trim()) {
      setError("Please enter a batch number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMedicine(null);

      const results = await verifyMedicineBatch(batchNumber);

      if (results.length === 0) {
        setError("No medicine found with this batch number.");
        return;
      }

      setMedicine(results);
    } catch (err) {
      console.error("Batch verification error:", err);
      setError(err.message || "Unable to verify this batch.");
    } finally {
      setLoading(false);
    }
  };

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
              <span className="icon-badge emerald">
                <ScanLine size={20} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Verify a medicine batch</h2>
                <p>Enter a batch number to retrieve its inventory records.</p>
              </div>
            </div>
          </div>

          <div className="scanner-view scanner-disabled">
            <div className="scan-corners" />
            <QrCode size={62} strokeWidth={1.4} />
            <span>QR camera scanner</span>
            <small>Camera scanning will be integrated separately.</small>
          </div>

          <div className="scan-divider">
            <span />
            or enter batch manually
            <span />
          </div>

          <form onSubmit={handleVerify}>
            <label className="field-label" htmlFor="batch-number">
              Batch number
            </label>

            <div className="batch-entry">
              <input
                id="batch-number"
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                placeholder="e.g. DEMO-AMOXICILLIN-001"
              />

              <Button
                type="submit"
                disabled={loading || !batchNumber.trim()}
              >
                <FileSearch size={16} strokeWidth={2} />
                {loading ? "Verifying…" : "Verify Batch"}
              </Button>
            </div>
          </form>

          {error && (
            <div
              className="alert-banner error"
              role="alert"
              style={{ marginTop: 18, marginBottom: 0 }}
            >
              <AlertCircle size={18} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {medicine && (
            <div className="scan-results">
              <div className="scan-result-header">
                <ShieldCheck size={20} strokeWidth={2} />
                <span>Batch verification successful</span>
              </div>

              {medicine.map((item) => (
                <article key={item.id} className="batch-result-card">
                  <div className="batch-result-top">
                    <h3>{item.medicineName}</h3>
                    <span className="status-pill low">
                      <i aria-hidden="true" />
                      Verified in Inventory
                    </span>
                  </div>

                  <div className="batch-meta-grid">
                    <div className="batch-meta-item">
                      <span>Batch Number</span>
                      <strong>{item.batchNumber}</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Category</span>
                      <strong>{item.category || "Not provided"}</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Manufacturer</span>
                      <strong>{item.manufacturer || "Not provided"}</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Quantity</span>
                      <strong>{Number(item.quantity ?? 0).toLocaleString()} units</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Supplier</span>
                      <strong>{item.supplier || "Not provided"}</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Manufacturing Date</span>
                      <strong>{item.manufactureDate || "Not provided"}</strong>
                    </div>
                    <div className="batch-meta-item">
                      <span>Expiry Date</span>
                      <strong>{item.expiryDate || "Not provided"}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="card scan-guide">
          <div className="guide-icon">
            <ShieldCheck size={24} strokeWidth={1.9} />
          </div>

          <h2>Verify every batch</h2>

          <p>
            Review product, batch, origin, and expiry information as part of
            your receiving workflow.
          </p>

          <ul>
            <li>
              <CheckCircle2 size={17} strokeWidth={2} />
              Confirm product and batch details
            </li>
            <li>
              <CheckCircle2 size={17} strokeWidth={2} />
              Review origin and expiry information
            </li>
            <li>
              <CheckCircle2 size={17} strokeWidth={2} />
              Retrieve live records from Firestore
            </li>
          </ul>

          <div className="info-tag">
            <Database size={14} strokeWidth={2} />
            Firestore Connected
          </div>
        </aside>
      </div>
    </>
  );
}
