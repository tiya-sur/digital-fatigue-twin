import { motion } from "motion/react";
import { ArrowRight, Brain, Shield, Zap, Activity } from "lucide-react";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-indigo-50/50 blur-3xl" />
        <div className="absolute top-[20%] right-[5%] h-[400px] w-[400px] rounded-full bg-blue-50/50 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Brain size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">FatigueTwin</span>
        </div>
        <button
          onClick={onStart}
          className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800 transition-all"
        >
          Open Dashboard
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl">
              Your Mental Fatigue, <span className="text-indigo-600">Visualized.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              A privacy-first digital twin that monitors your interaction patterns to detect mental fatigue in real-time. Optimize your productivity without compromising your data.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={onStart}
                className="group flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-500 transition-all"
              >
                Start Monitoring
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#features" className="text-sm font-semibold leading-6 text-neutral-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-neutral-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 uppercase tracking-widest">Advanced Monitoring</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need to master your focus
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: "Real-time Detection",
                  description: "Detect mental fatigue in under 10ms using edge-based inference models.",
                  icon: Zap,
                },
                {
                  name: "Privacy First",
                  description: "No keystrokes or content recorded. We only analyze timing and interaction patterns.",
                  icon: Shield,
                },
                {
                  name: "Personalized Insights",
                  description: "Baseline models adapted to your unique behavior for maximum accuracy.",
                  icon: Activity,
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900">
                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
