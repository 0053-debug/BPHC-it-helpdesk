import React, { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Shield,
  Bell,
  Cpu,
  Download,
  Home
} from 'lucide-react';
import LandingPage from './pages/LandingPage';
import ItManagerDashboardPage from './pages/ItManagerDashboardPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationBell from './components/NotificationBell';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // Starts on the product introduction / download landing page

  if (activeTab === 'landing') {
    return <LandingPage onLaunchApp={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('landing')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md hover:opacity-90 transition"
              title="Return to Product Home & Downloads"
            >
              <Cpu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">BPHC I-ITSM</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wide">
                  PERSON 4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Service Desk, Notifications & Operational Analytics</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Downloads</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Service Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'audit'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Trail</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Real-Time WebSocket Notification Bell */}
            <NotificationBell userId={1} />
          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <ItManagerDashboardPage />}
        {activeTab === 'services' && <ServiceManagementPage />}
        {activeTab === 'audit' && <AuditLogsPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        BPHC CS F213 / MAC F212 OOP Project (2026–2027) &bull; Intelligent IT Service Management System
      </footer>
    </div>
  );
}
