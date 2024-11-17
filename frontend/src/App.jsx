import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function App() {
  const pointsRef = useRef();

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += 0.01;
      pointsRef.current.rotation.y += 0.01;
      pointsRef.current.position.x = Math.sin(Date.now() * 0.001) * 0.5;
      pointsRef.current.position.y = Math.cos(Date.now() * 0.001) * 0.5;
    }
  });

  return (
      <Canvas camera={{ fov: 45 }}>
        <points ref={pointsRef}>
          <torusGeometry args={[2, 0.8, 16, 100]} />
          <pointsMaterial size={0.05} color="blue" />
        </points>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
  );
}
