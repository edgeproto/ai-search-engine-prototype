export type ResultViewMode = "grid" | "list";

type ViewModeToggleProps = {
  value: ResultViewMode;
  onChange: (mode: ResultViewMode) => void;
  disabled?: boolean;
};

export function ViewModeToggle({ value, onChange, disabled }: ViewModeToggleProps) {
  return (
    <div className="viewModeToggle" role="group" aria-label="Product layout">
      <span className="viewModeLabel">View</span>
      <div className="viewModeSegmented">
        <button
          type="button"
          className={`viewModeButton${value === "grid" ? " viewModeButtonActive" : ""}`}
          onClick={() => onChange("grid")}
          disabled={disabled}
          aria-pressed={value === "grid"}
        >
          <svg
            className="viewModeSvg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            aria-hidden
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"
            />
          </svg>
          Grid
        </button>
        <button
          type="button"
          className={`viewModeButton${value === "list" ? " viewModeButtonActive" : ""}`}
          onClick={() => onChange("list")}
          disabled={disabled}
          aria-pressed={value === "list"}
        >
          <svg
            className="viewModeSvg"
            width={16}
            height={16}
            viewBox="0 0 16 16"
            aria-hidden
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M1 3h14v2H1V3zm0 4h14v2H1V7zm0 4h10v2H1v-2z"
            />
          </svg>
          List
        </button>
      </div>
    </div>
  );
}
