"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { GeminiWebSocket } from '../services/geminiWebSocket';
import { Base64 } from 'js-base64';
import { cn } from "@/lib/utils";

interface AudioPreviewProps {
  onTranscription: (text: string) => void;
}

export default function AudioPreview({ onTranscription }: AudioPreviewProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const geminiWsRef = useRef<GeminiWebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [outputAudioLevel, setOutputAudioLevel] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();

  const cleanupAudio = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (geminiWsRef.current) {
      geminiWsRef.current.disconnect();
      geminiWsRef.current = null;
    }
  }, []);

  const toggleAudio = async () => {
    if (isStreaming && stream) {
      setIsStreaming(false);
      cleanupWebSocket();
      cleanupAudio();
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    } else {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
        setStream(audioStream);
        setIsStreaming(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        cleanupAudio();
        setIsStreaming(false);
        setStream(null);
      }
    }
  };

  // WebSocket setup
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    geminiWsRef.current = new GeminiWebSocket(
      (text) => {
        console.log("[Audio] Received from Gemini:", text);
      },
      () => {
        console.log("[Audio] WebSocket connected");
        setConnectionStatus('connected');
      },
      (isPlaying) => {
        setIsModelSpeaking(isPlaying);
      },
      (level) => {
        setOutputAudioLevel(level);
      },
      onTranscription
    );
    geminiWsRef.current.connect();

    return () => {
      cleanupWebSocket();
      setConnectionStatus('disconnected');
    };
  }, [isStreaming, onTranscription, cleanupWebSocket]);

  // Audio processing setup
  useEffect(() => {
    if (!isStreaming || !stream || !audioContextRef.current) return;

    const setupAudioProcessing = async () => {
      try {
        const ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') return;

        console.log("[Audio] Loading audio worklet");
        await ctx.audioWorklet.addModule('/worklets/audio-processor.js');
        console.log("[Audio] Audio worklet loaded");

        const source = ctx.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(ctx, 'audio-processor', {
          processorOptions: {
            sampleRate: 16000,
            bufferSize: 2048
          }
        });

        workletNode.port.onmessage = (event) => {
          if (!event.data) return;
          const { pcmData, level } = event.data;
          setAudioLevel(Math.min(level, 100));
          if (pcmData && !isModelSpeaking && geminiWsRef.current) {
            geminiWsRef.current.sendMediaChunk(
              Base64.fromUint8Array(new Uint8Array(pcmData)),
              "audio/pcm"
            );
          }
        };

        source.connect(workletNode);
        console.log("[Audio] Audio processing connected");

        return () => {
          source.disconnect();
          workletNode.disconnect();
          console.log("[Audio] Audio processing disconnected");
        };
      } catch (error) {
        console.error('[Audio] Audio setup failed:', error);
        cleanupAudio();
      }
    };

    setupAudioProcessing();
  }, [isStreaming, stream, cleanupAudio, isModelSpeaking]);

  // Smooth wave animation
  useEffect(() => {
    const canvasWidth = 640;
    const canvasHeight = 200;
    const animate = () => {
      if (!canvasRef.current || !audioLevel) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Fade-out effect for smoother transitions
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Dynamic line thickness based on audio level
      ctx.lineWidth = 2 + (audioLevel * 3);
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Smoother wave animation with bezier curves
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight/2);
      
      const segmentWidth = canvasWidth / 10;
      for (let i = 0; i < 10; i++) {
        const x = i * segmentWidth + segmentWidth/2;
        const y = canvasHeight/2 + Math.sin(Date.now()/200 + x/50) * audioLevel * 20;
        
        ctx.bezierCurveTo(
          x - segmentWidth/2, canvasHeight/2,
          x - segmentWidth/4, y,
          x, y
        );
      }

      ctx.strokeStyle = isModelSpeaking ? '#10b981' : '#059669';
      ctx.stroke();
      
      requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, isModelSpeaking, outputAudioLevel, audioLevel]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[640px] aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
        {/* Wave Animation */}
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="w-full h-full"
        />
        
        {/* Microphone Button - Positioned at the right */}
        <div className="absolute right-4 bottom-4">
          <Button
            size="icon"
            variant={isStreaming ? "default" : "outline"}
            onClick={toggleAudio}
            className={cn(
              "rounded-full w-12 h-12",
              "transition-all duration-300",
              isStreaming 
                ? "bg-green-500/50 hover:bg-green-500/70 text-white backdrop-blur-sm"
                : "bg-zinc-100/10 hover:bg-zinc-100/20 backdrop-blur-sm"
            )}
          >
            {isStreaming ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Status Text */}
      <div className={cn(
        "flex items-center gap-2 text-sm font-medium",
        "transition-all duration-300",
        isModelSpeaking ? "text-emerald-500" : "text-zinc-500"
      )}>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isModelSpeaking 
            ? "bg-emerald-500 animate-pulse"
            : isStreaming 
              ? "bg-green-500 animate-[pulse_1.5s_ease-in-out_infinite]"
              : "bg-zinc-400"
        )} />
        {!isStreaming 
          ? "Click to start"
          : connectionStatus !== 'connected'
            ? connectionStatus === 'connecting' 
              ? "Connecting..."
              : "Disconnected"
            : isModelSpeaking 
              ? "Assistant is speaking..."
              : "Listening..."
        }
      </div>
    </div>
  );
}
