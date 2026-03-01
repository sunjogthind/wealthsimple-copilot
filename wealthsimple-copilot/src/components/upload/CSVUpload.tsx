'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { parseCSV, CSVParseResult } from '@/lib/parsers/csv-parser';
import { ParsedTrade } from '@/types/trade';

interface CSVUploadProps {
  onUploadComplete: (trades: ParsedTrade[]) => void;
  compact?: boolean;
}

export default function CSVUpload({ onUploadComplete, compact = false }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseResult({
        success: false,
        trades: [],
        errors: ['Please upload a CSV file'],
        warnings: [],
      });
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const result = parseCSV(text);
      setParseResult(result);

      if (result.success && result.trades.length > 0) {
        setTimeout(() => {
          onUploadComplete(result.trades);
        }, 800);
      }
    } catch {
      setParseResult({
        success: false,
        trades: [],
        errors: ['Failed to read the file. Please try again.'],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-sm text-ws-text-secondary hover:text-white transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-ws-green bg-ws-green-light scale-[1.02]'
            : parseResult?.success
            ? 'border-ws-green/40 bg-ws-green-light'
            : parseResult && !parseResult.success
            ? 'border-ws-red/40 bg-ws-red-light'
            : 'border-ws-border-dark hover:border-ws-text-muted hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-ws-green animate-spin" />
            <p className="text-ws-text-secondary">Processing {fileName}...</p>
          </div>
        ) : parseResult?.success ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-ws-green" />
            <div>
              <p className="text-ws-text font-medium">{fileName}</p>
              <p className="text-ws-green text-sm mt-1">
                {parseResult.trades.length} trades loaded successfully
              </p>
              {parseResult.warnings.length > 0 && (
                <p className="text-ws-yellow text-xs mt-1">
                  {parseResult.warnings.length} warning(s) — some rows were skipped
                </p>
              )}
            </div>
          </div>
        ) : parseResult && !parseResult.success ? (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-ws-red" />
            <div>
              <p className="text-ws-red font-medium">Upload failed</p>
              {parseResult.errors.map((error, i) => (
                <p key={i} className="text-ws-text-secondary text-sm mt-1">{error}</p>
              ))}
              <p className="text-ws-text-muted text-xs mt-2">Click to try again</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-ws-bg-alt flex items-center justify-center">
              <Upload className="w-8 h-8 text-ws-text-secondary" />
            </div>
            <div>
              <p className="text-ws-text font-serif text-xl">Upload your trade history</p>
              <p className="text-ws-text-secondary text-sm mt-1">
                Drag and drop your Wealthsimple CSV export, or click to browse
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FileText className="w-4 h-4 text-ws-text-muted" />
              <span className="text-xs text-ws-text-muted">
                Supported: CSV files with Date, Symbol, Quantity, Price, Amount columns
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
