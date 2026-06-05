import { useState, useEffect } from "react";
import { Shield, Bell, Database, User, Save } from "lucide-react";

export function Settings() {
  const [baseline, setBaseline] = useState({
    key_latency: 100,
    click_latency: 250,
    pause: 1.5
  });
  const [thingspeak, setThingspeak] = useState({
    channelId: "3256608",
    readApiKey: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      if (data.baseline) setBaseline(data.baseline);
      if (data.thingspeak) {
        setThingspeak(prev => ({ ...prev, channelId: data.thingspeak.channelId }));
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/settings/baseline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseline)
        }),
        fetch("/api/settings/thingspeak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(thingspeak)
        })
      ]);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-neutral-500">Manage your baseline models and privacy preferences.</p>
      </header>

      <div className="space-y-6">
        {/* Baseline Configuration */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Baseline Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Key Latency (ms)</label>
              <input 
                type="number" 
                value={baseline.key_latency}
                onChange={(e) => setBaseline({ ...baseline, key_latency: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Click Interval (ms)</label>
              <input 
                type="number" 
                value={baseline.click_latency}
                onChange={(e) => setBaseline({ ...baseline, click_latency: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Pause Time (s)</label>
              <input 
                type="number" 
                step="0.1"
                value={baseline.pause}
                onChange={(e) => setBaseline({ ...baseline, pause: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-400">These values represent your "normal" state and are used to calculate the fatigue score relative to current activity.</p>
        </section>

        {/* ThingSpeak Configuration */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">ThingSpeak Integration</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Channel ID</label>
              <input 
                type="text" 
                value={thingspeak.channelId}
                onChange={(e) => setThingspeak({ ...thingspeak, channelId: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Read API Key (Optional)</label>
              <input 
                type="password" 
                placeholder="Enter key if channel is private"
                value={thingspeak.readApiKey}
                onChange={(e) => setThingspeak({ ...thingspeak, readApiKey: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-neutral-400">Your data is fetched from this channel. If the channel is private, you must provide a Read API Key.</p>
        </section>

        {/* Privacy Settings */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Privacy & Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Edge Processing Only</p>
                <p className="text-sm text-neutral-500">Ensure all raw interaction data stays on your local machine.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-indigo-600 p-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Anonymize Cloud Sync</p>
                <p className="text-sm text-neutral-500">Strip all metadata before syncing with ThingSpeak.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-indigo-600 p-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 disabled:opacity-50 transition-all"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
