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
  const [targetType, setTargetType] = useState<"app" | "admin" | "colab">("app");
  const [targetId, setTargetId] = useState<string | null>(null);
  const collaborators = useQuery(api.users.getCollaborators, {}) || [];
  
  // Déboguer les valeurs
  console.log("Reviews prop:", reviews);
  console.log("Session:", session);
  console.log("User:", user);
  console.log("Is authenticated:", !!session);
  console.log("Admin check:", session?.user?.role === "admin");
  console.log("ShowForm:", showForm);

  const shouldShowReviewButton = !!session;
  console.log("Should show review button:", shouldShowReviewButton);
  
  const addReview = useMutation(api.reviews.add);

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
    setCurrentIndex((prev) => (prev + newDirection + reviews.length) % reviews.length);
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
      console.log("Tentative d'ajout d'avis avec:", {
        content: newReview.content,
        rating: newReview.rating,
        session,
        user
      });

      const result = await addReview({
        content: newReview.content,
        rating: newReview.rating,
        targetType: targetType,
        targetId: targetId || undefined
      });
      
      console.log("Résultat de l'ajout:", result);
      
      if (result) {
        toast.success("Avis ajouté avec succès !");
        setNewReview({ content: "", rating: 5 });
        setShowForm(false);
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      toast.error(error.message || "Une erreur est survenue lors de l'ajout de votre avis");
    }
  };

  // Si reviews est undefined ou vide, on affiche le formulaire d'ajout d'avis
  if (!reviews || reviews.length === 0) {
    return (
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="text-center text-gray-700 mb-8">
          {!reviews ? "Chargement des avis..." : "Aucun avis pour le moment"}
        </div>

        {/* Debug info */}
        <div className="mt-6 text-gray-700 text-sm p-4 bg-gray-100 rounded-md">
          <h4 className="font-semibold mb-2">Information de débogage:</h4>
          <p>Session présente: {session ? "Oui" : "Non"}</p>
          <p>Session status: {session ? "authenticated" : "unauthenticated"}</p>
          <p>User présent: {user ? "Oui" : "Non"}</p>
          <p>Rôle utilisateur: {user?.role || "Non défini"}</p>
          <p>Email utilisateur: {user?.email || "Non défini"}</p>
          <p>ID utilisateur: {user?._id || "Non défini"}</p>
          <p>Afficher le bouton: {shouldShowReviewButton ? "Oui" : "Non"}</p>
          <p>Reviews: {reviews ? `${reviews.length} avis` : "Non défini"}</p>
        </div>

        {/* Test container */}
        <div className="mt-8 p-4 bg-red-100 rounded-md">
          <p>Test container - Ce conteneur devrait toujours être visible</p>
          {shouldShowReviewButton && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p>Le bouton devrait apparaître ici</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="mt-4 px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
              >
                Ajouter votre avis
              </motion.button>
            </div>
          )}
        </div>

        {shouldShowReviewButton && showForm && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleAddReview}
            className="mt-8 bg-white p-6 rounded-xl shadow-md"
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
    const filled = i < (reviews[currentIndex]?.rating || 0);
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
      <div className="h-[500px] w-full mb-8">
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
              opacity: { duration: 0.4 },
              rotateY: { duration: 0.8 },
              scale: { duration: 0.4 }
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
            className="absolute w-full perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="glassmorphism rounded-xl p-8 shadow-glow-primary relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50" />
              <div className="absolute top-1 left-1 w-20 h-20 rounded-full bg-primary opacity-10 blur-xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-secondary opacity-10 blur-xl" />
              
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6 relative z-10">
                <div className="relative w-24 h-24 md:w-20 md:h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-md opacity-50" />
                  <div className="relative h-full w-full">
                    <Image
                      src={reviews[currentIndex]?.userImage || DEFAULT_AVATAR}
                      alt={reviews[currentIndex]?.userName || "Utilisateur"}
                      fill
                      className="rounded-full object-cover border-2 border-white/50"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_AVATAR;
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h4 className="font-futuristic font-semibold text-lg text-gray-800">
                    {reviews[currentIndex]?.userName}
                  </h4>
                  <div className="flex gap-1 justify-center md:justify-start">
                    {stars}
                  </div>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <p className="text-gray-700 mb-4 text-lg leading-relaxed relative z-10">
                  <span className="text-3xl text-primary opacity-50 font-serif absolute -top-4 -left-2">"</span>
                  {reviews[currentIndex]?.content}
                  <span className="text-3xl text-primary opacity-50 font-serif absolute -bottom-8 right-0">"</span>
                </p>
                <p className="text-sm text-gray-600 text-right mt-6">
                  {new Date(reviews[currentIndex]?.createdAt || "").toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {reviews.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-12 rounded-full transition-colors ${
                index === currentIndex 
                  ? "bg-gradient-to-b from-primary to-secondary" 
                  : "bg-primary/30"
              }`}
              style={{
                height: index === currentIndex ? '12px' : '8px',
                width: index === currentIndex ? '24px' : '8px',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <motion.button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 md:-translate-x-16 z-10 bg-white/30 hover:bg-white/40 text-gray-800 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50"
          onClick={() => paginate(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">←</span>
        </motion.button>

        <motion.button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 md:translate-x-16 z-10 bg-white/30 hover:bg-white/40 text-gray-800 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50"
          onClick={() => paginate(1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">→</span>
        </motion.button>
      </div>
    </div>
  );
}