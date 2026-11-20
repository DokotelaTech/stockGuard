import { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";

const columns = ["From", "To", "Medicine", "Quantity", "Status", "Date"];

export default function Transfers() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Transfers"
        description="Move stock between clinics and track each transfer."
        action={
          <Button
            variant={formOpen ? "secondary" : "primary"}
            onClick={() => setFormOpen(!formOpen)}
          >
            {formOpen ? (
              <X size={16} strokeWidth={2} />
            ) : (
              <Plus size={16} strokeWidth={2.2} />
            )}
            {formOpen ? "Close" : "New transfer"}
          </Button>
        }
      />

      {formOpen && (
        <section className="card transfer-form">
          <div className="card-heading">
            <div>
              <span className="icon-badge emerald">
                <ArrowLeftRight size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Create a stock transfer</h2>
                <p>
                  Enter transfer details. Submission is unavailable until the
                  transfer API is connected.
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <label>
              From clinic
              <input name="sourceClinic" placeholder="Clinic name or ID" />
            </label>
            <label>
              To clinic
              <input name="destinationClinic" placeholder="Clinic name or ID" />
            </label>
            <label>
              Medicine
              <input name="medicine" placeholder="Medicine name or ID" />
            </label>
            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="1"
                placeholder="Quantity"
              />
            </label>
            <Button type="button" disabled>
              <ArrowRight size={16} strokeWidth={2} />
              Submit transfer
            </Button>
          </form>
        </section>
      )}

      <section className="card table-card">
        <div className="table-toolbar">
          <div>
            <strong className="toolbar-title">Transfer history</strong>
            <p>Recent stock movements between clinics</p>
          </div>
          <button className="filter-select" disabled>
            <SlidersHorizontal size={15} strokeWidth={2} />
            Status
          </button>
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
              <tr>
                <td className="empty-state" colSpan={columns.length}>
                  <EmptyState>
                    <ArrowLeftRight size={24} strokeWidth={1.7} />
                    Transfer records will appear here when the transfer service
                    is connected.
                  </EmptyState>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
