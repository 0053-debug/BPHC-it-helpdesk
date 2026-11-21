import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Download,
  ExternalLink,
  Globe,
  Laptop,
  Layers,
  Monitor,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';

const FALLBACK_VERSION = '1.1.0';
const GITHUB_REPO = '0053-debug/BPHC-it-helpdesk';
const GITHUB_LATEST_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function LandingPage({ onEnterConsole }) {
  const [activePlatform, setActivePlatform] = useState('windows');
  const [releaseData, setReleaseData] = useState({
    version: FALLBACK_VERSION,
    tagName: `v${FALLBACK_VERSION}`,
    publishedAt: null,
    htmlUrl: GITHUB_RELEASES_PAGE,
    assets: {
      windows: {
        name: `I-ITSM-win-x64-${FALLBACK_VERSION}.exe`,
        url: `https://github.com/${GITHUB_REPO}/releases/download/v${FALLBACK_VERSION}/I-ITSM-win-x64-${FALLBACK_VERSION}.exe`,
        size: '119.8 MB',
      },
      android: {
        name: `I-ITSM-android-debug-${FALLBACK_VERSION}.apk`,
        url: `https://github.com/${GITHUB_REPO}/releases/download/v${FALLBACK_VERSION}/I-ITSM-android-debug-${FALLBACK_VERSION}.apk`,
        size: '4.9 MB',
      },
      mac: {
        name: `I-ITSM-mac-universal-${FALLBACK_VERSION}.dmg`,
        url: `https://github.com/${GITHUB_REPO}/releases/download/v${FALLBACK_VERSION}/I-ITSM-mac-universal-${FALLBACK_VERSION}.dmg`,
        size: '218.7 MB',
      },
    },
    isLoaded: false,
  });

  const tabRefs = useRef([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatestRelease() {
      try {
        const cached = sessionStorage.getItem('iitsm_gh_release');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
            if (isMounted) setReleaseData(parsed.data);
            return;
          }
        }
      } catch {
        // ignore sessionStorage errors
      }

      try {
        const response = await fetch(GITHUB_LATEST_API, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (!response.ok) return;

        const data = await response.json();
        if (!data || !data.tag_name) return;

        const rawTag = data.tag_name;
        const cleanVersion = rawTag.replace(/^v/i, '');
        const assetsList = Array.isArray(data.assets) ? data.assets : [];

        const winAsset = assetsList.find((a) => a.name.toLowerCase().endsWith('.exe'));
        const androidAsset = assetsList.find((a) => a.name.toLowerCase().endsWith('.apk'));
        const macAsset = assetsList.find(
          (a) => a.name.toLowerCase().endsWith('.dmg') || a.name.toLowerCase().endsWith('.pkg')
        );

        let formattedDate = null;
        if (data.published_at) {
          try {
            formattedDate = new Date(data.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          } catch {}
        }

        const updated = {
          version: cleanVersion,
          tagName: rawTag,
          publishedAt: formattedDate,
          htmlUrl: data.html_url || GITHUB_RELEASES_PAGE,
          assets: {
            windows: {
              name: winAsset?.name || `I-ITSM-win-x64-${cleanVersion}.exe`,
              url:
                winAsset?.browser_download_url ||
                `https://github.com/${GITHUB_REPO}/releases/download/${rawTag}/I-ITSM-win-x64-${cleanVersion}.exe`,
              size: winAsset ? formatBytes(winAsset.size) : '',
            },
            android: {
              name: androidAsset?.name || `I-ITSM-android-debug-${cleanVersion}.apk`,
              url:
                androidAsset?.browser_download_url ||
                `https://github.com/${GITHUB_REPO}/releases/download/${rawTag}/I-ITSM-android-debug-${cleanVersion}.apk`,
              size: androidAsset ? formatBytes(androidAsset.size) : '',
            },
            mac: {
              name: macAsset?.name || `I-ITSM-mac-universal-${cleanVersion}.dmg`,
              url:
                macAsset?.browser_download_url ||
                `https://github.com/${GITHUB_REPO}/releases/download/${rawTag}/I-ITSM-mac-universal-${cleanVersion}.dmg`,
              size: macAsset ? formatBytes(macAsset.size) : '',
            },
          },
          isLoaded: true,
        };

        if (isMounted) {
          setReleaseData(updated);
          try {
            sessionStorage.setItem('iitsm_gh_release', JSON.stringify({ data: updated, timestamp: Date.now() }));
          } catch {}
        }
      } catch {
        // Network error; fallback data remains active
      }
    }

    fetchLatestRelease();
    return () => {
      isMounted = false;
    };
  }, []);

  const platforms = [
    {
      id: 'windows',
      label: 'Windows',
      title: 'Windows desktop',
      type: 'Installer (.exe)',
      icon: Monitor,
      description: 'A standalone desktop application for faculty, staff, and campus lab machines, with desktop notifications.',
      facts: [
        'Windows 10 / 11 (64-bit)',
        releaseData.assets.windows.name
          ? `${releaseData.assets.windows.name} ${releaseData.assets.windows.size ? `(${releaseData.assets.windows.size})` : ''}`
          : 'Self-contained desktop package',
        releaseData.publishedAt ? `Release date: ${releaseData.publishedAt}` : 'Always current with latest cloud build',
      ],
      action: `Download Windows app${releaseData.assets.windows.size ? ` (${releaseData.assets.windows.size})` : ''}`,
      downloadUrl: releaseData.assets.windows.url,
      downloadName: releaseData.assets.windows.name,
    },
    {
      id: 'android',
      label: 'Android',
      title: 'Android mobile',
      type: 'APK package',
      icon: Smartphone,
      description: 'A mobile client for raising tickets on the go or checking technician updates from your hostel room.',
      facts: [
        'Android 9.0 and newer',
        releaseData.assets.android.name
          ? `${releaseData.assets.android.name} ${releaseData.assets.android.size ? `(${releaseData.assets.android.size})` : ''}`
          : 'Direct APK installation',
        releaseData.publishedAt ? `Release date: ${releaseData.publishedAt}` : 'Always current with latest cloud build',
      ],
      action: `Download Android APK${releaseData.assets.android.size ? ` (${releaseData.assets.android.size})` : ''}`,
      downloadUrl: releaseData.assets.android.url,
      downloadName: releaseData.assets.android.name,
    },
    {
      id: 'mac',
      label: 'macOS',
      title: 'macOS desktop',
      type: 'Disk image (.dmg)',
      icon: Laptop,
      description: 'A desktop application for macOS users with keyboard shortcuts, system alerts, and fast navigation.',
      facts: [
        'macOS 12.0+ (Universal / Apple Silicon & Intel)',
        releaseData.assets.mac.name
          ? `${releaseData.assets.mac.name} ${releaseData.assets.mac.size ? `(${releaseData.assets.mac.size})` : ''}`
          : 'Universal binary package',
        releaseData.publishedAt ? `Release date: ${releaseData.publishedAt}` : 'Always current with latest cloud build',
      ],
      action: `Download macOS DMG${releaseData.assets.mac.size ? ` (${releaseData.assets.mac.size})` : ''}`,
      downloadUrl: releaseData.assets.mac.url,
      downloadName: releaseData.assets.mac.name,
    },
    {
      id: 'web',
      label: 'Web app',
      title: 'Web browser',
      type: 'Instant access',
      icon: Globe,
      description: 'Open the full service desk in your browser without installing software.',
      facts: ['Chrome, Edge, Firefox, Safari', 'Opens in a clean workspace', 'Always up to date with cloud backend'],
      action: 'Launch web console',
    },
  ];

  const scrollTo = (id) => (event) => {
    if (event) event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openConsole = (tab) => {
    if (onEnterConsole) {
      onEnterConsole(tab);
      return;
    }
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('app', 'console');
    if (tab) url.searchParams.set('tab', tab);
    window.location.href = url.toString();
  };

  const handleDownloadTabs = (event, index) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
        ? platforms.length - 1
        : (index + step + platforms.length) % platforms.length;
    setActivePlatform(platforms[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="public-shell">
      <nav className="public-nav" aria-label="Main navigation">
        <div className="public-container public-nav__inner">
          <a
            className="public-brand"
            href="#top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="BPHC IT HelpDesk home"
          >
            <span className="console-brand__mark">
              <Cpu size={19} aria-hidden="true" />
            </span>
            <span>
              <strong>BPHC IT HelpDesk</strong>
              <small>Campus service desk · {releaseData.tagName || `v${releaseData.version}`}</small>
            </span>
          </a>
          <div className="public-nav__links">
            <a className="public-tab" href="#downloads" onClick={scrollTo('downloads')}>
              Downloads
            </a>
            <a className="public-tab" href="#features" onClick={scrollTo('features')}>
              How it works
            </a>
            <button className="public-tab" onClick={() => openConsole('login')}>
              Sign in
            </button>
            <button className="public-tab public-tab--action" onClick={() => openConsole('register')}>
              Register
            </button>
          </div>
        </div>
      </nav>

      <main id="top">
        <section className="public-container public-hero">
          <div>
            <h1>
              Campus IT Support,
              <br />
              Simplified &amp; In One Place.
            </h1>
            <p className="public-campus-line">
              <Zap size={15} aria-hidden="true" /> BITS Pilani Hyderabad Campus · IT support portal
            </p>
            <p className="public-hero__lead">
              Report Wi-Fi issues, lab system faults, and hostel network problems. Track updates from your browser,
              Windows desktop, Mac, or Android phone.
            </p>
            <div className="public-actions">
              <a className="public-action public-action--primary" href="#downloads" onClick={scrollTo('downloads')}>
                <Download size={17} aria-hidden="true" /> Get the apps
              </a>
              <button type="button" className="public-action" onClick={() => openConsole('login')}>
                <Globe size={17} aria-hidden="true" /> Open in browser
              </button>
            </div>
          </div>
          <div className="public-hero__aside" aria-label="HelpDesk features">
            <p className="eyebrow">Campus support, connected</p>
            <div className="public-stat-list">
              <div className="public-stat">
                <span className="public-stat__value">&lt; 1s</span>
                <span>Live status sync</span>
              </div>
              <div className="public-stat">
                <span className="public-stat__value">P1 to P4</span>
                <span>Smart prioritization</span>
              </div>
              <div className="public-stat">
                <span className="public-stat__value">History</span>
                <span>Ticket audit trail</span>
              </div>
              <div className="public-stat">
                <span className="public-stat__value">Multi-client</span>
                <span>Windows, Android, Mac, web</span>
              </div>
            </div>
          </div>
        </section>

        <section id="downloads" className="public-section">
          <div className="public-container">
            <div className="public-section__head">
              <div>
                <h2>Get the BPHC HelpDesk App</h2>
              </div>
              <p>Download a desktop or mobile client, or open the web console directly.</p>
            </div>
            <div
              className="download-tabs"
              role="tablist"
              aria-label="Choose an app platform"
              onKeyDown={(event) =>
                handleDownloadTabs(
                  event,
                  platforms.findIndex((platform) => platform.id === activePlatform)
                )
              }
            >
              {platforms.map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={`download-tab-${platform.id}`}
                    type="button"
                    role="tab"
                    aria-selected={activePlatform === platform.id}
                    aria-controls={`download-panel-${platform.id}`}
                    tabIndex={activePlatform === platform.id ? 0 : -1}
                    onClick={() => setActivePlatform(platform.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {platform.label}
                  </button>
                );
              })}
            </div>
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isActive = activePlatform === platform.id;
              return (
                <article
                  key={platform.id}
                  id={`download-panel-${platform.id}`}
                  className="download-panel"
                  role="tabpanel"
                  aria-labelledby={`download-tab-${platform.id}`}
                  hidden={!isActive}
                >
                  <div>
                    <p className="download-platform-type">{platform.type}</p>
                    <h3>{platform.title}</h3>
                    <p>{platform.description}</p>
                    <ul className="download-facts">
                      {platform.facts.map((fact) => (
                        <li key={fact}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="download-panel__action">
                    <span className="download-panel__icon">
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    {platform.id !== 'web' ? (
                      <a
                        className="public-action public-action--primary"
                        href={platform.downloadUrl}
                        download={platform.downloadName}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={16} aria-hidden="true" />
                        {platform.action}
                        <ArrowRight size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="public-action public-action--primary"
                        onClick={() => openConsole('login')}
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                        {platform.action}
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    )}
                    {platform.downloadName && (
                      <span style={{ fontSize: '12px', color: 'var(--color-ink-2)' }}>
                        Package: {platform.downloadName}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '13px',
                color: 'var(--color-ink-2)',
              }}
            >
              <span>
                Latest release: <strong style={{ color: 'var(--color-ink)' }}>{releaseData.tagName}</strong>
                {releaseData.publishedAt && <span> · Published on {releaseData.publishedAt}</span>}
              </span>
              <a
                href={releaseData.htmlUrl || GITHUB_RELEASES_PAGE}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-cool)',
                  textDecoration: 'none',
                }}
              >
                View all releases and changelog on GitHub <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="public-section">
          <div className="public-container">
            <div className="public-section__head">
              <div>
                <h2>How the System Works</h2>
              </div>
              <p>Object-oriented patterns keep campus IT requests predictable, visible, and responsive.</p>
            </div>
            <div className="feature-rows">
              <article className="feature-row">
                <h3>
                  <span className="feature-row__icon">
                    <Activity size={19} aria-hidden="true" />
                  </span>
                  Live Event Notifications
                </h3>
                <p>The Observer pattern sends live changes as tickets are assigned, investigated, and resolved.</p>
              </article>
              <article className="feature-row">
                <h3>
                  <span className="feature-row__icon">
                    <Layers size={19} aria-hidden="true" />
                  </span>
                  Service Dependency Map
                </h3>
                <p>A dependency graph connects campus systems such as Wi-Fi, ERP, and authentication.</p>
              </article>
              <article className="feature-row">
                <h3>
                  <span className="feature-row__icon">
                    <ShieldCheck size={19} aria-hidden="true" />
                  </span>
                  Protected History &amp; SLAs
                </h3>
                <p>Ticket actions are recorded while SLA timers help staff act within service targets.</p>
              </article>
            </div>
            <div className="workflow-strip" aria-label="Ticket workflow">
              <span>
                <ClipboardList size={16} aria-hidden="true" /> Report
              </span>
              <span>→</span>
              <span>Route and investigate</span>
              <span>→</span>
              <span>Verify resolution</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <p>BPHC CS F213 OOP Project (2026–2027) · Campus IT HelpDesk</p>
        <p>Available on Windows desktop, Android mobile, macOS, and web browsers.</p>
      </footer>
    </div>
  );
}
