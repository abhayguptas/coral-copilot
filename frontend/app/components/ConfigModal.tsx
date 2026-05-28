'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Shield } from 'lucide-react';
import styles from '../styles/ConfigModal.module.css';

interface ConfigModalProps {
  isOpen: boolean;
  sourceName: string;
  onClose: () => void;
  onSubmit: (token: string) => Promise<void>;
}

export default function ConfigModal({ isOpen, sourceName, onClose, onSubmit }: ConfigModalProps) {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(token);
    setIsSubmitting(false);
    setToken(''); // Reset
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
          >
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <div className={styles.iconWrapper}>
                  <Shield size={20} className={styles.icon} />
                </div>
                <h2>Connect {sourceName}</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.content}>
              <p className={styles.description}>
                Enter your API Key or Bearer Token to grant Coral Copilot access. 
                Your credentials are stored securely on your local machine and never sent to our servers.
              </p>

              <div className={styles.inputGroup}>
                <label htmlFor="token">Authentication Token</label>
                <div className={styles.inputWrapper}>
                  <Key size={16} className={styles.inputIcon} />
                  <input
                    id="token"
                    type="password"
                    placeholder={`e.g. sk-${sourceName.toLowerCase()}-...`}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.footer}>
                <button type="button" onClick={onClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn} 
                  disabled={isSubmitting || !token.trim()}
                >
                  {isSubmitting ? 'Connecting...' : 'Connect Skill'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
