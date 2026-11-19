import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <main className="main-area">
        <Navbar
          onMenuOpen={() => setSidebarOpen(true)}
          query={query}
          onSearch={setQuery}
          onLogout={onLogout}
        />
        <div className="page-content">
          <Outlet context={{ query }} />
        </div>
      </main>
    </div>
  );
}
