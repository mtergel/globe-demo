import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { CubicBezierCurve3, TubeGeometry } from "three";
import shallow from "zustand/shallow";
import data from "../data.json";
import { dotDensity } from "./const";
import { useStore } from "./store";
import { getCurve, PullRequestType } from "./utils";

const PullRequestArc = () => {
  return (
    <>
      {data.arcs.map((i) => (
        <Arc pr={i} key={i.pr} />
      ))}
    </>
  );
};

export default PullRequestArc;

interface ArcProps {
  pr: PullRequestType;
}

const Arc: React.FC<ArcProps> = ({ pr }) => {
  const [curve, setCurve] = useState<CubicBezierCurve3 | null>(null);
  const geometryRef = useRef<TubeGeometry>(null);
  const [show, setShow] = useState(false);
  const [stop, setStop] = useState(false);

  const { setHovered } = useStore(
    (state) => ({ setHovered: state.setHovered }),
    shallow
  );
  const [hovered, set] = useState<number | undefined>(undefined);

  if (hovered) {
    setHovered(data.points[hovered]);
  } else {
    setHovered(null);
  }

  useEffect(() => {
    const { startLocation, ctrl1, ctrl2, endLocation } = getCurve(
      pr.gm.lat,
      pr.gm.lon,
      pr.gop.lat,
      pr.gop.lon
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, Math.random() * 80 * 1000);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line
  }, [show]);

  useEffect(() => {
    if (stop) {
      const timeout = setTimeout(() => {
        setStop(false);
      }, Math.random() * 20 * 1000);
      return () => clearTimeout(timeout);
    }

    // eslint-disable-next-line
  }, [stop]);

  useFrame((_, delta) => {
    if (geometryRef.current && show) {
      let endNow =
        geometryRef.current.drawRange.count === Infinity
          ? 0
          : geometryRef.current.drawRange.count;
      if (endNow >= geometryRef.current.index!.count) {
        // start timer here

        // go from start to end
        let startNow = geometryRef.current.drawRange.start;
        if (startNow < geometryRef.current.index!.count) {
          if (!stop) {
            geometryRef.current.setDrawRange(
              Math.round(startNow + 30),
              geometryRef.current.index!.count
            );
          }
        } else {
          // loop it
          setShow(false);
        }
      } else {
        geometryRef.current.setDrawRange(0, Math.round(endNow + 16));
        setStop(true);
      }
    }
  });

  if (show && curve) {
    return (
      <mesh>
        <tubeBufferGeometry
          ref={geometryRef}
          args={[curve, 32, dotDensity, 4]}
        />
        <meshBasicMaterial color="#E879F9" />
      </mesh>
    );
  }

  return null;
};
