'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Mic, Image as ImageIcon, Edit3, Globe, Plus, Send } from 'lucide-react';
import styles from '../styles/ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  isProcessing: boolean;
  isEmpty: boolean;
}

const CHIPS = [
  { id: 'review_prs', label: 'Review my open PRs', icon: Edit3 },
  { id: 'check_alerts', label: 'Check Datadog alerts', icon: Globe },
  { id: 'recent_issues', label: 'Find recent Jira tickets', icon: ImageIcon },
];

export default function ChatInput({ onSend, isProcessing, isEmpty }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access is required to use dictation.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    // Add a temporary indicator
    const prevText = text;
    setText(prevText ? prevText + ' (Transcribing...)' : '(Transcribing...)');

    try {
      const response = await fetch('http://localhost:8000/api/voice', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // Append transcribed text
        setText(prevText ? prevText + ' ' + data.text : data.text);
      } else {
        setText(prevText);
        console.error('Failed to transcribe audio');
      }
    } catch (error) {
      setText(prevText);
      console.error('Error sending audio to backend:', error);
    }
  };

  const handleSend = () => {
    if (!text.trim() || isProcessing) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (label: string) => {
    if (isProcessing) return;
    onSend(label);
  };

  return (
    <div className={`${styles.container} ${isEmpty ? styles.emptyState : ''}`}>
      {isEmpty && (
        <h1 className={styles.greeting}>What&apos;s on your mind today?</h1>
      )}

      <div className={styles.inputWrapper}>
        <div className={styles.inputPill}>
          <button className={styles.plusBtn}>
            <Plus size={20} />
          </button>
          
          <input
            type="text"
            className={styles.input}
            placeholder="Ask anything"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
          
          <div className={styles.actions}>
            <button 
              className={`${styles.micBtn} ${isRecording ? styles.recording : ''}`}
              onClick={toggleRecording}
              disabled={isProcessing}
            >
              <Mic size={18} />
            </button>
            <button 
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!text.trim() || isProcessing}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className={styles.chips}>
          {CHIPS.map(chip => {
            const Icon = chip.icon;
            return (
              <button 
                key={chip.id} 
                className={styles.chip}
                onClick={() => handleChipClick(chip.label)}
                disabled={isProcessing}
              >
                <Icon size={16} className={styles.chipIcon} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
