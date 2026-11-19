import React, { useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Monitor,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';

const version = '1.1.0';
const release = 'https://github.com/0053-debug/BPHC-it-helpdesk/releases/latest/download';

const platforms = [
  {
    id: 'windows', label: 'Windows', title: 'Windows desktop', type: 'Installer (.exe)', icon: Monitor,
    description: 'A standalone desktop application for faculty, staff, and campus lab machines, with desktop notifications.',
    facts: ['Windows 10 / 11 (64-bit)', 'Self-contained desktop package'], action: 'Download Windows app',
  },
  {
    id: 'android', label: 'Android', title: 'Android mobile', type: 'APK package', icon: Smartphone,
    description: 'A mobile client for raising tickets on the go or checking technician updates from your hostel room.',
    facts: ['Android 9.0 and newer', 'Direct APK installation'], action: 'Download Android APK',
  },
  {
    id: 'web', label: 'Web app', title: 'Web browser', type: 'Instant access', icon: Globe,
    description: 'Open the full service desk in your browser without installing software.',
    facts: ['Chrome, Edge, Firefox, Safari', 'Opens in a clean workspace'],
    action: 'Launch web console',
  },
];

export default function LandingPage() {
  const [activePlatform, setActivePlatform] = useState('web');
  const tabRefs = useRef([]);
  const scrollTo = (id) => (event) => {
    if (event) event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openConsole = (tab) => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('app', 'console');
    if (tab) url.searchParams.set('tab', tab);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadTabs = (event, index) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? platforms.length - 1 : (index + step + platforms.length) % platforms.length;
    setActivePlatform(platforms[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="public-shell">
      <nav className="public-nav" aria-label="Main navigation">
        <div className="public-container public-nav__inner">
          <a className="public-brand" href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="BPHC IT HelpDesk home">
            <span className="console-brand__mark"><Cpu size={19} aria-hidden="true" /></span>
            <span><strong>BPHC IT HelpDesk</strong><small>Campus service desk · v{version}</small></span>
          </a>
          <div className="public-nav__links">
            <a className="public-tab" href="#downloads" onClick={scrollTo('downloads')}>Downloads</a>
            <a className="public-tab" href="#features" onClick={scrollTo('features')}>How it works</a>
            <button className="public-tab" onClick={() => openConsole('login')}>Sign in</button>
            <button className="public-tab public-tab--action" onClick={() => openConsole('register')}>Register</button>
          </div>
        </div>
      </nav>

      <main id="top">
        <section className="public-container public-hero">
          <div>
            <h1>Campus IT Support,<br />Simplified &amp; In One Place.</h1>
            <p className="public-campus-line"><Zap size={15} aria-hidden="true" /> BITS Pilani Hyderabad Campus · IT support portal</p>
            <p className="public-hero__lead">Report Wi-Fi issues, lab system faults, and hostel network problems. Track updates from your browser, Windows desktop, or Android phone.</p>
            <div className="public-actions">
              <a className="public-action public-action--primary" href="#downloads" onClick={scrollTo('downloads')}><Download size={17} aria-hidden="true" /> Get the apps</a>
              <a className="public-action" href="?app=console" target="_blank" rel="noopener noreferrer"><Globe size={17} aria-hidden="true" /> Open in browser</a>
            </div>
          </div>
          <div className="public-hero__aside" aria-label="HelpDesk features">
            <p className="eyebrow">Campus support, connected</p>
            <div className="public-stat-list">
              <div className="public-stat"><span className="public-stat__value">&lt; 1s</span><span>Live status sync</span></div>
              <div className="public-stat"><span className="public-stat__value">P1 to P4</span><span>Smart prioritization</span></div>
              <div className="public-stat"><span className="public-stat__value">History</span><span>Ticket audit trail</span></div>
              <div className="public-stat"><span className="public-stat__value">3 clients</span><span>Windows, Android, web</span></div>
            </div>
          </div>
        </section>

        <section id="downloads" className="public-section">
          <div className="public-container">
            <div className="public-section__head">
              <div><h2>Get the BPHC HelpDesk App</h2></div>
              <p>Download a desktop or mobile client, or open the web console directly.</p>
            </div>
            <div className="download-tabs" role="tablist" aria-label="Choose an app platform" onKeyDown={(event) => handleDownloadTabs(event, platforms.findIndex((platform) => platform.id === activePlatform))}>
              {platforms.map((platform, index) => {
                const Icon = platform.icon;
                return <button key={platform.id} ref={(element) => { tabRefs.current[index] = element; }} id={`download-tab-${platform.id}`} type="button" role="tab" aria-selected={activePlatform === platform.id} aria-controls={`download-panel-${platform.id}`} tabIndex={activePlatform === platform.id ? 0 : -1} onClick={() => setActivePlatform(platform.id)}><Icon size={16} aria-hidden="true" />{platform.label}</button>;
              })}
            </div>
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isActive = activePlatform === platform.id;
              return <article key={platform.id} id={`download-panel-${platform.id}`} className="download-panel" role="tabpanel" aria-labelledby={`download-tab-${platform.id}`} hidden={!isActive}>
              <div>
                <p className="download-platform-type">{platform.type}</p>
                <h3>{platform.title}</h3>
                <p>{platform.description}</p>
                <ul className="download-facts">{platform.facts.map((fact) => <li key={fact}><CheckCircle2 size={16} aria-hidden="true" />{fact}</li>)}</ul>
              </div>
              <div className="download-panel__action">
                <span className="download-panel__icon"><Icon size={26} aria-hidden="true" /></span>
                {platform.id === 'windows' && <a className="public-action public-action--primary" href={`${release}/I-ITSM-win-x64-${version}.exe`} download><Download size={16} aria-hidden="true" />{platform.action}<ArrowRight size={15} aria-hidden="true" /></a>}
                {platform.id === 'android' && <a className="public-action public-action--primary" href={`${release}/I-ITSM-android-debug-${version}.apk`} download><Download size={16} aria-hidden="true" />{platform.action}<ArrowRight size={15} aria-hidden="true" /></a>}
                {platform.id === 'web' && <a className="public-action public-action--primary" href="?app=console" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" />{platform.action}<ArrowRight size={15} aria-hidden="true" /></a>}
              </div>
            </article>;
            })}
          </div>
        </section>

        <section id="features" className="public-section">
          <div className="public-container">
            <div className="public-section__head">
              <div><h2>How the System Works</h2></div>
              <p>Object-oriented patterns keep campus IT requests predictable, visible, and responsive.</p>
            </div>
            <div className="feature-rows">
              <article className="feature-row"><h3><span className="feature-row__icon"><Activity size={19} aria-hidden="true" /></span>Live Event Notifications</h3><p>The Observer pattern sends live changes as tickets are assigned, investigated, and resolved.</p></article>
              <article className="feature-row"><h3><span className="feature-row__icon"><Layers size={19} aria-hidden="true" /></span>Service Dependency Map</h3><p>A dependency graph connects campus systems such as Wi-Fi, ERP, and authentication.</p></article>
              <article className="feature-row"><h3><span className="feature-row__icon"><ShieldCheck size={19} aria-hidden="true" /></span>Protected History &amp; SLAs</h3><p>Ticket actions are recorded while SLA timers help staff act within service targets.</p></article>
            </div>
            <div className="workflow-strip" aria-label="Ticket workflow">
              <span><ClipboardList size={16} aria-hidden="true" /> Report</span><span>→</span><span>Route and investigate</span><span>→</span><span>Verify resolution</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer"><p>BPHC CS F213 OOP Project (2026–2027) · Campus IT HelpDesk</p><p>Available on Windows desktop, Android mobile, and web browsers.</p></footer>
    </div>
  );
}
