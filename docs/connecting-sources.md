# Connecting Sources (The Skill Marketplace)

Coral Copilot treats every SaaS application as a "Skill." Out of the box, the copilot knows how to speak to 90+ different tools thanks to the Coral federated query engine.

However, to query *your* private data, you must install the skill and provide your credentials.

## Installing a Skill via the UI

1. Navigate to the [Marketplace](http://localhost:3000/marketplace).
2. Browse the available catalog of sources (e.g., GitHub, Slack, Datadog).
3. Click **Connect Skill** on the desired source.
4. (During the Hackathon, clicking this button triggers the backend to add the source automatically assuming environment variables are pre-set. In production, this opens an OAuth flow).

## Installing a Skill via CLI

For developers, you can install skills directly using the Coral CLI. The Copilot will instantly recognize the new skill the next time you speak to it.

```bash
# Add GitHub
GITHUB_TOKEN=ghp_... coral source add github

# Add Slack
SLACK_TOKEN=xoxb-... coral source add slack
```

Once installed, the source's entire schema is loaded into the MCP server, and the LLM Agent can now write SQL against those tables!

## How the Agent Learns
The beauty of the Skill Marketplace is that we **do not hardcode** any API knowledge into the LLM. 

When you install a new skill, the Coral MCP server automatically surfaces the new database tables via the `list_catalog` and `describe_table` tools. The Agent queries the MCP server dynamically to understand the schema before generating SQL.
