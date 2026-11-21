import React, { useEffect, useState } from 'react';
import {
  Activity,
  ClipboardList,
  Cpu,
  LogIn,
  LogOut,
  Server,
  Shield,
  UserPlus,
  Users,
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

function defaultTab(user) {
  if (!user) return 'login';
  if (user.role === 'ROLE_EMPLOYEE') return 'incidents';
  if (['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(user.role)) return 'dashboard';
  return 'technicians';
}

function isTabAvailable(user, tab) {
  if (tab === 'login' || tab === 'register') return true;
  if (!user) return false;
  if (tab === 'incidents') return true;
  if (tab === 'technicians') return user.role !== 'ROLE_EMPLOYEE';
  if (tab === 'dashboard' || tab === 'audit') return ['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(user.role);
  if (tab === 'services') return user.role === 'ROLE_ADMIN';
  return false;
}

export function isNativeApp() {
  if (typeof window === 'undefined') return false;
  const protocol = window.location.protocol;
  const ua = window.navigator.userAgent || '';
  const origin = window.location.origin || '';
  const hostname = window.location.hostname || '';

  if (window.Capacitor || protocol === 'capacitor:' || origin.includes('capacitor://')) return true;
  if (ua.includes('Electron') || protocol === 'iitsm:' || window.process?.type === 'renderer') return true;
  if (protocol === 'file:') return true;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && window.location.port !== '5173') return true;
  return false;
}

function getInitialTab(user) {
  if (isNativeApp()) {
    return user ? defaultTab(user) : 'login';
  }
  const params = new URLSearchParams(window.location.search);
  const isConsole = params.get('app') === 'console' || window.location.pathname === '/console';
  if (!isConsole) return 'landing';
  const requestedTab = params.get('tab');
  return requestedTab && isTabAvailable(user, requestedTab) ? requestedTab : defaultTab(user);
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const [activeTab, setActiveTab] = useState(() => getInitialTab(readStoredUser()));

  const isNative = isNativeApp();
  const params = new URLSearchParams(window.location.search);
  const isConsoleMode = isNative || params.get('app') === 'console' || window.location.pathname === '/console' || activeTab !== 'landing';
  const isManager = currentUser && ['ROLE_ADMIN', 'ROLE_TEAM_LEAD'].includes(currentUser.role);
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';
  const isEmployee = currentUser?.role === 'ROLE_EMPLOYEE';

  useEffect(() => {
    if (!isConsoleMode || activeTab === 'landing') return;
    const url = new URL(window.location.href);
    const currentTab = url.searchParams.get('tab');
    if (currentTab === activeTab) return;
    url.searchParams.set('app', 'console');
    url.searchParams.set('tab', activeTab);
    if (currentTab === null) window.history.replaceState({ tab: activeTab }, '', url);
    else window.history.pushState({ tab: activeTab }, '', url);
  }, [activeTab, isConsoleMode]);

  useEffect(() => {
    if (!isConsoleMode) return;
    const onPopState = () => {
      const nextTab = new URLSearchParams(window.location.search).get('tab');
      setActiveTab(isTabAvailable(currentUser, nextTab) ? nextTab : defaultTab(currentUser));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentUser, isConsoleMode]);

  const handleAuthenticated = (response) => {
    localStorage.setItem('iitsm_token', response.accessToken);
    localStorage.setItem('iitsm_user', JSON.stringify(response.user));
    setCurrentUser(response.user);
    setActiveTab(defaultTab(response.user));
  };

  const logout = () => {
    localStorage.removeItem('iitsm_token');
    localStorage.removeItem('iitsm_user');
    setCurrentUser(null);
    setActiveTab('login');
  };

  const tabs = [];
  if (currentUser) {
    tabs.push({ id: 'incidents', label: isEmployee ? 'My tickets' : 'Ticket queue', icon: ClipboardList });
    if (!isEmployee) tabs.push({ id: 'technicians', label: 'Technicians', icon: Users });
    if (isManager) tabs.push({ id: 'dashboard', label: 'Operations', icon: Activity });
    if (isAdmin) tabs.push({ id: 'services', label: 'Services', icon: Server });
    if (isManager) tabs.push({ id: 'audit', label: 'Audit log', icon: Shield });
  } else {
    tabs.push({ id: 'login', label: 'Sign in', icon: LogIn });
    tabs.push({ id: 'register', label: 'Create account', icon: UserPlus });
  }

  const handleTabKeyDown = (event) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
  };

  if (!isNative && !isConsoleMode && activeTab === 'landing') {
    return (
      <LandingPage
        onEnterConsole={(tab) => {
          const target = tab && isTabAvailable(currentUser, tab) ? tab : (currentUser ? defaultTab(currentUser) : 'login');
          setActiveTab(target);
          const url = new URL(window.location.href);
          url.searchParams.set('app', 'console');
          url.searchParams.set('tab', target);
          window.history.pushState({ tab: target }, '', url);
        }}
      />
    );
  }

  return (
    <div className="console-shell">
      <header className="console-topbar">
        <div className="console-topbar__inner">
          <button
            type="button"
            className="console-brand"
            onClick={() => setActiveTab(currentUser ? defaultTab(currentUser) : 'login')}
            aria-label="BPHC IT HelpDesk console"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
          >
            <span className="console-brand__mark"><Cpu size={19} aria-hidden="true" /></span>
            <span>
              <span className="console-brand__title">BPHC IT HelpDesk</span>
              <span className="console-brand__subline">Campus IT service desk · v1.1</span>
            </span>
          </button>
          <div className="console-tools">
            {currentUser && <span className="console-user">{currentUser.fullName}</span>}
            {currentUser && <NotificationBell userId={currentUser.id} />}
            {currentUser && (
              <button className="console-icon-button" onClick={logout} title="Sign out" aria-label="Sign out">
                <LogOut size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <nav className="console-tabrail" role="tablist" aria-label="HelpDesk sections" onKeyDown={handleTabKeyDown}>
          {currentUser && <button id="tab-incidents" type="button" role="tab" aria-selected={activeTab === 'incidents'} aria-controls="tab-panel" tabIndex={activeTab === 'incidents' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('incidents')}><ClipboardList size={16} aria-hidden="true" /><span>{isEmployee ? 'My tickets' : 'Ticket queue'}</span></button>}
          {currentUser && !isEmployee && <button id="tab-technicians" type="button" role="tab" aria-selected={activeTab === 'technicians'} aria-controls="tab-panel" tabIndex={activeTab === 'technicians' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('technicians')}><Users size={16} aria-hidden="true" /><span>Technicians</span></button>}
          {isManager && <button id="tab-dashboard" type="button" role="tab" aria-selected={activeTab === 'dashboard'} aria-controls="tab-panel" tabIndex={activeTab === 'dashboard' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('dashboard')}><Activity size={16} aria-hidden="true" /><span>Operations</span></button>}
          {isAdmin && <button id="tab-services" type="button" role="tab" aria-selected={activeTab === 'services'} aria-controls="tab-panel" tabIndex={activeTab === 'services' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('services')}><Server size={16} aria-hidden="true" /><span>Services</span></button>}
          {isManager && <button id="tab-audit" type="button" role="tab" aria-selected={activeTab === 'audit'} aria-controls="tab-panel" tabIndex={activeTab === 'audit' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('audit')}><Shield size={16} aria-hidden="true" /><span>Audit log</span></button>}
          {!currentUser && <button id="tab-login" type="button" role="tab" aria-selected={activeTab === 'login'} aria-controls="tab-panel" tabIndex={activeTab === 'login' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('login')}><LogIn size={16} aria-hidden="true" /><span>Sign in</span></button>}
          {!currentUser && <button id="tab-register" type="button" role="tab" aria-selected={activeTab === 'register'} aria-controls="tab-panel" tabIndex={activeTab === 'register' ? 0 : -1} className="console-tab" onClick={() => setActiveTab('register')}><UserPlus size={16} aria-hidden="true" /><span>Create account</span></button>}
        </nav>
      </header>

      <main id="tab-panel" className="console-main" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={-1}>
        {activeTab === 'login' && <LoginPage onAuthenticated={handleAuthenticated} onRegister={() => setActiveTab('register')} />}
        {activeTab === 'register' && <RegisterPage onAuthenticated={handleAuthenticated} onLogin={() => setActiveTab('login')} />}
        {activeTab === 'technicians' && currentUser && <TechnicianDirectoryPage currentUser={currentUser} />}
        {activeTab === 'incidents' && currentUser && <IncidentWorkspacePage currentUser={currentUser} />}
        {activeTab === 'dashboard' && isManager && <ItManagerDashboardPage />}
        {activeTab === 'services' && isAdmin && <ServiceManagementPage />}
        {activeTab === 'audit' && isManager && <AuditLogsPage />}
        {!tabs.some((tab) => tab.id === activeTab) && <p role="status" className="work-panel p-5">This section is unavailable for your account.</p>}
      </main>

      <footer className="console-footer">BPHC CS F213 OOP Project (2026–2027) · Campus IT HelpDesk</footer>
    </div>
  );
}
