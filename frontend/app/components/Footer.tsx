import Link from 'next/link';
import Logo from './Logo';
import styles from '../styles/Footer.module.css';


export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink}>
              <Logo size={28} className={styles.logoIcon} />
              <span className={styles.logoText}>Coral Copilot</span>
            </Link>
            <p className={styles.description}>
              The universal developer agent powered by federated SQL. Talk to your entire dev stack without leaving your terminal.
            </p>
            <div className={styles.socials}>
              <a href="https://x.com/abhayguptas" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://github.com/abhayguptas/coral-copilot" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/abhayakg/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Product</h4>
              <Link href="/dashboard" className={styles.link}>Dashboard</Link>
              <Link href="/marketplace" className={styles.link}>Skill Marketplace</Link>
              <Link href="#" className={styles.link}>Pricing</Link>
              <Link href="#" className={styles.link}>Changelog</Link>
            </div>
            
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Resources</h4>
              <Link href="/docs" className={styles.link}>Documentation</Link>
              <Link href="/docs/getting-started" className={styles.link}>Getting Started</Link>
              <Link href="/docs/example-prompts" className={styles.link}>Example Prompts</Link>
              <Link href="https://github.com/withcoral/coral" className={styles.link}>Coral Engine</Link>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>Legal</h4>
              <Link href="#" className={styles.link}>Privacy Policy</Link>
              <Link href="#" className={styles.link}>Terms of Service</Link>
              <Link href="#" className={styles.link}>Cookie Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Coral Copilot. Built for the developer track.
          </p>
          <div className={styles.status}>
            <span className={styles.statusDot}></span> All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
