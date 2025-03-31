"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  rating: number;
  createdAt: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + reviews.length) % reviews.length);
  };

  if (!reviews.length) {
    return (
      <div className="text-center text-muted-foreground">
        Aucun avis pour le moment
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full max-w-3xl mx-auto">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full"
        >
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16">
                <Image
                  src={reviews[currentIndex].userImage}
                  alt={reviews[currentIndex].userName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold">{reviews[currentIndex].userName}</h4>
                <div className="flex gap-1">
                  {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              {reviews[currentIndex].content}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(reviews[currentIndex].createdAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-[-3rem] left-1/2 transform -translate-x-1/2 flex gap-2">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? "bg-primary" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
} 