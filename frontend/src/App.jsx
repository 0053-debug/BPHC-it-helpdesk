import React, { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Shield,
  Bell,
  Cpu,
  Download,
  Home,
  Users,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';
import LandingPage from './pages/LandingPage';
import ItManagerDashboardPage from './pages/ItManagerDashboardPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationBell from './components/NotificationBell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TechnicianDirectoryPage from './pages/TechnicianDirectoryPage';

function readStoredUser() {
  const storedUser = localStorage.getItem('iitsm_user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('iitsm_user');
    localStorage.removeItem('iitsm_token');
    return null;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // Starts on the product introduction / download landing page
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const isManager = currentUser && ['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(currentUser.role);
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';

  const handleAuthenticated = (response) => {
    localStorage.setItem('iitsm_token', response.accessToken);
    localStorage.setItem('iitsm_user', JSON.stringify(response.user));
    setCurrentUser(response.user);
    setActiveTab('technicians');
  };

  const logout = () => {
    localStorage.removeItem('iitsm_token');
    localStorage.removeItem('iitsm_user');
    setCurrentUser(null);
    setActiveTab('landing');
  };

  if (activeTab === 'landing') {
    return (
      <LandingPage
        onLaunchApp={() => setActiveTab(currentUser ? (isManager ? 'dashboard' : 'technicians') : 'login')}
        onLogin={() => setActiveTab('login')}
        onRegister={() => setActiveTab('register')}
      />
    );
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

            {currentUser && (
              <button
                onClick={() => setActiveTab('technicians')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'technicians'
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Technicians</span>
              </button>
            )}

            {isManager && (
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
            )}

            {isAdmin && (
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
            )}

            {isManager && (
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
            )}

            {currentUser ? (
              <>
                <span className="hidden xl:inline text-xs text-slate-500">{currentUser.fullName}</span>
                <button onClick={logout} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full" title="Sign out">
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <NotificationBell userId={currentUser.id} />
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('login')} className="flex items-center gap-1 px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                  <LogIn className="w-4 h-4" /> Sign in
                </button>
                <button onClick={() => setActiveTab('register')} className="flex items-center gap-1 px-2 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg">
                  <UserPlus className="w-4 h-4" /> Register
                </button>
              </>
            )}

          </nav>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'login' && (
          <LoginPage
            onAuthenticated={handleAuthenticated}
            onRegister={() => setActiveTab('register')}
            onHome={() => setActiveTab('landing')}
          />
        )}
        {activeTab === 'register' && (
          <RegisterPage
            onAuthenticated={handleAuthenticated}
            onLogin={() => setActiveTab('login')}
            onHome={() => setActiveTab('landing')}
          />
        )}
        {activeTab === 'technicians' && currentUser && <TechnicianDirectoryPage currentUser={currentUser} />}
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
