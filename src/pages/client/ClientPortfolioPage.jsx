import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useAuthStore } from '../../store/authStore';
import { portfolioApi } from '../../api/endpoints/portfolio'; // Zakomentarisano
import ClientHeader from '../../components/layout/ClientHeader';
import PortfolioTable from '../../features/portfolio/PortfolioTable';
import ProfitSummary from '../../features/portfolio/ProfitSummary';
import TaxSummary from '../../features/portfolio/TaxSummary';
import styles from './ClientPortfolioPage.module.css';

const MOCK_PORTFOLIO = {
  stocks: [
    { 
      id: 1, 
      ticker: 'AAPL',           // Bilo je symbol
      name: 'Apple Inc.', 
      amount: 10,               // Bilo je quantity
      price: 175.20, 
      profit: 25.50,            // Dodato polje za profit kolonu
      lastModified: '21-03-2026', 
      type: 'STOCK' 
    },
    { 
      id: 2, 
      ticker: 'TSLA', 
      name: 'Tesla Motors', 
      amount: 5, 
      price: 160.50, 
      profit: -12.30,           // Negativan profit
      lastModified: '21-03-2026',
      type: 'STOCK' 
    },
    { 
      id: 3, 
      ticker: 'MSFT', 
      name: 'Microsoft', 
      amount: 8, 
      price: 420.10, 
      profit: 105.00, 
      lastModified: '21-03-2026',
      type: 'STOCK' 
    }
  ],
  tax: {
    taxPaid: 1250.50,   // Komponenta traži stats.taxPaid
    taxUnpaid: 340.20   // Komponenta traži stats.taxUnpaid
  }
};

export default function ClientPortfolioPage() {
  const pageRef = useRef(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const user = useAuthStore(s => s.user);
  const initFromStorage = useAuthStore(s => s.initFromStorage);

  // 1. Inicijalizacija korisnika
  useEffect(() => {
    if (!user) initFromStorage();
  }, [user, initFromStorage]);

  // 2. Učitavanje podataka - SADA KORISTI MOCK
  useEffect(() => {
    const loadData = async () => {
      // if (!user?.id) return; // Možeš ostaviti ili skloniti dok testiraš mock
try {
  setLoading(true);
  const res = await portfolioApi.getClientPortfolio(user.id);
  setPortfolio(res.data);
} catch (err) {
  console.error("API ne radi, koristim mock podatke:", err);
  // OVO TI OMOGUĆAVA DA RADIŠ DALJE NA UI DOK JE BACKEND OFFLINE
  setPortfolio(MOCK_PORTFOLIO); 
} finally {
  setLoading(false);
}
    };
    loadData();
  }, [user]);

  // 3. GSAP Animacija
  useLayoutEffect(() => {
    if (!loading && portfolio) {
      const ctx = gsap.context(() => {
        gsap.from('.page-anim', { 
          opacity: 0, 
          y: 20, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: 'power2.out' 
        });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, portfolio]);

  if (loading) return <div className={styles.loader}>Učitavanje vašeg portfolija...</div>;
  if (!portfolio) return <div className={styles.error}>Nije moguće učitati podatke portfolija.</div>;

  return (
    <div ref={pageRef} className={styles.stranica}>
      <ClientHeader activeNav="portfolio" />
      
      <main className={styles.sadrzaj}>
        
        {/* Header Sekcija */}
        <div className="page-anim">
          <div className={styles.breadcrumb}><span>Moj nalog</span></div>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Moj Portfolio</h1>
              <p className={styles.pageDesc}>Pregled vaših akcija i poresko stanje u realnom vremenu.</p>
            </div>
            <TaxSummary stats={portfolio.tax} />
          </div>
        </div>

        {/* Profitna kartica */}
        <div className="page-anim">
          <ProfitSummary assets={portfolio.stocks} />
        </div>

        {/* Tabela sa akcijama */}
        <div className={`page-anim ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <h3>Moje akcije (Stocks)</h3>
          </div>
          <PortfolioTable 
            assets={portfolio.stocks} 
            isAdmin={false} 
          />
        </div>

        {/* Info labela */}
        <div className="page-anim" style={{ marginTop: '32px', paddingBottom: '40px' }}>
          <div style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '16px', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              💡 <strong>Napomena:</strong> Za prodaju određenih akcija kliknite na dugme <strong>SELL</strong>. 
              Sredstva će biti automatski prebačena na vaš primarni račun nakon obrade transakcije.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}