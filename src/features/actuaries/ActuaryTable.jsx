import styles from './ActuaryTable.module.css';

const NON_AGENT_POSITIONS = ['supervisor', 'supervizor', 'admin', 'administrator'];

function isAgent(actuary) {
  const pos = actuary.position?.toLowerCase() ?? '';
  return !NON_AGENT_POSITIONS.some(p => pos.includes(p));
}

export default function ActuaryTable({ actuaries, onChangeLimit, onResetUsedLimit }) {
  if (!actuaries?.length) {
    return <div className={styles.empty}>Nema aktuara za prikaz.</div>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ime</th>
            <th>Prezime</th>
            <th>Email</th>
            <th>Pozicija</th>
            <th>Limit</th>
            <th>Iskorišćen limit</th>
            <th>Need Approval</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {actuaries.map(actuary => (
            <tr key={actuary.id}>
              <td className={styles.name}>{actuary.first_name}</td>
              <td className={styles.name}>{actuary.last_name}</td>
              <td className={styles.email}>{actuary.email}</td>
              <td>{actuary.position}</td>
              <td>{actuary.limit?.toLocaleString('sr-RS')} RSD</td>
              <td>{actuary.used_limit?.toLocaleString('sr-RS')} RSD</td>
              <td>
                <span className={`${styles.badge} ${actuary.need_approval ? styles.badgeYes : styles.badgeNo}`}>
                  {actuary.need_approval ? 'Da' : 'Ne'}
                </span>
              </td>
              <td className={styles.actions}>
                {isAgent(actuary) && (
                  <>
                    <button
                      className={styles.btnAction}
                      onClick={() => onChangeLimit(actuary)}
                    >
                      Promeni limit
                    </button>
                    <button
                      className={`${styles.btnAction} ${styles.btnReset}`}
                      onClick={() => onResetUsedLimit(actuary)}
                    >
                      Resetuj
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
