import { useState } from "react";
import {
  Blocks,
  Check,
  ExternalLink,
  Gift,
  Link2,
  Search,
  ShieldCheck,
} from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import PharmacyRewardsPanel from "../components/blockchain/PharmacyRewardsPanel";
import { getApiClient } from "../services/api";
import {
  blockchainConfig,
  isBlockchainConfigured,
} from "../services/blockchain/config";
import formatDate from "../utils/formatDate";

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

export default function BlockchainTrace() {
  const [activeView, setActiveView] = useState("trace");
  const [batchId, setBatchId] = useState("");
  const [trace, setTrace] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canRead = isBlockchainConfigured();

  async function handleVerify(event) {
    event.preventDefault();
    const id = batchId.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setTrace(null);
    try {
      const result = await getApiClient().blockchain.getBatchTrace(id);
      setTrace(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to read this batch.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Blockchain"
        description="Verify batch provenance on Fuji and pharmacy rewards on BNB Smart Chain."
      />

      <div className="blockchain-view-switch" role="tablist">
        <Button
          variant={activeView === "trace" ? "primary" : "light"}
          onClick={() => setActiveView("trace")}
          role="tab"
          aria-selected={activeView === "trace"}
        >
          <ShieldCheck size={16} strokeWidth={2} />
          Batch traceability
        </Button>
        <Button
          variant={activeView === "rewards" ? "primary" : "light"}
          onClick={() => setActiveView("rewards")}
          role="tab"
          aria-selected={activeView === "rewards"}
        >
          <Gift size={16} strokeWidth={2} />
          Pharmacy rewards
        </Button>
      </div>

      {activeView === "trace" ? (
        <>
          <section className="card trace-card">
            <div className="card-heading">
              <div>
                <span className="icon-badge emerald">
                  <Blocks size={19} strokeWidth={1.9} />
                </span>
                <div>
                  <h2>On-chain batch lookup</h2>
                  <p>
                    Search an on-chain batch ID to inspect provenance milestones
                  </p>
                </div>
              </div>
            </div>

            <form className="trace-search" onSubmit={handleVerify}>
              <label>
                <Search size={17} strokeWidth={1.9} />
                <input
                  value={batchId}
                  onChange={(event) => setBatchId(event.target.value)}
                  placeholder="Enter batch number (try SG-001)"
                />
              </label>
              <Button type="submit" disabled={!batchId.trim() || loading}>
                <ShieldCheck size={16} strokeWidth={2} />
                {loading ? "Verifying…" : "Verify batch"}
              </Button>
            </form>

            {trace ? (
              <div className="trace-content">
                <div className="trace-timeline">
                  <h2>Batch milestones</h2>
                  <div className="trace-step">
                    <span className="trace-check">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <div>
                      <strong>Batch registered</strong>
                      <span>{trace.manufacturer}</span>
                      <small>Owner {shortenAddress(trace.owner)}</small>
                    </div>
                  </div>
                  <div className="trace-step">
                    <span className="trace-check">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <div>
                      <strong>Current status: {trace.status}</strong>
                      <span>Last updated {formatDate(trace.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="trace-step">
                    <span className="trace-check">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                    <div>
                      <strong>Expiry date</strong>
                      <span>{formatDate(trace.expiryDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="verification-panel">
                  <div className="verified-icon">
                    <ShieldCheck size={28} strokeWidth={2} />
                  </div>
                  <span className="eyebrow">Verified on Avalanche Fuji</span>
                  <h2>{trace.medicineName}</h2>
                  <p>{trace.manufacturer}</p>
                  <code>{trace.batchId}</code>
                  {blockchainConfig.explorerUrl && (
                    <a
                      className="text-link"
                      href={`${blockchainConfig.explorerUrl}/address/${trace.owner}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View owner on SnowTrace{" "}
                      <ExternalLink size={14} strokeWidth={2} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-chart">
                {loading ? (
                  <Loader label="Reading the batch from Avalanche Fuji…" />
                ) : (
                  <EmptyState>
                    <Link2 size={24} strokeWidth={1.7} />
                    {error ||
                      (canRead
                        ? "Enter a registered batch ID such as SG-001 to load its on-chain trace."
                        : "Add your deployed contract address to frontend/.env and restart the dev server.")}
                  </EmptyState>
                )}
              </div>
            )}
          </section>

          <section className="info-card">
            <div className="info-icon">
              <ShieldCheck size={20} strokeWidth={1.9} />
            </div>
            <div>
              <strong>
                {canRead
                  ? "Connected to Avalanche Fuji"
                  : "Blockchain not configured"}
              </strong>
              <p>
                {canRead
                  ? `Reading batch records from contract ${shortenAddress(
                      blockchainConfig.traceabilityAddress,
                    )}.`
                  : "Deploy BatchTrace.sol in Remix using Core Wallet, then add the contract address to frontend/.env."}
              </p>
            </div>
            <span className="info-tag">
              {canRead ? "Fuji testnet" : "Setup needed"}
            </span>
          </section>
        </>
      ) : (
        <PharmacyRewardsPanel />
      )}
    </>
  );
}
