import { useEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";
import data from "../data.json";
import { dotDensity } from "./const";
import { createCircle } from "./utils";

const cylinderRadius = dotDensity;
let temp = new Object3D();

const PullRequests: React.FC<{}> = () => {
  const count = data.points.length;
  // const { setHovered } = useStore(
  //   (state) => ({ setHovered: state.setHovered }),
  //   shallow
  // );
  // const [hovered, set] = useState<number | undefined>(undefined);

  const ref = useRef<InstancedMesh>();
  // if (hovered) {
  //   setHovered(data.points[hovered]);
  // } else {
  //   // setHovered(null);
  // }

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
    <>
      <instancedMesh
        // onPointerMove={(e) => set(e.instanceId)}
        // onPointerOut={(e) => {
        //   set(undefined);
        // }}
        ref={ref}
        args={[undefined, undefined, count]}
      >
        <cylinderBufferGeometry
          args={[cylinderRadius, cylinderRadius, 0.2, 5]}
        />
        <meshStandardMaterial color="#60A5FA" />
      </instancedMesh>
    </>
  );
};

export default PullRequests;
