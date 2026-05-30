'use client';

import { useState } from 'react';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Database, Zap, Cpu, Sparkles, Workflow, ChevronDown } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import InteractiveNetwork from "./components/InteractiveNetwork";
import styles from "./styles/Home.module.css";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const integrations = [
  { name: "GitHub", icon: <Database /> },
  { name: "Slack", icon: <Database /> },
  { name: "PagerDuty", icon: <Database /> },
  { name: "Datadog", icon: <Database /> },
  { name: "Linear", icon: <Database /> },
  { name: "Sentry", icon: <Database /> },
];

const faqs = [
  {
    question: "Do you store my data?",
    answer: "No. Coral Copilot runs locally and connects to your tools live. We never cache your sensitive SaaS data. The federated SQL execution happens entirely in memory during the query."
  },
  {
    question: "How does it connect to 90+ tools?",
    answer: "We use the open-source Model Context Protocol (MCP). The agent doesn't need to learn 90 different REST APIs; it just asks the Coral Engine to expose them as a standard SQL database schema."
  },
  {
    question: "What happens if a query fails?",
    answer: "Our agent features a self-healing SQL loop. If the Coral engine returns a syntax error or a missing column, the LLM catches the error, rewrites the query, and tries again automatically."
  },
  {
    question: "Is there a latency overhead?",
    answer: "Coral Engine uses Apache DataFusion to push down filters and joins directly to the upstream APIs wherever possible, ensuring blazingly fast responses."
  }
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isDeployed = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.bgGlow}></div>
        
        {/* Hero Section */}
        <motion.div 
          className={styles.hero}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className={styles.badge} variants={fadeInUp}>
            <Sparkles size={16} /> The New Standard for Developer Productivity
          </motion.div>
          
          <motion.h1 className={styles.title} variants={fadeInUp}>
            Talk to your entire dev stack.<br />
            <span className="text-gradient">Just your voice.</span>
          </motion.h1>
          
          <motion.p className={styles.subtitle} variants={fadeInUp}>
            Coral Copilot connects to 90+ SaaS tools without ETL pipelines. 
            Speak your question, and the agent writes federated SQL, executes it, 
            and speaks the answer back. No tabs. No dashboards.
          </motion.p>
          
          <motion.div className={styles.ctaGroup} variants={fadeInUp}>
            {isDeployed ? (
              <>
                <Link href="/docs" className={styles.primaryCta}>
                  <Database size={20} /> Setup Instructions
                </Link>
                <a href="https://github.com/abhayguptas/coral-copilot" target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
                  View on GitHub
                </a>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={styles.primaryCta}>
                  <Mic size={20} /> Try the Copilot
                </Link>
                <Link href="/marketplace" className={styles.secondaryCta}>
                  View Skill Marketplace
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Marquee Section */}
        <motion.div 
          className={styles.integrationsWrapper}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className={styles.highlightContainer}>
            <div className={styles.highlightGlow}></div>
            <h2 className={styles.highlightNumber}>90+</h2>
            <p className={styles.highlightText}>Data Sources Connected Instantly</p>
          </div>
          <div className={styles.marquee}>
            <div className={styles.marqueeContent}>
              {[...integrations, ...integrations].map((item, idx) => (
                <div key={idx} className={styles.marqueeItem}>
                  {item.icon} {item.name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className={styles.features}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className={styles.featureCard} variants={fadeInUp}>
            <div className={styles.featureIcon}><Mic size={28} /></div>
            <h3 className={styles.featureTitle}>Voice-First Interface</h3>
            <p className={styles.featureDesc}>A hands-free experience. Ask complex questions out loud and get instant, synthesized answers based on live data.</p>
          </motion.div>
          <motion.div className={styles.featureCard} variants={fadeInUp}>
            <div className={styles.featureIcon}><Workflow size={28} /></div>
            <h3 className={styles.featureTitle}>Cross-SaaS JOINs</h3>
            <p className={styles.featureDesc}>Not a simple chatbot wrapper. The agent writes real SQL that JOINs data across GitHub, Slack, and PagerDuty in a single query.</p>
          </motion.div>
          <motion.div className={styles.featureCard} variants={fadeInUp}>
            <div className={styles.featureIcon}><Cpu size={28} /></div>
            <h3 className={styles.featureTitle}>Skill Marketplace</h3>
            <p className={styles.featureDesc}>Dynamically expand the agent&apos;s brain. Add any of Coral&apos;s 90+ sources at runtime without exploding the LLM context window.</p>
          </motion.div>
        </motion.div>

        {/* Why Coral Copilot Section */}
        <motion.section 
          className={styles.whySection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className={styles.sectionHeader}>
            <motion.span className={styles.sectionLabel} variants={fadeInUp}>The Problem</motion.span>
            <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>Stop context switching.</motion.h2>
          </div>
          
          <div className={styles.whyGrid}>
            <motion.div className={styles.whyText} variants={fadeInUp}>
              <p>As a developer, your context is scattered across dozens of disconnected tools. To figure out why a deployment failed, you check Slack, then GitHub, then PagerDuty, then Datadog.</p>
              <p><strong>Coral Copilot changes the paradigm.</strong> Instead of navigating 10 different dashboards, you simply ask a question. The agent maps your voice to a federated SQL query and retrieves exactly what you need in seconds.</p>
            </motion.div>
            <motion.div className={styles.whyVisual} variants={fadeInUp}>
              <InteractiveNetwork />
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          className={styles.howSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.span className={styles.sectionLabel} variants={fadeInUp}>Under the Hood</motion.span>
          <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>How it Works</motion.h2>
          
          <div className={styles.howSteps}>
            <motion.div className={styles.stepCard} variants={fadeInUp}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Voice Transcription</h3>
              <p className={styles.stepDesc}>OpenAI Whisper instantly transcribes your spoken question with near-perfect accuracy.</p>
            </motion.div>
            
            <motion.div className={styles.stepCard} variants={fadeInUp}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>MCP Schema Discovery</h3>
              <p className={styles.stepDesc}>The LLM agent interrogates the Coral engine via MCP to discover the exact tables and columns available.</p>
            </motion.div>
            
            <motion.div className={styles.stepCard} variants={fadeInUp}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Federated SQL</h3>
              <p className={styles.stepDesc}>Coral parses the generated SQL, fetching and joining live JSON data from multiple APIs in memory.</p>
            </motion.div>

            <motion.div className={styles.stepCard} variants={fadeInUp}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Synthesized Answer</h3>
              <p className={styles.stepDesc}>The LLM formats the tabular data into a concise, human-readable answer spoken back to you.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className={styles.faqSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className={styles.sectionHeader}>
            <motion.span className={styles.sectionLabel} variants={fadeInUp}>FAQ</motion.span>
            <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>Common Questions</motion.h2>
          </div>
          
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <motion.div key={index} className={styles.faqItem} variants={fadeInUp}>
                <button 
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.question}
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }}>
                    <ChevronDown />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.faqAnswer}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pre-Footer CTA */}
        <motion.div 
          className={styles.ctaBlock}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2 className={styles.ctaBlockTitle}>Ready to ship faster?</h2>
          <p className={styles.ctaBlockDesc}>Stop hunting through dashboards. Start talking to your stack today.</p>
          {isDeployed ? (
            <Link href="/docs" className={styles.primaryCta}>
              Deploy Locally
            </Link>
          ) : (
            <Link href="/dashboard" className={styles.primaryCta}>
              Launch Copilot
            </Link>
          )}
        </motion.div>

      </main>
      <Footer />
    </>
  );
}
