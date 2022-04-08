import { Vector3 } from "three";
import { globeRadius } from "./const";

export type PullRequestType = {
  uml: string;
  gm: {
    lat: number;
    lon: number;
  };
  uol: string;
  gop: {
    lat: number;
    lon: number;
  };
  l: string;
  nwo: string;
  pr: number;
  ma: string;
  oa: string;
};

// map x from range in_min,in_max to out_min, out_max
function map(
  x: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export const convertCoorToPos = (lat: number, long: number) => {
  let latRad = lat * (Math.PI / 180);
  let lonRad = -long * (Math.PI / 180);

  return {
    position: [
      Math.cos(latRad) * Math.cos(lonRad) * globeRadius,
      Math.sin(latRad) * globeRadius,
      Math.cos(latRad) * Math.sin(lonRad) * globeRadius,
    ] as any,
  };
};

export const getCurve = (
  startLat: number,
  startLong: number,
  endLat: number,
  endLong: number
) => {
  const curveStart = convertCoorToPos(startLat, startLong);
  let startPoint = new Vector3(
    curveStart.position[0],
    curveStart.position[1],
    curveStart.position[2]
  );

  const curveEnd = convertCoorToPos(endLat, endLong);

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

// convert lat long to three js props
export const createCircle = (lat: number, long: number) => {
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

export const getRandomNum = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
