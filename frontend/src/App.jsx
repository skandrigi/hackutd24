import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";

const degToRad = (degrees) => (degrees * Math.PI) / 180;

function Arc({
    arc_length = Math.PI / 6,
    radius = 1.5,
    segments = 100,
    angle = 0,
}) {
    const [currentAngle, setCurrentAngle] = useState(0);
    const [opacity, setOpacity] = useState(0);

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
    const points = useMemo(() => {
        const positions = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const theta = t * arc_length - arc_length / 2 + degToRad(currentAngle);
            const x = radius * Math.cos(theta);
            const y = radius * Math.sin(theta);
            positions.push([x, y, 0]);
        }
        return positions;
    }, [arc_length, radius, segments, currentAngle]);

    return <Line points={points} color="blue" lineWidth={2} opacity={opacity} />;
}

export default function App() {
    return (
        <button onClick={handleRandomAngle} style={{ position: 'absolute', zIndex: 1 }}>
            Random Angle
        </button>
        <Canvas
            camera={{ fov: 45 }}
            style={{ width: "100vw", height: "100vh" }}
        >
            <Arc
                arc_length={Math.PI / 6}
                radius={1.5}
                segments={100}
                angle={180}
            />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
        </Canvas>
    );
}
