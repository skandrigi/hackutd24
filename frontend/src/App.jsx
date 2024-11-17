import { Canvas } from "@react-three/fiber";

export default function App() {
return (
    <Canvas>
      <points>
        <torusGeometry args={[1, 0.4, 16, 100]} />
        <pointsMaterial size={0.05} color="yellow" />
      </points>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
);
}
