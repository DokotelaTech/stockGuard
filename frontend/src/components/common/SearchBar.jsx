import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <label className={`global-search ${className}`.trim()}>
      <Search size={18} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
