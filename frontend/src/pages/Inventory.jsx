import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Plus, X } from "lucide-react";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import MedicineTable from "../components/inventory/MedicineTable";

import {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine
} from "../services/inventoryService";

const initialForm = {
    medicineName: "",
    category: "",
    batchNumber: "",
    manufacturer: "",
    quantity: "",
    unitPrice: "",
    manufactureDate: "",
    expiryDate: "",
    supplier: ""
};

export default function Inventory() {

    const { query: globalQuery = "" } = useOutletContext() || {};

    const [query, setQuery] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // FETCH INVENTORY
    const loadMedicines = async () => {

        try {
            setLoading(true);

            const data = await getMedicines();

            setMedicines(data);

        } catch (error) {
            console.error(error);
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
        return () => { active = false; };
    }, []);

    // HANDLE INPUT
    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    // ADD OR UPDATE MEDICINE
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

            } else {

                await addMedicine(form);
            }

            setForm(initialForm);
            setEditingId(null);
            setShowForm(false);

            await loadMedicines();

        } catch (error) {

            console.error(error);
            setError("Something went wrong while saving medicine.");

        } finally {
            setSaving(false);
        }
    };

    // EDIT MEDICINE
    const handleEdit = (medicine) => {

        setForm({
            medicineName: medicine.medicineName || "",
            category: medicine.category || "",
            batchNumber: medicine.batchNumber || "",
            manufacturer: medicine.manufacturer || "",
            quantity: String(medicine.quantity ?? ""),
            unitPrice: String(medicine.unitPrice ?? ""),
            manufactureDate: medicine.manufactureDate || "",
            expiryDate: medicine.expiryDate || "",
            supplier: medicine.supplier || ""
        });

        setEditingId(medicine.id);
        setShowForm(true);
    };

    // DELETE MEDICINE
    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this medicine?"
        );

        if (!confirmed) return;

        try {

            await deleteMedicine(id);

            await loadMedicines();

        } catch (error) {

            console.error(error);
            setError("Unable to delete medicine.");
        }
    };

    // SEARCH MEDICINES
const filteredMedicines = medicines.filter((medicine) => {

    const searchTerms = [query, globalQuery]
        .filter(Boolean)
        .map(value => value.toLowerCase());

    const searchable = `
        ${medicine.medicineName}
        ${medicine.batchNumber}
        ${medicine.category}
    `.toLowerCase();

    return searchTerms.every(term => searchable.includes(term));
});

    return (
        <>
            <PageHeader
                title="Medicine Inventory"
                description="Browse stock, check quantities, and manage medicines."
                action={
                    <div style={{ display: "flex", gap: "10px" }}>

                        <Button onClick={() => {
                            setForm(initialForm);
                            setEditingId(null);
                            setShowForm(true);
                        }}>
                            <Plus size={16} />
                            Add Medicine
                        </Button>

                    </div>
                }
            />

            {error && (
                <p style={{ color: "#ef4444", marginBottom: "15px" }}>
                    {error}
                </p>
            )}

            {/* INVENTORY SUMMARY */}

            <section style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "20px"
            }}>

                <div className="card" style={{ padding: "20px" }}>
                    <p>Total Medicines</p>
                    <h2>{medicines.length}</h2>
                </div>

                <div className="card" style={{ padding: "20px" }}>
                    <p>Low Stock</p>
                    <h2>
                        {medicines.filter(m =>
                            Number(m.quantity) <= 10
                        ).length}
                    </h2>
                </div>

                <div className="card" style={{ padding: "20px" }}>
                    <p>Expired Medicines</p>
                    <h2>
                        {medicines.filter(m =>
                            m.expiryDate &&
                            new Date(m.expiryDate + "T23:59:59") < new Date()
                        ).length}
                    </h2>
                </div>

                <div className="card" style={{ padding: "20px" }}>
                    <p>Total Stock Units</p>
                    <h2>
                        {medicines.reduce(
                            (total, m) => total + Number(m.quantity || 0),
                            0
                        )}
                    </h2>
                </div>

            </section>

            {/* ADD / EDIT FORM */}

            {showForm && (

                <section className="card" style={{
                    padding: "25px",
                    marginBottom: "20px"
                }}>

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px"
                    }}>

                        <h3>
                            {editingId ? "Update Medicine" : "Add New Medicine"}
                        </h3>

                        <button onClick={() => {
                            setShowForm(false);
                            setError("");
                        }}>
                            <X size={20} />
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "15px"
                        }}>

                            {[
                                ["medicineName", "Medicine Name", "text"],
                                ["category", "Category", "text"],
                                ["batchNumber", "Batch Number", "text"],
                                ["manufacturer", "Manufacturer", "text"],
                                ["quantity", "Quantity", "number"],
                                ["unitPrice", "Unit Price (R)", "number"],
                                ["manufactureDate", "Manufacturing Date", "date"],
                                ["expiryDate", "Expiry Date", "date"],
                                ["supplier", "Supplier", "text"]
                            ].map(([name, label, type]) => (

                                <label key={name} style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "7px"
                                }}>

                                    {label}

                                    <input
                                        type={type}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        min={type === "number" ? "0" : undefined}
                                        step={name === "unitPrice" ? "0.01" : "1"}
                                        required={[
                                            "medicineName",
                                            "category",
                                            "batchNumber",
                                            "quantity",
                                            "unitPrice",
                                            "expiryDate"
                                        ].includes(name)}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #475569",
                                            width: "100%"
                                        }}
                                    />

                                </label>

                            ))}

                        </div>

                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "20px"
                        }}>

                            <Button disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Medicine"
                                        : "Save Medicine"}
                            </Button>

                            <Button
                                type="button"
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

            {/* INVENTORY TABLE */}

            <section className="card table-card">

                <div className="table-toolbar">

                    <label className="table-search">

                        <Search size={16} />

                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search medicine, category or batch..."
                        />

                    </label>

                    <span className="results-count">
                        {filteredMedicines.length} medicines found
                    </span>

                </div>

                {loading ? (

                    <p style={{ padding: "25px" }}>
                        Loading inventory...
                    </p>

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
