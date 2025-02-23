"use client";
import { useState, ComponentType } from 'react'; // Add ComponentType import
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Brain, Sparkles, Shield, Zap, Github, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: ComponentType<{ className?: string }>; // Use ComponentType instead of any
  title: string; 
  description: string; 
  index: number; 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-white/5 rounded-3xl blur-xl"
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div 
        className="relative p-8 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full"
        animate={{
          y: isHovered ? -5 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 mb-6"
          animate={{
            rotate: isHovered ? 5 : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-full h-full text-white" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 text-lg leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
};

const SocialLink = ({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: ComponentType<{ className?: string }>; // Use ComponentType instead of any
  label: string; 
}) => (
  <Link 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-zinc-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </Link>
);

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-white/5" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  Next-Gen AI Chat
                </span>
              </h1>
              <p className="mt-6 text-xl text-zinc-400">
                Experience the future of communication with our multimodal AI chat interface.
                Seamlessly interact using voice, video, and screen sharing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/chat/camera">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 px-8"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Lets Chat
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Experience the next generation of AI communication with our cutting-edge features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              index={0}
              icon={MessageSquare}
              title="Multimodal Chat"
              description="Seamlessly switch between text, voice, and video communication modes"
            />
            <FeatureCard
              index={1}
              icon={Brain}
              title="Advanced AI"
              description="Powered by Google's Gemini, offering human-like understanding and responses"
            />
            <FeatureCard
              index={2}
              icon={Sparkles}
              title="Real-time Processing"
              description="Get instant responses with our lightning-fast AI processing"
            />
            <FeatureCard
              index={3}
              icon={Shield}
              title="Secure & Private"
              description="Your conversations are encrypted and private by default"
            />
            <FeatureCard
              index={4}
              icon={Zap}
              title="High Performance"
              description="Built with Next.js for optimal speed and reliability"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-white/5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Ready to Experience the Future?
            </h2>
            <p className="text-zinc-400">
              Join thousands of users who are already experiencing the next generation of AI communication.
            </p>
            <div className="flex justify-center">
              <Link href="/chat/camera">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 px-8"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-400">
              Made with ❤️ by Abdullah
            </p>
            <div className="flex items-center gap-6">
              <SocialLink 
                href="https://github.com/aabdullah27" 
                icon={Github}
                label="GitHub"
              />
              <SocialLink 
                href="https://www.linkedin.com/in/muhammad-abdullah-py-dev/" 
                icon={Linkedin}
                label="LinkedIn"
              />
              <SocialLink 
                href="https://www.instagram.com/abdllah._.77/" 
                icon={Instagram}
                label="Instagram"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
