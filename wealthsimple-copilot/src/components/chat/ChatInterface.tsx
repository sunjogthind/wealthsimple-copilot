'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Message, ModuleType } from '@/types/agent';
import { ParsedTrade } from '@/types/trade';
import { parseCSV } from '@/lib/parsers/csv-parser';
import { Bot } from 'lucide-react';

interface ChatInterfaceProps {
  portfolioData: ParsedTrade[] | null;
  activeModule: ModuleType | null;
  onModuleChange: (module: ModuleType) => void;
  onDataUpload: (trades: ParsedTrade[]) => void;
  pendingStarterMessage: string | null;
  onStarterMessageSent: () => void;
}

export default function ChatInterface({
  portfolioData,
  activeModule,
  onModuleChange,
  onDataUpload,
  pendingStarterMessage,
  onStarterMessageSent,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialGreeting = useRef(false);
  const processingStarter = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send initial greeting
  useEffect(() => {
    if (!hasInitialGreeting.current) {
      hasInitialGreeting.current = true;
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content: portfolioData
          ? "Welcome back! I have your portfolio data loaded. What would you like to explore? I can analyze your trading patterns, check for behavioral biases, or look at tax optimization opportunities."
          : "Hello! I'm your **Wealthsimple Copilot** — an AI assistant that helps you become a more self-aware investor.\n\nTo get started, **upload your Wealthsimple trade history CSV** using the upload area or the attachment button below. Once I have your data, I can:\n\n- **Analyze your trading patterns** and detect behavioral biases\n- **Run pre-trade sanity checks** on trades you're considering\n- **Identify tax-loss harvesting opportunities** in your portfolio\n\nWhat would you like to do?",
        timestamp: new Date(),
        module: 'general',
      };
      setMessages([greeting]);
    }
  }, [portfolioData]);

  // Handle starter messages from sidebar clicks
  useEffect(() => {
    if (pendingStarterMessage && !isLoading && !processingStarter.current) {
      processingStarter.current = true;
      onStarterMessageSent();
      sendMessage(pendingStarterMessage).finally(() => {
        processingStarter.current = false;
      });
    }
  }, [pendingStarterMessage]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          portfolioData: portfolioData,
          activeModule: activeModule,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const detectedModule = response.headers.get('X-Module') as ModuleType;
      if (detectedModule && detectedModule !== activeModule) {
        onModuleChange(detectedModule);
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        module: detectedModule || activeModule || 'general',
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        let fullContent = '';
        let buffer = '';
        let lastRenderTime = Date.now();
        const RENDER_INTERVAL = 50; // ms

        const renderBuffer = () => {
          if (buffer) {
            fullContent += buffer;
            buffer = '';
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: fullContent }
                  : m
              )
            );
            lastRenderTime = Date.now();
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            renderBuffer(); // Flush remaining buffer
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Render if enough time has passed
          if (Date.now() - lastRenderTime >= RENDER_INTERVAL) {
            renderBuffer();
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Something went wrong'}. Please try again.`,
        timestamp: new Date(),
        module: 'general',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const result = parseCSV(text);

      if (result.success && result.trades.length > 0) {
        onDataUpload(result.trades);

        const systemMsg: Message = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: `${file.name} uploaded — ${result.trades.length} trades loaded`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, systemMsg]);

        // Auto-trigger analysis
        setTimeout(() => {
          sendMessage("Please analyze my trading history and give me a comprehensive overview of my portfolio, trading patterns, and any behavioral biases you detect.");
        }, 500);
      } else {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `I had trouble reading that file. ${result.errors.join('. ')}. Please make sure it's a valid Wealthsimple CSV export with columns: Date, Transaction Type, Symbol, Quantity, Price, Amount, Currency, Account Type.`,
          timestamp: new Date(),
          module: 'general',
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to read the file. Please try again with a valid CSV file.',
        timestamp: new Date(),
        module: 'general',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 chat-scroll-container">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-ws-green-light flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-ws-green" />
              </div>
              <h2 className="text-xl font-serif text-ws-text mb-2">Wealthsimple Copilot</h2>
              <p className="text-ws-text-secondary max-w-md">
                Your AI-powered trading coach. Upload your trade history to get started.
              </p>
            </div>
          )}

          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-ws-green-light flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-ws-green" />
              </div>
              <div className="bg-white shadow-ws border border-ws-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-ws-text-muted typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-ws-text-muted typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-ws-text-muted typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        onSend={sendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        placeholder={
          portfolioData
            ? "Ask about your portfolio, or describe a trade you're considering..."
            : "Upload your CSV to get started, or ask me what I can do..."
        }
      />
    </div>
  );
}
