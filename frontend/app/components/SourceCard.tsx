import { useState } from 'react';
import { Database } from 'lucide-react';
import styles from '../styles/SourceCard.module.css';

interface Source {
  name: string;
  status: 'installed' | 'available';
  category?: 'core' | 'community';
}

interface SourceCardProps {
  source: Source;
  onInstall: (name: string) => void;
}

export default function SourceCard({ source, onInstall }: SourceCardProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const isInstalled = source.status === 'installed';

  const handleInstall = async () => {
    setIsInstalling(true);
    await onInstall(source.name);
    setIsInstalling(false);
  };

  return (
    <div className={`${styles.card} ${isInstalled ? styles.installed : ''}`}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Database size={24} color="var(--text-primary)" />
        </div>
        <div className={styles.titleGroup}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{source.name}</h3>
            {source.category === 'community' && (
              <span className={styles.communityBadge}>Community</span>
            )}
          </div>
          <span className={`${styles.badge} ${isInstalled ? styles.badgeInstalled : styles.badgeAvailable}`}>
            {isInstalled ? 'Installed' : 'Available'}
          </span>
        </div>
      </div>
      
      <div className={styles.actions}>
        {!isInstalled ? (
          <button 
            className={styles.installBtn} 
            onClick={handleInstall}
            disabled={isInstalling}
          >
            {isInstalling ? 'Installing...' : 'Connect Skill'}
          </button>
        ) : (
          <button className={styles.manageBtn} disabled>
            Manage Config (CLI)
          </button>
        )}
      </div>
    </div>
  );
}
