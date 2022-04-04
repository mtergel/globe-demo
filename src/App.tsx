import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { InstancedMesh, Object3D } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import "./App.css";
import glowUrl from "./glow.svg";
import worldUrl from "./map.png";

interface AppProps {}

const rows = 120;

const dotDensity = 0.01;
const globeRadius = 2;

// let circleData: { long: number; lat: number }[] = [];

// for (let lat = -90; lat <= 90; lat += 180 / rows) {
//   const radius = Math.cos(Math.abs(lat) * DEG2RAD) * 2;
//   const circumference = radius * Math.PI * 2;
//   const dotsForLat = circumference * dotDensity;
//   for (let x = 0; x < dotsForLat; x++) {
//     for (let longI = 0; longI >= -360; longI -= 20) {
//       const long = longI + (x * 360) / dotsForLat;

//       // TODO
//       // add this later when found image
//       // if (!this.visibilityForCoordinate(long, lat)) continue;

//       // Setup and save circle matrix data
//       circleData.push({ long, lat });
//     }
//   }
// }

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

const Countries: React.FC<{ circleData: { lat: number; long: number }[] }> = ({
  circleData,
}) => {
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
      <sphereBufferGeometry args={[dotDensity]} />
      <meshStandardMaterial color="#ffffff" />
    </instancedMesh>
  );
};

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 200;

// fix this
const coords2pix = (lat: number, long: number) => {
  let x = Math.abs((long + 180) * (IMAGE_WIDTH / 360));
  // let latRad = (lat * Math.PI) / 180;
  // let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // let y = IMAGE_HEIGHT / 2 - (IMAGE_WIDTH * mercN) / (2 * Math.PI);

  // simplified y
  let y = IMAGE_HEIGHT / 2 - (lat * IMAGE_HEIGHT) / 180;

  return { x, y };
};

const App: React.FC<AppProps> = () => {
  const [image, setImage] = useState<CanvasRenderingContext2D | null>(null);
  const worldCanvas = useRef<HTMLCanvasElement>(null);

  const [circleData, setCircleData] = useState<{ long: number; lat: number }[]>(
    []
  );

  useEffect(() => {
    if (worldCanvas && worldCanvas.current) {
      const context = worldCanvas.current.getContext("2d")!;
      const image = new Image();
      image.src = worldUrl;
      image.onload = () => {
        context.drawImage(image, 0, 0, 400, 200);
        setImage(context);
      };
    }
  }, []);

  const visibilityForCoordinate = (lat: number, long: number) => {
    if (image) {
      const { x, y } = coords2pix(lat, long);
      const pixelData = image.getImageData(x, y, 1, 1);
      return pixelData.data[3] <= 90;
    }

    return true;
  };

  useEffect(() => {
    if (image) {
      let tmp = [];
      for (let lat = -90; lat <= 90; lat += 180 / rows) {
        const radius = Math.cos(Math.abs(lat) * DEG2RAD) * 2;
        const circumference = radius * Math.PI * 2;
        const dotsForLat = circumference * dotDensity;
        for (let x = 0; x < dotsForLat; x++) {
          for (let longI = 90; longI >= -90; longI -= 180 / rows) {
            const long = longI + (x * 360) / dotsForLat;

            if (visibilityForCoordinate(lat, long)) continue;

            // Setup and save circle matrix data
            tmp.push({ lat, long });
          }
        }
      }

      setCircleData(tmp);
    }
    // eslint-disable-next-line
  }, [image]);

  return (
    <div className="container">
      <div className="hero">
        <div></div>
        <img alt="hero-glow" src={glowUrl} className="hero-glow" />
        <div className="globe-canvas-container">
          <canvas id="world" ref={worldCanvas} className="hidden" />
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
              <sphereGeometry args={[globeRadius]} />
              <meshStandardMaterial color="#1d2460" />
            </mesh>
            {circleData && circleData.length > 0 && (
              <Countries circleData={circleData} />
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
