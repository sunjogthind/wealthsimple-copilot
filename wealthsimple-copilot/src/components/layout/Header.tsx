'use client';

import { useState } from 'react';
import WealthsimpleLogo from './WealthsimpleLogo';
import { Upload, Info } from 'lucide-react';
import AboutModal from './AboutModal';

interface HeaderProps {
  hasData: boolean;
  onUploadClick: () => void;
  onHomeClick?: () => void;
}

export default function Header({ hasData, onUploadClick, onHomeClick }: HeaderProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
    <header className="h-14 border-b border-ws-border bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-50">
      <button onClick={onHomeClick} className="hover:opacity-70 transition-opacity">
        <WealthsimpleLogo />
      </button>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAbout(true)}
          className="flex items-center gap-2 text-sm text-ws-text-secondary hover:text-ws-text transition-colors px-3 py-1.5 rounded-full hover:bg-ws-bg-alt"
          aria-label="About"
        >
          <Info className="w-4 h-4" />
          About
        </button>
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

    <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
