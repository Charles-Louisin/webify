"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Chargement dynamique du composant Canvas qui utilise Three.js
// avec désactivation du SSR pour éviter les erreurs
const ThreeScene = dynamic(() => import('./ThreeScene'), { ssr: false });

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <ThreeScene />
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
        >
          Votre vision, notre création
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl mb-8 text-muted-foreground"
        >
          Transformez vos idées en réalité numérique avec notre expertise
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/projects")}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
          >
            Nos Projets
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="px-8 py-3 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors"
          >
            Contactez-nous
          </button>
        </motion.div>
      </div>
    </div>
  );
} 