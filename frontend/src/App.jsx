import React, { useState } from 'react';
import {
  LayoutDashboard,
  Server,
  Shield,
  Cpu,
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
import IncidentWorkspacePage from './pages/IncidentWorkspacePage';

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

function getInitialTab(storedUser) {
  const urlParams = new URLSearchParams(window.location.search);
  const isConsole = urlParams.get('app') === 'console' || window.location.pathname === '/console';
  if (!isConsole) return 'landing';

  const requestedTab = urlParams.get('tab');
  if (requestedTab === 'register') return 'register';
  if (requestedTab === 'login') return 'login';

  if (!storedUser) return 'login';
  if (storedUser.role === 'ROLE_EMPLOYEE') return 'incidents';
  if (['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(storedUser.role)) return 'dashboard';
  return 'technicians';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const [activeTab, setActiveTab] = useState(() => getInitialTab(readStoredUser()));

  const urlParams = new URLSearchParams(window.location.search);
  const isConsoleMode = urlParams.get('app') === 'console' || window.location.pathname === '/console';

  const isManager = currentUser && ['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(currentUser.role);
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';
  const isEmployee = currentUser?.role === 'ROLE_EMPLOYEE';

  const handleAuthenticated = (response) => {
    localStorage.setItem('iitsm_token', response.accessToken);
    localStorage.setItem('iitsm_user', JSON.stringify(response.user));
    setCurrentUser(response.user);
    setActiveTab(response.user.role === 'ROLE_EMPLOYEE' ? 'incidents' : 'technicians');
  };

  const logout = () => {
    localStorage.removeItem('iitsm_token');
    localStorage.removeItem('iitsm_user');
    setCurrentUser(null);
    setActiveTab('login');
  };

  // If in landing mode and not in console workspace, render the landing page
  if (!isConsoleMode && activeTab === 'landing') {
    return <LandingPage />;
  }

  // Web Console Workspace (Isolated from landing page, no option to return to landing)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">BPHC I-ITSM</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wide">
                  Console
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Service Desk, Notifications & Operational Analytics</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {currentUser && (
              <button
                onClick={() => setActiveTab('incidents')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'incidents' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >{isEmployee ? 'My incidents' : 'Incidents'}</button>
            )}

            {currentUser && !isEmployee && (
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
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'login' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-50'}`}
                >
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
          />
        )}
        {activeTab === 'register' && (
          <RegisterPage
            onAuthenticated={handleAuthenticated}
            onLogin={() => setActiveTab('login')}
          />
        )}
        {activeTab === 'technicians' && currentUser && <TechnicianDirectoryPage currentUser={currentUser} />}
        {activeTab === 'incidents' && currentUser && <IncidentWorkspacePage currentUser={currentUser} />}
        {activeTab === 'dashboard' && <ItManagerDashboardPage />}
        {activeTab === 'services' && <ServiceManagementPage />}
        {activeTab === 'audit' && <AuditLogsPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        BPHC CS F213 OOP Project (2026–2027) &bull; Intelligent IT Service Management System &bull; Web Console
      </footer>
    </div>
  );
}
