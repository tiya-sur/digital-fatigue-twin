import { Brain, LayoutDashboard, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-neutral-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Brain size={20} />
        </div>
        <span className="text-lg font-bold tracking-tight">FatigueTwin</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              currentPage === item.id
                ? "bg-indigo-50 text-indigo-700"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-neutral-100 p-4">
        <button
          onClick={() => onNavigate("landing")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
