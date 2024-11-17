import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

function MovingParticles() {
  const pointsRef = useRef();

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += 0.01;
      pointsRef.current.rotation.y += 0.01;

      // Randomly move particles in 2D space
      pointsRef.current.position.x += (Math.random() - 0.5) * 0.01;
      pointsRef.current.position.y += (Math.random() - 0.5) * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <torusGeometry args={[2, 0.8, 16, 100]} />
      <pointsMaterial size={0.05} color="blue" />
    </points>
  );
}

export default function App() {
  return (
    <Canvas camera={{ fov: 45 }}>
      <MovingParticles />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
