# Getting Started with Coral Copilot

Coral Copilot is a voice-operated developer agent that uses the Coral federated SQL engine to answer complex questions about your entire dev stack.

## Prerequisites

Before running the copilot, ensure you have:
1. **Node.js 18+** for the Next.js frontend
2. **Python 3.12+** for the FastAPI backend
3. **Coral CLI** installed globally and available on your `PATH`.
4. **OpenAI API Key** with access to GPT-4o and Whisper.

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd universal-dev-copilot
   ```

2. Run the automated setup:
   ```bash
   make setup
   ```
   This command installs all frontend `npm` dependencies and creates a Python virtual environment with all backend `pip` dependencies.

3. Configure your API key:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and paste your `OPENAI_API_KEY`.

## Running the Copilot

Start both the frontend and backend servers simultaneously:
```bash
make dev
```

- The **UI** will be available at `http://localhost:3000`
- The **API** will be running at `http://localhost:8000`

Open your browser, navigate to the UI, and start talking!

## Next Steps
- Head to the [Marketplace](http://localhost:3000/marketplace) to connect your SaaS tools.
- Read [Connecting Sources](connecting-sources.md) to learn how to add new skills.
