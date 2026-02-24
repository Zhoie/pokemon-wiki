import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import styles from './Pagination.module.css';

function getVisiblePages(page, totalPages) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const slots = [];
  let previous = null;

  pages.forEach((value) => {
    if (previous !== null && value - previous > 1) {
      slots.push(`gap-${value}`);
    }

    slots.push(value);
    previous = value;
  });

  return slots;
}

export default function Pagination({ page, totalPages, onPageChange, disabled = false }) {
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pokemon pagination">
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <CaretLeft size={14} aria-hidden="true" />
        Prev
      </button>

      <div className={styles.pageButtons}>
        {visiblePages.map((value) => {
          if (typeof value !== 'number') {
            return (
              <span key={value} className={styles.dots} aria-hidden="true">
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={value}
              className={`${styles.pageButton} ${value === page ? styles.active : ''}`}
              onClick={() => onPageChange(value)}
              disabled={disabled || value === page}
              aria-current={value === page ? 'page' : undefined}
            >
              {value}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Next
        <CaretRight size={14} aria-hidden="true" />
      </button>

      <p className={styles.summary}>
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}
