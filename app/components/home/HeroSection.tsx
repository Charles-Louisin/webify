"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const HeroSection = () => {
  const router = useRouter();

  return (
    <div className="relative h-[90vh] flex items-center">
      <Canvas
        className="absolute inset-0 -z-10"
        camera={{ position: [0, 0, 5] }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Particles />
      </Canvas>

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Votre vision, notre création
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Transformez vos idées en réalité numérique avec notre équipe de développeurs passionnés.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/projects")}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              Voir nos projets
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/contact")}
            >
              Nous contacter
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Particles = () => {
  const points = useRef<THREE.Points>(null!);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const size = 2000;

    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * size;
      const y = (Math.random() - 0.5) * size;
      const z = (Math.random() - 0.5) * size;
      vertices.push(x, y, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    points.current.rotation.x = 0;
    points.current.rotation.y = 0;
  }, []);

  useEffect(() => {
    const animate = () => {
      points.current.rotation.y += 0.001;
      points.current.rotation.x += 0.001;
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial size={3} color="#8b5cf6" sizeAttenuation={true} />
    </points>
  );
};

export default HeroSection; 