import { Link } from 'react-router-dom';
import { Warehouse, ArrowRight, Split, AlertTriangle, BarChart3, Activity, CheckCircle2, Truck, Package, Boxes, Zap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold font-display text-ink-900">WAREFLOW</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-sm font-medium text-primary-700 mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            The Decision Engine Warehouse Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-ink-900 max-w-4xl mx-auto leading-tight text-balance animate-fade-in-up">
            Your warehouse doesn't just need data.
            <br />
            <span className="text-primary-600">It needs decisions.</span>
          </h1>
          <p className="mt-6 text-lg text-ink-500 max-w-2xl mx-auto text-balance animate-fade-in-up">
            WAREFLOW is a control tower that manages the complete order fulfillment lifecycle —
            and an intelligent Decision Engine that detects problems, explains why, recommends
            the best action, and lets you execute or override with one click.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-sm"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white border border-ink-300 hover:bg-ink-50 text-ink-700 font-medium rounded-lg px-6 py-3 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-white border-y border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink-900">
              Detect. Explain. Recommend. Act. Measure.
            </h2>
            <p className="mt-3 text-ink-500 max-w-2xl mx-auto">
              For every important warehouse problem, WAREFLOW doesn't just show an alert —
              it shows what happened, why, what to do, and what happens if you do it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { icon: AlertTriangle, label: 'Detect', desc: 'What happened?', tone: 'text-error-600 bg-error-50' },
              { icon: Activity, label: 'Explain', desc: 'Why is it happening?', tone: 'text-warning-600 bg-warning-50' },
              { icon: Split, label: 'Recommend', desc: 'What should you do?', tone: 'text-primary-600 bg-primary-50' },
              { icon: CheckCircle2, label: 'Act', desc: 'Execute or override', tone: 'text-success-600 bg-success-50' },
              { icon: BarChart3, label: 'Measure', desc: 'What changed?', tone: 'text-info-600 bg-info-50' },
            ].map((step, i) => (
              <div key={step.label} className="relative text-center">
                <div className={`mx-auto h-14 w-14 rounded-2xl ${step.tone} flex items-center justify-center mb-3`}>
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-semibold text-ink-400 mb-1">Step {i + 1}</div>
                <h3 className="text-base font-semibold text-ink-900">{step.label}</h3>
                <p className="text-sm text-ink-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink-900 text-center mb-12">
            Everything your warehouse needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Command Center', desc: 'Real-time warehouse health, orders at risk, pending allocations, and recommended actions in one view.' },
              { icon: Package, title: 'Order Management', desc: 'Create, prioritize, and track orders through the complete fulfillment lifecycle with SLA monitoring.' },
              { icon: Boxes, title: 'Inventory Management', desc: 'SKU-level stock tracking with safety stock, reorder points, low-stock detection, and movement history.' },
              { icon: Split, title: 'Decision Engine', desc: 'Detects allocation conflicts, compares competing orders by priority, and recommends the optimal allocation strategy.' },
              { icon: AlertTriangle, title: 'Exception Management', desc: 'Every exception follows a Decision → Resolution workflow with AI-recommended actions and operator override.' },
              { icon: Truck, title: 'Dispatch Management', desc: 'Carrier cutoff monitoring, dispatch risk alerts, and ready-to-ship tracking across all carriers.' },
              { icon: Activity, title: 'Bottleneck Detection', desc: 'Analyzes zone performance, identifies bottlenecks, and recommends resource reallocation with expected impact.' },
              { icon: Zap, title: 'Decision Simulator', desc: 'Create hypothetical scenarios and run the Decision Engine to see recommendations before acting.' },
              { icon: CheckCircle2, title: 'Audit Trail', desc: 'Every operational decision is tracked — what happened, what was recommended, who decided, and the outcome.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-ink-200 shadow-card p-6 hover:shadow-card-hover transition-shadow">
                <div className="h-11 w-11 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-ink-900 mb-2">{f.title}</h3>
                <p className="text-sm text-ink-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Ready to take control?
          </h2>
          <p className="mt-4 text-ink-400">
            Start managing your warehouse operations with intelligent decision-making today.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-8 py-3.5 transition-colors shadow-elevated"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-ink-950 text-ink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <Warehouse className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-ink-400">WAREFLOW</span>
          </div>
          <p className="text-xs">Smart Warehouse Operations & Decision Platform</p>
        </div>
      </footer>
    </div>
  );
}
