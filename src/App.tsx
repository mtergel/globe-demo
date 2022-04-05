import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  CubicBezierCurve3,
  InstancedMesh,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import "./App.css";
import data from "./data.json";
import glowUrl from "./glow.svg";
import worldUrl from "./map.png";
import * as THREE from "three";

interface AppProps {}

const rows = 120;
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

interface PullRequestsProps {
  index: number;
}

const getCurve = (
  startLat: number,
  startLong: number,
  endLat: number,
  endLong: number
) => {
  const curveStart = createCircle(startLat, startLong);
  let startPoint = new Vector3(
    curveStart.position[0],
    curveStart.position[1],
    curveStart.position[2]
  );

  const curveEnd = createCircle(endLat, endLong);

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

  // tweak this value based on the distance
  let smoothDist = map(dist, 0, 4, 1.5, dist / globeRadius + globeRadius / 4);

  midPoint.setLength(globeRadius * smoothDist);
  let curveA = startPoint.clone();
  let curveB = endPoint.clone();
  curveA.add(midPoint);
  curveB.add(midPoint);

  curveA.setLength(globeRadius * smoothDist);
  curveB.setLength(globeRadius * smoothDist);

  return {
    startLocation: startPoint,
    ctrl1: curveA,
    ctrl2: curveB,
    endLocation: endPoint,
  };
};
const PullRequests: React.FC<PullRequestsProps> = ({ index }) => {
  const item = data[index];
  const [curve, setCurve] = useState<CubicBezierCurve3 | null>(null);
  const geometryRef = useRef<TubeGeometry>(null);

  useEffect(() => {
    const { startLocation, ctrl1, ctrl2, endLocation } = getCurve(
      item.gm.lat,
      item.gm.lon,
      item.gop.lat,
      item.gop.lon
    );

    const _curve = new CubicBezierCurve3(
      startLocation,
      ctrl1,
      ctrl2,
      endLocation
    );
    setCurve(_curve);

    // eslint-disable-next-line
  }, []);

  useFrame((i) => {
    if (geometryRef.current) {
      geometryRef.current.setDrawRange(
        0,
        THREE.MathUtils.lerp(
          geometryRef.current.drawRange.count === Infinity
            ? 0
            : geometryRef.current.drawRange.count,
          geometryRef.current.index!.count,
          0.01
        )
      );
    }
  });

  if (curve) {
    return (
      <mesh>
        <tubeGeometry ref={geometryRef} args={[curve, 32, dotDensity, 32]} />
        <meshBasicMaterial color="#E879F9" />
      </mesh>
    );
  }

  return null;
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

// clean this up
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
                {data.map((i, index) => {
                  if (
                    data[index].gm.lat === data[index].gop.lat &&
                    data[index].gm.lon === data[index].gop.lon
                  ) {
                    return null;
                  }
                  return <PullRequests key={index} index={index} />;
                })}
              </>
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
