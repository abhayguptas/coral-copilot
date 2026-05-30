import { useRef, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import styles from '../styles/ChatHistory.module.css';
import SQLDisplay from './SQLDisplay';
import TypewriterMarkdown from './TypewriterMarkdown';
import DashboardSummary from './DashboardSummary';
import DataTable from './DataTable';
import Logo from './Logo';
import ResultChart from './ResultChart';
import ExportButtons from './ExportButtons';

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  type: 'text' | 'sql' | 'thinking' | 'error' | 'data_table';
  status?: 'pending' | 'success' | 'error';
}

interface ChatHistoryProps {
  messages: Message[];
  isProcessing?: boolean;
  onAction?: (text: string) => void;
}

export default function ChatHistory({ messages, isProcessing = false, onAction }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      {messages.length === 0 ? (
        <DashboardSummary onAction={onAction || (() => {})} />
      ) : (
        <div className={styles.messageList}>
          {messages.map((msg, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const isComplete = !(isLastMessage && isProcessing);

            let displayContent = msg.content;
            const followUps: string[] = [];
            
            if (msg.type === 'text' && msg.role === 'agent') {
              const lines = msg.content.split('\n');
              displayContent = lines.filter(line => {
                if (line.trim().startsWith('FOLLOW_UP:')) {
                  followUps.push(line.replace('FOLLOW_UP:', '').trim());
                  return false;
                }
                return true;
              }).join('\n');
            }

            return (
              <div 
                key={msg.id} 
                className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.agentWrapper}`}
              >
                {msg.role === 'agent' && (
                  <div className={styles.avatar}>
                    <Logo size={20} />
                  </div>
                )}
                
                <div className={styles.messageContentWrapper}>
                  <div className={`${styles.messageBubble} ${styles[msg.role]} ${styles[msg.type]}`}>
                    {msg.type === 'sql' ? (
                      <SQLDisplay code={msg.content} />
                    ) : msg.type === 'data_table' ? (
                      <div className={styles.dataTableContainer}>
                        <ExportButtons data={msg.content} />
                        <DataTable data={msg.content} />
                        <ResultChart data={msg.content} />
                      </div>
                    ) : msg.type === 'thinking' ? (
                      <div className={`${styles.thinking} ${msg.status === 'success' ? styles.thinkingSuccess : msg.status === 'error' ? styles.thinkingError : ''}`}>
                        {msg.status === 'success' ? (
                          <CheckCircle2 size={16} className={styles.successIcon} />
                        ) : msg.status === 'error' ? (
                          <XCircle size={16} className={styles.errorIcon} />
                        ) : (
                          <span className={styles.spinner}></span>
                        )}
                        {msg.content}
                      </div>
                    ) : msg.type === 'text' && msg.role === 'agent' ? (
                      <TypewriterMarkdown content={displayContent} isComplete={isComplete} />
                    ) : (
                      <div className={styles.content}>{displayContent}</div>
                    )}
                  </div>
                  
                  {followUps.length > 0 && isComplete && (
                    <div className={styles.followUps}>
                      {followUps.map((chip, i) => (
                        <button 
                          key={i} 
                          className={styles.followUpChip}
                          onClick={() => onAction && onAction(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
