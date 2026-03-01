'use client';

import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types/agent';
import ModuleIndicator from './ModuleIndicator';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3 message-enter">
        <div className="bg-ws-card/50 border border-ws-border rounded-full px-4 py-1.5 text-xs text-ws-text-muted">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 message-enter ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-ws-bg-alt' : 'bg-ws-green-light'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-ws-text-secondary" />
        ) : (
          <Bot className="w-4 h-4 text-ws-green" />
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && message.module && (
          <div className="mb-1.5">
            <ModuleIndicator module={message.module} />
          </div>
        )}

        <div className={`rounded-2xl px-4 py-3 chat-message-bubble ${
          isUser
            ? 'bg-ws-btn-dark text-white rounded-br-md'
            : 'bg-white shadow-ws border border-ws-border text-ws-text rounded-bl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        <span className="text-[10px] text-ws-text-muted mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('en-CA', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
