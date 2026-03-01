'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, onFileUpload, isLoading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    e.target.value = '';
  };

  return (
    <div className="border-t border-ws-border bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 bg-ws-bg border border-ws-border rounded-2xl px-4 py-3 focus-within:border-ws-green/40 transition-colors">
          {onFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-1 text-ws-text-muted hover:text-ws-text-secondary transition-colors"
                title="Upload CSV"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask me about your portfolio..."}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-ws-text placeholder:text-ws-text-muted resize-none outline-none min-h-[24px] max-h-[120px]"
          />

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${
              message.trim() && !isLoading
                ? 'bg-ws-btn-dark text-white hover:bg-ws-btn-dark-hover'
                : 'bg-ws-border text-ws-text-muted cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-ws-text-muted mt-2 text-center">
          Copilot provides analysis and education — not financial advice. You make the final decisions.
        </p>
      </div>
    </div>
  );
}
