import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Server, Edit2, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ServiceManagementPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    criticalityFactor: '1.50',
    baseSlaWeight: 2,
    status: 'OPERATIONAL',
    baselineMttrMinutes: 60,
    dependencyIds: [],
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        criticalityFactor: parseFloat(formData.criticalityFactor),
        baseSlaWeight: parseInt(formData.baseSlaWeight),
        baselineMttrMinutes: parseInt(formData.baselineMttrMinutes),
      };

      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
      } else {
        await api.post('/services', payload);
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (err) {
      alert('Error saving service: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      code: s.code,
      description: s.description || '',
      criticalityFactor: s.criticalityFactor.toString(),
      baseSlaWeight: s.baseSlaWeight,
      status: s.status,
      baselineMttrMinutes: s.baselineMttrMinutes || 60,
      dependencyIds: Array.from(s.dependencyIds || []),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      criticalityFactor: '1.50',
      baseSlaWeight: 2,
      status: 'OPERATIONAL',
      baselineMttrMinutes: 60,
      dependencyIds: [],
    });
  };

  const toggleDependency = (id) => {
    setFormData((prev) => {
      const exists = prev.dependencyIds.includes(id);
      return {
        ...prev,
        dependencyIds: exists
          ? prev.dependencyIds.filter((item) => item !== id)
          : [...prev.dependencyIds, id],
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Service Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure registered enterprise services, criticality factors (1.00 - 2.00x), and upstream dependencies.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Register New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Criticality</th>
                <th className="py-3.5 px-4">Base Weight</th>
                <th className="py-3.5 px-4">Baseline MTTR</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Upstream Dependencies</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No services registered.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-400" />
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{s.code}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{Number(s.criticalityFactor).toFixed(2)}x</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">+{s.baseSlaWeight}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.baselineMttrMinutes}m</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          s.status === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : s.status === 'DEGRADED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {s.dependencyNames?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(s.dependencyNames).map((d) => (
                            <span key={d} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit IT Service' : 'Register New IT Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Campus Wi-Fi & VPN"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Code (Unique)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SRV-WIFI"
                  className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Criticality Factor (1.00 - 2.00x)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.00"
                    max="2.00"
                    required
                    value={formData.criticalityFactor}
                    onChange={(e) => setFormData({ ...formData, criticalityFactor: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base SLA Weight (0 - 4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    required
                    value={formData.baseSlaWeight}
                    onChange={(e) => setFormData({ ...formData, baseSlaWeight: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUTAGE">OUTAGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Baseline MTTR (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.baselineMttrMinutes}
                    onChange={(e) => setFormData({ ...formData, baselineMttrMinutes: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upstream Dependencies (Select services this depends on)
                </label>
                <div className="border border-slate-200 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                  {services
                    .filter((s) => s.id !== editingId)
                    .map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dependencyIds.includes(s.id)}
                          onChange={() => toggleDependency(s.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{s.name} ({s.code})</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
