import { useState } from "react";
import { FileSearch, QrCode, ShieldCheck, Check, XCircle } from "lucide-react";

import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";

import { verifyMedicineBatch } from "../services/inventoryService";

export default function ScanBatch() {

    const [batchNumber, setBatchNumber] = useState("");
    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (event) => {

        event.preventDefault();

        if (!batchNumber.trim()) {
            setError("Please enter a batch number.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setMedicine(null);

            const results = await verifyMedicineBatch(batchNumber);

            if (results.length === 0) {
                setError("No medicine found with this batch number.");
                return;
            }

            setMedicine(results);

        } catch (error) {

            console.error("Batch verification error:", error);

            setError(error.message || "Unable to verify this batch.");

        } finally {

            setLoading(false);

        }

    };

    return (
        <>
            <PageHeader
                title="Scan Batch"
                description="Verify a medicine batch using its QR code or batch number."
            />

            <div className="scan-layout">

                <section className="card scan-card">

                    <div className="card-heading">

                        <div>
                            <QrCode size={19} className="heading-icon green-text" />

                            <div>
                                <h2>Verify a medicine batch</h2>
                                <p>Enter a batch number to retrieve its records.</p>
                            </div>
                        </div>

                    </div>

                    <div className="scanner-view scanner-disabled">

                        <div className="scan-corners" />

                        <QrCode size={68} strokeWidth={1.3} />

                        <span>QR camera scanner</span>

                        <small>
                            Camera scanning will be integrated separately.
                        </small>

                    </div>

                    <div className="scan-divider">
                        <span />
                        enter batch details
                        <span />
                    </div>

                    <form onSubmit={handleVerify}>

                        <label className="field-label" htmlFor="batch-number">
                            Batch number
                        </label>

                        <div className="batch-entry">

                            <input
                                id="batch-number"
                                value={batchNumber}
                                onChange={(event) => setBatchNumber(event.target.value)}
                                placeholder="Enter a batch number"
                            />

                            <Button
                                type="submit"
                                disabled={loading || !batchNumber.trim()}
                            >
                                <FileSearch size={16} />

                                {loading ? "Verifying..." : "Verify Batch"}

                            </Button>

                        </div>

                    </form>

                    {error && (

                        <div style={{
                            marginTop: "20px",
                            padding: "15px",
                            borderRadius: "8px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}>

                            <XCircle size={20} />

                            {error}

                        </div>

                    )}

                    {medicine && (

                        <div style={{ marginTop: "25px" }}>

                            <h3 style={{ color: "#059669" }}>
                                <ShieldCheck size={20} style={{
                                    display: "inline",
                                    verticalAlign: "middle",
                                    marginRight: "8px"
                                }} />

                                Batch verification successful
                            </h3>

                            {medicine.map((item) => (

                                <div
                                    key={item.id}
                                    className="card"
                                    style={{
                                        padding: "20px",
                                        marginTop: "15px"
                                    }}
                                >

                                    <h3>{item.medicineName}</h3>

                                    <p>
                                        <strong>Batch Number:</strong> {item.batchNumber}
                                    </p>

                                    <p>
                                        <strong>Category:</strong> {item.category}
                                    </p>

                                    <p>
                                        <strong>Manufacturer:</strong> {item.manufacturer || "Not provided"}
                                    </p>

                                    <p>
                                        <strong>Quantity:</strong> {item.quantity}
                                    </p>

                                    <p>
                                        <strong>Supplier:</strong> {item.supplier || "Not provided"}
                                    </p>

                                    <p>
                                        <strong>Manufacturing Date:</strong> {item.manufactureDate || "Not provided"}
                                    </p>

                                    <p>
                                        <strong>Expiry Date:</strong> {item.expiryDate || "Not provided"}
                                    </p>

                                    <p style={{
                                        color: "#059669",
                                        fontWeight: "600",
                                        marginTop: "15px"
                                    }}>
                                        <Check size={16} style={{
                                            display: "inline",
                                            verticalAlign: "middle"
                                        }} />
                                        &nbsp; Record found in StockGuard inventory.
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                <aside className="card scan-guide">

                    <div className="guide-icon">
                        <ShieldCheck size={24} />
                    </div>

                    <h2>Verify every batch</h2>

                    <p>
                        Review product, batch, origin, and expiry information
                        as part of your receiving workflow.
                    </p>

                    <ul>

                        <li>
                            <Check size={15} />
                            Confirm product and batch details
                        </li>

                        <li>
                            <Check size={15} />
                            Review origin and expiry information
                        </li>

                        <li>
                            <Check size={15} />
                            Retrieve records from Firestore
                        </li>

                    </ul>

                    <div className="info-tag">
                        Firestore Connected
                    </div>

                </aside>

            </div>
        </>
    );
}