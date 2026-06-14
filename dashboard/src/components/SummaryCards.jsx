export default function SummaryCards({ report }) {
  const { total_messages, total_users, total_topics, overall_sentiment } = report;

  const cards = [
    { value: total_messages?.toLocaleString() ?? "—", label: "Messages", icon: "💬", color: "var(--accent-indigo)" },
    { value: total_users ?? "—", label: "Active Users", icon: "👥", color: "var(--accent-cyan)" },
    { value: total_topics ?? "—", label: "Topics", icon: "🏷️", color: "var(--accent-violet)" },
    {
      value: overall_sentiment ? `${Math.round(overall_sentiment.positive * 100)}%` : "—",
      label: "Positive",
      icon: "😊",
      color: "var(--accent-green)",
    },
  ];

  return (
    <div className="summary-cards" id="summary-cards">
      {cards.map((c) => (
        <div className="card" key={c.label} style={{ "--card-accent": c.color }}>
          <span className="card-icon">{c.icon}</span>
          <span className="card-value">{c.value}</span>
          <span className="card-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
