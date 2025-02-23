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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const cleanupAudio = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const cleanupWebSocket = useCallback(() => {
    if (geminiWsRef.current) {
      geminiWsRef.current.disconnect();
      geminiWsRef.current = null;
    }
  }, []);

  const toggleAudio = async () => {
    setError(null);
    
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
            autoGainControl: true,
          },
        });

        audioContextRef.current = new AudioContext({
          sampleRate: 16000,
          latencyHint: 'interactive',
        });
        
        setStream(audioStream);
        setIsStreaming(true);
      } catch (err: unknown) {
        console.error('Error accessing microphone:', err);
        setError(err instanceof Error ? err.message : 'Failed to access microphone');
        cleanupAudio();
        setIsStreaming(false);
        setStream(null);
      }
    }
  };

  // WebSocket setup with improved error handling
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    try {
      geminiWsRef.current = new GeminiWebSocket(
        (text) => {
          console.log("[Audio] Received from Gemini:", text);
        },
        () => {
          console.log("[Audio] WebSocket connected");
          setConnectionStatus('connected');
          setError(null);
        },
        (isPlaying) => {
          setIsModelSpeaking(isPlaying);
        },
        () => {
          // Audio level callback not used in this component
        },
        onTranscription
      );
      geminiWsRef.current.connect();
    } catch (err: unknown) {
      console.error('[Audio] WebSocket connection failed:', err);
      setError('Failed to connect to Gemini service');
      setConnectionStatus('disconnected');
    }

    return () => {
      cleanupWebSocket();
      setConnectionStatus('disconnected');
    };
  }, [isStreaming, onTranscription, cleanupWebSocket]);

  // Enhanced audio processing setup
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

        workletNodeRef.current = workletNode;

        workletNode.port.onmessage = (event) => {
          if (!event.data) return;
          const { pcmData, level } = event.data;
          setAudioLevel(Math.min(level * 1.2, 100)); // Slightly amplified for better visualization
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
      } catch (error: unknown) {
        console.error('[Audio] Audio setup failed:', error);
        setError('Failed to initialize audio processing');
        cleanupAudio();
      }
    };

    setupAudioProcessing();
  }, [isStreaming, stream, cleanupAudio, isModelSpeaking]);

  // Improved wave animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const drawWave = () => {
      if (!ctx) return;

      // Clear canvas with a fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const centerY = canvasHeight / 2;
      const amplitude = (audioLevel / 100) * (canvasHeight / 3);
      
      // Draw the main waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let x = 0; x < canvasWidth; x++) {
        const frequency = 0.02;
        const time = Date.now() * 0.003;
        
        // Combine multiple sine waves for a more complex animation
        const y = centerY + 
          Math.sin(x * frequency + time) * amplitude +
          Math.sin(x * frequency * 2 + time * 1.5) * (amplitude * 0.5);

        ctx.lineTo(x, y);
      }

      // Create gradient for the line
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      if (isModelSpeaking) {
        gradient.addColorStop(0, '#059669');
        gradient.addColorStop(1, '#10b981');
      } else {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + (audioLevel * 0.05);
      ctx.stroke();

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = isModelSpeaking ? '#10b981' : '#3b82f6';
      
      animationFrameRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isModelSpeaking]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
        {/* Status Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
          <div className={cn(
            "h-2 w-2 rounded-full",
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          )} />
          <span className="text-xs font-medium text-white">
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>

        {/* Canvas Container */}
        <div className="relative aspect-[3/1] w-full">
          <canvas
            ref={canvasRef}
            width={640}
            height={200}
            className="w-full h-full"
          />
          
          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}

          {/* Mic Button */}
          <Button
            onClick={toggleAudio}
            size="icon"
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-12 h-12 transition-all duration-200",
              isStreaming 
                ? "bg-red-500/80 hover:bg-red-500 text-white" 
                : "bg-blue-500/80 hover:bg-blue-500 text-white"
            )}
          >
            {isStreaming ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>

        {/* Audio Level Indicator */}
        {isStreaming && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm">
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            {isModelSpeaking && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-white">AI Speaking</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
