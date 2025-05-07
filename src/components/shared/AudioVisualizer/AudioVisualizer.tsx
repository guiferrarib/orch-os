// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { useEffect, useRef, useState } from "react";
import { MicrophoneState, useMicrophone } from "../../context";

const AudioVisualizer = ({
  width = 500,
  height = 150,
}: {
  width?: number;
  height?: number;
}) => {
  // Analysis frequency (visualizer update rate)
  const ANALYSIS_FREQUENCY = 100; // 100ms = 10fps
  
  // Initialize canvas and context
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // State to control display
  const [isConnected, setIsConnected] = useState(false);
  
  // Access microphone context
  const { microphoneState } = useMicrophone();
  
  // Initialize visualizer and analysis
  useEffect(() => {
    // Verify if the canvas exists
    if (!canvasRef.current) return;
    
    // Get 2D context for canvas drawing
    const canvas = canvasRef.current;
    canvasCtxRef.current = canvas.getContext('2d');
    
    // Configure canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas (draw black background)
    if (canvasCtxRef.current) {
      canvasCtxRef.current.fillStyle = 'rgba(0, 0, 0, 0.2)';
      canvasCtxRef.current.fillRect(0, 0, width, height);
    }
  }, [width, height]);
  
  // Observe microphone state to update visualizer
  useEffect(() => {
    // Visualize only when the microphone is active
    const shouldVisualize = microphoneState === MicrophoneState.Open;
    setIsConnected(shouldVisualize);
    
    // Reference for animation timer
    let animationTimer: ReturnType<typeof setInterval> | null = null;
    
    // Start visualization when active
    if (shouldVisualize) {
      animationTimer = setInterval(() => renderFrame(), ANALYSIS_FREQUENCY);
    }
    
    // Function to render a frame of the visualization
    const renderFrame = () => {
      if (!canvasCtxRef.current) return;
      
      const ctx = canvasCtxRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Fadeout effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Generate simulated visualization (when there are no real audio data)
      
      // Draw color lines simulating audio activity
      const centerY = canvas.height / 2;
      const maxHeight = canvas.height * 0.4;
      
      // Generate "random" values but with some continuity for simulation
      const now = Date.now() / 1000;
      
      for (let x = 0; x < canvas.width; x++) {
        // Generate "waves" using sine functions with different frequencies and phases
        // to create a more natural and less random effect
        const phase1 = now * 2;
        const phase2 = now * 3.7;
        
        // Combination of waves to create a more complex shape
        const value = (
          Math.sin(x * 0.02 + phase1) * 0.5 + 
          Math.sin(x * 0.04 + phase2) * 0.3
        ) * maxHeight;
        
        // Height varies based on generated value
        const height = Math.abs(value);
        
        // Y position (centered vertically)
        const y = centerY - (value < 0 ? 0 : height);
        
        // Color based on position and height (gradient effect)
        const hue = (x / canvas.width) * 180 + 180; // blue to purple
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
        
        // Draw bar
        ctx.fillRect(x, y, 1, height);
      }
    };
    
    // Clear timer on unmount or state change
    return () => {
      if (animationTimer) {
        clearInterval(animationTimer);
      }
    };
  }, [microphoneState, width, height]);
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-gradient-to-b from-black/20 to-black/50 backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        width={width}
        height={height}
      />
      
      {/* Overlay status when not connected */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
          Audio visualizer inactive
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer; 