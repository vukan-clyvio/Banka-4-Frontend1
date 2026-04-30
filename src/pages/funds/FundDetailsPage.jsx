import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';

import { investmentFundsApi } from '../../api/endpoints/investmentFunds';
import { accountsApi } from '../../api/endpoints/accounts';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuthStore } from '../../store/authStore';

import ClientHeader from '../../components/layout/ClientHeader';
import Navbar from '../../components/layout/Navbar';
import Alert from '../../components/ui/Alert';

import styles from './FundDetailsPage.module.css';
import { getErrorMessage } from '../../utils/apiError';

export default function FundDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const perms = usePermissions();

  const isSupervisor =
    (perms?.isSupervisor ?? false) ||
    Boolean(perms?.can?.('admin.all')) ||
    Boolean(perms?.can?.('investment.fund.manage'));

  const isClient = user?.identity_type === 'client';

  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [feedback, setFeedback] = useState(null);

  // Invest modal
  const [investOpen, setInvestOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investAccountNumber, setInvestAccountNumber] = useState('');
  const [investSubmitting, setInvestSubmitting] = useState(false);

  // Client accounts
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Profit
  const [fundProfit, setFundProfit] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);

  // Derived IDs
  const fundId = fund?.fund_id ?? fund?.id ?? fund?.fundId;

  // ---- LOAD FUND (from list endpoint) ----
  useEffect(() => {
    let alive = true;

    async function loadFund() {
      try {
        setLoading(true);
        setError('');

        // IMPORTANT: tradingApi interceptor returns payload directly (res.data)
        const payload = await investmentFundsApi.getFunds(); // your existing working list endpoint

        const list =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.data) ? payload.data :
          Array.isArray(payload?.content) ? payload.content :
          Array.isArray(payload?.data?.data) ? payload.data.data :
          Array.isArray(payload?.data?.content) ? payload.data.content :
          [];

        const found = list.find((f) => {
          const fid = f?.fund_id ?? f?.id ?? f?.fundId;
          return String(fid) === String(id);
        });

        if (!alive) return;

        if (!found) {
          setFund(null);
          setError('Fond nije pronađen.');
          return;
        }

        setFund(found);
      } catch (e) {
        console.error('FundDetailsPage load error:', e);
        if (!alive) return;
        setError(getErrorMessage(e, 'Greška pri učitavanju fonda. Proverite vezu sa serverom.'));
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) loadFund();
    return () => { alive = false; };
  }, [id]);

  // ---- LOAD CLIENT ACCOUNTS (for invest) ----
  useEffect(() => {
    if (!isClient) return;

    let alive = true;
    const clientId = user?.client_id ?? user?.identity_id ?? user?.id;
    if (!clientId) return;

    const loadAccounts = async () => {
      try {
        setAccountsLoading(true);

        const payload = await accountsApi.getClientAccounts(clientId);

        const list =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.data) ? payload.data :
          Array.isArray(payload?.content) ? payload.content :
          [];

        if (!alive) return;

        setAccounts(list);

        const first = list?.[0];
        if (first?.account_number) setInvestAccountNumber(String(first.account_number));
      } catch (e) {
        console.error('loadAccounts error:', e);
        if (!alive) return;
        setAccounts([]);
      } finally {
        if (alive) setAccountsLoading(false);
      }
    };

    loadAccounts();
    return () => { alive = false; };
  }, [isClient, user]);

  // ---- LOAD PROFIT FOR THIS FUND ----
  useEffect(() => {
    let alive = true;
    if (!fundId) return;

    async function loadProfit() {
      try {
        setProfitLoading(true);

        const payload = await investmentFundsApi.getFundProfits();

        const list =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.data) ? payload.data :
          [];

        const row = list.find((p) => String(p?.fund_id ?? p?.fundId ?? p?.id) === String(fundId));

        if (!alive) return;
        setFundProfit(row ?? null);
      } catch (e) {
        console.error('loadProfit error:', e);
        if (!alive) return;
        setFundProfit(null);
      } finally {
        if (alive) setProfitLoading(false);
      }
    }

    loadProfit();
    return () => { alive = false; };
  }, [fundId]);

  // ---- ANIMATIONS ----
  useLayoutEffect(() => {
    if (loading || !fund) return;
    const ctx = gsap.context(() => {
      const nodes = pageRef.current?.querySelectorAll('.page-anim') ?? [];
      if (!nodes.length) return;
      gsap.from(nodes, { opacity: 0, y: 20, duration: 0.45, stagger: 0.08, ease: 'power2.out' });
    }, pageRef);
    return () => ctx.revert();
  }, [loading, fund]);

  const HeaderComponent = isClient ? ClientHeader : Navbar;
  const headerProps = isClient ? { activeNav: 'funds' } : {};

  const managerName = useMemo(() => {
    const m = fund?.manager ?? fund?.actuary ?? fund?.fund_manager ?? null;
    const first = m?.first_name ?? m?.firstName ?? '';
    const last = m?.last_name ?? m?.lastName ?? '';
    const full = `${first} ${last}`.trim();
    return full || fund?.manager_name || '—';
  }, [fund]);

  const minInvestment =
    fund?.minimumInvestment ??
    fund?.minimum_investment ??
    fund?.minimum_investment_rsd ??
    null;

  const liquidity =
    fund?.liquidity ??
    fund?.liquidity_rsd ??
    fund?.available_liquidity_rsd ??
    null;

  const fundAccountNumber =
    fund?.fund_account?.account_number ??
    fund?.account_number ??
    fund?.bank_account_number ??
    fund?.fund_account_number ??
    '—';

  async function handleInvestSubmit(e) {
    e.preventDefault();

    const amount = Number(investAmount);

    if (!investAccountNumber) {
      setFeedback({ type: 'greska', text: 'Izaberite račun sa kog investirate.' });
      return;
    }

    if (!investAmount || Number.isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'greska', text: 'Unesite validan iznos.' });
      return;
    }

    const min = Number(minInvestment);
    if (!Number.isNaN(min) && min > 0 && amount < min) {
      setFeedback({ type: 'greska', text: `Minimalni ulog je ${formatRSD(min)}.` });
      return;
    }

    try {
      setInvestSubmitting(true);
      setFeedback(null);

      // Keep multiple keys until swagger request schema is confirmed
      await investmentFundsApi.investInFund(fundId, {
        amount,
        accountNumber: String(investAccountNumber),
        AccountNumber: String(investAccountNumber),
        account_number: String(investAccountNumber),
      });

      setFeedback({ type: 'uspeh', text: 'Investicija je uspešno evidentirana.' });
      setInvestOpen(false);
      setInvestAmount('');
    } catch (err) {
      setFeedback({ type: 'greska', text: getErrorMessage(err, 'Investiranje nije uspelo.') });
    } finally {
      setInvestSubmitting(false);
    }
  }

  // ---- STATES ----
  if (loading) {
    return (
      <div className={styles.page}>
        <HeaderComponent {...headerProps} />
        <div className={styles.loadingState}>Učitavanje...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <HeaderComponent {...headerProps} />
        <main className={styles.content}>
          <Alert tip="greska" poruka={error} />
        </main>
      </div>
    );
  }

  if (!fund) return null;

  return (
    <div ref={pageRef} className={styles.page}>
      <HeaderComponent {...headerProps} />

      <main className={styles.content}>
        {/* Breadcrumb */}
        <div className={`page-anim ${styles.breadcrumb}`}>
          <button
            className={styles.breadcrumbLink}
            onClick={() => navigate(isClient ? '/client/investment-funds' : '/profit-bank')}
          >
            Investicioni fondovi
          </button>
          <span className={styles.breadcrumbSep}>›</span>
          <span>{fund.name ?? fund.fund_name ?? 'Fond'}</span>
        </div>

        {/* Header */}
        <div className={`page-anim ${styles.pageHeader}`}>
          <div>
            <h1 className={styles.pageTitle}>{fund.name ?? fund.fund_name ?? 'Fond'}</h1>
            {(fund.description ?? '') && <p className={styles.pageDesc}>{fund.description}</p>}
          </div>
          {isSupervisor && <span className={styles.supervisorBadge}>Supervisor</span>}
        </div>

        {feedback && (
          <div className="page-anim" style={{ marginBottom: 20 }}>
            <Alert tip={feedback.type} poruka={feedback.text} />
          </div>
        )}

        {/* Info cards */}
        <section className={`page-anim ${styles.statsGrid}`}>
          <InfoCard label="Menadžer" value={managerName} />
          <InfoCard label="Minimalni ulog" value={formatRSD(minInvestment)} />
          <InfoCard label="Likvidnost" value={formatRSD(liquidity)} />
          <InfoCard label="Broj računa fonda" value={fundAccountNumber} />

          <InfoCard
            label="Profit"
            value={
              profitLoading
                ? 'Učitavanje...'
                : formatRSD(
                    fundProfit?.profit_rsd ??
                      fundProfit?.profit ??
                      fundProfit?.value ??
                      null
                  )
            }
          />

          {/* Placeholder: Fund value derived */}
          <InfoCard label="Vrednost fonda" value="—" valueClass={styles.mutedValue} />
        </section>

        <div className={`page-anim ${styles.helperText}`}>
          Vrednost fonda (likvidnost + vrednost hartija) nije dostupna dok backend ne doda endpoint za holdings fonda.
        </div>

        {/* Assets table placeholder (prepared for future endpoints) */}
        <section className={`page-anim ${styles.card}`}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardEyebrow}>Hartije</div>
              <h2 className={styles.cardTitle}>Sastav fonda</h2>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Volume</th>
                  <th>InitialMarginCost</th>
                  <th>AcquisitionDate</th>
                  {isSupervisor && <th>Akcija</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={isSupervisor ? 7 : 6} className={styles.emptyCell}>
                    Trenutno nema dostupnog endpoint-a za hartije fonda (GET assets) na backendu.
                  </td>
                </tr>

                {/* Example placeholder row if you want Sell button visible */}
                {isSupervisor && (
                  <tr>
                    <td colSpan={6} className={styles.mutedCell}>
                      (Biće dostupno kada backend doda holdings + sell endpoint.)
                    </td>
                    <td>
                      <button
                        className={styles.btnGhost}
                        disabled
                        title="Biće dostupno kada backend doda endpoint za prodaju hartije iz fonda."
                      >
                        Prodaj
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Performance placeholder */}
        <section className={`page-anim ${styles.card}`}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardEyebrow}>Performanse</div>
              <h2 className={styles.cardTitle}>Istorijski prikaz</h2>
            </div>
          </div>
          <div className={styles.emptyTable}>
            Trenutno nema dostupnog endpoint-a za performanse fonda (GET performance) na backendu.
          </div>
        </section>

        {/* Actions */}
        <section className={`page-anim ${styles.actionSection}`}>
          {isClient && (
            <>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setInvestOpen(true);
                  setInvestAmount('');
                }}
              >
                Investiraj
              </button>
              <button
                className={styles.btnGhost}
                disabled
                title="Biće dostupno kada backend doda withdraw endpoint."
              >
                Povuci sredstva
              </button>
            </>
          )}

          {isSupervisor && (
            <>
              <button
                className={styles.btnGhost}
                disabled
                title="Biće dostupno kada backend doda deposit endpoint."
              >
                Uplata u fond
              </button>
              <button
                className={styles.btnGhost}
                disabled
                title="Biće dostupno kada backend doda withdraw endpoint."
              >
                Povlačenje iz fonda
              </button>
            </>
          )}

          {/* If neither client nor supervisor, show nothing (or could show Invest as well if allowed) */}
          {!isClient && !isSupervisor && (
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setInvestOpen(true);
                setInvestAmount('');
              }}
            >
              Investiraj
            </button>
          )}
        </section>
      </main>

      {/* Invest modal */}
      {investOpen && (
        <div className={styles.modalBackdrop} onClick={() => setInvestOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Investiraj u fond</h3>
                <p className={styles.modalText}>
                  Fond: <strong>{fund.name ?? fund.fund_name}</strong>
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setInvestOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleInvestSubmit} className={styles.modalBody}>
              <div className={styles.field}>
                <label>Račun *</label>
                <select
                  value={investAccountNumber}
                  onChange={(e) => setInvestAccountNumber(e.target.value)}
                  required
                  disabled={accountsLoading || accounts.length === 0}
                >
                  {accountsLoading ? (
                    <option value="">Učitavanje računa...</option>
                  ) : accounts.length === 0 ? (
                    <option value="">Nema dostupnih računa</option>
                  ) : (
                    accounts.map((acc) => (
                      <option key={acc.account_number} value={acc.account_number}>
                        {acc.name ?? 'Račun'} — {acc.account_number}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.field}>
                <label>Iznos (RSD) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Unesite iznos..."
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setInvestOpen(false)}
                  disabled={investSubmitting}
                >
                  Otkaži
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={investSubmitting}>
                  {investSubmitting ? 'Slanje...' : 'Potvrdi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, valueClass }) {
  return (
    <div className={styles.infoCard}>
      <span className={styles.infoLabel}>{label}</span>
      <strong className={`${styles.infoValue}${valueClass ? ` ${valueClass}` : ''}`}>
        {value}
      </strong>
    </div>
  );
}

function formatRSD(value) {
  if (value == null || value === '—') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} RSD`;
}