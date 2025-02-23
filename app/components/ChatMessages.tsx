"use client";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRef, useEffect } from "react";

export type Message = {
  type: 'human' | 'gemini';
  text: string;
  timestamp?: Date;
};

const MessageTimestamp = ({ date }: { date?: Date }) => (
  <span className="text-xs text-zinc-500">
    {date ? new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) : ''}
  </span>
);

const TypingIndicator = () => (
  <div className="flex gap-1 px-2 py-1">
    <motion.div
      className="h-2 w-2 rounded-full bg-blue-500"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <motion.div
      className="h-2 w-2 rounded-full bg-blue-500"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="h-2 w-2 rounded-full bg-blue-500"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

const HumanMessage = ({ text, timestamp }: { text: string, timestamp?: Date }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 items-start group hover:bg-white/5 rounded-lg p-2 transition-colors"
  >
    <Avatar className="h-10 w-10 ring-2 ring-blue-500/10 shrink-0">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback className="bg-blue-50 text-blue-900">H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">You</p>
        <MessageTimestamp date={timestamp} />
      </div>
      <div className="rounded-2xl bg-blue-500/10 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-blue-900/5 break-words">
        {text}
      </div>
    </div>
  </motion.div>
);

const GeminiMessage = ({ text, timestamp, isTyping }: { text: string, timestamp?: Date, isTyping?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 items-start group hover:bg-white/5 rounded-lg p-2 transition-colors"
  >
    <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-500/20 shrink-0">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">Gemini</p>
        <MessageTimestamp date={timestamp} />
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-white/5 px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-blue-900/5 break-words">
        {text}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  </motion.div>
);

export default function ChatMessages({ messages, isTyping }: { messages: Message[], isTyping?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl blur-3xl" />
      <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
          <div className="space-y-6">
            <GeminiMessage 
              text="Hi! I'm Gemini. I can see and hear you. Let's chat!" 
              timestamp={new Date()} 
            />
            {messages.map((message, index) => (
              message.type === 'human' 
                ? <HumanMessage key={index} text={message.text} timestamp={message.timestamp} />
                : <GeminiMessage key={index} text={message.text} timestamp={message.timestamp} />
            ))}
            {isTyping && (
              <GeminiMessage text="" isTyping={true} />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
