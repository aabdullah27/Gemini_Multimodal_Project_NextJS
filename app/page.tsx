// app/page.tsx
"use client";
import { useState, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import AudioPreview from './components/AudioPreview';
import ScreenSharePreview from './components/ScreenSharePreview';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, Mic, Monitor } from "lucide-react";

// Helper function to create message components
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-900">You</p>
      </div>
      <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800">
        {text}
      </div>
    </div>
  </div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-3 items-start">
    <Avatar className="h-8 w-8 bg-blue-600">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-900">Gemini</p>
      </div>
      <div className="rounded-lg bg-white border border-zinc-200 px-3 py-2 text-sm text-zinc-800">
        {text}
      </div>
    </div>
  </div>
);

export default function Home() {
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);
  const [mode, setMode] = useState<'camera' | 'audio' | 'screen'>('camera');

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
  }, []);

  return (
    <>
      <h1 className="text-4xl font-bold text-zinc-800 p-8 pb-0">
        Multimodal Live Chat
      </h1>
      <div className="flex gap-8 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'camera' ? "default" : "outline"}
              onClick={() => setMode('camera')}
              size="sm"
            >
              <Video className="h-4 w-4 mr-2" />
              Camera Mode
            </Button>
            <Button
              variant={mode === 'audio' ? "default" : "outline"}
              onClick={() => setMode('audio')}
              size="sm"
            >
              <Mic className="h-4 w-4 mr-2" />
              Audio Mode
            </Button>
            <Button
              variant={mode === 'screen' ? "default" : "outline"}
              onClick={() => setMode('screen')}
              size="sm"
            >
              <Monitor className="h-4 w-4 mr-2" />
              Screen Share
            </Button>
          </div>
          {mode === 'camera' ? (
            <CameraPreview onTranscription={handleTranscription} />
          ) : mode === 'audio' ? (
            <AudioPreview onTranscription={handleTranscription} />
          ) : (
            <ScreenSharePreview onTranscription={handleTranscription} />
          )}
        </div>

        <div className="w-[640px] bg-white">
          <ScrollArea className="h-[540px] p-6">
            <div className="space-y-6">
              <GeminiMessage text="Hi! I'm Gemini. I can see and hear you. Let's chat!" />
              {messages.map((message, index) => (
                message.type === 'human' ? (
                  <HumanMessage key={`msg-${index}`} text={message.text} />
                ) : (
                  <GeminiMessage key={`msg-${index}`} text={message.text} />
                )
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
