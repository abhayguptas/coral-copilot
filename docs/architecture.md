# Copilot Architecture

Coral Copilot leverages a decoupled, high-performance architecture separating the UI, the LLM Brain, and the Data Execution Engine.

## The Model Context Protocol (MCP)

The secret sauce of Coral Copilot is the **Model Context Protocol (MCP)**. 

If we tried to load the schemas of 90+ SaaS APIs into an LLM's system prompt, the context window would explode, causing massive hallucinations. 

Instead, our Python Agent connects to Coral locally via `coral mcp-stdio`. This exposes Coral's database as a set of dynamic tools to the LLM:
1. `list_catalog`
2. `describe_table`
3. `sql`

When you ask a question, the LLM uses these tools to browse the schemas *on-demand*, writes the SQL, and uses the `sql` tool to execute it.

## The SQL Execution Engine (Coral)

When the Agent executes `sql("SELECT * FROM github.issues JOIN slack.users...")`, the Coral binary takes over.

Coral uses Apache DataFusion to parse the federated SQL. It routes the HTTP requests to GitHub and Slack, handles pagination, joins the JSON results in memory, and returns tabular data back over the MCP transport.

This entirely removes the need for ETL pipelines or data warehouses. 

## The Self-Healing Loop

Text-to-SQL is notoriously difficult. To ensure a flawless user experience, the Python Agent implements a **Self-Healing Loop**.

If the Agent generates invalid SQL, the Coral MCP server returns a detailed error (e.g., `Column 'name' not found in table 'slack.users'`). 
The Agent catches this error, reviews the schema, and automatically retries with a corrected query. This happens instantly in the background, up to 3 times, before returning a result to the frontend.
