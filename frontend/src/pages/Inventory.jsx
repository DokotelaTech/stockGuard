import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Search } from "lucide-react";
import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import MedicineTable from "../components/inventory/MedicineTable";

export default function Inventory() {
  const { query: globalQuery = "" } = useOutletContext() || {};
  const [query, setQuery] = useState("");

  return (
    <>
      <PageHeader
        title="Medicine Inventory"
        description="Browse stock, check quantities, and manage medicines."
        action={
          <Button disabled>
            <Download size={16} />
            Export
          </Button>
        }
      />
      <section className="card table-card">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search medicine or batch..."
            />
          </label>
          <span className="results-count">
            Inventory data will load from the API
          </span>
        </div>
        <MedicineTable
          medicines={[]}
          emptyMessage={
            globalQuery || query
              ? "No inventory data is available to search yet."
              : "Inventory records will appear here when your backend is connected."
          }
        />
      </section>
      <section className="info-card">
        <div className="info-icon">
          <Search size={20} />
        </div>
        <div>
          <strong>Inventory is ready to connect</strong>
          <p>
            Connect the inventory service to load clinic quantities and batch
            details.
          </p>
        </div>
        <span className="info-tag">Awaiting API</span>
      </section>
    </>
  );
}
