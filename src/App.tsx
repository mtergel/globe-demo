import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import "./App.css";
import glowUrl from "./glow.svg";

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
    for (let longI = 0; longI >= -360; longI -= 20) {
      const long = longI + (x * 360) / dotsForLat;

      // TODO
      // add this later when found image
      // if (!this.visibilityForCoordinate(long, lat)) continue;

      // Setup and save circle matrix data
      circleData.push({ long, lat });
    }
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

const Countries = () => {
  const ref = useRef<InstancedMesh>();
  const count = circleData.length;
  let temp = new Object3D();

  useEffect(() => {
    // Set positions
    for (let i = 0; i < count; i++) {
      const id = i + 1;
      const { position, rotation } = createCircle(
        circleData[i].lat,
        circleData[i].long
      );
      temp.position.set(position[0], position[1], position[2]);
      temp.rotation.set(rotation[0], rotation[1], rotation[2]);
      temp.updateMatrix();
      ref.current!.setMatrixAt(id, temp.matrix);
    }

    // Update the instance
    ref.current!.instanceMatrix.needsUpdate = true;

    // eslint-disable-next-line
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <coneBufferGeometry args={[dotDensity, dotDensity * 2, 5]} />
      <meshStandardMaterial color="#ffffff" />
    </instancedMesh>
  );
};

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
            <Countries />
            {/* {circleData.map((i, index) => (
              <mesh key={index} {...createCircle(i.lat, i.long)}>
                <sphereBufferGeometry args={[dotDensity]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            ))} */}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
