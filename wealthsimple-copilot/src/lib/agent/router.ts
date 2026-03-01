import Anthropic from '@anthropic-ai/sdk';
import { RouterResponse, ModuleType, Message } from '@/types/agent';

const ROUTER_SYSTEM_PROMPT = `You are the routing layer of Wealthsimple Copilot, an AI financial assistant. Your ONLY job is to classify the user's message and return a JSON object indicating which module should handle it.

## Modules Available

1. **trading-coach** — Anything about trading behavior, portfolio analysis, buy/sell considerations, position sizing, performance review, stock analysis, behavioral biases
2. **tax-optimizer** — Anything about taxes, capital gains, tax-loss harvesting, TFSA/RRSP optimization, superficial loss rule, ACB calculations
3. **general** — Greetings, meta-questions about the copilot itself, anything that doesn't clearly fit the above

## Rules

- If the message could fit multiple modules, prefer the one most specifically relevant.
- If the user has been in a conversation with a specific module and the message is a follow-up, route to the same module.
- Never explain your reasoning. Return ONLY the JSON.

## Output Format

Return ONLY valid JSON, nothing else:

{"module": "trading-coach" | "tax-optimizer" | "general", "confidence": 0.0-1.0}`;

export async function routeMessage(
  message: string,
  conversationHistory: Message[],
  activeModule?: ModuleType
): Promise<RouterResponse> {
  // If the user just uploaded data and there's no message, default to trading-coach
  if (!message.trim() || message.toLowerCase().includes('analyze') || message.toLowerCase().includes('upload')) {
    return { module: 'trading-coach', confidence: 0.95 };
  }

  // Quick pattern matching for obvious cases
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('tax') || lowerMsg.includes('harvest') || lowerMsg.includes('capital gain') || lowerMsg.includes('tfsa') || lowerMsg.includes('rrsp') || lowerMsg.includes('acb') || lowerMsg.includes('superficial loss')) {
    return { module: 'tax-optimizer', confidence: 0.9 };
  }

  if (lowerMsg.includes('buy') || lowerMsg.includes('sell') || lowerMsg.includes('trade') || lowerMsg.includes('bias') || lowerMsg.includes('pattern') || lowerMsg.includes('portfolio') || lowerMsg.includes('position') || lowerMsg.includes('stock') || lowerMsg.includes('shares')) {
    return { module: 'trading-coach', confidence: 0.9 };
  }

  // For ambiguous messages, use Claude to route
  try {
    const client = new Anthropic();

    const recentContext = conversationHistory.slice(-4).map(m =>
      `${m.role}: ${m.content.substring(0, 200)}`
    ).join('\n');

    const routerMessage = recentContext
      ? `Recent conversation:\n${recentContext}\n\nNew message: ${message}`
      : message;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: ROUTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: routerMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    return {
      module: parsed.module as ModuleType,
      confidence: parsed.confidence || 0.8,
    };
  } catch {
    // Fallback: if there's an active module, stay with it; otherwise default to general
    return {
      module: activeModule || 'general',
      confidence: 0.5,
    };
  }
}
