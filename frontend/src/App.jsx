import { Canvas } from "@react-three/fiber";

export default function App() {
return (
    <Canvas>
      <mesh>
        <torusGeometry args={[1, 0.4, 16, 100]} />
        <meshStandardMaterial emissive="yellow" emissiveIntensity={0.5} />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
);
}
