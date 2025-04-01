"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

// Images de fond qui peuvent être modifiées par l'admin
const backgroundImages = [
  "/images/hero-bg-1.jpg",
  "/images/hero-bg-2.jpg",
  "/images/hero-bg-3.jpg",
  "/images/hero-bg-4.jpg",
];

// Phrases d'accroche qui peuvent être modifiées par l'admin
const taglines = [
  "Transformez vos idées en réalité numérique avec notre expertise",
  "Donnez vie à votre vision avec des technologies innovantes",
  "Créez l'incroyable avec notre équipe passionnée",
  "Votre imagination, notre savoir-faire, des résultats exceptionnels",
];

export default function HeroSection() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Variantes pour les images avec transition latérale
  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0.5,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 100, damping: 20 },
        opacity: { duration: 0.8 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0.5,
      transition: {
        x: { type: "spring", stiffness: 100, damping: 20 },
        opacity: { duration: 0.8 }
      }
    })
  };

  // Direction de la transition (1 pour droite vers gauche, -1 pour gauche vers droite)
  const [[currentIndex, direction], setCurrentImage] = useState([0, 0]);

  const changeImage = () => {
    const newIndex = (currentIndex + 1) % backgroundImages.length;
    setCurrentImage([newIndex, 1]);
  };

  useEffect(() => {
    const timer = setInterval(changeImage, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Side Transitions */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={backgroundImages[currentIndex]}
              alt={`Arrière-plan ${currentIndex + 1}`}
              priority
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          className="glassmorphism p-10 rounded-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="font-futuristic text-5xl md:text-7xl font-bold mb-6 text-gradient"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Votre vision, notre création
          </motion.h1>

          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-white/90 font-light"
          >
            {taglines[currentIndex]}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/projects")}
              className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
            >
              Nos Projets
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/contact")}
              className="px-8 py-3 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors shadow-glow-secondary font-futuristic"
            >
              Contactez-nous
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 