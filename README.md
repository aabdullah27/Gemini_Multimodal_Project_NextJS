# Multimodal Realtime App with Gemini 2.0 by Next.js Framework

A demonstration project showing how to build a realtime multimodal application using Google's Gemini 2.0 API and Next.js. This app can process audio, video, and generate transcripts in realtime.

## Features

- 🎥 Real-time Video Chat: Engage in fluid video conversations with Gemini AI, featuring advanced video processing
- 🎤 Voice Interaction: Natural voice-based communication with real-time transcription and noise reduction
- 🖥️ Screen Sharing: High-quality screen sharing with adaptive resolution
- ⚡ Real-time Processing: Instant responses with WebSocket streaming and optimized data transmission
- 🎨 Modern UI: Sleek, responsive design with Tailwind CSS and Framer Motion animations
- 🔒 Secure: Client-side API key management with secure storage and validation
- 🌐 Cross-platform: Works seamlessly across modern browsers with progressive enhancement
- 🔊 Audio Processing: Advanced audio features including echo cancellation and noise suppression
- 🖼️ Adaptive Quality: Smart quality adjustment for optimal performance

## Tech Stack

- **Frontend**: Next.js 14 with App Router and Server Components
- **UI Components**: Tailwind CSS, Shadcn/ui for consistent design
- **Animations**: Framer Motion for fluid transitions
- **API**: Google's Gemini Pro Vision & Gemini Pro with streaming support
- **Real-time**: WebSocket for bi-directional streaming
- **Media Processing**: WebRTC and Web Audio API for high-quality media handling
- **TypeScript**: For robust type safety and developer experience
- **State Management**: React hooks and context for efficient state handling

## Architecture

![Block Diagram](./diagram.jpg)

## Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get it here](https://aistudio.google.com/app/apikey))
- Modern web browser with:
  - WebRTC support
  - Camera/microphone permissions
  - JavaScript enabled
  - Minimum resolution of 1280x720

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/aabdullah27/Gemini_Multimodal_Project_NextJS.git
cd gemini-nextjs
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```
Note: The app also supports entering the API key through the UI settings dialog.

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Click "Let's Chat" on the homepage to start
2. Choose your preferred interaction mode:
   - Camera: For high-quality video chat with AI
   - Audio: For voice-only conversations
   - Screen: For detailed screen sharing assistance
3. Grant necessary permissions when prompted
4. Start interacting with Gemini AI!

### Tips for Best Experience

- Use a well-lit environment for better video quality
- Speak clearly and at a moderate pace
- Ensure stable internet connection (minimum 2Mbps upload/download)
- Use headphones to prevent audio feedback
- Position yourself within 2-3 feet of the camera

## Performance Optimization

The application includes several optimizations:
- Adaptive video quality based on network conditions
- Efficient audio processing with WebAudio API
- Lazy loading of non-critical components
- Optimized asset delivery with Next.js
- Memory-efficient media streaming

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Troubleshooting

Common issues and solutions:

- Camera not working: Check browser permissions
- Audio echo: Use headphones or enable echo cancellation
- Performance issues: Try lowering video quality in settings
- Connection drops: Check your internet stability
