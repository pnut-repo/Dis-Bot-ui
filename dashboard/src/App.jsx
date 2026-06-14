import { useState, useEffect } from "react";
import { fetchReportDates, fetchReport, fetchTopics } from "./api/client";
import DatePicker from "./components/DatePicker";
import SummaryCards from "./components/SummaryCards";
import ChartView from "./components/ChartView";
import TopicList from "./components/TopicList";
import NarrativeReport from "./components/NarrativeReport";

export default function App() {
  const [dates, setDates]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport]     = useState(null);
  const [topics, setTopics]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

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
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>📊 Discord Sentiment Dashboard</h1>
          <p className="header-subtitle">AI-powered community analytics</p>
        </div>
        {dates.length > 0 && (
          <DatePicker dates={dates} selected={selected} onChange={setSelected} />
        )}
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
            <TopicList topics={topics} />
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
