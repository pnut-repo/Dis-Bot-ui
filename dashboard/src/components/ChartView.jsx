import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  positive: "#22c55e",
  neutral:  "#64748b",
  negative: "#ef4444",
};

export default function ChartView({ chartData }) {
  if (!chartData) return null;

  const {
    hourly_volume,
    sentiment_overview,
    sentiment_by_hour,
    topic_engagement,
    user_activity,
  } = chartData;

  const pieData = [
    { name: "Positive", value: sentiment_overview.positive },
    { name: "Neutral",  value: sentiment_overview.neutral },
    { name: "Negative", value: sentiment_overview.negative },
  ];

  return (
    <div className="charts" id="chart-view">

      {/* 1. Hourly Message Volume */}
      <section className="chart-section">
        <h3>Message Volume by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourly_volume}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 2. Overall Sentiment Pie */}
      <section className="chart-section">
        <h3>Overall Sentiment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={3}
              label={({ name, value }) => `${name} ${Math.round(value * 100)}%`}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* 3. Sentiment by Hour — Stacked Area */}
      <section className="chart-section chart-section-wide">
        <h3>Sentiment by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sentiment_by_hour}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="positive" stackId="1" stroke={COLORS.positive} fill={COLORS.positive} fillOpacity={0.6} />
            <Area type="monotone" dataKey="neutral"  stackId="1" stroke={COLORS.neutral}  fill={COLORS.neutral}  fillOpacity={0.4} />
            <Area type="monotone" dataKey="negative" stackId="1" stroke={COLORS.negative} fill={COLORS.negative} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* 4. Topic Engagement — Horizontal Bar */}
      {topic_engagement && topic_engagement.length > 0 && (
        <section className="chart-section chart-section-wide">
          <h3>Top Topics by Engagement</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, topic_engagement.length * 40)}>
            <BarChart data={topic_engagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" width={160} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              />
              <Bar dataKey="engagement_score" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* 5. User Activity — Horizontal Bar */}
      {user_activity && user_activity.length > 0 && (
        <section className="chart-section chart-section-wide">
          <h3>Most Active Users</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, user_activity.length * 35)}>
            <BarChart data={user_activity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="username" type="category" width={120} stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              />
              <Bar dataKey="message_count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

    </div>
  );
}
