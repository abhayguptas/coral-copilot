import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import styles from '../styles/DashboardSummary.module.css';

interface SummaryCard {
  title: string;
  value: string;
  source: string;
  action: string;
}

interface DashboardSummaryProps {
  onAction: (text: string) => void;
}

export default function DashboardSummary({ onAction }: DashboardSummaryProps) {
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('http://localhost:8000/api/dashboard/summary');
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.spinner} size={24} />
        <span>Loading your morning briefing...</span>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2>Welcome to Coral Copilot</h2>
        <p>You don&apos;t have any connected sources with active items.</p>
        <p className={styles.subtext}>Try asking: &quot;What can you do with GitHub?&quot;</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Morning Briefing</h2>
      <div className={styles.grid}>
        {cards.map((card, idx) => (
          <div key={idx} className={styles.card} onClick={() => onAction(card.action)}>
            <div className={styles.cardHeader}>
              <span className={styles.sourceTag}>{card.source}</span>
            </div>
            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.cardAction}>
              {card.action} <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
