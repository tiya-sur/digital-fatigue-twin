import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard" | "analytics" | "settings">("landing");

  // Simple routing logic
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <Landing onStart={() => setCurrentPage("dashboard")} />;
      case "dashboard":
        return <Dashboard />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Landing onStart={() => setCurrentPage("dashboard")} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {currentPage === "landing" ? (
        renderPage()
      ) : (
        <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </Layout>
      )}
    </div>
  );
}
