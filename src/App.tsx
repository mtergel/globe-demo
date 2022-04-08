import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { DEG2RAD } from "three/src/math/MathUtils";
import "./App.css";
import {
  coords2pix,
  dotDensity,
  globeRadius,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  rows,
} from "./components/const";
import Countries from "./components/Countries";
import PullRequestArc from "./components/PullRequestArc";
import PullRequests from "./components/PullRequests";
import glowUrl from "./glow.svg";
import worldUrl from "./map.png";

interface AppProps {}

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

      // creating circles on globe
      for (let lat = -90; lat <= 90; lat += 180 / rows) {
        const radius = Math.cos(Math.abs(lat) * DEG2RAD) * 2;
        const circumference = radius * Math.PI * 2;
        const dotsForLat = circumference * dotDensity;
        for (let x = 0; x < dotsForLat; x++) {
          // maybe move this loop up top?
          for (let longI = 180; longI >= -180; longI -= 180 / rows) {
            const long = -longI + (x * 360) / dotsForLat;

            // check if circle exists in imamge
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

  // const dataFormatted = useMemo(() => {
  //   let points: PullRequestType[] = [];
  //   let arcs: PullRequestType[] = [];

  //   data.forEach((i: PullRequestType) => {
  //     if (i.gm.lat === i.gop.lat && i.gm.lon && i.gop.lon) {
  //       points.push(i);
  //     } else {
  //       arcs.push(i);
  //     }
  //   });

  //   return {
  //     points,
  //     arcs,
  //   };
  // }, []);

  // console.log(dataFormatted);

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
              color="#ffffff"
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
                <PullRequests />
                <PullRequestArc />
                {/* {data.map((i) => {
                  if (
                    i.gm.lat === i.gop.lat &&
                    i.gm.lon === i.gop.lon
                  ) {
                    return <PullRequests 
                      key={i.pr}
                      circleData={{
                        lat: i.gm.lat,
                        long: i.gm.lon
                      }}
                    />
                  } else {return null;}
                })} */}
                {/* {data.map((i, index) => (
                  <>
                    if (
                    data[index].gm.lat === data[index].gop.lat &&
                    data[index].gm.lon === data[index].gop.lon
                  ) {
                    return null;
                  }
                  return <PullRequests key={index} index={index} />;
                  </>
                ))} */}
              </>
            )}
            <Stats showPanel={0} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
