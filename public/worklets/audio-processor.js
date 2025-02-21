// Note: AudioWorkletProcessor is available in the worklet scope
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Reduce noise threshold and increase sensitivity
    this.noiseThreshold = 0.005; // Reduced from 0.01
    this.smoothingFactor = 0.85;
    this.previousLevel = 0;
    this.amplificationFactor = 2.0; // Amplify input signal
    this.CHUNK_SIZE = 1024; // Define chunk size for efficient buffer management
    this.sampleBuffer = []; // Initialize sample buffer
  }

  process(inputs) {
    const input = inputs[0][0];
    if (!input) return true;

    // Efficient buffer management
    this.sampleBuffer = this.sampleBuffer.concat(Array.from(input));
    
    if (this.sampleBuffer.length >= this.CHUNK_SIZE) {
      const chunk = this.sampleBuffer.splice(0, this.CHUNK_SIZE);
      
      // Amplify input before processing
      const amplifiedInput = chunk.map(sample => sample * this.amplificationFactor);
      
      // Calculate RMS with amplified input
      const rms = Math.sqrt(amplifiedInput.reduce((sum, sample) => sum + sample * sample, 0) / amplifiedInput.length);
      
      // Apply noise gate with lower threshold
      const processedInput = amplifiedInput.map(sample => 
        Math.abs(sample) < this.noiseThreshold ? 0 : sample
      );

      // Only process if above noise threshold
      if (rms > this.noiseThreshold) {
        const pcmData = new Int16Array(processedInput.map(sample => 
          Math.max(-32768, Math.min(32767, sample * 32768))
        ));
        
        // Adjust level calculation for better sensitivity
        const currentLevel = Math.min(rms * 600, 100); // Increased from 400
        const smoothedLevel = (currentLevel * (1 - this.smoothingFactor)) + 
                            (this.previousLevel * this.smoothingFactor);
        this.previousLevel = smoothedLevel;

        this.port.postMessage({
          pcmData: pcmData.buffer,
          level: smoothedLevel
        }, [pcmData.buffer]);
      } else {
        this.previousLevel = this.previousLevel * this.smoothingFactor;
        this.port.postMessage({
          pcmData: new Int16Array(chunk.length).buffer,
          level: this.previousLevel
        });
      }
    }

    return true;
  }
}

// Register processor
registerProcessor('audio-processor', AudioProcessor);