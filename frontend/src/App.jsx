import './App.css';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useSpring, animated } from '@react-spring/web';

const App = () => {
  const pixiContainer = useRef(null); // Ref for attaching Pixi canvas
  const [degree, setDegree] = useState(90); // State for controlling highlighted part

  // React Spring animation for smooth transitions
  const { animatedDegree } = useSpring({
    from: { animatedDegree: 0 },
    to: { animatedDegree: degree },
    config: { tension: 200, friction: 20 },
  });

  useEffect(() => {
    // Initialize PixiJS Application
    const app = new PIXI.Application({ width: 800, height: 600 });

    // Append Pixi canvas to DOM
    if (pixiContainer.current) {
      pixiContainer.current.appendChild(app.view);
    }

    // Function to draw the circle outline and highlight part of it
    const drawCircle = (highlightedDegree) => {
      app.stage.removeChildren(); // Clear previous drawings

      const graphics = new PIXI.Graphics();

      // Draw white circle outline
      graphics.lineStyle(4, 0xFFFFFF); // White border with thickness of 4
      graphics.arc(400, 300, 100, 0, Math.PI * 2); // Full circle outline
      app.stage.addChild(graphics);

      // Draw green highlighted arc based on degree
      const startAngle = (-90 * Math.PI) / 180; // Start at top (12 o'clock)
      const endAngle = ((-90 + highlightedDegree) * Math.PI) / 180; // End based on degree

      const highlightGraphics = new PIXI.Graphics();
      highlightGraphics.lineStyle(4, 0x00FF00); // Green border for highlighting
      highlightGraphics.arc(400, 300, 100, startAngle, endAngle); // Highlighted arc
      app.stage.addChild(highlightGraphics);
    };

    // Initial draw
    drawCircle(degree);

    return () => {
      app.destroy(true, { children: true }); // Clean up when component unmounts
    };
  }, [degree]); // Re-draw whenever `degree` changes

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