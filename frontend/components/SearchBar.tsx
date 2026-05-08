"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: SearchBarProps) {
  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <form
      className="searchBar"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onSubmit();
        }
      }}
    >
      <input
        className="searchInput"
        type="text"
        value={value}
        placeholder="Try: black running shoes under 100"
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search products"
        disabled={disabled}
      />
      <button className="searchButton" type="submit" disabled={!canSubmit}>
        {disabled ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
