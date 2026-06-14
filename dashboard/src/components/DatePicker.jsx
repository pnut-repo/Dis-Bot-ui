export default function DatePicker({ dates, selected, onChange }) {
  return (
    <select
      id="date-picker"
      value={selected || ""}
      onChange={(e) => onChange(e.target.value)}
      className="date-picker"
    >
      {dates.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}
