'use client';

import WealthsimpleLogo from './WealthsimpleLogo';
import { Upload } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  onUploadClick: () => void;
  onHomeClick?: () => void;
}

export default function Header({ hasData, onUploadClick, onHomeClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-ws-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <button onClick={onHomeClick} className="hover:opacity-70 transition-opacity">
        <WealthsimpleLogo />
      </button>
      <div className="flex items-center gap-4">
        {hasData && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 text-sm text-ws-text-secondary hover:text-ws-text transition-colors px-3 py-1.5 rounded-full hover:bg-ws-bg-alt"
          >
            <Upload className="w-4 h-4" />
            Upload New CSV
          </button>
        )}
      </div>
    </header>
  );
}
