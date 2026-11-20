import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  Mail,
  Phone,
  Pill,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { auth, db } from "../firebase.js";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import ExpiryAlerts from "../components/dashboard/ExpiryAlerts";
import ForecastCard from "../components/dashboard/ForecastCard";
import StockChart from "../components/dashboard/StockChart";
import StockSummary from "../components/dashboard/StockSummary";
import formatDate from "../utils/formatDate";

export default function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
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
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          setError("User profile not found.");
          return;
        }

        setUserData(userSnapshot.data());
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

  const profileFields = [
    {
      label: "Full Name",
      value: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "—",
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
      <PageHeader
        title={`Welcome, ${userData.firstName}!`}
        description={`Overview of your clinic inventory · ${formatDate(new Date())}`}
      />

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
          <span className="info-tag">
            <BadgeCheck size={14} strokeWidth={2.2} />
            Active account
          </span>
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

      <StockSummary />

      <section className="dashboard-grid">
        <StockChart />
        <ExpiryAlerts />
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

          <EmptyState>
            <Clock size={24} strokeWidth={1.7} />
            Recent activity will appear here when data is available.
          </EmptyState>
        </article>

        <article className="card medicine-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge blue">
                <Boxes size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Medicine Inventory</h2>
                <p>Quick view of clinic stock</p>
              </div>
            </div>
            <Link className="text-link" to="/inventory">
              View inventory <ArrowRight size={14} strokeWidth={2.2} />
            </Link>
          </div>

          <EmptyState>
            <Pill size={24} strokeWidth={1.7} />
            Inventory details will appear here when data is available.
          </EmptyState>
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
