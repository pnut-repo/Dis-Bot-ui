import { useState, useEffect, useCallback, useMemo } from "react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import { fetchReportDates, fetchReport, fetchTopics } from "./api/client";
import { logEvent } from "./api/audit";
import DatePicker from "./components/DatePicker";
import SummaryCards from "./components/SummaryCards";
import ChartView from "./components/ChartView";
import TopicList from "./components/TopicList";
import NarrativeReport from "./components/NarrativeReport";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "charts", label: "Analytics", icon: "📈" },
  { id: "topics", label: "Topics", icon: "💬" },
  { id: "report", label: "AI Digest", icon: "🤖" },
];

// ── Clerk Appearance Configs ────────────────────────────────────────────────

const CLERK_DARK = {
  variables: {
    colorPrimary:         "#3B82F6",
    colorBackground:      "#1a1c25",
    colorText:            "#e5e7eb",
    colorTextSecondary:   "#9CA3AF",
    colorInputBackground: "#14151e",
    colorInputText:       "#e5e7eb",
    colorNeutral:         "#6B7280",
    borderRadius:         "0.625rem",
    fontFamily:           "Inter, sans-serif",
    fontSize:             "14px",
  },
  elements: {
    rootBox:   { width: "100%" },
    card: {
      background:   "#1a1c25",
      border:       "1px solid #2a2d3a",
      borderRadius: "14px",
      boxShadow:    "0 4px 24px rgba(0,0,0,0.4)",
      padding:      "20px",
      width:        "100%",
    },
    headerTitle:    { color: "#e5e7eb", fontSize: "18px", fontWeight: "700" },
    headerSubtitle: { color: "#9CA3AF" },
    socialButtonsBlockButton: {
      background:   "#14151e",
      border:       "1px solid #2a2d3a",
      color:        "#e5e7eb",
      borderRadius: "10px",
    },
    socialButtonsBlockButtonText: { color: "#e5e7eb", fontWeight: "500" },
    dividerLine:      { background: "#2a2d3a" },
    dividerText:      { color: "#6B7280" },
    formFieldLabel:   { color: "#9CA3AF" },
    formFieldInput: {
      background:   "#14151e",
      border:       "1px solid #2a2d3a",
      borderRadius: "10px",
      color:        "#e5e7eb",
    },
    formFieldInput__focus:         { borderColor: "#3B82F6" },
    formButtonPrimary:             { background: "#3B82F6", borderRadius: "10px", fontWeight: "600", boxShadow: "0 1px 3px rgba(59,130,246,0.40)" },
    formButtonPrimary__hover:      { background: "#2563EB" },
    footerActionLink:              { color: "#3B82F6" },
    footerActionText:              { color: "#9CA3AF" },
    footer:                        { background: "transparent" },
    identityPreviewText:           { color: "#e5e7eb" },
    identityPreviewEditButtonIcon: { color: "#3B82F6" },
    userButtonPopoverCard:         { background: "#1a1c25", border: "1px solid #2a2d3a" },
    userButtonPopoverActionButton: { color: "#e5e7eb" },
    userButtonPopoverActionButtonText: { color: "#e5e7eb" },
    userButtonPopoverActionButtonIcon: { color: "#9CA3AF" },
    userButtonPopoverFooter:       { background: "transparent" },
    avatarBox:                     { width: "32px", height: "32px" },
  },
};

const CLERK_LIGHT = {
  variables: {
    colorPrimary:         "#2563EB",
    colorBackground:      "#FFFFFF",
    colorText:            "#111827",
    colorTextSecondary:   "#6B7280",
    colorInputBackground: "#F9FAFB",
    colorInputText:       "#111827",
    colorNeutral:         "#6B7280",
    borderRadius:         "0.625rem",
    fontFamily:           "Inter, sans-serif",
    fontSize:             "14px",
  },
  elements: {
    rootBox:   { width: "100%" },
    card: {
      background:   "#FFFFFF",
      border:       "1px solid #E5E7EB",
      borderRadius: "14px",
      boxShadow:    "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
      padding:      "20px",
      width:        "100%",
    },
    headerTitle:    { color: "#111827", fontSize: "18px", fontWeight: "700" },
    headerSubtitle: { color: "#6B7280" },
    socialButtonsBlockButton: {
      background:   "#F9FAFB",
      border:       "1px solid #E5E7EB",
      color:        "#111827",
      borderRadius: "10px",
    },
    socialButtonsBlockButtonText: { color: "#111827", fontWeight: "500" },
    dividerLine:      { background: "#E5E7EB" },
    dividerText:      { color: "#9CA3AF" },
    formFieldLabel:   { color: "#6B7280" },
    formFieldInput: {
      background:   "#F9FAFB",
      border:       "1px solid #E5E7EB",
      borderRadius: "10px",
      color:        "#111827",
    },
    formFieldInput__focus:         { borderColor: "#2563EB" },
    formButtonPrimary:             { background: "#2563EB", borderRadius: "10px", fontWeight: "600", boxShadow: "0 1px 3px rgba(37,99,235,0.30)" },
    formButtonPrimary__hover:      { background: "#1D4ED8" },
    footerActionLink:              { color: "#2563EB" },
    footerActionText:              { color: "#6B7280" },
    footer:                        { background: "transparent" },
    identityPreviewText:           { color: "#111827" },
    identityPreviewEditButtonIcon: { color: "#2563EB" },
    userButtonPopoverCard:         { background: "#FFFFFF", border: "1px solid #E5E7EB" },
    userButtonPopoverActionButton: { color: "#111827" },
    userButtonPopoverActionButtonText: { color: "#111827" },
    userButtonPopoverActionButtonIcon: { color: "#6B7280" },
    userButtonPopoverFooter:       { background: "transparent" },
    avatarBox:                     { width: "32px", height: "32px" },
  },
};

// ── useTheme hook ───────────────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("dashboard-theme") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const clerkAppearance = useMemo(
    () => (theme === "dark" ? CLERK_DARK : CLERK_LIGHT),
    [theme]
  );

  return { theme, toggleTheme, clerkAppearance };
}

// ── LoginPage ───────────────────────────────────────────────────────────────

function LoginPage({ theme, toggleTheme, clerkAppearance }) {
  return (
    <div className="login-page">
      <div className="login-top-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="login-center">
        <div className="login-brand">
          <div className="login-logo-icon">M</div>
          <div>
            <h1 className="login-title">Sentiment Dashboard</h1>
            <p className="login-sub">AI-powered Discord community analytics</p>
          </div>
        </div>

        <div className="login-clerk-wrap">
          <SignIn appearance={clerkAppearance} />
        </div>

        <p className="login-footer-note">
          Sign in to view your server's daily analytics report
        </p>
      </div>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ activeSection, onNavigate, dates, selected, onDateChange, user, mobileOpen, clerkAppearance }) {
  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-icon">M</div>
        <div>
          <div className="sidebar-title">Sentiment</div>
          <div className="sidebar-subtitle">Dashboard</div>
        </div>
      </div>

      <div className="sidebar-label">Analytics</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeSection === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {dates.length > 0 && (
          <div className="sidebar-date-section">
            <div className="sidebar-date-label">Report Date</div>
            <DatePicker
              dates={dates}
              selected={selected}
              onChange={onDateChange}
            />
          </div>
        )}
        <div className="sidebar-user">
          <UserButton appearance={clerkAppearance} />
          {user && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.fullName || user.username || "User"}</div>
              <div className="sidebar-user-email">{user.primaryEmailAddress?.emailAddress}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ theme, toggleTheme, clerkAppearance }) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [dates, setDates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLoggedLogin, setHasLoggedLogin] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && !hasLoggedLogin) {
      logEvent(getToken, "login", {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        nickname: user.username,
      });
      setHasLoggedLogin(true);
    }
  }, [user, hasLoggedLogin, getToken]);

  useEffect(() => {
    fetchReportDates()
      .then((d) => {
        setDates(d);
        if (d.length > 0) setSelected(d[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchReport(selected), fetchTopics(selected)])
      .then(([r, t]) => {
        setReport(r);
        setTopics(t);
        logEvent(getToken, "view_report", { report_date: selected });
        logEvent(getToken, "view_topics", { report_date: selected });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected, getToken]);

  const handleDateChange = useCallback(
    (newDate) => {
      setSelected(newDate);
      logEvent(getToken, "change_date", { report_date: newDate });
    },
    [getToken]
  );

  const handleTopicClick = useCallback(
    (topic) => {
      logEvent(getToken, "click_topic_card", {
        report_date: selected,
        topic_rank: topic.topic_rank,
        topic_name: topic.topic_name,
      });
    },
    [getToken, selected]
  );

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  }, []);

  const sectionTitles = {
    overview: { title: "Overview", subtitle: "Key metrics at a glance" },
    charts: { title: "Analytics", subtitle: "Charts and visualizations" },
    topics: { title: "Topic Rankings", subtitle: "Discovered conversation clusters" },
    report: { title: "AI Daily Digest", subtitle: "Auto-generated narrative report" },
  };

  const currentPage = sectionTitles[activeSection];

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        dates={dates}
        selected={selected}
        onDateChange={handleDateChange}
        user={user}
        mobileOpen={mobileMenuOpen}
        clerkAppearance={clerkAppearance}
      />

      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            ☰
          </button>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Sentiment Dashboard</span>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" style={{ marginLeft: "auto" }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Top bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <h1 className="page-title">{currentPage.title}</h1>
          </div>
          <div className="top-bar-right">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            {user && <span className="top-bar-user-name">{user.fullName || user.username}</span>}
            <UserButton appearance={clerkAppearance} />
          </div>
        </div>

        <div className="main-inner">
          <div className="page-header">
            <div>
              <p className="page-subtitle">
                {currentPage.subtitle}
                {selected && ` · ${selected}`}
              </p>
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading dashboard data…</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {!loading && !error && !report && (
            <div className="empty-state">
              <p>No reports available yet. The pipeline runs daily at 00:05 UTC.</p>
            </div>
          )}

          {!loading && !error && report && (
            <>
              {activeSection === "overview" && <SummaryCards report={report} />}
              {activeSection === "charts" && <ChartView key={theme} chartData={report.chart_data} />}
              {activeSection === "topics" && <TopicList topics={topics} onTopicClick={handleTopicClick} />}
              {activeSection === "report" && <NarrativeReport markdown={report.narrative_md} />}
            </>
          )}

          <footer className="app-footer">
            <p>
              Pipeline ran in {report?.pipeline_duration_seconds ?? "—"}s
              {selected && ` · Report for ${selected}`}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

// ── Root App ────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggleTheme, clerkAppearance } = useTheme();

  return (
    <>
      <SignedOut>
        <LoginPage theme={theme} toggleTheme={toggleTheme} clerkAppearance={clerkAppearance} />
      </SignedOut>
      <SignedIn>
        <Dashboard theme={theme} toggleTheme={toggleTheme} clerkAppearance={clerkAppearance} />
      </SignedIn>
    </>
  );
}
