import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useSpring } from '@react-spring/web';

const App = () => {
  const pixiContainer = useRef(null); 
  const [degree, setDegree] = useState(90); 
  const { animatedDegree } = useSpring({
    animatedDegree: degree,
    config: { tension: 200, friction: 20 },
    onChange: ({ value }) => {
      drawCircle(value.animatedDegree);
    },
  });

  const drawCircle = (highlightedDegree) => {
    const app = pixiContainer.current.pixiApp; 

    app.stage.removeChildren(); 

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(8, 0xFFFFFF); 
    graphics.arc(centerX, centerY, 250, 0, Math.PI * 2); // Circle radius
    app.stage.addChild(graphics);

    const arcWidth = 45; 
    const startAngle = ((highlightedDegree - arcWidth / 2 - 90) * Math.PI) / 180; 
    const endAngle = ((highlightedDegree + arcWidth / 2 - 90) * Math.PI) / 180;  
    const highlightGraphics = new PIXI.Graphics();
    highlightGraphics.lineStyle(8, 0x00FF00); 
    highlightGraphics.arc(centerX, centerY, 250, startAngle, endAngle);
    app.stage.addChild(highlightGraphics);
  };

  useEffect(() => {
    // Increase stage size to cover more screen area (70% of window size)
    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;

    const app = new PIXI.Application({ 
      width: stageWidth,
      height: stageHeight,
      resolution: window.devicePixelRatio || 2,
      antialias: true,
      backgroundColor: 0x000000
    });
    
    if (pixiContainer.current) {
      pixiContainer.current.appendChild(app.view);
      pixiContainer.current.pixiApp = app;
      drawCircle(degree); 
    }

    const handleResize = () => {
      const newStageWidth = window.innerWidth;
      const newStageHeight = window.innerHeight;
      app.renderer.resize(newStageWidth, newStageHeight);
      drawCircle(degree); 
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true }); 
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Container for PIXI stage */}
      <div ref={pixiContainer}></div>

      {/* Slider positioned absolutely inside the stage */}
      <input 
        type="range" 
        min="0" 
        max="360" 
        value={degree} 
        onChange={(e) => setDegree(Number(e.target.value))} 
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '100px',
          transform: 'translateX(-50%)',
          width: '40%', 
          zIndex: '10' 
        }}
      />
    </div>
  );
};

export default App;