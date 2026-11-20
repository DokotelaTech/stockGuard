import { useEffect, useState } from "react";
import {
  Award,
  Coins,
  ExternalLink,
  Gift,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loader from "../common/Loader";
import {
  isRewardsConfigured,
  rewardsConfig,
} from "../../services/blockchain/rewardsConfig";
import { createRewardsReader } from "../../services/blockchain/rewardsReader";

const rewardsReader = createRewardsReader();

const columns = [
  "Pharmacy",
  "Wallet",
  "Points",
  "Claimed",
  "Claimable",
  "Status",
];

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function readRewards() {
  return rewardsReader.listPharmacies();
}

export default function PharmacyRewardsPanel() {
  const canRead = isRewardsConfigured();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(canRead);

  useEffect(() => {
    if (!canRead) return;
    let active = true;
    readRewards()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to read pharmacy rewards.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canRead]);

  async function load() {
    if (!canRead) return;
    setLoading(true);
    setError("");
    try {
      setData(await readRewards());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to read pharmacy rewards.",
      );
    } finally {
      setLoading(false);
    }
  }

  const pharmacies = data?.pharmacies ?? [];
  const totalPoints = pharmacies.reduce(
    (sum, pharmacy) => sum + pharmacy.points,
    0,
  );
  const totalClaimable = pharmacies.reduce(
    (sum, pharmacy) => sum + pharmacy.claimable,
    0,
  );

  return (
    <>
      <section className="metric-grid" aria-label="Pharmacy rewards summary">
        <article className="metric-card metric-medicines">
          <div className="metric-icon">
            <Store size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Registered pharmacies</span>
            <strong>{data ? formatNumber(pharmacies.length) : "—"}</strong>
          </div>
        </article>
        <article className="metric-card metric-transfer">
          <div className="metric-icon">
            <Coins size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Points awarded</span>
            <strong>{data ? formatNumber(totalPoints) : "—"}</strong>
          </div>
        </article>
        <article className="metric-card metric-expiry">
          <div className="metric-icon">
            <Gift size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Claimable points</span>
            <strong>{data ? formatNumber(totalClaimable) : "—"}</strong>
          </div>
        </article>
        <article className="metric-card metric-medicines">
          <div className="metric-icon">
            <ShieldCheck size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Reward network</span>
            <strong>BSC</strong>
            <span className="metric-subtext">
              Chain ID {rewardsConfig.chainId}
            </span>
          </div>
        </article>
      </section>

      <section className="card table-card">
        <div className="table-toolbar">
          <div>
            <strong className="toolbar-title">Pharmacy leaderboard</strong>
            <p>1 point equals 1 SGR reward token</p>
          </div>
          <span className="results-count">
            {loading
              ? "Reading contract…"
              : `${pharmacies.length} pharmacies`}
          </span>
          <Button
            variant="light"
            onClick={load}
            disabled={loading || !canRead}
          >
            <RefreshCw size={15} strokeWidth={2} />
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pharmacies.length ? (
                pharmacies.map((pharmacy) => (
                  <tr key={pharmacy.address}>
                    <td>
                      <span className="medicine-cell">
                        <span className="table-medicine-icon">
                          <Store size={15} strokeWidth={1.9} />
                        </span>
                        <strong>{pharmacy.name}</strong>
                      </span>
                    </td>
                    <td>
                      <a
                        className="text-link"
                        href={`${rewardsConfig.explorerUrl}/address/${pharmacy.address}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="mono-badge">
                          {shortenAddress(pharmacy.address)}
                        </span>
                        <ExternalLink size={13} strokeWidth={2} />
                      </a>
                    </td>
                    <td>
                      <strong>{formatNumber(pharmacy.points)}</strong>
                    </td>
                    <td>{formatNumber(pharmacy.claimed)}</td>
                    <td>{formatNumber(pharmacy.claimable)}</td>
                    <td>
                      <span className="status-pill low">
                        <i aria-hidden="true" />
                        {pharmacy.exists ? "Registered" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-state" colSpan={columns.length}>
                    {loading ? (
                      <div className="loader-center">
                        <Loader label="Reading pharmacy rewards from BNB Smart Chain Testnet…" />
                      </div>
                    ) : (
                      <EmptyState>
                        <Award size={24} strokeWidth={1.7} />
                        {error ||
                          (canRead
                            ? "No pharmacies are registered on this contract yet."
                            : "Add VITE_REWARDS_CONTRACT_ADDRESS to frontend/.env and restart the dev server.")}
                      </EmptyState>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="info-card">
        <div className="info-icon">
          <Gift size={20} strokeWidth={1.9} />
        </div>
        <div>
          <strong>
            {canRead
              ? "Connected to BNB Smart Chain Testnet"
              : "Pharmacy rewards not configured"}
          </strong>
          <p>
            {canRead ? (
              <>
                Reading rewards from contract{" "}
                {shortenAddress(rewardsConfig.contractAddress)}.{" "}
                <a
                  className="text-link"
                  href={`${rewardsConfig.explorerUrl}/address/${rewardsConfig.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on BscScan <ExternalLink size={13} strokeWidth={2} />
                </a>
              </>
            ) : (
              "Deploy PharmacyRewards.sol on BSC Testnet, then add its address to frontend/.env."
            )}
          </p>
        </div>
        <span className="info-tag">
          {canRead ? "BSC testnet" : "Setup needed"}
        </span>
      </section>
    </>
  );
}
