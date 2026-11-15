import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  Apple,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  const [downloadStarted, setDownloadStarted] = useState(null);

  const triggerMockDownload = (platform, filename) => {
    setDownloadStarted(platform);
    // Create simulated file download
    const element = document.createElement('a');
    const file = new Blob([
      `BPHC I-ITSM Installer package for ${platform}.\nVersion: 1.0.0-PROD\nBuild: 2026.11.08\nIntegrations: Real-Time STOMP WebSockets, Google FCM Push, PostgreSQL.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => setDownloadStarted(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Glass Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">BPHC I-ITSM</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                v1.0 Cloud-Native
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#downloads" className="text-xs font-semibold text-slate-300 hover:text-white transition hidden md:block">
              Downloads
            </a>
            <a href="#features" className="text-xs font-semibold text-slate-300 hover:text-white transition hidden md:block">
              Architecture & Features
            </a>
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <span>Launch Web Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Enterprise IT Service Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Intelligent Incident Resolution. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              Zero Downtime. Multi-Platform.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A high-performance ITIL platform engineered for campus and enterprise IT infrastructure.
            Features real-time STOMP WebSockets, automated SLA breach mitigation, dependency blast-radius analysis, and native cross-platform client apps.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#downloads"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-600/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Get Download Packages</span>
            </a>
            <button
              onClick={onLaunchApp}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Open Cloud Dashboard</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xs border border-slate-700/60 p-4 rounded-2xl">
              <div className="text-2xl font-black text-white">&lt; 50ms</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">WebSocket Live Broadcast</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xs border border-slate-700/60 p-4 rounded-2xl">
              <div className="text-2xl font-black text-cyan-400">P1 to P4</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Algorithmic Priority Matrix</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xs border border-slate-700/60 p-4 rounded-2xl">
              <div className="text-2xl font-black text-emerald-400">100% Immutable</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">PostgreSQL Trigger Audit</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xs border border-slate-700/60 p-4 rounded-2xl">
              <div className="text-2xl font-black text-indigo-400">Cross-Platform</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Windows, Android, PWA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Hub Section */}
      <section id="downloads" className="py-20 bg-slate-950 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Download Native Client Packages
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Install the dedicated native applications for instant desktop notifications and hardware push integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Android Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/60 transition group hover:shadow-2xl hover:shadow-blue-900/20">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Android Client</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Play Store / APK
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Dedicated Android package with Google Firebase Cloud Messaging (FCM) hardware push alerts.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Android 9.0+ (ARM64 & x86)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Background FCM Sync</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => triggerMockDownload('Android', 'bphc-iitsm-client-v1.0.apk')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadStarted === 'Android' ? 'Downloading APK...' : 'Download Android .APK'}</span>
                </button>
              </div>
            </div>

            {/* Windows Desktop Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/60 transition group hover:shadow-2xl hover:shadow-blue-900/20">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition">
                  <Monitor className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Windows Desktop</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    MS Store / MSIX
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Native Windows desktop executable with native taskbar badges, toast notifications, and multi-monitor layouts.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Windows 10 / 11 (64-bit)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Native Action Center Toasts</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => triggerMockDownload('Windows', 'bphc-iitsm-desktop-setup.msix')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadStarted === 'Windows' ? 'Downloading MSIX...' : 'Download Windows .MSIX'}</span>
                </button>
              </div>
            </div>

            {/* Web PWA Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/60 transition group hover:shadow-2xl hover:shadow-blue-900/20">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Cloud Web PWA</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                    Direct Browser
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Progressive Web Application installable directly through Chrome, Edge, or Firefox without store intermediaries.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Installable via Address Bar (+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Full Offline Service Worker</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Web Console</span>
                </button>
              </div>
            </div>

            {/* iOS Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/60 transition group hover:shadow-2xl hover:shadow-blue-900/20">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                  <Apple className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Apple iOS</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    App Store
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Optimized for Safari PWA Add to Home Screen or Xcode native iOS packaging.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>iOS 15.0+ Compatible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Full-Screen Standalone Mode</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open via Mobile Safari</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section id="features" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Enterprise Engineering Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Built in accordance with strict Object-Oriented Design principles and ISO/IEC 25010 software quality metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Observer Pattern Event Bus</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Decoupled GoF Subject/Observer pattern emitting synchronous audit records while broadcasting asynchronous STOMP WebSocket and SMTP email alerts.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Service Dependency Graph</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full DAG dependency model mapping upstream infrastructure (SSO, Network, DB) and determining downstream blast radius during outages with cycle detection.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Immutable Audit Guarantees</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Enforced by a PostgreSQL database-level trigger blocking all UPDATE and DELETE queries. Certified write-only audit trail for compliance auditing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>BPHC CS F213 / MAC F212 OOP Project (Semester-I, 2026–2027) &bull; Intelligent IT Service Management System</p>
        <p className="mt-1 text-slate-600">Designed for Firebase Cloud Hosting & Cloud-Native Deployment</p>
      </footer>
    </div>
  );
}
