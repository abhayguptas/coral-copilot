'use client';

import { useState, useEffect } from 'react';
import { History, X, Trash2, Clock } from 'lucide-react';
import styles from '../styles/QueryHistory.module.css';

export interface QueryEntry {
  id: string;
  question: string;
  sql?: string;
  timestamp: number;
}

interface QueryHistoryProps {
  onSelectQuery: (question: string) => void;
  entries: QueryEntry[];
  onClear: () => void;
}

export default function QueryHistory({ onSelectQuery, entries, onClear }: QueryHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (entries.length === 0 && !isOpen) return null;

  return (
    <>
      <button
        className={styles.toggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        title="Query History"
      >
        <History size={20} />
        {entries.length > 0 && (
          <span className={styles.badge}>{entries.length}</span>
        )}
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <History size={18} /> Query History
          </h3>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.list}>
          {entries.length === 0 ? (
            <div className={styles.empty}>
              <Clock size={32} />
              <p>No queries yet</p>
            </div>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                className={styles.entry}
                onClick={() => {
                  onSelectQuery(entry.question);
                  setIsOpen(false);
                }}
              >
                <span className={styles.question}>{entry.question}</span>
                {entry.sql && (
                  <code className={styles.sql}>{entry.sql.slice(0, 80)}{entry.sql.length > 80 ? '...' : ''}</code>
                )}
                <span className={styles.time}>{formatTime(entry.timestamp)}</span>
              </button>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.clearBtn} onClick={onClear}>
              <Trash2 size={14} /> Clear History
            </button>
          </div>
        )}
      </div>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  );
}
