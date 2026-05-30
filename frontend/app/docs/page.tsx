'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Docs.module.css';

const DOCS = {
  getting_started: {
    title: 'Getting Started',
    content: (
      <>
        <h1>Getting Started with Coral Copilot</h1>
        <p>Coral Copilot is a voice-operated developer agent that uses the Coral federated SQL engine to answer complex questions about your entire dev stack.</p>
        
        <h2>Prerequisites</h2>
        <p>Before running the copilot, ensure you have:</p>
        <ol>
          <li><strong>Node.js 18+</strong> for the Next.js frontend</li>
          <li><strong>Python 3.12+</strong> for the FastAPI backend</li>
          <li><strong>Coral CLI</strong> installed globally and available on your PATH.</li>
          <li><strong>OpenAI API Key</strong> with access to GPT-4o and Whisper.</li>
        </ol>

        <h2>Deploying Locally</h2>
        <p>Because Coral Copilot connects to your live databases and operational data, the LLM agent and MCP Server must be run locally or within your private VPC.</p>
        
        <h3>1. Fork and Clone</h3>
        <pre><code>git clone https://github.com/abhayguptas/coral-copilot.git
cd coral-copilot
make setup</code></pre>

        <h3>2. Configure Environment</h3>
        <pre><code>cp backend/.env.example backend/.env</code></pre>
        <p>Open <code>backend/.env</code> and insert your API key. You can use OpenAI or Groq (for Llama 3 70B).</p>

        <h3>3. Run the Copilot</h3>
        <p>Start both the Next.js frontend and the FastAPI backend servers simultaneously:</p>
        <pre><code>make dev</code></pre>
        <p>The Copilot UI will be available at <code>http://localhost:3000</code>.</p>
      </>
    )
  },
  connecting_sources: {
    title: 'Connecting Sources',
    content: (
      <>
        <h1>Connecting Sources (The Skill Marketplace)</h1>
        <p>Coral Copilot treats every SaaS application as a &quot;Skill.&quot; Out of the box, the copilot knows how to speak to 90+ different tools.</p>
        
        <h2>Installing a Skill via the UI</h2>
        <ol>
          <li>Navigate to the Marketplace.</li>
          <li>Browse the available catalog of sources.</li>
          <li>Click <strong>Connect Skill</strong> on the desired source.</li>
        </ol>

        <h2>How the Agent Learns</h2>
        <p>The beauty of the Skill Marketplace is that we <strong>do not hardcode</strong> any API knowledge into the LLM.</p>
        <p>When you install a new skill, the Coral MCP server automatically surfaces the new database tables via the <code>list_catalog</code> and <code>describe_table</code> tools. The Agent queries the MCP server dynamically to understand the schema before generating SQL.</p>
      </>
    )
  },
  example_prompts: {
    title: 'Example Prompts',
    content: (
      <>
        <h1>Example Voice Prompts</h1>
        <p>Try these powerful, cross-SaaS prompts.</p>

        <h2>1. The &quot;Morning Standup&quot; Update</h2>
        <p><strong>Required Skills:</strong> <code>github</code>, <code>linear</code>, <code>slack</code></p>
        <blockquote>&quot;Good morning Coral. What PRs did I merge yesterday, and what are my highest priority open Linear tickets today?&quot;</blockquote>

        <h2>2. The Root Cause Investigation</h2>
        <p><strong>Required Skills:</strong> <code>github</code>, <code>sentry</code>, <code>pagerduty</code></p>
        <blockquote>&quot;Why did my phone just go off? Show me the active PagerDuty incident, the related Sentry errors, and tell me who made the last commit to that module.&quot;</blockquote>

        <h2>3. The Cloud Cost Auditor</h2>
        <p><strong>Required Skills:</strong> <code>datadog</code>, <code>github</code></p>
        <blockquote>&quot;Which GitHub team owns the service that had the highest latency spike in Datadog over the last 24 hours?&quot;</blockquote>
      </>
    )
  },
  architecture: {
    title: 'Architecture',
    content: (
      <>
        <h1>Copilot Architecture</h1>
        <p>Coral Copilot leverages a decoupled, high-performance architecture separating the UI, the LLM Brain, and the Data Execution Engine.</p>

        <h2>The Model Context Protocol (MCP)</h2>
        <p>If we tried to load the schemas of 90+ SaaS APIs into an LLM&apos;s system prompt, the context window would explode.</p>
        <p>Instead, our Python Agent connects to Coral locally via <code>coral mcp-stdio</code>. This exposes Coral&apos;s database as a set of dynamic tools to the LLM (list_catalog, describe_table, sql).</p>

        <h2>The SQL Execution Engine (Coral)</h2>
        <p>When the Agent executes SQL, Coral uses Apache DataFusion to parse the federated SQL. It routes the HTTP requests, handles pagination, joins the JSON results in memory, and returns tabular data back over the MCP transport.</p>

        <h2>The Self-Healing Loop</h2>
        <p>If the Agent generates invalid SQL, the Coral MCP server returns a detailed error. The Agent catches this error, reviews the schema, and automatically retries with a corrected query.</p>
      </>
    )
  }
};

type DocKey = keyof typeof DOCS;

export default function Docs() {
  const [activeDoc, setActiveDoc] = useState<DocKey>('getting_started');

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            {(Object.keys(DOCS) as DocKey[]).map((key) => (
              <div 
                key={key}
                className={`${styles.navLink} ${activeDoc === key ? styles.active : ''}`}
                onClick={() => setActiveDoc(key)}
              >
                {DOCS[key].title}
              </div>
            ))}
          </div>
          <div className={styles.content}>
            {DOCS[activeDoc].content}
          </div>
        </div>
      </main>
    </>
  );
}
