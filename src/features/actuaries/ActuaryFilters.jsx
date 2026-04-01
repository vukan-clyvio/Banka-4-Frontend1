import styles from './ActuaryFilters.module.css';

export default function ActuaryFilters({ filters, onFilterChange }) {
  function update(key, value) {
    onFilterChange({ ...filters, [key]: value });
  }

  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder="Email..."
        value={filters.email}
        onChange={e => update('email', e.target.value)}
        className={styles.searchInput}
      />
      <input
        type="text"
        placeholder="Ime..."
        value={filters.first_name}
        onChange={e => update('first_name', e.target.value)}
      />
      <input
        type="text"
        placeholder="Prezime..."
        value={filters.last_name}
        onChange={e => update('last_name', e.target.value)}
      />
      <input
        type="text"
        placeholder="Pozicija..."
        value={filters.position}
        onChange={e => update('position', e.target.value)}
      />
    </div>
  );
}
