export default function TopicList({ topics, onTopicClick }) {
  if (!topics || topics.length === 0) {
    return <p className="no-topics">No topics detected for this day.</p>;
  }

  return (
    <div className="topic-list" id="topic-list">
      <h2>Topic Rankings</h2>
      <div className="sentiment-legend">
        {['excited', 'happy', 'curious', 'neutral', 'frustrated', 'angry', 'sad', 'confused'].map(s => (
          <span key={s} className="legend-item">
            <span className={`legend-color ${s}`}></span>
            {s}
          </span>
        ))}
      </div>
      <div className="topic-grid">
        {topics.map((t) => {
          const dominantSentiment = Object.entries(t.sentiment_dist || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
          return (
          <div key={t.topic_rank} className="topic-card" onClick={() => onTopicClick?.(t)}>
            <div className="topic-header">
              <span className="topic-rank">#{t.topic_rank}</span>
              <span className="topic-name">{t.topic_name}</span>
              <span className="topic-dominant-sentiment">{dominantSentiment}</span>
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
              {['excited', 'happy', 'curious', 'neutral', 'frustrated', 'angry', 'sad', 'confused'].map(sentiment => {
                const val = t.sentiment_dist[sentiment] || 0;
                if (val === 0) return null;
                return (
                  <div
                    key={sentiment}
                    className={`sentiment-segment ${sentiment}`}
                    style={{ width: `${val * 100}%` }}
                    title={`${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}: ${Math.round(val * 100)}%`}
                  />
                );
              })}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
