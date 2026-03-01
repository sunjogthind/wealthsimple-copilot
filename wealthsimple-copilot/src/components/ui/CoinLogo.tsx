'use client';

import Image from 'next/image';

export default function CoinLogo({ size = 80 }: { size?: number }) {
  const padding = Math.round(size * 0.12);
  const outerSize = size + padding * 2;

  return (
    <div className="coin-float" style={{ width: outerSize, height: outerSize }}>
      <div
        className="coin-shine rounded-full bg-white flex items-center justify-center"
        style={{
          width: outerSize,
          height: outerSize,
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        }}
      >
        <Image
          src="/coin-logo.png"
          alt="Wealthsimple Copilot"
          width={size}
          height={size}
          className="rounded-full"
          priority
        />
      </div>
    </div>
  );
}
