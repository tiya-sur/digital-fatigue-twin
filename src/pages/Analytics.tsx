import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Calendar, Download, Filter } from "lucide-react";
import { cn } from "../lib/utils";

export function Analytics() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        setHistory(result.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getFatigueColor = (score: number) => {
    if (score > 1.5) return "#ef4444";
    if (score > 1.2) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Session Analytics</h1>
          <p className="text-neutral-500">Historical data and long-term fatigue trends.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Overview */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-neutral-900">Fatigue Distribution</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" hide />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="fatigue_score" radius={[4, 4, 0, 0]}>
                  {history.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFatigueColor(entry.fatigue_score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">Session Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total Samples</span>
                <span className="font-bold">{history.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Avg Fatigue Score</span>
                <span className="font-bold">
                  {(history.reduce((acc, curr) => acc + curr.fatigue_score, 0) / (history.length || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Peak Fatigue</span>
                <span className="font-bold text-red-600">
                  {Math.max(...history.map(h => h.fatigue_score), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">Time Distribution</h3>
            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '70%' }} />
                <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                <div className="h-full bg-red-500" style={{ width: '10%' }} />
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Normal</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /> Moderate</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500" /> High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Key Latency</th>
              <th className="px-6 py-4">Click Interval</th>
              <th className="px-6 py-4">Pause Time</th>
              <th className="px-6 py-4">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {history.slice().reverse().slice(0, 10).map((item, i) => (
              <tr key={i} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 text-neutral-500">{new Date(item.timestamp).toLocaleTimeString()}</td>
                <td className="px-6 py-4 font-mono">{item.avg_key_latency}ms</td>
                <td className="px-6 py-4 font-mono">{item.click_interval}ms</td>
                <td className="px-6 py-4 font-mono">{item.pause_time}s</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    item.fatigue_score > 1.5 ? "text-red-700 bg-red-50" : 
                    item.fatigue_score > 1.2 ? "text-amber-700 bg-amber-50" : 
                    "text-emerald-700 bg-emerald-50"
                  )}>
                    {item.fatigue_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
