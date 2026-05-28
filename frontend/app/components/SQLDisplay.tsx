import { useState, useEffect } from 'react';
import styles from '../styles/SQLDisplay.module.css';

interface SQLDisplayProps {
  code: string;
}

export default function SQLDisplay({ code }: SQLDisplayProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!code) return;
    
    // Typewriter effect
    let i = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTyping(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedCode('');
    
    const interval = setInterval(() => {
      setDisplayedCode(code.substring(0, i));
      i++;
      if (i > code.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15); // Adjust typing speed here

    return () => clearInterval(interval);
  }, [code]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.dot} style={{ backgroundColor: '#ff5f56' }}></span>
        <span className={styles.dot} style={{ backgroundColor: '#ffbd2e' }}></span>
        <span className={styles.dot} style={{ backgroundColor: '#27c93f' }}></span>
        <span className={styles.title}>Coral SQL</span>
      </div>
      <pre className={styles.codeBlock}>
        <code>
          {displayedCode}
          {isTyping && <span className={styles.cursor}>|</span>}
        </code>
      </pre>
    </div>
  );
}
