import { NextRequest } from 'next/server';
import { routeMessage } from '@/lib/agent/router';
import { handleTradingCoach } from '@/lib/agent/modules/trading-coach';
import { handleTaxOptimizer } from '@/lib/agent/modules/tax-optimizer';
import { analyzePortfolio } from '@/lib/analysis/portfolio';
import { ChatRequest, ModuleType } from '@/types/agent';
import Anthropic from '@anthropic-ai/sdk';

const GENERAL_SYSTEM = `You are Wealthsimple Copilot, a friendly AI financial assistant for Canadian self-directed investors using Wealthsimple.

You have several specialized modules:
1. **Trading Coach** — Analyzes trade history, detects behavioral biases, does pre-trade sanity checks
2. **Tax Optimizer** — Identifies tax-loss harvesting opportunities from portfolio data
3. **Migration Planner** (coming soon) — Helps users plan asset consolidation from other brokerages
4. **Smart Support** (coming soon) — Context-aware support that understands the user's account

When users greet you or ask general questions, be warm and helpful. Guide them toward uploading their trade data CSV so you can provide personalized insights.

If they haven't uploaded data yet, explain what you can do and encourage them to upload their Wealthsimple trade history CSV.

Keep responses concise, friendly, and professional. Use markdown formatting.
Never provide specific financial advice. Frame everything as education and analysis.
Use CAD ($) as default currency. Be aware of Canadian-specific concepts (TFSA, RRSP, etc.).`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-key-here') {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your .env.local file and restart the server.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: ChatRequest = await req.json();
    const { message, conversationHistory, portfolioData, activeModule } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Route the message to the right module
    const routerResult = await routeMessage(message, conversationHistory, activeModule);
    const targetModule: ModuleType = routerResult.module;

    // Build portfolio summary if data exists
    let portfolioSummary = undefined;
    if (portfolioData && portfolioData.length > 0) {
      portfolioSummary = analyzePortfolio(portfolioData);
    }

    let stream: ReadableStream;

    switch (targetModule) {
      case 'trading-coach':
        stream = await handleTradingCoach({
          message,
          conversationHistory,
          portfolioData,
          portfolioSummary,
        });
        break;

      case 'tax-optimizer':
        stream = await handleTaxOptimizer({
          message,
          conversationHistory,
          portfolioData,
          portfolioSummary,
        });
        break;

      default:
        // General handler
        stream = await handleGeneral(message, conversationHistory);
        break;
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Module': targetModule,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleGeneral(message: string, conversationHistory: { role: string; content: string }[]): Promise<ReadableStream> {
  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = [];

  for (const msg of conversationHistory) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: message });

  const anthropicStream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: GENERAL_SYSTEM,
    messages,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
