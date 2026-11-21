import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Activity,
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  Mail,
  PackageCheck,
  Phone,
  Pill,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { auth, db } from "../firebase.js";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
// import PageHeader from "../components/common/PageHeader";
import ExpiryAlerts from "../components/dashboard/ExpiryAlerts";
import ForecastCard from "../components/dashboard/ForecastCard";
import StockChart from "../components/dashboard/StockChart";
import StockSummary from "../components/dashboard/StockSummary";
import StockStatus from "../components/inventory/StockStatus";
import { getMedicines } from "../services/inventoryService";
import { listTransfers } from "../services/transferService";
import formatDate from "../utils/formatDate";
import { getMedicineAlertState } from "../utils/stockCalculations";

function parseTimestamp(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function relativeTime(ms) {
  if (!ms) return "Recently";
  const diffMinutes = Math.max(0, Math.floor((Date.now() - ms) / 60_000));
  if (diffMinutes < 60) return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(new Date(ms));
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const [userSnapshot, inventoryList] = await Promise.all([
          getDoc(userRef),
          getMedicines().catch(() => []),
        ]);

        if (!userSnapshot.exists()) {
          setError("User profile not found.");
          return;
        }

        const profile = userSnapshot.data();
        const transferList = await listTransfers().catch(() => []);

        setUserData(profile);
        setMedicines(inventoryList);
        setTransfers(transferList);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to load your account information.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loader-center">
        <Loader label="Loading your dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-banner error" role="alert">
        <AlertCircle size={18} strokeWidth={2} />
        <span>{error}</span>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const evaluatedMedicines = medicines.map((medicine) => ({
    medicine,
    alert: getMedicineAlertState(medicine),
  }));

  const totalUnits = medicines.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const stockoutRisks = evaluatedMedicines.filter(
    ({ alert }) => alert.isStockoutRisk,
  ).length;
  const nearExpiryCount = evaluatedMedicines.filter(
    ({ alert }) => alert.isNearExpiry,
  ).length;
  const pendingTransfers = transfers.filter(
    (t) => String(t.status || "").toLowerCase() !== "completed",
  ).length;

  const recentActivity = [
    ...transfers.map((tr) => ({
      id: `tr-${tr.id}`,
      kind: "transfer",
      title: `Transfer ${tr.status.toLowerCase()} · ${tr.medicine}`,
      detail: `${tr.quantity} units → ${tr.destinationClinic}`,
      timestamp: parseTimestamp(tr.createdAt || tr.date),
    })),
    ...medicines.map((med) => ({
      id: `med-${med.id}`,
      kind: "inventory",
      title: `Stock logged · ${med.medicineName}`,
      detail: `${Number(med.quantity || 0).toLocaleString()} units · Batch ${med.batchNumber}`,
      timestamp: parseTimestamp(med.updatedAt || med.createdAt),
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  const quickInventory = [...evaluatedMedicines]
    .sort((a, b) => Number(a.medicine.quantity || 0) - Number(b.medicine.quantity || 0))
    .slice(0, 4);

  const profileFields = [
    {
      label: "Full Name",
      value:
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "—",
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: userData.email || "—",
      icon: Mail,
      noCapitalize: true,
    },
    {
      label: "Phone Number",
      value: userData.phone || "—",
      icon: Phone,
      noCapitalize: true,
    },
    {
      label: "Clinic",
      value: userData.clinic || "—",
      icon: Building2,
    },
    {
      label: "Role",
      value: userData.role?.replaceAll("_", " ") || "—",
      icon: BadgeCheck,
    },
  ];

  return (
    <>
      {/* <PageHeader
        title={`Welcome, ${userData.firstName}!`}
        description={`Overview of your clinic inventory · ${formatDate(new Date())}`}
      /> */}

      <section className="card account-card" aria-label="Account information">
        <div className="card-heading">
          <div>
            <span className="icon-badge emerald">
              <UserRound size={19} strokeWidth={1.9} />
            </span>
            <div>
              <h2>Your Account Information</h2>
              <p>Active session profile and clinic assignment</p>
            </div>
          </div>
        </div>

        <div className="account-grid">
          {profileFields.map(({ label, value, icon: Icon, noCapitalize }) => (
            <div className="account-item" key={label}>
              <span className="account-item-icon">
                <Icon size={16} strokeWidth={1.9} />
              </span>
              <div className="account-item-copy">
                <small>{label}</small>
                <strong
                  className={noCapitalize ? "no-capitalize" : undefined}
                  title={value}
                >
                  {value}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <StockSummary
        totalMedicines={medicines.length}
        stockoutRisks={stockoutRisks}
        nearExpiry={nearExpiryCount}
        pendingTransfers={pendingTransfers}
        totalUnits={totalUnits}
      />

      <section className="dashboard-grid">
        <StockChart medicines={medicines} />
        <ExpiryAlerts medicines={medicines} />
        <ForecastCard />

        <article className="card activity-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge blue">
                <Activity size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Recent Activity</h2>
                <p>Latest updates from your clinic</p>
              </div>
            </div>
          </div>

          {recentActivity.length ? (
            <div className="dash-list">
              {recentActivity.map((item) => (
                <div className="dash-list-row" key={item.id}>
                  <span
                    className={`dash-item-icon ${item.kind === "transfer" ? "medium" : "low"}`}
                  >
                    {item.kind === "transfer" ? (
                      <ArrowLeftRight size={15} strokeWidth={2} />
                    ) : (
                      <PackageCheck size={15} strokeWidth={2} />
                    )}
                  </span>
                  <div className="dash-item-copy">
                    <strong title={item.title}>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <time className="dash-item-time">
                    {relativeTime(item.timestamp)}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              <Clock size={24} strokeWidth={1.7} />
              Recent activity will appear here when data is available.
            </EmptyState>
          )}
        </article>

        <article className="card medicine-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge blue">
                <Boxes size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Medicine Inventory</h2>
                <p>Priority stock levels requiring attention</p>
              </div>
            </div>
            <Link className="text-link" to="/inventory">
              View inventory <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>

          {quickInventory.length ? (
            <div className="dash-list">
              {quickInventory.map(({ medicine, alert }) => {
                const rowClass =
                  alert.rowTone === "row-danger"
                    ? "dash-item-danger"
                    : alert.rowTone === "row-warning"
                      ? "dash-item-warning"
                      : "";
                return (
                  <div
                    className={`dash-list-row ${rowClass}`}
                    key={medicine.id}
                  >
                    <span
                      className={`dash-item-icon ${
                        alert.rowTone === "row-danger"
                          ? "high"
                          : alert.rowTone === "row-warning"
                            ? "medium"
                            : "low"
                      }`}
                    >
                      <Pill size={15} strokeWidth={1.9} />
                    </span>
                    <div className="dash-item-copy">
                      <strong title={medicine.medicineName}>
                        {medicine.medicineName}
                      </strong>
                      <span>
                        {Number(medicine.quantity || 0).toLocaleString()} units ·{" "}
                        {medicine.category || "Medicine"}
                      </span>
                    </div>
                    <StockStatus status={alert.status} />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>
              <Pill size={24} strokeWidth={1.7} />
              Inventory details will appear here when data is available.
            </EmptyState>
          )}
        </article>

        <article className="promo-card">
          <div>
            <div className="promo-brand">
              <ShieldCheck size={22} strokeWidth={2} />
              Stock<span>Guard</span>
            </div>

            <h2>
              Smarter decisions.
              <br />
              Healthier tomorrow.
            </h2>

            <p>
              Manage stock, monitor batches, and support clinic teams with
              verified on-chain provenance.
            </p>
          </div>

          <Link to="/blockchain" className="button button-primary">
            Explore traceability <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </article>
      </section>
    </>
  );
}
