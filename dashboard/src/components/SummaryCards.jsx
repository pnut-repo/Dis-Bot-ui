export default function SummaryCards({ report }) {
  const { total_messages, total_users, total_topics, overall_sentiment } = report;

  const cards = [
    { value: total_messages?.toLocaleString() ?? "—", label: "Messages", icon: "💬" },
    { value: total_users ?? "—", label: "Active Users", icon: "👥" },
    { value: total_topics ?? "—", label: "Topics", icon: "🏷️" },
    {
      value: overall_sentiment ? `${Math.round(overall_sentiment.positive * 100)}%` : "—",
      label: "Positive Sentiment",
      icon: "😊",
    },
  ];

  return (
    <div className="summary-cards" id="summary-cards">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <div className="card-icon-badge">{c.icon}</div>
          <span className="card-value">{c.value}</span>
          <span className="card-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}
