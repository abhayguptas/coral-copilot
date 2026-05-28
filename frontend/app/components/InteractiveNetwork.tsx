'use client';

import { motion } from 'framer-motion';
import { Database, GitPullRequest, MessageSquare, AlertTriangle } from 'lucide-react';
import Logo from './Logo';
import styles from '../styles/InteractiveNetwork.module.css';

export default function InteractiveNetwork() {
  return (
    <div className={styles.container}>
      <svg className={styles.lines}>
        <motion.line 
          x1="50%" y1="50%" x2="25%" y2="25%" 
          stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="75%" y2="25%" 
          stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="25%" y2="75%" 
          stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.line 
          x1="50%" y1="50%" x2="75%" y2="75%" 
          stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="5 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <motion.div 
        className={styles.centerNode}
        whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <Logo size={40} />
      </motion.div>

      <motion.div 
        className={`${styles.orbitNode} ${styles.tl}`}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
      >
        <GitPullRequest size={20} color="#a5b4fc" />
      </motion.div>

      <motion.div 
        className={`${styles.orbitNode} ${styles.tr}`}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.8 }}
      >
        <MessageSquare size={20} color="#a5b4fc" />
      </motion.div>

      <motion.div 
        className={`${styles.orbitNode} ${styles.bl}`}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 1.2 }}
      >
        <Database size={20} color="#a5b4fc" />
      </motion.div>

      <motion.div 
        className={`${styles.orbitNode} ${styles.br}`}
        whileHover={{ scale: 1.2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
      >
        <AlertTriangle size={20} color="#a5b4fc" />
      </motion.div>

      <div className={styles.pulseRing}></div>
    </div>
  );
}
