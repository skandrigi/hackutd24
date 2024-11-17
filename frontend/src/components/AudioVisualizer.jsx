import { Canvas } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { useMemo, useState, useEffect } from "react";
import { Line } from "@react-three/drei";

const degToRad = (degrees) => (degrees * Math.PI) / 180;

function SmallCircle({ radius = 1.5, currentAngle }) {
  const { position } = useSpring({
    position: [
      radius * Math.cos(degToRad(currentAngle)),
      radius * Math.sin(degToRad(currentAngle)),
      0.01,
    ],
    config: { tension: 170, friction: 26 },
  });

  return (
    <animated.mesh position={position}>
      <circleGeometry args={[0.05, 32]} /> {/* Smaller size */}
      <meshBasicMaterial color="blue" />
    </animated.mesh>
  );
}

function Circle({ radius = 1.5, segments = 100 }) {
  const points = useMemo(() => {
    const positions = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      positions.push([x, y, -0.01]); // Slightly behind the arc
    }
    return positions;
  }, [radius, segments]);

  return (
    <Line
      points={points}
      color="gray"
      lineWidth={1}
      opacity={0.5}
      transparent
    />
  );
}

export default function AudioVisualizer() {
  const [currentAngle, setCurrentAngle] = useState(0);

  useEffect(() => {
    // Simulate real-time updates from WebSocket or backend
    const interval = setInterval(() => {
      const randomAngle = Math.floor(Math.random() * 360);
      setCurrentAngle(randomAngle);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "200px", // Smaller size
        height: "200px", // Smaller size
        margin: "0 auto", // Center horizontally
      }}
    >
      <Canvas camera={{ fov: 45 }}>
        {/* Render the full circle */}
        <Circle radius={1.5} segments={100} />
        {/* Render the small circle on the larger circle */}
        <SmallCircle radius={1.5} currentAngle={currentAngle} />
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} /> {/* Smaller size */}
          <meshBasicMaterial color="red" />
        </mesh>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
    </div>
  );
}
