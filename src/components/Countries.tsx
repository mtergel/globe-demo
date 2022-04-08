import { useEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import { dotDensity } from "./const";
import { createCircle } from "./utils";

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

export default Countries;
