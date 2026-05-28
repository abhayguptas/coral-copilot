# Hackathon Bounties Submission

This document contains the finalized text for both the Social Post bounty and the End-to-End Guide bounty. Each team member can take one of these and publish them.

## Bounty 1: Discord Showcase and Social Post

**Target Platform:** LinkedIn or Twitter / X
**Discord Channel:** #show-and-tell

### Post Text

Stop Context Switching. Unifying 90+ SaaS APIs with Coral and MCP.

Every developer knows the pain of constant context switching. You check GitHub for code, Linear for tracking issues, and Datadog for logs. Building custom ETL pipelines to aggregate all this operational data takes weeks of engineering effort and creates massive maintenance overhead.

We built Universal Dev Copilot to solve this exact problem. It is a voice operated developer assistant that interacts directly with your live operational data. 

By combining the Coral federated SQL engine with the Model Context Protocol, we created an agent that can query over 90 SaaS platforms instantly. There is no data duplication and there are no stale dashboards. 

When you ask a question, the LLM translates your intent into federated SQL. Coral then executes this SQL directly against the live APIs. If a query fails or hits an API rate limit, our backend intercepts the failure. It then orchestrates an autonomous self healing loop to correct the SQL and retry the request before responding to the user.

We also built a dynamic marketplace interface. Adding a new data source like Hugging Face takes seconds. You just provide an API token, and the agent discovers the new database schemas at runtime without requiring any code changes.

Tech Stack:
* Frontend: Next.js 15
* Backend: FastAPI and Python
* LLM Orchestration: GPT 4o with Model Context Protocol
* Query Engine: Coral DataFusion
* Voice: OpenAI Whisper

We are excited to share this project. Check out the demo video below and find the full source code on our GitHub repository. 

[Link to Demo Video]
[Link to GitHub Repo]

***

## Bounty 2: Captain's Log End-to-End Guide

**Target Platform:** Hashnode, Dev.to, or Medium
**Title:** How to Build a Voice Operated Developer Copilot with Coral and MCP
**SEO Meta Description:** Learn how to build a voice operated developer assistant using the Coral federated SQL engine, Model Context Protocol, FastAPI, and Next.js. Eliminate ETL pipelines.

### Blog Post Content

#### The 3 AM Problem

I remember staring at my screen at three in the morning during a critical incident. I had GitHub open on one monitor to check pull requests, Datadog on another to watch error rates, and Slack in a third window trying to coordinate with my team. The friction of jumping between these isolated platforms was painfully slow. 

I realized then that developers do not need more dashboards. We need a unified interface to interact with our live operational data. The traditional industry answer to this problem is building custom ETL pipelines to dump all this data into a central warehouse. But for operational data, that approach takes weeks of engineering time and the data is stale the moment it lands. 

I wanted an assistant that I could talk to while my hands were on the keyboard. A tool that could query my entire stack in real time without moving any data. This guide explains exactly how I built a voice operated developer copilot using the Coral federated SQL engine and the Model Context Protocol.

#### The Architectural Blueprint

To solve this, I designed a highly decoupled system consisting of three main layers:
1. A Next.js frontend that handles audio capture and the chat interface.
2. A FastAPI backend that orchestrates the OpenAI GPT 4o agent.
3. The Coral MCP Server, which acts as the execution engine for federated SQL.

Here is a step by step breakdown of how you can build this yourself. 

#### Step 1: Setting up the Zero ETL Foundation with Coral

The core requirement for this project was querying live APIs without data pipelines. I found that the Coral SQL engine solves this perfectly by translating standard SQL into real time API requests. 

To start, I installed the Coral CLI. Instead of writing complex API wrappers, I simply connected my GitHub account by running the Coral source add command with my personal access token. Instantly, Coral acted as a local database endpoint. I could run a simple SQL query to select all open pull requests, and Coral would fetch that data live from GitHub. This gave my copilot a powerful, zero ETL foundation.

#### Step 2: Connecting the Brain with the Model Context Protocol

The next challenge was teaching the LLM about the data schemas available in Coral. I could have hardcoded the table definitions into the agent prompt, but that approach is rigid. If I added a new tool like Slack later, I would have to rewrite the prompt.

Instead, I integrated the Model Context Protocol. MCP standardizes how AI models discover local tools and data structures. In my FastAPI backend, I initialized an MCP client over standard input and output to communicate directly with the Coral binary. 

This connection gave my LLM access to a "list_tables" tool. Now, when the agent boots up, it dynamically inspects the available schemas. If I add a new integration to Coral, the copilot immediately knows how to query it without a single line of code changing in the backend. 

#### Step 3: Engineering the Self Healing SQL Loop

If you have ever asked an LLM to write SQL, you know they frequently hallucinate column names or make syntax errors. If I just executed their first attempt, the copilot would break constantly.

To make the system reliable, I engineered an autonomous self healing loop in Python. When the user asks a question, the LLM searches the dynamic schemas and generates a SQL query. My backend then sends this query to the Coral engine. 

If Coral throws a syntax error or a rate limit exception, I do not show that error to the user. Instead, the Python backend catches the exception and feeds the exact error message back into the LLM context. I instruct the agent to analyze the error, fix the syntax, and retry the query. This invisible retry mechanism happens in the background, ensuring the final answer presented to the user is always accurate.

#### Step 4: Integrating Voice with OpenAI Whisper

To make this a true copilot, I needed to eliminate typing entirely. I added a voice interface to the Next.js frontend using the native browser MediaRecorder API. 

When a user clicks the microphone icon, the browser captures the audio stream as a webm blob. I send this audio payload to a specific endpoint on my FastAPI server. The backend processes the audio using the OpenAI Whisper model, which converts the speech into text with incredible accuracy. This transcribed text is then injected directly into the agent loop as a standard user prompt.

#### The Future of Developer Tools

Building this copilot completely changed my perspective on internal tooling. By combining federated SQL execution with standard protocols like MCP, we can build tools that adapt to our workflows rather than forcing us to adapt to theirs. 

We can completely bypass the heavy lifting of ETL pipelines for operational data. You can find the complete, open source repository for this project on my GitHub. I encourage you to clone it, connect your own tools, and start talking to your stack.

***

## Bounty 3: Early Bird Swag Social Sharer

**Target Platform:** X (Twitter) and LinkedIn
**Goal:** Tag Coral and spread the word with a highly compelling hook.

### Version 1: X (Twitter) Optimized
**Note:** Fits perfectly within 280 characters but packs a massive punch by challenging the status quo.

Stop building ETL pipelines for operational data. I just built a voice operated copilot that queries live GitHub and Slack data instantly using federated SQL. No moving data. No stale dashboards. Massive thanks to @withcoral for the execution engine. Code and demo below.

### Version 2: LinkedIn Optimized
**Note:** A bold, story driven post that hooks senior engineers and judges immediately.

The industry is obsessed with building massive ETL pipelines for operational data. But when an incident hits at three in the morning, we do not need another stale dashboard. We need answers immediately.

This weekend, I built Universal Dev Copilot. It is a voice operated agent that queries live SaaS APIs using natural language. 

Instead of dumping data into a central warehouse, I used the @withcoral federated SQL engine combined with the Model Context Protocol. Now, I can ask my stack a question out loud and get correlated data from GitHub, Slack, and Datadog in real time. 

Zero data duplication. Zero pipelines to maintain. 

If you are tired of context switching and paying for dozens of disconnected tools, check out the open source code and demo video below.
