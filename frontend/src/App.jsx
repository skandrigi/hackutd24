import './App.css';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useSpring } from '@react-spring/web';

const App = () => {
  const pixiContainer = useRef(null); // Ref for attaching Pixi canvas
  const [degree, setDegree] = useState(90); // State for controlling highlighted part

  // React Spring animation for smooth transitions
  const { animatedDegree } = useSpring({
    animatedDegree: degree,
    config: { tension: 200, friction: 20 },
    onChange: ({ value }) => {
      drawCircle(value.animatedDegree); // Redraw circle when animation updates
    },
  });

  // Function to draw the circle outline and highlight part of it
  const drawCircle = (highlightedDegree) => {
    const app = pixiContainer.current.pixiApp; // Get PixiJS app instance

    app.stage.removeChildren(); // Clear previous drawings

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    // Draw white circle outline with thicker stroke
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(8, 0xFFFFFF); // White border with thickness of 8
    graphics.arc(centerX, centerY, 150, 0, Math.PI * 2); // Full circle outline with radius of 150
    app.stage.addChild(graphics);

    // Calculate start and end angles for highlighting (centered around `highlightedDegree`)
    const arcWidth = 45; // Highlight a larger portion (45 degrees)
    const startAngle = ((highlightedDegree - arcWidth / 2 - 90) * Math.PI) / 180; // Start angle (arcWidth/2 before)
    const endAngle = ((highlightedDegree + arcWidth / 2 - 90) * Math.PI) / 180;   // End angle (arcWidth/2 after)

    // Draw green highlighted arc based on degree
    const highlightGraphics = new PIXI.Graphics();
    highlightGraphics.lineStyle(8, 0x00FF00); // Green border for highlighting with thickness of 8
    highlightGraphics.arc(centerX, centerY, 150, startAngle, endAngle); // Highlighted arc (centered around degree)
    app.stage.addChild(highlightGraphics);
  };

  useEffect(() => {
    // Set stage size relative to screen size (80% of window width and height)
    const stageWidth = window.innerWidth * 0.8;
    const stageHeight = window.innerHeight * 0.8;

    // Initialize PixiJS Application once on mount with dynamic screen size
    const app = new PIXI.Application({ 
      width: stageWidth,
      height: stageHeight,
      resolution: window.devicePixelRatio || 2, // Higher resolution for smoother rendering
      antialias: true,                          // Enable antialiasing for smoother edges
      backgroundColor: 0x000000                 // Optional background color (black)
    });
    
    if (pixiContainer.current) {
      pixiContainer.current.appendChild(app.view);
      pixiContainer.current.pixiApp = app; // Store PixiJS app instance in ref
      drawCircle(degree); // Initial draw with default degree
    }

    // Handle window resize to adjust canvas size dynamically
    const handleResize = () => {
      const newStageWidth = window.innerWidth * 0.8;
      const newStageHeight = window.innerHeight * 0.8;
      app.renderer.resize(newStageWidth, newStageHeight);
      drawCircle(degree); // Re-draw circle after resizing
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true }); // Clean up when component unmounts
    };
  }, []);

  return (
    <div>
      <div ref={pixiContainer}></div> {/* Container for Pixi canvas */}

      {/* Input slider to control the degree */}
      <input 
        type="range" 
        min="0" 
        max="360" 
        value={degree} 
        onChange={(e) => setDegree(Number(e.target.value))} 
        style={{ width: '400px', marginTop: '20px' }}
      />
    </div>
  );
};

export default App;