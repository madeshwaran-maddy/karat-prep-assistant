import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../reviewer-dashboard.module.css";

export const TABLE_PAGE_SIZE = 10;

type TablePaginationProps = {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({ page, totalItems, onPageChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label="Table pagination">
      <button
        type="button"
        className={styles.paginationButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        type="button"
        className={styles.paginationButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
