import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowRight, Server, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ServiceDependencyGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/dependency-graph');
      setGraphData(res.data);
      if (res.data.nodes?.length > 0) {
        setSelectedNode(res.data.nodes[0]);
      }
    } catch (e) {
      console.warn('Could not fetch dependency graph:', e.message);
      // Fallback mock graph for demonstration
      setGraphData({
        nodes: [
          { id: 1, name: 'Central Auth (SSO)', code: 'SRV-AUTH', status: 'OPERATIONAL', criticality: 2.0 },
          { id: 2, name: 'Corporate Network/VPN', code: 'SRV-NET', status: 'OPERATIONAL', criticality: 1.75 },
          { id: 3, name: 'Database Cluster', code: 'SRV-DB', status: 'OPERATIONAL', criticality: 2.0 },
          { id: 4, name: 'Enterprise ERP', code: 'SRV-ERP', status: 'DEGRADED', criticality: 1.5 },
          { id: 5, name: 'Cloud Storage', code: 'SRV-STORE', status: 'OPERATIONAL', criticality: 1.25 },
        ],
        edges: [
          { source: 4, target: 3 }, // ERP -> DB
          { source: 4, target: 1 }, // ERP -> Auth
          { source: 1, target: 2 }, // Auth -> Network
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'text-success bg-success-soft border-success-soft';
      case 'DEGRADED':
        return 'text-person bg-person-soft border-person-soft';
      case 'OUTAGE':
        return 'text-danger bg-danger-soft border-danger-soft';
      default:
        return 'text-secondary bg-inset border-rule-strong';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return <CheckCircle className="w-3.5 h-3.5 text-success" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-3.5 h-3.5 text-person" />;
      case 'OUTAGE':
        return <ShieldAlert className="w-3.5 h-3.5 text-danger" />;
      default:
        return <Server className="w-3.5 h-3.5 text-muted" />;
    }
  };

  return (
    <section className="work-panel service-graph" aria-labelledby="service-map-title">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rule gap-2">
        <div>
          <h2 id="service-map-title" className="text-base font-bold text-ink flex items-center gap-2">
            <Server className="w-5 h-5 text-instrument" />
            Service Dependency & Outage Impact Map
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Visual map of campus service dependencies and downstream outage impact.
          </p>
        </div>
        <button
          onClick={fetchGraph}
          className="secondary-action"
        >
          Refresh Graph
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-semibold text-secondary  tracking-normal">
            Campus Services & System Dependencies
          </div>
          {loading ? <p role="status" className="text-sm text-muted">Loading service relationships…</p> : graphData.nodes.length === 0 ? <p className="work-panel p-4 text-sm text-muted">No service relationships are available.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {graphData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const outgoingDeps = graphData.edges.filter((e) => e.source === node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedNode(node); } }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={`service-node p-3.5 rounded-control border ${
                    isSelected
                      ? 'border-instrument ring-2 ring-focus bg-instrument-soft'
                      : 'border-rule hover:border-rule-strong bg-panel'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-ink">{node.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-chip border flex items-center gap-1 ${getStatusColor(node.status)}`}>
                      {getStatusIcon(node.status)}
                      {node.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>Code: {node.code}</span>
                    <span>Criticality: <strong className="text-secondary">{Number(node.criticality).toFixed(2)}x</strong></span>
                  </div>
                  {outgoingDeps.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-rule flex items-center gap-1.5 text-xs text-secondary">
                      <span className="text-muted">Depends on:</span>
                      {outgoingDeps.map((dep) => {
                        const target = graphData.nodes.find((n) => n.id === dep.target);
                        return (
                          <span key={dep.target} className="bg-inset px-1.5 py-0.5 rounded text-xs font-mono font-medium">
                            {target ? target.code : dep.target}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>}
        </div>

        {/* Selected Node Details & Blast Radius Inspector */}
        <div className="bg-inset border border-rule rounded-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-secondary  tracking-normal mb-2">
              Service Details & Impact Inspector
            </div>
            {selectedNode ? (
              <div className="space-y-3">
                <div className="bg-panel p-3 rounded-control border border-rule">
                  <div className="text-xs text-muted">Selected Service</div>
                  <div className="font-bold text-ink text-sm">{selectedNode.name}</div>
                  <div className="text-xs text-muted mt-1">Status: {selectedNode.status}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-secondary mb-1">Required Services (Upstream):</div>
                  {graphData.edges.filter((e) => e.source === selectedNode.id).length === 0 ? (
                    <div className="text-xs text-muted italic">No upstream dependencies. Autonomous service.</div>
                  ) : (
                    <ul className="space-y-1">
                      {graphData.edges
                        .filter((e) => e.source === selectedNode.id)
                        .map((e) => {
                          const target = graphData.nodes.find((n) => n.id === e.target);
                          return (
                            <li key={e.target} className="text-xs flex items-center gap-1.5 text-secondary bg-panel p-1.5 rounded border border-rule">
                              <ArrowRight className="w-3 h-3 text-instrument" />
                              <span>{target?.name} ({target?.code})</span>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="text-xs font-semibold text-secondary mb-1">Affected Services if Outage Occurs (Downstream):</div>
                  {graphData.edges.filter((e) => e.target === selectedNode.id).length === 0 ? (
                    <div className="text-xs text-muted italic">No other services depend on this.</div>
                  ) : (
                    <ul className="space-y-1">
                      {graphData.edges
                        .filter((e) => e.target === selectedNode.id)
                        .map((e) => {
                          const src = graphData.nodes.find((n) => n.id === e.source);
                          return (
                            <li key={e.source} className="text-xs flex items-center gap-1.5 text-person bg-person-soft p-1.5 rounded border border-person-soft">
                              <ShieldAlert className="w-3 h-3 text-person" />
                              <span>{src?.name} will be affected</span>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted">Select a service above to inspect its dependencies.</div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-rule text-xs text-muted">
            Directed Acyclic Graph (DAG) with cycle-detection prevents circular dependencies.
          </div>
        </div>
      </div>
    </section>
  );
}
