import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import ServiceDependencyGraph from '../components/ServiceDependencyGraph';

const COLORS = ['var(--color-cool)', 'var(--color-success)', 'var(--color-accent)', 'var(--color-error)', 'var(--color-muted)'];

export default function ItManagerDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [serviceHealth, setServiceHealth] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ovRes, techRes, srvRes, bnRes] = await Promise.allSettled([
        api.get('/reports/overview'),
        api.get('/reports/technician-workload'),
        api.get('/reports/service-health'),
        api.get('/reports/bottlenecks'),
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data);
      if (techRes.status === 'fulfilled') setTechnicians(techRes.value.data);
      if (srvRes.status === 'fulfilled') setServiceHealth(srvRes.value.data);
      if (bnRes.status === 'fulfilled') setBottlenecks(bnRes.value.data);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30s as backup to WebSockets
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="screen-heading">
        <div>
          <h1>Helpdesk Operations Dashboard</h1>
          <p>Monitor ticket volumes, team workloads, service health, and resolution performance.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="secondary-action"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </header>

      {/* Operational Attention Banner */}
      {bottlenecks.length > 0 && (
        <div className="space-y-3">
          {bottlenecks.map((bn) => (
            <div
              key={bn.id}
              className={`p-4 rounded-card border flex items-start gap-3  ${
                bn.severity === 'CRITICAL'
                  ? 'bg-danger-soft border-danger-soft text-danger'
                  : 'bg-person-soft border-person-soft text-person'
              }`}
            >
              <div className="p-2 rounded-control bg-panel ">
                {bn.severity === 'CRITICAL' ? (
                  <AlertOctagon className="w-5 h-5 text-danger" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-person" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{bn.title}</h3>
                  <span className="text-xs font-semibold  tracking-normal px-2 py-0.5 rounded-chip bg-panel border border-current">
                    {bn.type}
                  </span>
                </div>
                <p className="text-xs mt-1 text-secondary">{bn.description}</p>
                <div className="mt-2 text-xs flex flex-wrap gap-4 font-medium">
                  <span><strong>Metric:</strong> {bn.metricLabel} ({bn.metricValue})</span>
                  <span><strong>Limit:</strong> {bn.thresholdLabel}</span>
                  <span className="text-instrument"><strong>Suggested Action:</strong> {bn.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      <section className="work-section" aria-labelledby="operations-metrics-title">
      <h2 id="operations-metrics-title" className="work-section__title">At a glance</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">Total Tickets</span>
            <Layers className="w-4 h-4 text-instrument" />
          </div>
          <div className="text-2xl font-bold text-ink measured">{overview?.totalIncidents ?? 0}</div>
          <div className="text-xs text-muted mt-1">All time recorded</div>
        </div>

        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">Active Tickets</span>
            <Activity className="w-4 h-4 text-person" />
          </div>
          <div className="text-2xl font-bold text-person measured">{overview?.openIncidents ?? 0}</div>
          <div className="text-xs text-muted mt-1">Currently open</div>
        </div>

        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">Critical (P1)</span>
            <AlertOctagon className="w-4 h-4 text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger measured">{overview?.criticalIncidents ?? 0}</div>
          <div className="text-xs text-muted mt-1">30-minute target</div>
        </div>

        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success measured">{overview?.resolvedIncidents ?? 0}</div>
          <div className="text-xs text-muted mt-1">Completed tickets</div>
        </div>

        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">SLA Compliance</span>
            <TrendingUp className="w-4 h-4 text-instrument" />
          </div>
          <div className="text-2xl font-bold text-ink measured">{overview?.slaCompliancePercentage ?? 100}%</div>
          <div className="text-xs text-muted mt-1">{overview?.slaBreaches ?? 0} late tickets</div>
        </div>

        <div className="bg-panel p-4 rounded-card border border-rule ">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-medium">Avg Resolution</span>
            <Clock className="w-4 h-4 text-instrument" />
          </div>
          <div className="text-2xl font-bold text-instrument measured">{overview?.averageMttrMinutes ?? 0}m</div>
          <div className="text-xs text-muted mt-1">Average fix time</div>
        </div>
      </div>
      </section>

      {/* Visual Charts Grid */}
      <section className="work-section" aria-labelledby="operations-analysis-title">
      <h2 id="operations-analysis-title" className="work-section__title">Capacity and service health</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Workload Capacity Chart */}
        <div className="bg-panel p-6 rounded-card border border-rule ">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-instrument" />
                Technician Workload vs Capacity
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Active tickets assigned compared to the 5-ticket concurrent capacity limit.
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technicians} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'activeTickets' ? `${value} tickets` : `${value} max limit`,
                    name === 'activeTickets' ? 'Active' : 'Max Limit'
                  ]}
                />
                <Bar dataKey="activeTickets" fill="var(--color-cool)" name="Active Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxWorkload" fill="var(--color-rule-2)" name="Max Capacity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Incident Distribution Donut */}
        <div className="bg-panel p-6 rounded-card border border-rule ">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Layers className="w-5 h-5 text-success" />
                Ticket Distribution by Service
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Breakdown of reported issues across campus digital services.
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceHealth}
                  dataKey="totalIncidentsCount"
                  nameKey="serviceName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {serviceHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </section>

      {/* Service Dependency Graph Component */}
      <section className="work-section" aria-label="Service dependency map"><ServiceDependencyGraph /></section>
    </div>
  );
}
