"""Coral Copilot — LLM Agent with MCP integration.

The agent uses OpenAI function-calling to orchestrate Coral MCP tools.
It dynamically discovers schemas, generates federated SQL, and self-heals
on errors (up to 3 retries).
"""

import json
import re
import os
from typing import AsyncGenerator

from openai import OpenAI
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


CORAL_BIN = os.getenv("CORAL_BIN", "coral")

SYSTEM_PROMPT = """You are Coral Copilot, a voice-operated developer assistant.

You have access to a federated SQL engine called Coral that can query data from
the user's connected SaaS tools (GitHub, Slack, PagerDuty, Datadog, Linear, 
Sentry, and many more) using standard SQL.

## Your tools

- `search_tables` — search database tables by keyword. Returns table names, descriptions, and REQUIRED FILTERS.
- `sql` — execute a read-only SQL query against the Coral database.
- `request_installation` — ask the user to install a missing SaaS source.

## Workflow

1. ALWAYS call `search_tables` first to find relevant tables. 
   - **Crucial Tip:** If the user asks about a specific platform (e.g. "Hugging Face", "Linear"), search for that platform's exact name first (e.g., `pattern="huggingface"`) so you discover all tables belonging to that source, rather than accidentally querying a different source like GitHub!
2. Read the response carefully: each table lists `required_filters` that MUST appear in your WHERE clause.
3. Write a SQL query using `sql`. **CRITICAL: YOU MUST APPEND `LIMIT 10` TO EVERY SINGLE SQL QUERY!** If you forget `LIMIT 10`, the query will hang forever and time out.
4. If the SQL returns an error, fix it and retry (up to 3 times).
5. Summarize results conversationally.
6. At the very end of your final response, suggest 2-3 relevant follow-up questions the user could ask. Format each on a new line like this: `FOLLOW_UP: [Question]`. **CRITICAL: These follow-up questions MUST strictly relate to the specific tables and columns you found in step 1. Do NOT suggest questions about data that is not available in the schema.**

## Handling Broad Queries

If the user asks an extremely broad question like "give me a summary of my work" without specifying a source:
- DO NOT blindly search tables or execute long queries.
- INSTANTLY reply by asking for clarification: "I can summarize your work across GitHub, Linear, Jira, or Slack. Which platform should we look at first?"

## Handling Missing Sources

NEVER call `request_installation` immediately. You MUST always call `search_tables` first to check if the source is already installed. 
ONLY call `request_installation` if `search_tables` returns 0 tables for that source. If you find tables, DO NOT call `request_installation` - just proceed with writing the SQL query! Stop after calling request_installation if it is truly missing.

## Handling Meta / System Questions

If the user asks questions about you, how you work, or how to "add skills":
- DO NOT use `search_tables` or `request_installation`.
- Answer conversationally. For skills, explain that maintained Coral agent skills are located in `plugins/coral/skills` in the repository, and they can be added or exported from there.

## Handling Capability Queries

If the user asks "what can you do with [Source]?" or "what can I ask you about [Source]?":
1. Use `search_tables` to find 3-4 key tables for that source and briefly summarize what data you can access (e.g., "I can query your open pull requests, issues, and commits").
2. ALWAYS provide a direct Markdown link to the official documentation for that source so they can read the exact schema capabilities themselves. 
   - For Core sources (like GitHub, Datadog, Stripe, Slack, Linear, Jira, Sentry, etc.), use the docs site: `https://docs.withcoral.com/sources/core/<source_name_lowercase>`
   - For Community sources (like HuggingFace, Hashnode, Auth0, etc.), use the GitHub tree link: `https://github.com/withcoral/coral/tree/main/sources/community/<source_name_lowercase>`
   If you aren't sure, assume it is a core source.

## GitHub-specific guidance

For broad GitHub queries (open PRs, issues, etc.) where you don't know the user's owner/repo, use `github.search_issues` with the `q` filter. The `q` filter uses GitHub search syntax.

Examples:
- Open PRs by the authenticated user: `SELECT title, html_url, state FROM github.search_issues WHERE q = 'is:pr is:open author:@me' LIMIT 10`
## Hugging Face specific guidance

**CRITICAL RULE FOR HUGGING FACE**: NEVER, EVER use the `ORDER BY` clause for any `huggingface` table. Doing so will instantly crash the database. 
If you want to sort the results, you MUST use the `sort` and `direction` virtual columns inside the `WHERE` clause instead. 

Examples:
- Most downloaded models: `SELECT id, pipeline_tag, likes, downloads FROM huggingface.models WHERE sort = 'downloads' AND direction = '-1' LIMIT 10`
- Most liked models: `SELECT id, pipeline_tag, likes, downloads FROM huggingface.models WHERE sort = 'likes' AND direction = '-1' LIMIT 10`

## Notion specific guidance

**CRITICAL RULE FOR NOTION**: The `notion` source does NOT have a `notion.pages` table. To list or search pages and databases, you MUST use the `notion.search` table. 
Additionally, the `notion.search` table does NOT have a `title` column. You must select columns like `id, object, url, created_time` instead.

Examples:
- List recent Notion pages: `SELECT id, object, url FROM notion.search WHERE object = 'page' LIMIT 10`
- Search Notion for a keyword: `SELECT id, object, url FROM notion.search WHERE query = 'keyword' LIMIT 10`

If the user provides a specific owner/repo, you can use more specific tables like `github.pulls WHERE owner = '...' AND repo = '...'`.

## Rules

- NEVER generate DROP, DELETE, UPDATE, or INSERT statements. Coral is read-only.
- Always qualify table names with their schema (e.g., `github.pulls`, not just `pulls`).
- CRITICAL: You MUST call `search_tables` FIRST before writing any SQL. Never guess table names.
- CRITICAL: You MUST include ALL `required_filters` in WHERE. If a table requires `owner` and `repo`, include both.
- If `search_tables` returns zero results for a source, ONLY THEN call `request_installation`.
- If the user says they cancelled an installation, do NOT call `request_installation` again.
- Be concise but helpful.
"""

# Cache the full table list so we don't call list_tables on every search_tables invocation
_table_cache: list[dict] | None = None
_table_cache_session_id: int | None = None


class CoralAgent:
    """Agent that connects to Coral via MCP and answers developer questions."""

    def __init__(self, openai_api_key: str, base_url: str | None = None):
        self.client = OpenAI(api_key=openai_api_key, base_url=base_url)
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        if self.model == "llama3-70b-8192":
            self.model = "llama-3.3-70b-versatile"
        self.conversation_history: list[dict] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

    async def chat(self, user_message: str) -> AsyncGenerator[dict, None]:
        """Process a user message and yield streaming response chunks."""
        self.conversation_history.append({"role": "user", "content": user_message})

        # Keep conversation history bounded to avoid blowing up token limits
        self._trim_history()

        server_params = StdioServerParameters(
            command=CORAL_BIN,
            args=["mcp-stdio"],
        )

        # Tools always available (search_tables is handled locally as a proxy)
        base_tools = [
            {
                "type": "function",
                "function": {
                    "name": "request_installation",
                    "description": "Request the user to install a missing SaaS integration.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "source": {
                                "type": "string",
                                "description": "Source name, e.g. Datadog, GitHub."
                            }
                        },
                        "required": ["source"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_tables",
                    "description": "Search available database tables by keyword. Returns matching table names, descriptions, and required_filters.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pattern": {
                                "type": "string",
                                "description": "Keyword to search for, e.g. 'pull', 'issue', 'alert'."
                            }
                        },
                        "required": ["pattern"]
                    }
                }
            }
        ]

        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()

                    # Get MCP tools (only sql — list_tables is proxied via search_tables)
                    tools_result = await session.list_tools()
                    mcp_tools = []
                    for tool in tools_result.tools:
                        if tool.name == "list_tables":
                            continue  # We proxy this through search_tables
                        mcp_tools.append({
                            "type": "function",
                            "function": {
                                "name": tool.name,
                                "description": tool.description or "",
                                "parameters": tool.inputSchema if tool.inputSchema else {"type": "object", "properties": {}},
                            },
                        })

                    all_tools = base_tools + mcp_tools

                    async for chunk in self._run_llm_loop(session, all_tools):
                        yield chunk

        except Exception as e:
            print(f"MCP client failed: {e}. Falling back to base tools only.")
            try:
                async for chunk in self._run_llm_loop(None, base_tools):
                    yield chunk
            except Exception as inner_e:
                yield {"type": "error", "content": f"Agent error: {inner_e}"}

        yield {"type": "done", "content": ""}

    async def _run_llm_loop(self, session, tools):
        """Core agent loop: call LLM, handle tool calls, repeat."""
        retries = 0
        max_retries = 3
        max_iterations = 10  # Safety cap to prevent infinite loops

        for _ in range(max_iterations):
            # Call LLM
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=self.conversation_history,
                    tools=tools if tools else None,
                    stream=False,
                )
                choice = response.choices[0]
            except Exception as e:
                err_str = str(e)
                # Handle Groq's failed_generation edge case
                if "failed_generation" in err_str:
                    match = re.search(r"<function=?([a-zA-Z0-9_]+)(.*?)</function>", err_str)
                    if match:
                        choice = self._make_dummy_choice(match.group(1), match.group(2))
                    else:
                        yield {"type": "error", "content": f"Agent error: {e}"}
                        return
                else:
                    yield {"type": "error", "content": f"Agent error: {e}"}
                    return

            # If the model wants to call tools
            if choice.finish_reason == "tool_calls" and choice.message.tool_calls:
                tool_calls = choice.message.tool_calls

                # Record the assistant message with tool_calls
                msg_dump = {
                    "role": choice.message.role or "assistant",
                    "content": choice.message.content,
                }
                msg_dump["tool_calls"] = [
                    tc.model_dump(exclude_none=True) for tc in tool_calls
                ]
                self.conversation_history.append(msg_dump)

                # Check if this batch includes search_tables — if so, defer
                # any request_installation calls (the model is hedging; wait
                # for actual search results before prompting install).
                has_search = any(tc.function.name == "search_tables" for tc in tool_calls)

                for tc in tool_calls:
                    fn_name = tc.function.name
                    raw_args = tc.function.arguments
                    try:
                        fn_args = json.loads(raw_args) if raw_args else {}
                    except json.JSONDecodeError:
                        fn_args = {}

                    # --- Handle request_installation ---
                    if fn_name == "request_installation":
                        if has_search:
                            # Silently skip — let search_tables results decide
                            self.conversation_history.append({
                                "role": "tool",
                                "tool_call_id": tc.id,
                                "content": "Skipped: checking catalog first.",
                            })
                            continue
                            
                        source_name = fn_args.get("source", "Source")
                        slug = source_name.lower().replace(" ", "").replace("-", "")
                        
                        # VERIFY INSTALLATION STATE
                        # Intercept hallucinated requests by checking the source of truth
                        from coral_bridge import coral_source_discover
                        installed = await coral_source_discover()
                        installed_slugs = {s["name"].lower() for s in installed}
                        
                        if slug in installed_slugs:
                            # It's already installed! Block the popup and correct the LLM.
                            self.conversation_history.append({
                                "role": "tool",
                                "tool_call_id": tc.id,
                                "content": f"Error: Source '{source_name}' is ALREADY INSTALLED. You MUST use search_tables with pattern='{slug}' to find its tables.",
                            })
                            continue
                            
                        # Not installed, safe to prompt the user
                        yield {"type": "install_request", "content": source_name}
                        self.conversation_history.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": f"Installation prompt shown to user for {source_name}. Wait for user response.",
                        })
                        continue

                    # --- Handle search_tables (local proxy over list_tables) ---
                    if fn_name == "search_tables":
                        pattern = fn_args.get("pattern", "").lower()
                        yield {"type": "thinking", "content": f"Searching tables for '{pattern}'..."}
                        tool_output = await self._search_tables(session, pattern)
                        self.conversation_history.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": tool_output,
                        })
                        continue

                    # --- Handle sql ---
                    if fn_name == "sql":
                        query = fn_args.get("query", fn_args.get("sql", ""))
                        yield {"type": "sql", "content": query}

                    yield {"type": "thinking", "content": f"Calling {fn_name}..."}

                    # Execute MCP tool
                    try:
                        if session:
                            result = await session.call_tool(fn_name, fn_args)
                            tool_output = result.content[0].text if result.content else ""
                            
                            # Intercept large SQL results to render as a data table
                            if fn_name == "sql" and not tool_output.startswith("Error") and not tool_output.startswith("SQL Error"):
                                try:
                                    data = json.loads(tool_output)
                                    if isinstance(data, list) and len(data) > 3:
                                        # Yield data table to frontend
                                        yield {"type": "data_table", "content": tool_output}
                                        # Tell LLM we displayed it natively
                                        tool_output = f"Successfully queried and displayed a rich data table with {len(data)} rows to the user. DO NOT list the rows in your response. Just provide a 1-sentence conversational summary."
                                except json.JSONDecodeError:
                                    pass

                            # Truncate to stay within Groq free-tier TPM limits
                            if len(tool_output) > 2000:
                                tool_output = tool_output[:2000] + "\n\n...[TRUNCATED]"
                        else:
                            tool_output = f"Tool error: MCP session not available for {fn_name}"
                    except Exception as e:
                        tool_output = f"Tool error: {e}"

                    self.conversation_history.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": tool_output,
                    })

                    # Track SQL retries
                    if fn_name == "sql" and "error" in tool_output.lower():
                        retries += 1
                        if retries <= max_retries:
                            yield {"type": "thinking", "content": f"SQL error detected, retrying ({retries}/{max_retries})..."}
                        else:
                            yield {"type": "error", "content": "Failed to execute query after 3 retries. Please try rephrasing your request."}
                            return

                # Continue the loop to let the LLM process tool results
                continue

            # If the model returned a text response (no tool calls)
            else:
                content = choice.message.content or ""
                if content:
                    self.conversation_history.append({"role": "assistant", "content": content})
                    yield {"type": "text", "content": content}
                return

    async def _search_tables(self, session, pattern: str) -> str:
        """Proxy: search through tables by keyword using MCP list_tables."""
        global _table_cache, _table_cache_session_id

        if not session:
            return json.dumps({"tables": [], "error": "MCP session not available"})

        # Synonym expansion for common terms
        SYNONYMS = {
            "pr": "pull", "prs": "pull", "pull_request": "pull",
            "pull_requests": "pull", "merge": "pull",
            "ci": "workflow", "pipeline": "workflow", "build": "workflow",
            "alert": "alert", "alerts": "alert",
            "bug": "issue", "bugs": "issue", "ticket": "issue", "tickets": "issue",
        }
        # Noise words to filter out
        NOISE = {"my", "open", "closed", "list", "show", "get", "all", "recent", "the", "a", "an"}

        try:
            sid = id(session)
            if _table_cache is None or _table_cache_session_id != sid:
                result = await session.call_tool("list_tables", {})
                raw = result.content[0].text if result.content else "{}"
                data = json.loads(raw)
                _table_cache = data.get("tables", [])
                _table_cache_session_id = sid

            # Expand synonyms and filter noise
            raw_keywords = pattern.lower().split()
            keywords = []
            for w in raw_keywords:
                if w in NOISE:
                    continue
                keywords.append(SYNONYMS.get(w, w))
            # Deduplicate
            keywords = list(set(keywords)) if keywords else raw_keywords

            matched = [
                t for t in _table_cache
                if any(
                    kw in t.get("name", "").lower() or kw in t.get("description", "").lower()
                    for kw in keywords
                )
            ]
            # Limit to 15 results to keep context small
            return json.dumps({"tables": matched[:15]})
        except Exception as e:
            return json.dumps({"tables": [], "error": str(e)})

    def _trim_history(self):
        """Keep conversation history bounded to prevent token explosion."""
        # Keep the system prompt + last 20 messages
        if len(self.conversation_history) > 21:
            self.conversation_history = (
                [self.conversation_history[0]]  # system prompt
                + self.conversation_history[-20:]
            )

    def _make_dummy_choice(self, fn_name: str, fn_args_str: str):
        """Create a dummy Choice object for Groq failed_generation recovery."""
        class DummyToolCall:
            def __init__(self, name, args):
                self.id = "call_groq_recovery"
                self.function = type('obj', (object,), {'name': name, 'arguments': args})
            def model_dump(self, **kwargs):
                return {"id": self.id, "type": "function", "function": {"name": self.function.name, "arguments": self.function.arguments}}

        class DummyMessage:
            def __init__(self, tc):
                self.tool_calls = [tc]
                self.role = "assistant"
                self.content = None

        class DummyChoice:
            def __init__(self, tc):
                self.finish_reason = "tool_calls"
                self.message = DummyMessage(tc)

        return DummyChoice(DummyToolCall(fn_name, fn_args_str))

    def reset(self):
        """Clear conversation history."""
        global _table_cache, _table_cache_session_id
        _table_cache = None
        _table_cache_session_id = None
        self.conversation_history = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
