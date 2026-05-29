'use client';

import { Download } from 'lucide-react';
import styles from '../styles/ExportButtons.module.css';

interface ExportButtonsProps {
  data: string | any[];
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  let parsed: Record<string, unknown>[] = [];
  try {
    parsed = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const timestamp = new Date().toISOString().slice(0, 10);

  const downloadCSV = () => {
    const columns = Object.keys(parsed[0]);
    const header = columns.join(',');
    const rows = parsed.map(row =>
      columns.map(col => {
        const val = row[col];
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    triggerDownload(csv, `coral_export_${timestamp}.csv`, 'text/csv');
  };

  const downloadJSON = () => {
    const json = JSON.stringify(parsed, null, 2);
    triggerDownload(json, `coral_export_${timestamp}.json`, 'application/json');
  };

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <button className={styles.btn} onClick={downloadCSV} title="Export as CSV">
        <Download size={13} /> CSV
      </button>
      <button className={styles.btn} onClick={downloadJSON} title="Export as JSON">
        <Download size={13} /> JSON
      </button>
    </div>
  );
}
