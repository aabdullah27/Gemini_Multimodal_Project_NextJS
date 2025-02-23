"use client";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type Message = {
  type: 'human' | 'gemini';
  text: string;
};

const HumanMessage = ({ text }: { text: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 items-start"
  >
    <Avatar className="h-10 w-10 ring-2 ring-blue-500/10">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback className="bg-blue-50 text-blue-900">H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-100">You</p>
      </div>
      <div className="rounded-2xl bg-blue-500/10 backdrop-blur-sm px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-blue-900/5">
        {text}
      </div>
    </div>
  </motion.div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 items-start"
  >
    <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-500/20">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-zinc-100">Gemini</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-white/5 px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-blue-900/5">
        {text}
      </div>
    </div>
  </motion.div>
);

export default function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl blur-3xl" />
      <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <ScrollArea className="h-[400px] p-6">
          <div className="space-y-8">
            <GeminiMessage text="Hi! I'm Gemini. I can see and hear you. Let's chat!" />
            {messages.map((message, index) => (
              message.type === 'human' 
                ? <HumanMessage key={index} text={message.text} />
                : <GeminiMessage key={index} text={message.text} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
