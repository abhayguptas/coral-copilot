'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import styles from '../styles/ResultChart.module.css';

interface ResultChartProps {
  data: string | any[];
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'];

export default function ResultChart({ data }: ResultChartProps) {
  const chartData = useMemo(() => {
    let parsed: Record<string, unknown>[] = [];
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return null;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const columns = Object.keys(parsed[0]);
    
    // Find a numeric column and a label column
    const numericCols = columns.filter(col => 
      parsed.every(row => typeof row[col] === 'number' || (typeof row[col] === 'string' && !isNaN(Number(row[col])) && row[col] !== ''))
    );
    const labelCols = columns.filter(col => 
      !numericCols.includes(col) && parsed.some(row => typeof row[col] === 'string')
    );

    if (numericCols.length === 0 || labelCols.length === 0) return null;

    const labelCol = labelCols[0];
    const valueCol = numericCols[0];

    return {
      items: parsed.slice(0, 10).map(row => ({
        name: String(row[labelCol] || '').slice(0, 30),
        value: Number(row[valueCol]) || 0,
      })),
      labelCol,
      valueCol,
    };
  }, [data]);

  if (!chartData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Visualization</span>
        <span className={styles.meta}>{chartData.valueCol} by {chartData.labelCol}</span>
      </div>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData.items} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
            <XAxis type="number" stroke="#555" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
            <YAxis type="category" dataKey="name" width={120} stroke="#555" fontSize={11} tick={{ fill: '#999' }} />
            <Tooltip 
              contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 13 }} 
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.items.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
