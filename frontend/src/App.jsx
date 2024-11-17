import './App.css';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useSpring, animated } from '@react-spring/web';

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

    const graphics = new PIXI.Graphics();

    // Draw white circle outline
    graphics.lineStyle(4, 0xFFFFFF); // White border with thickness of 4
    graphics.arc(400, 300, 100, 0, Math.PI * 2); // Full circle outline
    app.stage.addChild(graphics);

    // Calculate start and end angles for highlighting
    const startAngle = ((highlightedDegree - 11.25) * Math.PI) / 180; // Start angle (1/16 before)
    const endAngle = ((highlightedDegree + 11.25) * Math.PI) / 180;   // End angle (1/16 after)

    // Draw green highlighted arc based on degree
    const highlightGraphics = new PIXI.Graphics();
    highlightGraphics.lineStyle(4, 0x00FF00); // Green border for highlighting
    highlightGraphics.arc(400, 300, 100, startAngle, endAngle); // Highlighted arc (1/16th)
    app.stage.addChild(highlightGraphics);
  };

  useEffect(() => {
    // Initialize PixiJS Application once on mount
    const app = new PIXI.Application({ width: 800, height: 600 });
    
    if (pixiContainer.current) {
      pixiContainer.current.appendChild(app.view);
      pixiContainer.current.pixiApp = app; // Store PixiJS app instance in ref
      drawCircle(degree); // Initial draw with default degree
    }

    return () => {
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