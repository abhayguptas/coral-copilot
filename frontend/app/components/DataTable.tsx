import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import styles from '../styles/DataTable.module.css';

interface DataTableProps {
  data: string | any[];
}

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const rowsPerPage = 5;

  let parsedData: Record<string, unknown>[] = [];
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return <div className={styles.error}>Failed to parse data table.</div>;
  }

  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    return null;
  }

  const columns = Object.keys(parsedData[0]);

  // Sorting
  const sortedData = [...parsedData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key] as any;
    const bVal = b[sortConfig.key] as any;
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderCell = (val: any) => {
    if (val === null || val === undefined) return <span className={styles.null}>null</span>;
    if (typeof val === 'boolean') return <span className={styles.boolean}>{val.toString()}</span>;
    if (typeof val === 'object') return <span className={styles.object}>{JSON.stringify(val)}</span>;
    
    // Auto-link URLs
    const strVal = String(val);
    if (strVal.startsWith('http://') || strVal.startsWith('https://')) {
      return <a href={strVal} target="_blank" rel="noopener noreferrer" className={styles.link}>{strVal}</a>;
    }
    return strVal;
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} onClick={() => handleSort(col)} className={styles.th}>
                  <div className={styles.thContent}>
                    {col}
                    <ArrowUpDown size={12} className={styles.sortIcon} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr key={i} className={styles.tr}>
                {columns.map(col => (
                  <td key={col} className={styles.td}>
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length}
          </span>
          <div className={styles.controls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
