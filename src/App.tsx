import { CubicBezierLine, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import "./App.css";
import glowUrl from "./glow.svg";
import worldUrl from "./map.png";

interface AppProps {}

const rows = 90;
const dotDensity = 0.01;
const globeRadius = 2;

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

const coords2pix = (lat: number, long: number) => {
  let x = (long + 180) * (IMAGE_WIDTH / 360);

  // this is causing Infinity to appear
  // let latRad = (lat * Math.PI) / 180;
  // let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // let y = IMAGE_HEIGHT / 2 - (IMAGE_WIDTH * mercN) / (2 * Math.PI);

  // simplified y
  let y = IMAGE_HEIGHT / 2 - (lat * IMAGE_HEIGHT) / 180;

  return { x, y };
};

function map(
  x: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

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
        context.drawImage(image, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
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
      let dots = [];

      for (let lat = -90; lat <= 90; lat += 180 / rows) {
        const radius = Math.cos(Math.abs(lat) * DEG2RAD) * 2;
        const circumference = radius * Math.PI * 2;
        const dotsForLat = circumference * dotDensity;
        for (let x = 0; x < dotsForLat; x++) {
          // maybe move this loop up top?
          for (let longI = 180; longI >= -180; longI -= 180 / rows) {
            const long = -longI + (x * 360) / dotsForLat;

            if (visibilityForCoordinate(lat, long)) continue;

            // Setup and save circle matrix data
            dots.push({ lat, long });
          }
        }
      }

      setCircleData(dots);
    }
    // eslint-disable-next-line
  }, [image]);

  const curveStart = createCircle(46.86, 103.83);
  let startPoint = new Vector3(
    curveStart.position[0],
    curveStart.position[1],
    curveStart.position[2]
  );

  const curveEnd = createCircle(36, 138);
  let endPoint = new Vector3(
    curveEnd.position[0],
    curveEnd.position[1],
    curveEnd.position[2]
  );

  let dist = startPoint.distanceTo(endPoint);
  let xC = 0.5 * (curveStart.position[0] + curveEnd.position[0]);
  let yC = 0.5 * (curveStart.position[1] + curveEnd.position[1]);
  let zC = 0.5 * (curveStart.position[2] + curveEnd.position[2]);

  let midPoint = new Vector3(xC, yC, zC);
  let smoothDist = map(dist, 0, 5, 0, 15 / dist);

  midPoint.setLength(globeRadius * smoothDist);
  let curveA = startPoint.clone();
  let curveB = endPoint.clone();
  curveA.add(midPoint);
  curveB.add(midPoint);

  curveA.setLength(globeRadius * smoothDist);
  curveB.setLength(globeRadius * smoothDist);

  return (
    <div className="container">
      <div className="hero">
        <div></div>
        <img alt="hero-glow" src={glowUrl} className="hero-glow" />
        <div className="globe-canvas-container">
          <canvas
            id="world"
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            ref={worldCanvas}
            className="hidden"
          />
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
              <>
                <Countries circleData={circleData} />
                <mesh {...curveStart}>
                  <sphereBufferGeometry args={[dotDensity * 2]} />
                  <meshStandardMaterial color="orange" />
                </mesh>
                <mesh {...curveEnd}>
                  <sphereBufferGeometry args={[dotDensity * 2]} />
                  <meshStandardMaterial color="orange" />
                </mesh>
                <CubicBezierLine
                  start={curveStart.position}
                  end={curveEnd.position}
                  midA={curveA}
                  midB={curveB}
                  color="#E879F9"
                />
              </>
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
