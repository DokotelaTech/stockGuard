import { Filter } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";

const columns = [
  "Medicine",
  "Batch number",
  "Expiry date",
  "Priority",
  "Suggested action",
];

export default function ExpiryAlerts() {
  return (
    <>
      <PageHeader
        title="Expiry Alerts"
        description="Review medicines approaching their expiry date."
        action={
          <button className="filter-select" disabled>
            <Filter size={15} />
            Priority
          </button>
        }
      />
      <section className="card table-card">
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
                    Expiry alerts will appear here when inventory data is
                    available.
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
