export default function TopicList({ topics }) {
  if (!topics || topics.length === 0) {
    return <p className="no-topics">No topics detected for this day.</p>;
  }

  return (
    <div className="topic-list" id="topic-list">
      <h2>Topic Rankings</h2>
      <div className="topic-grid">
        {topics.map((t) => (
          <div key={t.topic_rank} className="topic-card">
            <div className="topic-header">
              <span className="topic-rank">#{t.topic_rank}</span>
              <span className="topic-name">{t.topic_name}</span>
              <span className="topic-score">
                {(t.engagement_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="topic-meta">
              <span>💬 {t.message_count} msgs</span>
              <span>👥 {t.unique_users} users</span>
              <span>⏱️ {Math.round(t.duration_minutes)} min</span>
              <span>🕐 {t.peak_hour}:00 UTC</span>
            </div>
            <div className="topic-initiator">
              Started by <strong>{t.initiator_username}</strong>
            </div>
            <div className="topic-sentiment-bar">
              <div
                className="sentiment-segment positive"
                style={{ width: `${t.sentiment_dist.positive * 100}%` }}
                title={`Positive: ${Math.round(t.sentiment_dist.positive * 100)}%`}
              />
              <div
                className="sentiment-segment neutral"
                style={{ width: `${t.sentiment_dist.neutral * 100}%` }}
                title={`Neutral: ${Math.round(t.sentiment_dist.neutral * 100)}%`}
              />
              <div
                className="sentiment-segment negative"
                style={{ width: `${t.sentiment_dist.negative * 100}%` }}
                title={`Negative: ${Math.round(t.sentiment_dist.negative * 100)}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
