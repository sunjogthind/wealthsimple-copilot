'use client';

import Image from 'next/image';

export default function CoinLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="coin-float" style={{ width: size, height: size }}>
      <Image
        src="/coin-logo.png"
        alt="Wealthsimple Copilot"
        width={size}
        height={size}
        className="coin-shine rounded-full drop-shadow-lg"
        priority
      />
    </div>
  );
}
