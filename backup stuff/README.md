# Wealthsimple Copilot

An AI-native financial copilot for Wealthsimple users. Built as a submission for Wealthsimple's AI Builders program.

## What Is This?

Wealthsimple Copilot is a modular AI agent that transforms siloed financial tools into a unified intelligent layer. Instead of a trading app that doesn't talk to your tax software and a chatbot that can't see your account, Copilot provides a single conversational interface that understands your complete financial picture.

### Modules

| Module | Status | Description |
|--------|--------|-------------|
| **Trading Coach** | ✅ Live | Behavioral analysis, bias detection, pre-trade checks |
| **Tax Optimizer** | ✅ Live | Tax-loss harvesting scanner, superficial loss rule alerts |
| **Migration Planner** | 🔜 Coming | Asset consolidation planning from other brokerages |
| **Smart Support** | 🔜 Coming | Context-aware support beyond FAQ answers |

### Design Principle

> The Copilot analyzes, recommends, and explains. It never acts. Every decision that touches money stays in your hands.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/wealthsimple-copilot.git
cd wealthsimple-copilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Digital Ocean

### Option A: App Platform
1. Push repo to GitHub
2. Go to Digital Ocean → App Platform → Create App
3. Connect your GitHub repo
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Deploy

### Option B: Docker
```bash
docker build -t ws-copilot .
docker run -p 3000:3000 --env-file .env ws-copilot
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- PapaParse (CSV parsing)

## How It Works

1. Upload your Wealthsimple trade history CSV
2. The AI agent analyzes your trading patterns and portfolio
3. Ask follow-up questions conversationally
4. Get pre-trade checks before making decisions
5. Scan for tax-loss harvesting opportunities

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for the full project specification and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical architecture.

## License

MIT
