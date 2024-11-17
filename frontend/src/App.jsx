import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function MovingParticles({ angle = Math.PI * 2 }) {
  const pointsRef = useRef();

  const numParticles = 500; // Increase number of particles for a thicker arc
  const radius = 2; // Radius of the arc

  // Calculate positions of particles along the arc
  const positions = [];
  for (let i = 0; i < numParticles; i++) {
    // Use a normal distribution to pool more points towards the middle
    const t = (Math.random() + Math.random() + Math.random()) / 3; // Central limit theorem
    const theta = (t * angle) - (angle / 2); // Center the arc around 0
    const r = radius + (Math.random() - 0.5) * 0.5; // Add randomness to radius
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    positions.push(x, y, 0); // z = 0 for 2D
  }

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += 0.01; // Rotate around z-axis

      // Randomly move particles in 2D space
      pointsRef.current.position.x += (Math.random() - 0.5) * 0.01;
      pointsRef.current.position.y += (Math.random() - 0.5) * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={new Float32Array(positions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" size={0.05} color="blue" />
    </points>
  );
}

export default function App() {
  return (
    <Canvas camera={{ fov: 45 }}>
      <MovingParticles angle={Math.PI} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
