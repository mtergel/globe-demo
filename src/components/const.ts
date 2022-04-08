// rendering circles on globe
export const rows = 120;
export const dotDensity = 0.01;
export const globeRadius = 2;

// countries alpha map
export const IMAGE_WIDTH = 400;
export const IMAGE_HEIGHT = 200;

// simple method to convert coords to pix in image
export const coords2pix = (lat: number, long: number) => {
  let x = (long + 180) * (IMAGE_WIDTH / 360);

  // this is causing Infinity to appear
  // let latRad = (lat * Math.PI) / 180;
  // let mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // let y = IMAGE_HEIGHT / 2 - (IMAGE_WIDTH * mercN) / (2 * Math.PI);

  // simplified y
  let y = IMAGE_HEIGHT / 2 - (lat * IMAGE_HEIGHT) / 180;

  return { x, y };
};
