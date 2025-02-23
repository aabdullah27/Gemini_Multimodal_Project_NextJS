// app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SettingsDialog } from './components/SettingsDialog';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gemini Multimodal Chat',
  description: 'Modern AI-powered multimodal chat interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={jakarta.className}>
        <div className="fixed top-6 right-6 z-50">
          <SettingsDialog />
        </div>
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          <main className="min-h-screen p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="relative w-full max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
