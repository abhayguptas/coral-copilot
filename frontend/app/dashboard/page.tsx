'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChatInput from '../components/ChatInput';
import ChatHistory, { Message } from '../components/ChatHistory';
import ConfigModal from '../components/ConfigModal';
import QueryHistory, { QueryEntry } from '../components/QueryHistory';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [installSource, setInstallSource] = useState<string | null>(null);
  
  const [queryHistory, setQueryHistory] = useState<QueryEntry[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('coral_query_history');
    if (saved) {
      try {
        setQueryHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleClearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem('coral_query_history');
  };

  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text, type: 'text' }]);
    
    const hId = crypto.randomUUID();
    setCurrentHistoryId(hId);
    
    setQueryHistory(prev => {
      const newHistory = [{ id: hId, question: text, timestamp: Date.now() }, ...prev].slice(0, 50);
      localStorage.setItem('coral_query_history', JSON.stringify(newHistory));
      return newHistory;
    });
    
    setIsProcessing(true);

    try {
      // Send to backend and handle SSE
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let currentAgentMsgId: string | null = null;
      let currentAgentMsgContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value, { stream: true });
        // Split by newlines in case multiple SSE events arrive at once
        const events = chunkStr.split('\n\n');
        
        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          
          const dataStr = event.substring(6);
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            
            if (data.type === 'done') {
              setIsProcessing(false);
              currentAgentMsgId = null;
              currentAgentMsgContent = '';
              continue;
            }

             if (data.type === 'install_request') {
               setInstallSource(data.content);
               continue;
            } else if (data.type === 'thinking' || data.type === 'sql' || data.type === 'error' || data.type === 'data_table') {
               setMessages(prev => [
                 ...prev, 
                 { id: crypto.randomUUID(), role: 'agent', content: data.content, type: data.type }
               ]);
               
               if (data.type === 'sql') {
                 setQueryHistory(prev => {
                   const updated = prev.map(entry => 
                     (entry.id === hId && !entry.sql) ? { ...entry, sql: data.content } : entry
                   );
                   localStorage.setItem('coral_query_history', JSON.stringify(updated));
                   return updated;
                 });
               }
               
               currentAgentMsgId = null; // Next text should be a new block
            } else if (data.type === 'text') {
               if (!currentAgentMsgId) {
                 currentAgentMsgId = crypto.randomUUID();
                 currentAgentMsgContent = data.content;
                 setMessages(prev => [
                   ...prev,
                   { id: currentAgentMsgId!, role: 'agent', content: currentAgentMsgContent, type: 'text' }
                 ]);
               } else {
                 currentAgentMsgContent += data.content;
                 setMessages(prev => prev.map(msg => 
                   msg.id === currentAgentMsgId 
                     ? { ...msg, content: currentAgentMsgContent }
                     : msg
                 ));
               }
            }
          } catch (e) {
            console.error('Error parsing SSE data', e, dataStr);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev, 
        { id: crypto.randomUUID(), role: 'agent', content: 'Connection to Copilot backend failed.', type: 'error' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstallSubmit = async (token: string) => {
    if (!installSource) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/sources/add/${installSource.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setInstallSource(null);
        // Automatically resume workflow
        handleTranscript(`I just configured ${installSource}. Please proceed with my request!`);
      } else {
        alert('Failed to configure source. Please try again.');
      }
    } catch (error) {
      console.error('Failed to configure source:', error);
      alert('Network error while configuring source.');
    }
  };

  const handleInstallCancel = () => {
    if (!installSource) return;
    const source = installSource;
    setInstallSource(null);
    handleTranscript(`I cancelled the installation of ${source}. I did not provide a key.`);
  };

  return (
    <>
      <Navbar />
      <QueryHistory 
        entries={queryHistory} 
        onSelectQuery={handleTranscript} 
        onClear={handleClearHistory} 
      />
      <main className={styles.main}>
        <div className={styles.chatContainer}>
          <ChatHistory messages={messages} isProcessing={isProcessing} onAction={handleTranscript} />
        </div>
        <div className={styles.inputContainer}>
          <ChatInput 
            onSend={handleTranscript} 
            isProcessing={isProcessing} 
            isEmpty={messages.length === 0}
          />
        </div>
      </main>

      <ConfigModal 
        isOpen={!!installSource} 
        sourceName={installSource || ''} 
        onClose={handleInstallCancel}
        onSubmit={handleInstallSubmit}
      />
    </>
  );
}
