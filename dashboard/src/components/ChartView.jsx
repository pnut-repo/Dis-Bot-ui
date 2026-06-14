import { useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

/** Read a CSS custom property from :root */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function ChartView({ chartData }) {
  if (!chartData) return null;

  /* Resolve CSS variables at render so they follow the active theme */
  const theme = useMemo(() => {
    const isDark = !document.documentElement.hasAttribute("data-theme") ||
                   document.documentElement.getAttribute("data-theme") === "dark";
    return {
      chart1:  cssVar("--chart-1"),
      chart2:  cssVar("--chart-2"),
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
  } = chartData;

  const pieData = [
    { name: "Positive", value: sentiment_overview.positive },
    { name: "Neutral",  value: sentiment_overview.neutral },
    { name: "Negative", value: sentiment_overview.negative },
  ];

  const PIE_COLORS = [theme.success, theme.neutral, theme.danger];

  return (
    <div className="charts" id="chart-view">

      {/* 1. Hourly Message Volume */}
      <section className="chart-section">
        <h3>Message Volume by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourly_volume}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis dataKey="hour" stroke={theme.axis} fontSize={12} />
            <YAxis stroke={theme.axis} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: theme.axis }} />
            <Bar dataKey="count" fill={theme.chart1} radius={[4, 4, 0, 0]} />
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
              {pieData.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i]} />
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
            <XAxis dataKey="hour" stroke={theme.axis} fontSize={12} />
            <YAxis stroke={theme.axis} fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="positive" stackId="1" stroke={theme.success} fill={theme.success} fillOpacity={0.12} strokeWidth={2} />
            <Area type="monotone" dataKey="neutral"  stackId="1" stroke={theme.neutral}  fill={theme.neutral}  fillOpacity={0.08} strokeWidth={2} />
            <Area type="monotone" dataKey="negative" stackId="1" stroke={theme.danger}   fill={theme.danger}   fillOpacity={0.12} strokeWidth={2} />
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

      {/* 5. User Activity */}
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

    </div>
  );
}
