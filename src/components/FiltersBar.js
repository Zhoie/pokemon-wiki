import { ArrowsDownUp, FunnelSimple, MagnifyingGlass } from '@phosphor-icons/react';
import styles from './FiltersBar.module.css';

export const SORT_OPTIONS = [
  { value: 'id-asc', label: 'ID: Low to High' },
  { value: 'id-desc', label: 'ID: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

function toTypeLabel(value) {
  if (value === 'all') {
    return 'All';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FiltersBar({
  searchValue,
  onSearchChange,
  typeValue,
  onTypeChange,
  sortValue,
  onSortChange,
  typeOptions,
  disabled = false,
}) {
  return (
    <section className={styles.filters} aria-label="Pokemon filters">
      <label className={`${styles.field} ${styles.searchField}`} htmlFor="pokemon-search">
        <span className={styles.labelRow}>
          <MagnifyingGlass size={16} aria-hidden="true" />
          Search
        </span>
        <input
          id="pokemon-search"
          className={styles.input}
          type="search"
          placeholder="Type a Pokemon name"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          disabled={disabled}
        />
        <span className={styles.helper}>Partial names are supported.</span>
      </label>

      <label className={styles.field} htmlFor="pokemon-type">
        <span className={styles.labelRow}>
          <FunnelSimple size={16} aria-hidden="true" />
          Type
        </span>
        <select
          id="pokemon-type"
          className={styles.select}
          value={typeValue}
          onChange={(event) => onTypeChange(event.target.value)}
          disabled={disabled}
        >
          {typeOptions.map((type) => (
            <option value={type} key={type}>
              {toTypeLabel(type)}
            </option>
          ))}
        </select>
        <span className={styles.helper}>Filter by battle class.</span>
      </label>

      <label className={styles.field} htmlFor="pokemon-sort">
        <span className={styles.labelRow}>
          <ArrowsDownUp size={16} aria-hidden="true" />
          Sort
        </span>
        <select
          id="pokemon-sort"
          className={styles.select}
          value={sortValue}
          onChange={(event) => onSortChange(event.target.value)}
          disabled={disabled}
        >
          {SORT_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.helper}>Adjust ranking logic instantly.</span>
      </label>
    </section>
  );
}
