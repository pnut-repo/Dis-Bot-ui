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
        // Log view events
        logEvent(getToken, "view_report", { report_date: selected });
        logEvent(getToken, "view_topics", { report_date: selected });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected, getToken]);

  // Date change handler with logging
  const handleDateChange = useCallback(
    (newDate) => {
      setSelected(newDate);
      logEvent(getToken, "change_date", { report_date: newDate });
    },
    [getToken]
  );

  // Topic card click handler
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>📊 Discord Sentiment Dashboard</h1>
          <p className="header-subtitle">AI-powered community analytics</p>
        </div>
        <div className="header-right">
          {dates.length > 0 && (
            <DatePicker
              dates={dates}
              selected={selected}
              onChange={handleDateChange}
            />
          )}
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: "36px", height: "36px" },
              },
            }}
          />
        </div>
      </header>

      <main className="app-main">
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
            <SummaryCards report={report} />
            <ChartView chartData={report.chart_data} />
            <TopicList topics={topics} onTopicClick={handleTopicClick} />
            <NarrativeReport markdown={report.narrative_md} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Pipeline ran in {report?.pipeline_duration_seconds ?? "—"}s
          {selected && ` · Report for ${selected}`}
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <div className="login-page">
          <div className="login-branding">
            <h1>📊 Discord Sentiment Dashboard</h1>
            <p>AI-powered community analytics — sign in to continue</p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: { width: "100%" },
                card: {
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                },
              },
            }}
          />
        </div>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}
