'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SourceCard from '../components/SourceCard';
import ConfigModal from '../components/ConfigModal';
import { useToast } from '../contexts/ToastContext';
import styles from '../styles/Marketplace.module.css';

interface Source {
  name: string;
  status: 'installed' | 'available';
  category?: 'core' | 'community';
}

export default function Marketplace() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'installed' | 'available' | 'core' | 'community'>('all');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchSources = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sources/discover');
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSources();
  }, []);

  const handleInstallClick = (name: string) => {
    setSelectedSource(name);
  };

  const handleConfigSubmit = async (token: string) => {
    if (!selectedSource) return;

    try {
      const response = await fetch(`http://localhost:8000/api/sources/add/${selectedSource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (response.ok) {
        showToast(`Successfully connected to ${selectedSource}!`, 'success');
        setSelectedSource(null);
        await fetchSources();
      } else {
        const errData = await response.json().catch(() => ({}));
        showToast(errData.detail || `Failed to connect ${selectedSource}.`, 'error');
      }
    } catch (error) {
      console.error('Install error:', error);
      showToast(`Network error while connecting ${selectedSource}.`, 'error');
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter(source => {
      // 1. Text Search filter
      if (searchQuery.trim() && !source.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // 2. Tab/Category filter
      if (filterType === 'all') return true;
      if (filterType === 'installed' && source.status === 'installed') return true;
      if (filterType === 'available' && source.status === 'available') return true;
      if (filterType === 'core' && source.category === 'core') return true;
      if (filterType === 'community' && source.category === 'community') return true;
      
      return false;
    });
  }, [sources, searchQuery, filterType]);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'installed', label: 'Installed' },
    { id: 'available', label: 'Available' },
    { id: 'core', label: 'Core Skills' },
    { id: 'community', label: 'Community Skills' }
  ] as const;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.title}>Skill Marketplace</h1>
              <div className={styles.searchWrapper}>
                <input 
                  type="text" 
                  placeholder="Search skills..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <p className={styles.subtitle}>
              Connect your SaaS tools to expand Copilot&apos;s capabilities. 
              The agent dynamically learns the schema for every connected skill.
            </p>
            
            <div className={styles.filterTabs}>
              {filterOptions.map(option => (
                <button
                  key={option.id}
                  className={`${styles.filterTab} ${filterType === option.id ? styles.activeTab : ''}`}
                  onClick={() => setFilterType(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Loading skills...</div>
          ) : (
            <div className={styles.grid}>
              {filteredSources.length > 0 ? (
                filteredSources.map((source) => (
                  <SourceCard 
                    key={source.name} 
                    source={source} 
                    onInstall={handleInstallClick} 
                  />
                ))
              ) : (
                <div className={styles.noResults}>No skills found matching &quot;{searchQuery}&quot;</div>
              )}
            </div>
          )}
        </div>
      </main>

      <ConfigModal 
        isOpen={!!selectedSource}
        sourceName={selectedSource || ''}
        onClose={() => setSelectedSource(null)}
        onSubmit={handleConfigSubmit}
      />
    </>
  );
}
