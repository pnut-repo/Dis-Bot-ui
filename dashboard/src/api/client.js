const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchReportDates() {
  const res = await fetch(`${API_BASE}/api/reports/dates`);
  if (!res.ok) throw new Error("Failed to fetch report dates");
  const data = await res.json();
  return data.dates; // ["2026-06-14", "2026-06-13", ...]
}

export async function fetchReport(date) {
  const res = await fetch(`${API_BASE}/api/reports/${date}`);
  if (!res.ok) throw new Error(`No report for ${date}`);
  return res.json();
}

export async function fetchTopics(date) {
  const res = await fetch(`${API_BASE}/api/topics/${date}`);
  if (!res.ok) throw new Error(`No topics for ${date}`);
  const data = await res.json();
  return data.topics;
}
