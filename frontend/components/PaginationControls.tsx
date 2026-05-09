type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="pagination" aria-label="Results pagination">
      <p className="paginationSummary">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
        <strong>{totalItems}</strong>
      </p>
      <div className="paginationActions">
        <button
          type="button"
          className="paginationButton"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="paginationPageLabel" aria-current="page">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="paginationButton"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
