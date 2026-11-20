import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  CalendarX2,
  CheckCircle2,
  Database,
  Layers,
  Package,
  PencilLine,
  Plus,
  PlusCircle,
  Search,
  X,
} from "lucide-react";

import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import MedicineTable from "../components/inventory/MedicineTable";

import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  seedDemoInventory,
} from "../services/inventoryService";

const initialForm = {
  medicineName: "",
  category: "",
  batchNumber: "",
  manufacturer: "",
  quantity: "",
  averageDailyUsage: "",
  unitPrice: "",
  manufactureDate: "",
  expiryDate: "",
  supplier: "",
};

const formFields = [
  ["medicineName", "Medicine Name", "text"],
  ["category", "Category", "text"],
  ["batchNumber", "Batch Number", "text"],
  ["manufacturer", "Manufacturer", "text"],
  ["quantity", "Quantity", "number"],
  ["averageDailyUsage", "Average daily usage (units, optional)", "number"],
  ["unitPrice", "Unit Price (R)", "number"],
  ["manufactureDate", "Manufacturing Date", "date"],
  ["expiryDate", "Expiry Date", "date"],
  ["supplier", "Supplier", "text"],
];

const requiredFields = new Set([
  "medicineName",
  "category",
  "batchNumber",
  "quantity",
  "unitPrice",
  "expiryDate",
]);

export default function Inventory() {
  const { query: globalQuery = "" } = useOutletContext() || {};

  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadInitialMedicines() {
      try {
        const data = await getMedicines();
        if (active) setMedicines(data);
      } catch (loadError) {
        console.error(loadError);
        if (active) setError("Unable to load inventory.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialMedicines();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        !form.medicineName ||
        !form.category ||
        !form.batchNumber ||
        form.quantity === "" ||
        form.unitPrice === "" ||
        !form.expiryDate
      ) {
        setError("Please complete all required fields.");
        return;
      }

      if (
        !Number.isFinite(Number(form.quantity)) ||
        Number(form.quantity) < 0 ||
        !Number.isFinite(Number(form.averageDailyUsage || 0)) ||
        Number(form.averageDailyUsage || 0) < 0 ||
        !Number.isFinite(Number(form.unitPrice)) ||
        Number(form.unitPrice) < 0
      ) {
        setError("Enter valid quantity and price values.");
        return;
      }

      if (
        new Date(form.expiryDate + "T00:00:00") <
        new Date(new Date().toDateString())
      ) {
        setError("Expiry date cannot be in the past.");
        return;
      }

      if (editingId) {
        await updateMedicine(editingId, form);
        setNotice("Medicine updated successfully.");
      } else {
        await addMedicine(form);
        setNotice("Medicine added to inventory.");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);

      await loadMedicines();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine) => {
    setForm({
      medicineName: medicine.medicineName || "",
      category: medicine.category || "",
      batchNumber: medicine.batchNumber || "",
      manufacturer: medicine.manufacturer || "",
      quantity: String(medicine.quantity ?? ""),
      averageDailyUsage: String(medicine.averageDailyUsage ?? ""),
      unitPrice: String(medicine.unitPrice ?? ""),
      manufactureDate: medicine.manufactureDate || "",
      expiryDate: medicine.expiryDate || "",
      supplier: medicine.supplier || "",
    });

    setEditingId(medicine.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this medicine?",
    );
    if (!confirmed) return;

    try {
      await deleteMedicine(id);
      setNotice("Medicine removed from inventory.");
      await loadMedicines();
    } catch (err) {
      console.error(err);
      setError("Unable to delete medicine.");
    }
  };

  const handleSeedDemoInventory = async () => {
    try {
      setSeeding(true);
      setError("");
      setNotice("");
      const result = await seedDemoInventory();
      await loadMedicines();
      setNotice(
        result.added > 0
          ? `Added ${result.added} demo stock items${result.skipped ? `; skipped ${result.skipped} already seeded` : ""}.`
          : "Demo stock is already in your inventory.",
      );
    } catch (seedError) {
      console.error("Demo inventory seed failed:", seedError);
      setError(seedError.message || "Unable to add demo stock data.");
    } finally {
      setSeeding(false);
    }
  };

  const filteredMedicines = medicines.filter((medicine) => {
    const searchTerms = [query, globalQuery]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    const searchable = `
      ${medicine.medicineName || ""}
      ${medicine.batchNumber || ""}
      ${medicine.category || ""}
    `.toLowerCase();

    return searchTerms.every((term) => searchable.includes(term));
  });

  const lowStockCount = medicines.filter(
    (m) => Number(m.quantity) <= 10,
  ).length;
  const expiredCount = medicines.filter(
    (m) => m.expiryDate && new Date(`${m.expiryDate}T23:59:59`) < new Date(),
  ).length;
  const totalUnits = medicines.reduce(
    (total, m) => total + Number(m.quantity || 0),
    0,
  );

  return (
    <>
      <PageHeader
        title="Medicine Inventory"
        description="Browse stock, check quantities, and manage medicines."
        action={
          <>
            <Button
              variant="light"
              onClick={handleSeedDemoInventory}
              disabled={seeding}
            >
              <Database size={16} strokeWidth={1.9} />
              {seeding ? "Adding demo stock…" : "Add demo stock"}
            </Button>

            <Button
              onClick={() => {
                setForm(initialForm);
                setEditingId(null);
                setShowForm(true);
                setError("");
              }}
            >
              <Plus size={16} strokeWidth={2.2} />
              Add Medicine
            </Button>
          </>
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

      <section className="metric-grid" aria-label="Inventory summary">
        <article className="metric-card metric-medicines">
          <div className="metric-icon">
            <Package size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Total Medicines</span>
            <strong>{medicines.length.toLocaleString()}</strong>
            <span className="metric-subtext">Active catalog items</span>
          </div>
        </article>

        <article className="metric-card metric-expiry">
          <div className="metric-icon">
            <AlertTriangle size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Low Stock</span>
            <strong>{lowStockCount.toLocaleString()}</strong>
            <span className="metric-subtext">10 units or fewer</span>
          </div>
        </article>

        <article className="metric-card metric-risk">
          <div className="metric-icon">
            <CalendarX2 size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Expired Medicines</span>
            <strong>{expiredCount.toLocaleString()}</strong>
            <span className="metric-subtext">Require immediate review</span>
          </div>
        </article>

        <article className="metric-card metric-transfer">
          <div className="metric-icon">
            <Layers size={22} strokeWidth={1.9} />
          </div>
          <div className="metric-content">
            <span>Total Stock Units</span>
            <strong>{totalUnits.toLocaleString()}</strong>
            <span className="metric-subtext">Combined clinic inventory</span>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="card form-card">
          <div className="card-heading">
            <div>
              <span className="icon-badge emerald">
                {editingId ? (
                  <PencilLine size={19} strokeWidth={1.9} />
                ) : (
                  <PlusCircle size={19} strokeWidth={1.9} />
                )}
              </span>
              <div>
                <h2>{editingId ? "Update Medicine" : "Add New Medicine"}</h2>
                <p>
                  {editingId
                    ? "Modify batch quantities, pricing, or expiry details."
                    : "Register a new medicine batch in your clinic inventory."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="icon-button"
              aria-label="Close form"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {formFields.map(([name, label, type]) => (
                <label key={name} className="form-field">
                  <span>{label}</span>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    min={type === "number" ? "0" : undefined}
                    step={name === "unitPrice" ? "0.01" : "1"}
                    required={requiredFields.has(name)}
                  />
                </label>
              ))}
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update Medicine"
                    : "Save Medicine"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="card table-card">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={17} strokeWidth={1.9} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search medicine, category or batch..."
            />
          </label>

          <span className="results-count">
            {filteredMedicines.length}{" "}
            {filteredMedicines.length === 1 ? "medicine" : "medicines"} found
          </span>
        </div>

        {loading ? (
          <div className="loader-center">
            <Loader label="Loading inventory…" />
          </div>
        ) : (
          <MedicineTable
            medicines={filteredMedicines}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No medicines found. Add your first medicine."
          />
        )}
      </section>
    </>
  );
}
