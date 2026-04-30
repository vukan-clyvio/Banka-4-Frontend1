import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

import { investmentFundsApi } from '../../api/endpoints/investmentFunds';
import { useFetch } from '../../hooks/useFetch';
import { useAuthStore } from '../../store/authStore';

import ClientHeader from '../../components/layout/ClientHeader';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

import styles from './ClientFundsPage.module.css';
import { getErrorMessage } from '../../utils/apiError';

export default function ClientFundsPage() {
  const pageRef = useRef(null);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isActuary = user?.identity_type === 'actuary';
  const actId = user?.actuary_id ?? user?.identity_id ?? user?.id;

  const [onlyMine, setOnlyMine] = useState(false);

  const fetcher = () => {
    if (isActuary && onlyMine && actId) {
      return investmentFundsApi.getFundsManagedByActuary(actId);
    }
    return investmentFundsApi.getFunds();
  };

  const { data: rawFunds, loading, error, refetch } = useFetch(fetcher, [
    isActuary,
    onlyMine,
    actId,
  ]);

  const funds = useMemo(() => {
    return Array.isArray(rawFunds) ? rawFunds : rawFunds?.data ?? rawFunds?.content ?? [];
  }, [rawFunds]);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from('.page-anim', {
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
      });
    }, pageRef);
    return () => ctx.revert();
  }, [loading]);

  return (
    <div ref={pageRef} className={styles.page}>
      <ClientHeader activeNav="funds" />

      <main className={styles.content}>
        <div className="page-anim">
          <p className={styles.breadcrumb}>Investicioni fondovi</p>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Investicioni fondovi</h1>
              <p className={styles.pageDesc}>Pregled svih dostupnih investicionih fondova.</p>
            </div>

            {/* Toggle: only for actuary accounts (if this page is reused for them) */}
            {isActuary && (
              <button
                className={styles.btnGhost}
                onClick={() => setOnlyMine((v) => !v)}
                disabled={!actId}
                title={!actId ? 'Nedostaje actId u user objektu.' : undefined}
              >
                {onlyMine ? 'Prikaži sve fondove' : 'Moji fondovi'}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="page-anim">
            <Alert tip="greska" poruka={getErrorMessage(error, 'Greška pri učitavanju fondova.')} />
            <button className={styles.btnGhost} onClick={refetch} style={{ marginTop: 12 }}>
              Pokušaj ponovo
            </button>
          </div>
        ) : (
          <section className={`page-anim ${styles.card}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Dostupni fondovi</h2>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Naziv fonda</th>
                    <th>Menadžer</th>
                    <th>Opis</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {funds.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyTable}>
                        Nema dostupnih fondova.
                      </td>
                    </tr>
                  ) : (
                    funds.map((fund) => {
                      const fundId = fund.id ?? fund.fund_id ?? fund.fundId;
                      const managerName =
                        [
                          fund.manager?.first_name ?? fund.manager?.firstName ?? '',
                          fund.manager?.last_name ?? fund.manager?.lastName ?? '',
                        ]
                          .filter(Boolean)
                          .join(' ') || '—';

                      return (
                        <tr key={fundId}>
                          <td className={styles.fundName}>{fund.name ?? fund.fund_name ?? '—'}</td>
                          <td>{managerName}</td>
                          <td className={styles.fundDesc}>{fund.description ?? '—'}</td>
                          <td>
                            <button
                              className={styles.btnPrimary}
                              onClick={() => navigate(`/client/investment-funds/${fundId}`)}
                            >
                              Detalji
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}