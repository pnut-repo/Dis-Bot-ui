import { useState, useEffect, useCallback } from "react";
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
  { id: "overview", label: "Overview", icon: "📊", description: "Summary cards & key metrics" },
  { id: "charts", label: "Analytics", icon: "📈", description: "Charts & visualizations" },
  { id: "topics", label: "Topics", icon: "💬", description: "Topic rankings & clusters" },
  { id: "report", label: "AI Digest", icon: "🤖", description: "Groq narrative report" },
];

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-hero">
          <div className="login-logo">
            <div className="login-logo-icon">📊</div>
            <span className="login-logo-text">Sentiment Dashboard</span>
          </div>
          <p className="login-tagline">
            AI-powered community analytics for your Discord server.
            Track sentiment, discover trending topics, and understand your community.
          </p>
          <ul className="login-features">
            <li>
              <span className="login-feature-icon">🔍</span>
              Real-time sentiment analysis powered by RoBERTa
            </li>
            <li>
              <span className="login-feature-icon">🏷️</span>
              Automatic topic clustering with HDBSCAN
            </li>
            <li>
              <span className="login-feature-icon">🤖</span>
              Daily AI-written narrative digests via Groq
            </li>
            <li>
              <span className="login-feature-icon">📈</span>
              Interactive charts and engagement scoring
            </li>
          </ul>
        </div>
        <div className="login-form-wrapper">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#f59e0b",
                colorBackground: "#22223a",
                colorText: "#e8e6f0",
                colorInputBackground: "#16162a",
                colorInputText: "#e8e6f0",
                borderRadius: "0.6rem",
              },
              elements: {
                card: {
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                },
                formButtonPrimary: {
                  background: "linear-gradient(145deg, #f59e0b, #d97706)",
                  color: "#1a1a2e",
                  border: "none",
                  fontWeight: "700",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                },
                socialButtonsBlockButton: {
                  backgroundColor: "#16162a",
                  border: "1px solid #3a3a58",
                  color: "#e8e6f0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                },
                footerActionLink: { color: "#f59e0b" },
                headerTitle: { color: "#e8e6f0" },
                headerSubtitle: { color: "#a09cb5" },
                formFieldLabel: { color: "#a09cb5" },
                formFieldInput: {
                  backgroundColor: "#16162a",
                  border: "1px solid #3a3a58",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                },
                dividerLine: { background: "#3a3a58" },
                dividerText: { color: "#6e6a82" },
                identityPreviewEditButton: { color: "#f59e0b" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeSection, onNavigate, dates, selected, onDateChange, user }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-icon">📊</div>
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
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: "32px", height: "32px" },
              },
            }}
          />
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

function Dashboard() {
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

  // Log login event once per session
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

  // Load available dates on mount
  useEffect(() => {
    fetchReportDates()
      .then((d) => {
        setDates(d);
        if (d.length > 0) setSelected(d[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Load report + topics when selected date changes
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
      {/* Mobile overlay */}
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
      />

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Sentiment Dashboard</span>
      </div>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">{currentPage.title}</h1>
          <p className="page-subtitle">
            {currentPage.subtitle}
            {selected && ` · ${selected}`}
          </p>
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
            {activeSection === "charts" && <ChartView chartData={report.chart_data} />}
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
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <LoginPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}
