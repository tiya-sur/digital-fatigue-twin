import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  MousePointer2, 
  Keyboard, 
  Timer, 
  AlertCircle,
  RefreshCcw,
  Play
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "../lib/utils";

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const mockEdgeData = async () => {
    const mockPayload = {
      avg_key_latency: Math.floor(Math.random() * 150) + 50,
      click_interval: Math.floor(Math.random() * 400) + 100,
      pause_time: (Math.random() * 3).toFixed(2),
      fatigue_state: Math.random() > 0.8 ? 1 : 0
    };

    await fetch("/api/fatigue-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockPayload)
    });
    fetchData();
  };

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const latest = data?.latest || {
    fatigue_score: 0,
    avg_key_latency: 0,
    click_interval: 0,
    pause_time: 0,
    fatigue_state: 0
  };

  const fatigueLevel = latest.fatigue_score > 1.5 ? "High" : latest.fatigue_score > 1.2 ? "Moderate" : "Normal";
  const fatigueColor = latest.fatigue_score > 1.5 ? "text-red-600 bg-red-50 border-red-100" : latest.fatigue_score > 1.2 ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100";

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Live Dashboard</h1>
          <p className="text-neutral-500">Real-time fatigue monitoring and interaction analysis.</p>
        </div>
        <div className="flex gap-3">
          {data?.thingspeak?.error && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100">
              <AlertCircle size={14} />
              ThingSpeak: {data.thingspeak.error}
            </div>
          )}
          <button
            onClick={mockEdgeData}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all"
          >
            <Play size={16} />
            Simulate Edge Data
          </button>
          <button
            onClick={fetchData}
            className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Fatigue Score" 
          value={latest.fatigue_score} 
          icon={Brain} 
          trend={fatigueLevel}
          trendColor={fatigueColor}
        />
        <StatCard 
          title="Avg Key Latency" 
          value={`${latest.avg_key_latency}ms`} 
          icon={Keyboard} 
          subValue={`Baseline: ${data?.baseline?.key_latency}ms`}
        />
        <StatCard 
          title="Click Interval" 
          value={`${latest.click_interval}ms`} 
          icon={MousePointer2} 
          subValue={`Baseline: ${data?.baseline?.click_latency}ms`}
        />
        <StatCard 
          title="Pause Time" 
          value={`${latest.pause_time}s`} 
          icon={Timer} 
          subValue={`Baseline: ${data?.baseline?.pause}s`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Fatigue Trend</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1"><Activity size={14} /> Live</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.history || []}>
                <defs>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  hide 
                />
                <YAxis domain={[0, 'auto']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fatigue_score" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFatigue)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts / Insights */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Insights</h3>
          <div className="space-y-4">
            {latest.fatigue_score > 1.5 ? (
              <div className="flex gap-3 rounded-2xl bg-red-50 p-4 text-red-700 border border-red-100">
                <AlertCircle className="shrink-0" size={20} />
                <div>
                  <p className="font-semibold">High Fatigue Detected</p>
                  <p className="text-sm opacity-90">Your interaction patterns suggest significant mental fatigue. Consider taking a 15-minute break.</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 border border-emerald-100">
                <Activity className="shrink-0" size={20} />
                <div>
                  <p className="font-semibold">Optimal Focus</p>
                  <p className="text-sm opacity-90">Your interaction patterns are consistent with your baseline. You are in a high-focus state.</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recommendations</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">• Hydrate and stretch</li>
                <li className="flex items-center gap-2">• Use the 20-20-20 rule</li>
                <li className="flex items-center gap-2">• Minimize context switching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendColor, subValue }: any) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-neutral-50 p-2 text-neutral-600">
          <Icon size={20} />
        </div>
        {trend && (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border", trendColor)}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <h2 className="mt-1 text-2xl font-bold text-neutral-900">{value}</h2>
        {subValue && <p className="mt-1 text-xs text-neutral-400">{subValue}</p>}
      </div>
    </div>
  );
}

function Brain(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2a.5.5 0 0 1 .5.5v.35c0 .713.186 1.413.54 2.035L11.285 6.5a.5.5 0 0 1-.43.75H9.5a.5.5 0 0 1-.5-.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v.5a.5.5 0 0 1-.5.5h-1.355a.5.5 0 0 1-.43-.75l.745-1.115A4.001 4.001 0 0 1 7 2.5V2.5a.5.5 0 0 1 .5-.5h2z" />
      <path d="M14.5 2a.5.5 0 0 0-.5.5v.35c0 .713-.186 1.413-.54 2.035L12.715 6.5a.5.5 0 0 0 .43.75H14.5a.5.5 0 0 0 .5-.5V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.5a.5.5 0 0 0 .5.5h1.355a.5.5 0 0 0 .43-.75l-.745-1.115A4.001 4.001 0 0 0 17 2.5V2.5a.5.5 0 0 0-.5-.5h-2z" />
      <path d="M12 7v15" />
      <path d="M5 16a7 7 0 0 0 14 0" />
      <path d="M2 10.5a15.4 15.4 0 0 1 20 0" />
    </svg>
  );
}
