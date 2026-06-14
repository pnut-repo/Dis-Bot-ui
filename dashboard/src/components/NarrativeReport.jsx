import ReactMarkdown from "react-markdown";

export default function NarrativeReport({ markdown }) {
  if (!markdown) return null;

  return (
    <div className="narrative-report" id="narrative-report">
      <h2>🤖 AI Daily Digest</h2>
      <div className="markdown-content">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
