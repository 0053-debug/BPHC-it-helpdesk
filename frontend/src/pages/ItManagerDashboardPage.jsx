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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ITSM Executive & Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operational visibility, SLA monitoring, workload capacity, and intelligent bottleneck detection.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Intelligent Bottleneck Warnings Banner */}
      {bottlenecks.length > 0 && (
        <div className="space-y-3">
          {bottlenecks.map((bn) => (
            <div
              key={bn.id}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                bn.severity === 'CRITICAL'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="p-2 rounded-lg bg-white/70 shadow-xs">
                {bn.severity === 'CRITICAL' ? (
                  <AlertOctagon className="w-5 h-5 text-red-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">{bn.title}</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    {bn.type}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-700">{bn.description}</p>
                <div className="mt-2 text-xs flex flex-wrap gap-4 font-medium">
                  <span><strong>Metric:</strong> {bn.metricLabel} ({bn.metricValue})</span>
                  <span><strong>Threshold:</strong> {bn.thresholdLabel}</span>
                  <span className="text-blue-700"><strong>Recommendation:</strong> {bn.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Tickets</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{overview?.totalIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">All time recorded</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Load</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{overview?.openIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">In triage / progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">P1 Critical</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">{overview?.criticalIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">30m SLA window</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{overview?.resolvedIncidents ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Successfully closed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">SLA Compliance</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{overview?.slaCompliancePercentage ?? 100}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{overview?.slaBreaches ?? 0} breaches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Avg MTTR</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{overview?.averageMttrMinutes ?? 0}m</div>
          <div className="text-[11px] text-slate-400 mt-1">Mean resolution time</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Workload Capacity Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Technician Workload vs Max Capacity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active tickets allocated vs. maximum concurrent workload limit (Cap: 5).
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
                    name === 'activeTickets' ? `${value} tickets` : `${value} max cap`,
                    name === 'activeTickets' ? 'Active' : 'Max Limit'
                  ]}
                />
                <Bar dataKey="activeTickets" fill="#3b82f6" name="Active Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxWorkload" fill="#e2e8f0" name="Max Capacity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Health Incident Distribution Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Service Health & Outage Density
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Incident density and outage distribution across registered digital services.
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

      {/* Service Dependency Graph Component */}
      <ServiceDependencyGraph />
    </div>
  );
}
