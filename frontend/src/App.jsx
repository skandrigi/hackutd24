import { Canvas } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { useMemo, useState } from "react";
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
      <circleGeometry args={[0.1, 32]} />
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

export default function App() {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const handleRandomAngle = () => {
    const randomAngle = Math.floor(Math.random() * 360);
    setCurrentAngle(randomAngle);
    setOpacity(0);
    const fadeIn = setInterval(() => {
      setOpacity((prev) => {
        if (prev >= 1) {
          clearInterval(fadeIn);
          return 1;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  return (
    <>
      <button
        onClick={handleRandomAngle}
        style={{ position: "absolute", zIndex: 1 }}
      >
        Random Angle
      </button>
      <Canvas
        camera={{ fov: 45 }}
        style={{ width: "100vw", height: "100vh" }}
      >
        {/* Render the full circle first */}
        <Circle radius={1.5} segments={100} />
        {/* Render the small circle on the larger circle */}
        <SmallCircle radius={1.5} currentAngle={currentAngle} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
    </>
  );
}
