"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useUser } from "@/app/hooks/useUser";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "react-hot-toast";
import { Rating } from "../ui/Rating";
import { signIn } from "next-auth/react";

// Ajout des images par défaut
const DEFAULT_AVATAR = "/images/img1.jpg";
const DEFAULT_PLACEHOLDER = "/images/img2.jpg";

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
  const { user, session } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ content: "", rating: 5 });
  const [targetType] = useState<"app" | "admin" | "colab">("app");
  const [isPaused, setIsPaused] = useState(false);
  const allReviews = useQuery(api.social.getAppReviews, {}) || [];
  
  const displayedReviews = allReviews.length > 0 ? allReviews : reviews;
  const shouldShowReviewButton = !!session;
  const addReview = useMutation(api.reviews.add);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % displayedReviews.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [displayedReviews.length, isPaused]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? -45 : 45
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + displayedReviews.length) % displayedReviews.length);
  };
  
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !user) {
      toast.error("Vous devez être connecté pour laisser un avis");
      return;
    }
    
    if (newReview.content.trim().length < 10) {
      toast.error("Votre avis doit contenir au moins 10 caractères");
      return;
    }
    
    try {
      const result = await addReview({
        content: newReview.content,
        rating: newReview.rating,
        targetType,
        session: {
          user: {
            email: session.user.email!,
            name: session.user.name ?? undefined,
            image: session.user.image ?? undefined,
          }
        }
      });
      
      if (result) {
        toast.success("Avis ajouté avec succès !");
        setNewReview({ content: "", rating: 5 });
        setShowForm(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'ajout de votre avis");
    }
  };

  // Si reviews est undefined ou vide, afficher uniquement le bouton d'ajout
  if (!displayedReviews || displayedReviews.length === 0) {
    return (
      <div className="relative w-full max-w-3xl mx-auto text-center">
        <p className="text-gray-700 mb-8">Aucun avis pour le moment</p>
        {shouldShowReviewButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
          >
            Ajouter votre avis
          </motion.button>
        )}
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleAddReview}
            className="mt-8 bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto"
          >
            {/* Form content */}
            <h3 className="text-xl font-futuristic text-gray-800 mb-4">Partagez votre expérience</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-futuristic text-sm">Note</label>
              <Rating 
                value={newReview.rating} 
                onChange={(value) => setNewReview({...newReview, rating: value})} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-futuristic text-sm">Votre avis</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={4}
                placeholder="Partagez votre expérience avec nous..."
                required
                minLength={10}
              ></textarea>
            </div>
            
            <div className="flex gap-4 justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              >
                Annuler
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
              >
                Publier
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    );
  }

  const stars = [...Array(5)].map((_, i) => {
    const filled = i < (displayedReviews[currentIndex]?.rating || 0);
    return (
      <motion.span 
        key={i} 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          color: filled ? "#FFD700" : "#A0A0A0"
        }}
        transition={{ 
          delay: 0.2 + i * 0.1, 
          type: "spring", 
          stiffness: 200 
        }}
        className={`text-2xl ${filled ? "text-yellow-400" : "text-gray-400"}`}
      >
        {filled ? "★" : "☆"}
      </motion.span>
    );
  });

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {shouldShowReviewButton && (
        <div className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
          >
            Ajouter votre avis
          </motion.button>
        </div>
      )}

      {showForm && (
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleAddReview}
          className="mb-8 bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto"
        >
          {/* Form content */}
          <h3 className="text-xl font-futuristic text-gray-800 mb-4">Partagez votre expérience</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-futuristic text-sm">Note</label>
            <Rating 
              value={newReview.rating} 
              onChange={(value) => setNewReview({...newReview, rating: value})} 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-futuristic text-sm">Votre avis</label>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({...newReview, content: e.target.value})}
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
              placeholder="Partagez votre expérience avec nous..."
              required
              minLength={10}
            ></textarea>
          </div>
          
          <div className="flex gap-4 justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            >
              Annuler
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
            >
              Publier
            </motion.button>
          </div>
        </motion.form>
      )}

      <div className="h-[400px] w-full mb-8">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 40 },
              opacity: { duration: 0.6 },
              rotateY: { duration: 1 },
              scale: { duration: 0.6 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) paginate(1);
              else if (swipe > swipeConfidenceThreshold) paginate(-1);
            }}
            className="absolute w-full perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div className="glassmorphism rounded-xl p-6 shadow-glow-primary relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-md opacity-50" />
                  <div className="relative h-full w-full">
                    <Image
                      src={displayedReviews[currentIndex]?.userImage || DEFAULT_AVATAR}
                      alt={displayedReviews[currentIndex]?.userName || "Utilisateur"}
                      fill
                      className="rounded-full object-cover border-2 border-white/50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-futuristic font-semibold text-gray-800">
                    {displayedReviews[currentIndex]?.userName}
                  </h4>
                  <div className="flex gap-1">
                    {stars}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(displayedReviews[currentIndex]?.createdAt || "").toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed px-10">
                {displayedReviews[currentIndex]?.content}
              </p>
            </div>

            <motion.button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-primary/80 transition-all"
              onClick={() => paginate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">←</span>
            </motion.button>

            <motion.button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-primary/80 transition-all"
              onClick={() => paginate(1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">→</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {displayedReviews.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "w-6 h-2 bg-primary" 
                  : "w-2 h-2 bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}