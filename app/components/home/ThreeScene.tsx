"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Particles = () => {
  const points = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!points.current) return;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 5000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      vertices.push(x, y, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    points.current.rotation.x = 0.5;
  }, []);

  return (
    <points ref={points}>
      <bufferGeometry attach="geometry" />
      <pointsMaterial
        attach="material"
        size={3}
        sizeAttenuation={true}
        color={0x88ccff}
        transparent
        opacity={0.8}
      />
    </points>
  );
};

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 1000], fov: 75 }}>
      <Particles />
    </Canvas>
  );
} 