import "./App.css";
import glowUrl from "./glow.svg";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { DEG2RAD } from "three/src/math/MathUtils";

interface AppProps {}

const rows = 180;
const dotDensity = 0.01;
const globeRadius = 2;

let circleData: { long: number; lat: number }[] = [];

for (let lat = -90; lat <= 90; lat += 180 / rows) {
  const radius = Math.cos(Math.abs(lat) * DEG2RAD) * 2;
  const circumference = radius * Math.PI * 2;
  const dotsForLat = circumference * dotDensity;
  for (let x = 0; x < dotsForLat; x++) {
    const long = -180 + (x * 360) / dotsForLat;
    // if (!this.visibilityForCoordinate(long, lat)) continue;
    // Setup and save circle matrix data
    circleData.push({ long, lat });
  }
}

const createCircle = (lat: number, long: number) => {
  let latRad = lat * (Math.PI / 180);
  let lonRad = -long * (Math.PI / 180);

  return {
    position: [
      Math.cos(latRad) * Math.cos(lonRad) * globeRadius,
      Math.sin(latRad) * globeRadius,
      Math.cos(latRad) * Math.sin(lonRad) * globeRadius,
    ] as any,
    rotation: [0.0, -lonRad, latRad - Math.PI * 0.5] as any,
  };
};

// 48.856700, 2.350800

const App: React.FC<AppProps> = () => {
  return (
    <div className="container">
      <div className="hero">
        <div></div>
        <img alt="hero-glow" src={glowUrl} className="hero-glow" />
        <div className="globe-canvas-container">
          <Canvas className="webgl-canvas" fallback={null}>
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <directionalLight
              color="#FAF5FF"
              position={[0, 2, 4]}
              intensity={2}
            />
            <directionalLight
              color="#A855F7"
              position={[0, -5, -4]}
              intensity={0.5}
            />
            <mesh rotation={[0, 0, Math.PI * 2]}>
              <sphereGeometry args={[globeRadius, 32, 16]} />
              <meshStandardMaterial color="#1d2460" />
            </mesh>
            {circleData.map((i, index) => (
              <mesh key={index} {...createCircle(i.lat, i.long)}>
                <sphereGeometry args={[dotDensity]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            ))}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
