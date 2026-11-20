import { Edit, Trash2 } from "lucide-react";

export default function MedicineTable({
    medicines,
    onEdit,
    onDelete,
    emptyMessage
}) {

    if (medicines.length === 0) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#94a3b8"
            }}>
                {emptyMessage || "No medicines found."}
            </div>
        );
    }

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left"
            }}>

                <thead>
                    <tr>
                        {[
                            "Medicine",
                            "Category",
                            "Batch Number",
                            "Quantity",
                            "Price",
                            "Expiry Date",
                            "Status",
                            "Actions"
                        ].map((heading) => (
                            <th key={heading} style={{
                                padding: "14px",
                                borderBottom: "1px solid #334155",
                                color: "#94a3b8",
                                fontSize: "13px"
                            }}>
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {medicines.map((medicine) => {

                        const expired =
                            medicine.expiryDate &&
                            new Date(medicine.expiryDate) < new Date();

                        const lowStock =
                            Number(medicine.quantity) <= 10;

                        const status = expired
                            ? "Expired"
                            : lowStock
                                ? "Low Stock"
                                : "Available";

                        return (
                            <tr key={medicine.id}>

                                <td style={{ padding: "14px" }}>
                                    {medicine.medicineName}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    {medicine.category}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    {medicine.batchNumber}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    {medicine.quantity}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    R {Number(medicine.unitPrice).toFixed(2)}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    {medicine.expiryDate}
                                </td>

                                <td style={{ padding: "14px" }}>
                                    <span style={{
                                        padding: "5px 10px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        background: expired
                                            ? "#fee2e2"
                                            : lowStock
                                                ? "#fef3c7"
                                                : "#dcfce7",
                                        color: expired
                                            ? "#991b1b"
                                            : lowStock
                                                ? "#92400e"
                                                : "#166534"
                                    }}>
                                        {status}
                                    </span>
                                </td>

                                <td style={{
                                    padding: "14px",
                                    display: "flex",
                                    gap: "10px"
                                }}>

                                    <button
                                        onClick={() => onEdit(medicine)}
                                        title="Edit medicine"
                                    >
                                        <Edit size={17} />
                                    </button>

                                    <button
                                        onClick={() => onDelete(medicine.id)}
                                        title="Delete medicine"
                                        style={{ color: "#ef4444" }}
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </td>

                            </tr>
                        );
                    })}
                </tbody>

            </table>
        </div>
    );
}