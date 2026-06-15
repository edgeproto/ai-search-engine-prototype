import { SORT_OPTIONS, type ResultSortOption } from "@/lib/sortProducts";

type SortSelectProps = {
  value: ResultSortOption;
  onChange: (sort: ResultSortOption) => void;
  disabled?: boolean;
};

export function SortSelect({ value, onChange, disabled }: SortSelectProps) {
  return (
    <div className="sortSelect">
      <label className="sortSelectLabel" htmlFor="result-sort">
        Sort by
      </label>
      <select
        id="result-sort"
        className="sortSelectControl"
        value={value}
        onChange={(event) => onChange(event.target.value as ResultSortOption)}
        disabled={disabled}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
