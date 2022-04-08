import { useEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import data from "../data.json";
import { dotDensity } from "./const";
import { createCircle } from "./utils";

const cylinderRadius = dotDensity;

const PullRequests: React.FC<{}> = () => {
  const ref = useRef<InstancedMesh>();
  const count = data.points.length;

  let temp = new Object3D();

  useEffect(() => {
    // Set positions
    for (let i = 0; i < count; i++) {
      const id = i + 1;
      const { position, rotation } = createCircle(
        data.points[i].gm.lat,
        data.points[i].gm.lon
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
      <cylinderBufferGeometry args={[cylinderRadius, cylinderRadius, 0.3, 6]} />
      <meshStandardMaterial color="#60A5FA" />
    </instancedMesh>
  );
};

export default PullRequests;
