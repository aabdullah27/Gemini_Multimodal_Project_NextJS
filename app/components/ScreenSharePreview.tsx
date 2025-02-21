"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff } from "lucide-react";
import { GeminiWebSocket } from '../services/geminiWebSocket';
import { Base64 } from 'js-base64';

interface ScreenSharePreviewProps {
  onTranscription: (text: string) => void;
}

export default function ScreenSharePreview({ onTranscription }: ScreenSharePreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const geminiWsRef = useRef<GeminiWebSocket | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [outputAudioLevel, setOutputAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

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

  const toggleScreenShare = async () => {
    if (isStreaming && stream) {
      setIsStreaming(false);
      cleanupWebSocket();
      cleanupAudio();
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
    } else {
      try {
        // First get microphone permission
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
          }
        });

        // Then get screen share permission
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: false
        });

        // Initialize audio context
        audioContextRef.current = new AudioContext({
          sampleRate: 16000,
        });

        // Set up video preview
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
          videoRef.current.muted = true;
        }

        // Combine screen and audio tracks
        const combinedStream = new MediaStream([
          ...screenStream.getTracks(),
          ...audioStream.getTracks()
        ]);

        // Handle screen share stop
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log("[ScreenShare] Screen sharing stopped by user");
          setIsStreaming(false);
          cleanupWebSocket();
          cleanupAudio();
          combinedStream.getTracks().forEach(track => track.stop());
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
          setStream(null);
        });

        setStream(combinedStream);
        setIsStreaming(true);
      } catch (err) {
        console.error('Error accessing screen share:', err);
        cleanupAudio();
        setIsStreaming(false);
        setStream(null);
      }
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isStreaming) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    geminiWsRef.current = new GeminiWebSocket(
      (text) => {
        console.log("[ScreenShare] Received from Gemini:", text);
      },
      () => {
        console.log("[ScreenShare] WebSocket setup complete");
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

    const setupAudio = async () => {
      try {
        const ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') return;

        await ctx.audioWorklet.addModule('/worklets/audio-processor.js');
        console.log("[ScreenShare] Audio worklet loaded");
        
        const source = ctx.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(ctx, 'audio-processor', {
          processorOptions: {
            sampleRate: 16000,
            bufferSize: 2048
          }
        });

        workletNode.port.onmessage = (event) => {
          const { pcmData, level } = event.data;
          setAudioLevel(Math.min(level, 100));
          geminiWsRef.current?.sendMediaChunk(
            Base64.fromUint8Array(new Uint8Array(pcmData)), 
            "audio/pcm"
          );
        };

        source.connect(workletNode);
        console.log("[ScreenShare] Audio processing connected");
      } catch (error) {
        console.error('[ScreenShare] Audio setup failed:', error);
      }
    };

    setupAudio();
  }, [isStreaming, stream]);

  // Image capture and send
  useEffect(() => {
    if (!isStreaming || !videoRef.current || !videoCanvasRef.current || !geminiWsRef.current) return;

    const captureAndSend = () => {
      const video = videoRef.current;
      const canvas = videoCanvasRef.current;
      if (!video || !canvas) return;
      
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context || !geminiWsRef.current) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob || !geminiWsRef.current) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!reader.result) return;
          const base64data = reader.result.toString();
          const base64Image = base64data.split(',')[1];
          geminiWsRef.current?.sendMediaChunk(base64Image, "image/jpeg");
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };

    const interval = setInterval(captureAndSend, 1000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-4">
      <Card className="w-[640px]">
        <CardContent className="p-4">
          <div className="relative aspect-video bg-zinc-950 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-cover"
            />
            <canvas
              ref={videoCanvasRef}
              className="hidden"
            />
            
            {/* Connection Status Overlay */}
            {isStreaming && connectionStatus !== 'connected' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
                  <p className="text-white font-medium">
                    {connectionStatus === 'connecting' ? 'Connecting to Gemini...' : 'Disconnected'}
                  </p>
                  <p className="text-white/70 text-sm">
                    Please wait while we establish a secure connection
                  </p>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 right-4">
              <Button
                size="icon"
                variant={isStreaming ? "destructive" : "default"}
                onClick={toggleScreenShare}
                className="backdrop-blur-sm"
              >
                {isStreaming ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Level Indicator */}
      {isStreaming && (
        <div className="w-[640px] h-2 rounded-full bg-green-100">
          <div
            className="h-full rounded-full transition-all bg-green-500"
            style={{ 
              width: `${isModelSpeaking ? outputAudioLevel : audioLevel}%`,
              transition: 'width 100ms ease-out'
            }}
          />
        </div>
      )}
    </div>
  );
}
