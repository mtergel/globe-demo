import "./App.css";
import glowUrl from "./glow.svg";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface AppProps {}
//
const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <div className="hero">
        <div></div>
        <img alt="hero-glow" src={glowUrl} className="hero-glow" />
        <div className="globe-canvas-container">
          <Canvas className="webgl-canvas" fallback={null}>
            <OrbitControls />
            <ambientLight />
            <directionalLight
              color="#FAF5FF"
              position={[0, 2, 4]}
              intensity={4}
            />
            <directionalLight
              color="#A855F7"
              position={[0, -5, -4]}
              intensity={1}
            />
            <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}>
              <sphereGeometry args={[2, 32, 16]} />
              <meshStandardMaterial color="#1d2460" />
            </mesh>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
