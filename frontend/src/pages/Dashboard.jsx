import { Activity, ArrowRight, Boxes, Pill, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import ExpiryAlerts from "../components/dashboard/ExpiryAlerts";
import ForecastCard from "../components/dashboard/ForecastCard";
import StockChart from "../components/dashboard/StockChart";
import StockSummary from "../components/dashboard/StockSummary";
import formatDate from "../utils/formatDate";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Overview of your clinic inventory · ${formatDate(new Date())}`}
      />
      <StockSummary />
      <section className="dashboard-grid">
        <StockChart />
        <ExpiryAlerts />
        <ForecastCard />
        <article className="card activity-card">
          <div className="card-heading">
            <div>
              <Activity size={19} className="heading-icon blue-text" />
              <div>
                <h2>Recent Activity</h2>
                <p>Latest updates from your clinic</p>
              </div>
            </div>
          </div>
          <EmptyState>
            Recent activity will appear here when data is available.
          </EmptyState>
        </article>
        <article className="card medicine-card">
          <div className="card-heading">
            <div>
              <Boxes size={19} className="heading-icon blue-text" />
              <div>
                <h2>Medicine Inventory</h2>
                <p>Quick view of clinic stock</p>
              </div>
            </div>
            <Link className="text-link" to="/inventory">
              View inventory <ArrowRight size={14} />
            </Link>
          </div>
          <EmptyState>
            <Pill size={21} /> Inventory details will appear here when data is
            available.
          </EmptyState>
        </article>
        <article className="promo-card">
          <div className="promo-brand">
            <ShieldCheck size={22} /> Stock<span>Guard</span>
          </div>
          <h2>
            Smarter decisions.
            <br />
            Healthier tomorrow.
          </h2>
          <p>Manage stock, monitor batches, and support clinic teams.</p>
          <Link to="/blockchain" className="button button-primary">
            Explore traceability <ArrowRight size={15} />
          </Link>
        </article>
      </section>
    </>
  );
}
