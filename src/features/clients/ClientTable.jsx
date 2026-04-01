import { useNavigate } from 'react-router-dom';
import styles from './ClientTable.module.css';

export default function ClientTable({ clients, onRowClick }) {
  const navigate = useNavigate();

  if (!clients?.length) {
    return <div className={styles.empty}>Nema klijenata za prikaz.</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ime</th>
            <th>Prezime</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Adresa</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, i) => (
            <tr key={client.id ?? client.email ?? i} onClick={() => onRowClick?.(client.id)}>
              <td className={styles.name}>{client.first_name}</td>
              <td className={styles.name}>{client.last_name}</td>
              <td className={styles.email}>{client.email}</td>
              <td className={styles.phone}>{client.phone}</td>
              <td className={styles.address}>{client.address}</td>
              <td>
                <span className={`${styles.badge} ${client.active ? styles.badgeActive : styles.badgeInactive}`}>
                  {client.active ? 'Aktivan' : 'Neaktivan'}
                </span>
              </td>
              <td>
                <button
                  className={styles.btnProfil}
                  onClick={e => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                >
                  Profil →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
