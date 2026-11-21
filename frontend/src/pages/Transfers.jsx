import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import { auth, db } from "../firebase";
import {
  createTransfer,
  listTransfers,
  updateTransferStatus,
} from "../services/transferService";

const columns = [
  "From",
  "To",
  "Medicine",
  "Quantity",
  "Status",
  "Date",
  "Action",
];

export default function Transfers() {
  const [formOpen, setFormOpen] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    sourceClinic: "",
    destinationClinic: "",
    medicine: "",
    quantity: "",
  });

  useEffect(() => {
    let active = true;
    const user = auth.currentUser;

    async function load() {
      try {
        const [profileSnap, data] = await Promise.all([
          user
            ? getDoc(doc(db, "users", user.uid)).catch(() => null)
            : Promise.resolve(null),
          listTransfers(),
        ]);

        if (!active) return;

        const clinic = profileSnap?.exists()
          ? profileSnap.data().clinic || ""
          : "";
        setTransfers(data);
        if (clinic) {
          setForm((prev) => ({
            ...prev,
            sourceClinic: prev.sourceClinic || clinic,
          }));
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load transfers.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !form.sourceClinic.trim() ||
      !form.destinationClinic.trim() ||
      !form.medicine.trim() ||
      !form.quantity
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");
      const created = await createTransfer(form);
      setTransfers((prev) => [created, ...prev]);
      setForm((prev) => ({
        ...prev,
        destinationClinic: "",
        medicine: "",
        quantity: "",
      }));
      setFormOpen(false);
      setNotice(
        `Transfer recorded for ${created.quantity} units of ${created.medicine}.`,
      );
    } catch (err) {
      setError(err.message || "Unable to submit transfer.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      setError("");
      await updateTransferStatus(id, "Completed");
      setTransfers((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "Completed" } : item,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to update transfer status.");
    }
  };

  const filtered = transfers.filter((item) => {
    if (statusFilter === "all") return true;
    return String(item.status || "").toLowerCase() === statusFilter;
  });

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

      {error && (
        <div className="alert-banner error" role="alert">
          <AlertCircle size={18} strokeWidth={2} />
          <span>{error}</span>
          <button
            type="button"
            className="alert-banner-close"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="alert-banner success" role="status">
          <CheckCircle2 size={18} strokeWidth={2} />
          <span>{notice}</span>
          <button
            type="button"
            className="alert-banner-close"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {formOpen && (
        <section className="card transfer-form">
          <div className="card-heading">
            <div>
              <span className="icon-badge emerald">
                <ArrowLeftRight size={19} strokeWidth={1.9} />
              </span>
              <div>
                <h2>Create a stock transfer</h2>
                <p>Record a stock redistribution in Firestore.</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label>
              From clinic
              <input
                name="sourceClinic"
                value={form.sourceClinic}
                onChange={(e) =>
                  setForm({ ...form, sourceClinic: e.target.value })
                }
                placeholder="Clinic name or ID"
                required
              />
            </label>
            <label>
              To clinic
              <input
                name="destinationClinic"
                value={form.destinationClinic}
                onChange={(e) =>
                  setForm({ ...form, destinationClinic: e.target.value })
                }
                placeholder="Destination clinic"
                required
              />
            </label>
            <label>
              Medicine
              <input
                name="medicine"
                value={form.medicine}
                onChange={(e) => setForm({ ...form, medicine: e.target.value })}
                placeholder="Medicine name"
                required
              />
            </label>
            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Units to transfer"
                required
              />
            </label>
            <Button type="submit" disabled={saving}>
              <ArrowRight size={16} strokeWidth={2} />
              {saving ? "Saving…" : "Submit transfer"}
            </Button>
          </form>
        </section>
      )}

      <section className="card table-card">
        <div className="table-toolbar">
          <div>
            <strong className="toolbar-title">Transfer history</strong>
            <p>Stock movements recorded in Firestore</p>
          </div>
          <label className="filter-select">
            <SlidersHorizontal size={15} strokeWidth={2} />
            <select
              aria-label="Filter transfer status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </label>
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
              {loading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="loader-center">
                      <Loader label="Loading transfers…" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((item) => {
                  const isPending =
                    String(item.status || "").toLowerCase() === "pending";
                  return (
                    <tr
                      key={item.id}
                      className={isPending ? "row-warning" : "row-success"}
                    >
                      <td>{item.sourceClinic}</td>
                      <td>{item.destinationClinic}</td>
                      <td>
                        <strong>{item.medicine}</strong>
                      </td>
                      <td>
                        <strong>
                          {Number(item.quantity || 0).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${isPending ? "pending" : "low"}`}
                        >
                          <i aria-hidden="true" />
                          {item.status}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        {isPending ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => handleMarkCompleted(item.id)}
                          >
                            Mark received
                          </button>
                        ) : (
                          <span className="metric-subtext">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="empty-state" colSpan={columns.length}>
                    <EmptyState>
                      <ArrowLeftRight size={24} strokeWidth={1.7} />
                      No transfers recorded yet. Create a transfer to track
                      stock movements.
                    </EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
