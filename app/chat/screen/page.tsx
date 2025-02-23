"use client";
import { useState, useCallback } from 'react';
import ScreenSharePreview from '../../components/ScreenSharePreview';
import ChatMessages, { Message } from '../../components/ChatMessages';

export default function ScreenPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
  }, []);

  return (
    <>
      {/* Preview Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl blur-3xl" />
        <div className="relative h-[400px] rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-6 flex items-center justify-center shadow-2xl">
          <div className="w-[720px]">
            <ScreenSharePreview onTranscription={handleTranscription} />
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <ChatMessages messages={messages} />
    </>
  );
}
