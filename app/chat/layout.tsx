"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Mic, Monitor } from "lucide-react";
import { motion } from "framer-motion";

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className="relative">
      <div className="relative">
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl"
            style={{ backdropFilter: 'blur(8px)' }}
          />
        )}
        <Button
          variant="ghost"
          size="lg"
          className={`relative z-10 px-6 py-2 transition-all duration-300 ${
            isActive
              ? 'text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Icon className="h-5 w-5 mr-2" />
          {label}
        </Button>
      </div>
    </Link>
  );
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                Multimodal Live Chat
              </h1>
            </div>
            <nav className="flex items-center gap-2">
              <NavLink
                href="/chat/camera"
                icon={Video}
                label="Camera"
              />
              <NavLink
                href="/chat/audio"
                icon={Mic}
                label="Audio"
              />
              <NavLink
                href="/chat/screen"
                icon={Monitor}
                label="Screen"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {children}
      </main>
    </div>
  );
}
