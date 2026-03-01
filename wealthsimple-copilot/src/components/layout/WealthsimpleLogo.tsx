'use client';

export default function WealthsimpleLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-4xl',
  };

  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-serif ${sizeClasses[size]} text-ws-bg-dark tracking-tight`}>
        Wealthsimple
      </span>
      <span className={`text-xs font-sans font-medium uppercase tracking-widest text-ws-green ${size === 'large' ? 'text-sm' : ''}`}>
        Copilot
      </span>
    </div>
  );
}
