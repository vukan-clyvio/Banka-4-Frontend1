import { useEffect, useMemo, useState } from 'react';
import styles from './OTCPortalPage.module.css';
import { useAuthStore } from '../../store/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import Spinner from '../../components/ui/Spinner';
import OfferModal from './components/OfferModal';
// privremeno: mock podaci dok ne povežemo backend
const MOCK_STOCKS = [
    {
        id: '1',
        security: 'STOCK',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        amount: 120,
        price: 189.45,
        lastUpdated: '2026-04-30T10:30:00Z',
        owner: { firstName: 'Marija', lastName: 'Nikolic', bankName: 'Banka 1' },
        bankName: 'Banka 1',
    },
    {
        id: '2',
        security: 'STOCK',
        name: 'Tesla Inc.',
        symbol: 'TSLA',
        amount: 50,
        price: 172.12,
        lastUpdated: '2026-04-29T14:10:00Z',
        owner: { firstName: 'Petar', lastName: 'Ilic', bankName: 'Banka 2' },
        bankName: 'Banka 2',
    },
];

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso ?? '';
    }
}

export default function OtcPortalPage() {
    const user = useAuthStore(s => s.user);
    const { isSupervisor, canAny } = usePermissions();

    // “trade permisija” – ne znam tačan string u vašem sistemu,
    // pa ovde ostavljam fleksibilno (posle ćemo uskladiti).
    const hasTradePermission = useMemo(() => {
        // probaj da pokriješ najverovatnije permission stringove
        return canAny('trading', 'trade', 'client.trade', 'orders.create');
    }, [canAny]);

    const canSeePage = isSupervisor || (user?.identity_type === 'client' && hasTradePermission);

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);

    useEffect(() => {
        // privremeno simuliramo fetch
        setLoading(true);
        const t = setTimeout(() => {
            setRows(MOCK_STOCKS);
            setLoading(false);
        }, 250);
        return () => clearTimeout(t);
    }, []);

    if (!canSeePage) {
        return (
            <div className={styles.wrap}>
                <h1 className={styles.title}>OTC Portal</h1>
                <div className={styles.card}>
                    Nemaš permisiju za pristup OTC portalu.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrap}>
            <div className={styles.header}>
                <h1 className={styles.title}>OTC Portal</h1>
                <p className={styles.subtitle}>
                    Prikaz akcija koje su vlasnici prebacili na javni režim.
                </p>
            </div>

            <div className={styles.card}>
                {loading ? (
                    <div className={styles.center}>
                        <Spinner />
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Security</th>
                                <th>Name</th>
                                <th>Symbol</th>
                                <th className={styles.num}>Amount</th>
                                <th className={styles.num}>Price</th>
                                <th>Last Updated</th>
                                <th>Owner</th>
                                <th className={styles.actions}>Buttons</th>
                            </tr>
                            </thead>

                            <tbody>
                            {rows.map(r => {
                                const ownerText = isSupervisor
                                    ? (r.bankName ?? r.owner?.bankName ?? '')
                                    : `${r.owner?.firstName ?? ''} ${r.owner?.lastName ?? ''}, ${r.owner?.bankName ?? r.bankName ?? ''}`.trim();

                                return (
                                    <tr key={r.id}>
                                        <td>{r.security}</td>
                                        <td>{r.name}</td>
                                        <td>{r.symbol}</td>
                                        <td className={styles.num}>{r.amount}</td>
                                        <td className={styles.num}>{r.price}</td>
                                        <td>{formatDate(r.lastUpdated)}</td>
                                        <td>{ownerText}</td>
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.offerBtn}
                                                onClick={() => setSelectedStock(r)}
                                            >
                                                Offer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className={styles.empty}>
                                        Trenutno nema dostupnih akcija u OTC javnom režimu.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <OfferModal
                open={Boolean(selectedStock)}
                stock={selectedStock}
                isSupervisor={isSupervisor}
                onClose={() => setSelectedStock(null)}
                onSubmit={async (payload) => {
                    // TODO: ovde ćemo kasnije pozvati tradingApi endpoint
                    // za sada samo log
                    console.log('MAKE OFFER payload:', payload);
                    setSelectedStock(null);
                }}
            />
        </div>
    );
}