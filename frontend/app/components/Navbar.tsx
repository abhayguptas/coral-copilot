import Link from 'next/link';
import Logo from './Logo';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <Logo size={24} className={styles.logoIcon} />
            <span className={styles.logoText}>Coral Copilot</span>
          </Link>
        </div>
        
        <div className={styles.links}>
          <Link href="/dashboard" className={styles.link}>Dashboard</Link>
          <Link href="/marketplace" className={styles.link}>Marketplace</Link>
          <Link href="/docs" className={styles.link}>Docs</Link>
          <Link href="/dashboard" className={styles.cta}>
            Start Talking
          </Link>
        </div>
      </div>
    </nav>
  );
}
