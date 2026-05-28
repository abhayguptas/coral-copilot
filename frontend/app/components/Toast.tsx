'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from '../styles/Toast.module.css';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            <div className={styles.icon}>
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className={styles.message}>{toast.message}</div>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
