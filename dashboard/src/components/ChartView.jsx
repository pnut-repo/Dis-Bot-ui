import { useMemo, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

/** Read a CSS custom property from :root */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function ChartView({ chartData, analytics }) {
  const [selectedUser, setSelectedUser] = useState("");

  if (!chartData) return null;

  /* Resolve CSS variables at render so they follow the active theme */
  const theme = useMemo(() => {
    const isDark = !document.documentElement.hasAttribute("data-theme") ||
                   document.documentElement.getAttribute("data-theme") === "dark";
    return {
      chart1:  cssVar("--chart-1"),
      chart2:  cssVar("--chart-2"),
      chart3:  cssVar("--chart-3") || "#a855f7",
      chart4:  cssVar("--chart-4"),
      grid:    cssVar("--chart-grid"),
      axis:    cssVar("--chart-axis"),
      tooltipBg: cssVar("--chart-tooltip-bg"),
      tooltipBorder: cssVar("--chart-tooltip-border"),
      success: cssVar("--color-success"),
      neutral: cssVar("--color-neutral"),
      danger:  cssVar("--color-danger"),
      isDark,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.documentElement.getAttribute("data-theme")]);

  const tooltipStyle = {
    background: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    fontSize: 12,
    color: theme.isDark ? "#e5e7eb" : "#111827",
  };

  const {
    hourly_volume,
    sentiment_overview,
    sentiment_by_hour,
    topic_engagement,
    user_activity,
    user_detail,
  } = chartData;

  const sentimentKeys = ["excited", "happy", "curious", "neutral", "frustrated", "angry", "sad", "confused"];
  const sentimentColors = {
    excited: "#f59e0b",
    happy: "#22c55e",
    curious: "#06b6d4",
    neutral: "#6b7280",
    frustrated: "#f97316",
    angry: "#ef4444",
    sad: "#8b5cf6",
    confused: "#ec4899",
  };

  const pieData = sentimentKeys
    .map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: sentiment_overview[key] || 0,
      color: sentimentColors[key]
    }))
    .filter(d => d.value > 0);

  // Get user detail from either chart_data or analytics API
  const userDetailData = user_detail || (analytics && analytics.user_analytics) || {};
  const userList = Object.keys(userDetailData).sort();
  const currentUserData = selectedUser ? userDetailData[selectedUser] : null;

  // User sentiment pie
  const userPieData = currentUserData ? sentimentKeys
    .map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: currentUserData.sentiment[key] || 0,
      color: sentimentColors[key]
    }))
    .filter(d => d.value > 0) : null;

  return (
    <div className="charts" id="chart-view">

      {/* 1. Message Timeline — 24h Activity Curve */}
      <section className="chart-section chart-section-wide">
        <h3>📈 Message Timeline — 24h Activity</h3>
        <p className="chart-subtitle">
          Message volume throughout the day. Peaks indicate active discussion periods.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={hourly_volume}>
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.chart1} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.chart1} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="hour"
              stroke={theme.axis}
              fontSize={12}
              tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
            />
            <YAxis stroke={theme.axis} fontSize={12} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(h) => `${String(h).padStart(2, "0")}:00 — ${String(h).padStart(2, "0")}:59`}
            />
            <Area
              type="monotoneX"
              dataKey="count"
              stroke={theme.chart1}
              fill="url(#activityGradient)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: theme.chart1, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: theme.chart1, strokeWidth: 2, fill: theme.tooltipBg }}
              name="Messages"
            />
          </AreaChart>
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
                <Cell key={entry.name} fill={entry.color} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="hour"
              stroke={theme.axis}
              fontSize={12}
              tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
            />
            <YAxis stroke={theme.axis} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            {sentimentKeys.map(key => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={sentimentColors[key]}
                fill={sentimentColors[key]}
                fillOpacity={0.1}
                strokeWidth={2}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* 4. Topic Engagement */}
      {topic_engagement && topic_engagement.length > 0 && (
        <section className="chart-section chart-section-wide">
          <h3>Top Topics by Engagement</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, topic_engagement.length * 40)}>
            <BarChart data={topic_engagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis type="number" stroke={theme.axis} fontSize={12} />
              <YAxis dataKey="name" type="category" width={160} stroke={theme.axis} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="engagement_score" fill={theme.chart2} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* 5. Most Active Users */}
      {user_activity && user_activity.length > 0 && (
        <section className="chart-section chart-section-wide">
          <h3>Most Active Users</h3>
          <ResponsiveContainer width="100%" height={Math.max(300, user_activity.length * 35)}>
            <BarChart data={user_activity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis type="number" stroke={theme.axis} fontSize={12} />
              <YAxis dataKey="username" type="category" width={120} stroke={theme.axis} fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="message_count" fill={theme.chart4} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* 6. User Dropdown Analytics */}
      {userList.length > 0 && (
        <section className="chart-section chart-section-wide user-analytics-section">
          <div className="user-analytics-header">
            <h3>👤 User Analytics</h3>
            <select
              className="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              id="user-analytics-dropdown"
            >
              <option value="">Select a user...</option>
              {userList.map((u) => (
                <option key={u} value={u}>{u} ({userDetailData[u].message_count} msgs)</option>
              ))}
            </select>
          </div>

          {currentUserData && (
            <div className="user-analytics-grid">
              {/* User Activity Timeline */}
              <div className="user-chart-card">
                <h4>{selectedUser}'s Activity Timeline</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={currentUserData.hourly_activity}>
                    <defs>
                      <linearGradient id="userActivityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.chart3} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.chart3} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                    <XAxis
                      dataKey="hour"
                      stroke={theme.axis}
                      fontSize={11}
                      tickFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                    />
                    <YAxis stroke={theme.axis} fontSize={11} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                    />
                    <Area
                      type="monotoneX"
                      dataKey="count"
                      stroke={theme.chart3}
                      fill="url(#userActivityGrad)"
                      strokeWidth={2}
                      dot={{ r: 2, fill: theme.chart3 }}
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* User Sentiment Pie */}
              <div className="user-chart-card">
                <h4>{selectedUser}'s Sentiment</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={userPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                      label={({ name, value }) => `${name} ${Math.round(value * 100)}%`}
                    >
                      {userPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* User Stats Cards */}
              <div className="user-chart-card user-stats-card">
                <h4>Stats</h4>
                <div className="user-stat-row">
                  <span className="user-stat-label">Messages</span>
                  <span className="user-stat-value">{currentUserData.message_count}</span>
                </div>
                <div className="user-stat-row">
                  <span className="user-stat-label">Active Hours</span>
                  <span className="user-stat-value">{currentUserData.active_hours?.length || 0}</span>
                </div>
                <div className="user-stat-row">
                  <span className="user-stat-label">Topics Joined</span>
                  <span className="user-stat-value">{currentUserData.topics?.length || 0}</span>
                </div>
                {currentUserData.topics && currentUserData.topics.length > 0 && (
                  <div className="user-topics-list">
                    <span className="user-stat-label">Topics:</span>
                    <div className="user-topic-tags">
                      {currentUserData.topics.map((t, i) => (
                        <span key={i} className="user-topic-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
