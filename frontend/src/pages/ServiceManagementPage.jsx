import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Server, Edit2 } from 'lucide-react';

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
      <header className="screen-heading">
        <div>
          <h1>Campus Services Directory</h1>
          <p>Manage service details, priority weights (1.00–2.00×), and system dependencies.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="primary-action"
        >
          <Plus className="w-4 h-4" />
          Add Campus Service
        </button>
      </header>

      <section className="work-section" aria-labelledby="service-list-title">
      <div className="screen-heading"><div><h2 id="service-list-title" className="work-section__title">Service catalog</h2><p>Service health and dependencies inform incident priority and SLA handling.</p></div></div>
      <div className="work-panel p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="work-table border-collapse">
            <thead>
              <tr className="bg-inset text-muted text-xs font-semibold  tracking-normal border-b border-rule">
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Priority Weight</th>
                <th className="py-3.5 px-4">Base SLA</th>
                <th className="py-3.5 px-4">Target Resolution</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Dependencies</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule text-sm">
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-muted">Loading service catalog…</td></tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-muted">
                    No campus services registered yet.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <tr key={s.id} className="hover:bg-inset ">
                    <td className="py-3.5 px-4 font-semibold text-ink"><span className="inline-flex items-center gap-2"><Server className="w-4 h-4 text-muted" />{s.name}</span></td>
                    <td className="py-3.5 px-4 font-mono text-xs text-secondary">{s.code}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-ink">{Number(s.criticalityFactor).toFixed(2)}x</span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary">+{s.baseSlaWeight}</td>
                    <td className="py-3.5 px-4 text-secondary">{s.baselineMttrMinutes}m</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`status-chip ${s.status === 'OPERATIONAL' ? 'status-chip--success' : s.status === 'DEGRADED' ? 'status-chip--person' : 'status-chip--danger'}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {s.dependencyNames?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Array.from(s.dependencyNames).map((d) => (
                            <span key={d} className="bg-inset px-2 py-0.5 rounded text-xs font-medium text-secondary">
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 hover:bg-inset text-secondary hover:text-ink rounded-control "
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
      </section>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="work-panel max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-ink mb-4">
              {editingId ? 'Edit Campus Service' : 'Add New Campus Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Campus Wi-Fi & VPN"
                  className="w-full text-sm border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Service Code (Unique)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SRV-WIFI"
                  className="w-full text-sm font-mono border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden "
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
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
                    className="w-full text-sm border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Base SLA Weight (0 - 4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    required
                    value={formData.baseSlaWeight}
                    onChange={(e) => setFormData({ ...formData, baseSlaWeight: e.target.value })}
                    className="w-full text-sm border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="DEGRADED">DEGRADED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OUTAGE">OUTAGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Baseline MTTR (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.baselineMttrMinutes}
                    onChange={(e) => setFormData({ ...formData, baselineMttrMinutes: e.target.value })}
                    className="w-full text-sm border border-rule-strong rounded-control px-3 py-2 focus:ring-2 focus:ring-focus outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Upstream Dependencies (Select services this depends on)
                </label>
                <div className="border border-rule rounded-control p-2 max-h-32 overflow-y-auto space-y-1">
                  {services
                    .filter((s) => s.id !== editingId)
                    .map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-secondary hover:bg-inset p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.dependencyIds.includes(s.id)}
                          onChange={() => toggleDependency(s.id)}
                          className="rounded text-instrument focus:ring-focus"
                        />
                        <span>{s.name} ({s.code})</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="secondary-action"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-action"
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
