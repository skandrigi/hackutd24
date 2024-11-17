import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { Line } from "@react-three/drei";

function Arc({ angle = Math.PI / 6, radius = 1.5, segments = 100 }) {
  const points = useMemo(() => {
    const positions = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const theta = t * angle - angle / 2;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      positions.push([x, y, 0]);
    }
    return positions;
  }, [angle, radius, segments]);

  return <Line points={points} color="blue" lineWidth={2} />;
}

export default function App() { 
  return (
    <Canvas camera={{ fov: 45 }} style={{ width: '100vw', height: '100vh' }}>
      <Arc angle={Math.PI / 6} radius={1.5} segments={100} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
