import type { Metadata } from 'next';
import { Inter, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Wealthsimple Copilot',
  description: 'AI-powered financial copilot for Canadian self-directed investors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
