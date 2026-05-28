'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/TypewriterMarkdown.module.css';

interface TypewriterMarkdownProps {
  content: string;
  speed?: number;       // ms per character
  isComplete: boolean;  // true = show all immediately (old messages)
}

export default function TypewriterMarkdown({ content, speed = 12, isComplete }: TypewriterMarkdownProps) {
  const [displayedLength, setDisplayedLength] = useState(isComplete ? content.length : 0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (isComplete) {
      setDisplayedLength(content.length);
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= speed) {
        const charsToAdd = Math.max(1, Math.floor(elapsed / speed));
        setDisplayedLength(prev => {
          const next = Math.min(prev + charsToAdd, content.length);
          return next;
        });
        lastTimeRef.current = timestamp;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [content, speed, isComplete]);

  // When content grows (streaming), keep animating
  useEffect(() => {
    if (!isComplete && displayedLength >= content.length) {
      // Content might grow later — nothing to do until it does
    }
  }, [content.length, displayedLength, isComplete]);

  const visibleText = content.slice(0, displayedLength);
  const showCursor = !isComplete && displayedLength < content.length;

  return (
    <div className={styles.wrapper}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {children}
            </a>
          ),
          ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
          ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
          li: ({ children }) => <li className={styles.li}>{children}</li>,
          p: ({ children }) => <p className={styles.p}>{children}</p>,
          strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
          code: ({ children }) => <code className={styles.inlineCode}>{children}</code>,
        }}
      >
        {visibleText}
      </ReactMarkdown>
      {showCursor && <span className={styles.cursor} />}
    </div>
  );
}
