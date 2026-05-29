import { useState, useEffect } from 'react';
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
  const [health, setHealth] = useState<'healthy' | 'unhealthy' | 'loading' | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  
  const isInstalled = source.status === 'installed';

  useEffect(() => {
    if (isInstalled) {
      setHealth('loading');
      fetch(`http://localhost:8000/api/sources/health/${source.name.toLowerCase()}`)
        .then(res => res.json())
        .then(data => {
          setHealth(data.status);
          setHealthError(data.error || null);
        })
        .catch(err => {
          setHealth('unhealthy');
          setHealthError('Network error');
        });
    }
  }, [isInstalled, source.name]);

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
            {isInstalled && health && (
              <div 
                className={`${styles.healthDot} ${health === 'healthy' ? styles.healthGood : health === 'unhealthy' ? styles.healthBad : styles.healthLoading}`}
                title={health === 'healthy' ? 'Connected' : health === 'unhealthy' ? `Connection failed: ${healthError || 'Unknown'}` : 'Checking connection...'}
              />
            )}
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
          <button 
            className={styles.manageBtn} 
            onClick={handleInstall}
            disabled={isInstalling}
          >
            {isInstalling ? 'Updating...' : 'Update Token'}
          </button>
        )}
      </div>
    </div>
  );
}
