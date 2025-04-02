"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/hooks/useUser";
import { useState, useEffect } from "react";
import CollaboratorCard from "./CollaboratorCard";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
import CollaborateSection from "./CollaborateSection";

interface Collaborator {
  _id: Id<"users">;
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  stats: {
    projectsCreated?: number;
    projectsLiked?: number;
    postsCreated?: number;
    postsLiked?: number;
    commentsCreated?: number;
    commentsLiked?: number;
    likedBy?: string[];
    online?: boolean;
  };
}

interface CollaboratorsSectionProps {
  collaborators: Collaborator[];
}

export default function CollaboratorsSection({ collaborators }: CollaboratorsSectionProps) {
  const router = useRouter();
  const { user, session } = useUser();
  const likeProfile = useMutation(api.users.likeProfile);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(collaborators.length / itemsPerPage);

  useEffect(() => {
    if (isPaused || collaborators.length <= itemsPerPage) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, collaborators.length, totalPages]);

  const getCurrentPageItems = () => {
    const startIndex = currentIndex * itemsPerPage;
    return collaborators.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleLike = async (collaboratorId: Id<"users">) => {
    if (!session || !user) {
      toast.error("Connectez-vous pour liker ce profil", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
      });
      return;
    }

    try {
      await likeProfile({ collaboratorId, userId: user._id });
      toast.success("Profil liké avec succès !", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleMessage = (collaboratorId: string) => {
    if (!session) {
      toast.error("Connectez-vous pour envoyer un message", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
      });
      return;
    }
    router.push(`/messages?chat=${collaboratorId}`);
  };

  const handleCardClick = (collaboratorId: Id<"users">) => {
    if (!session) {
      toast.error("Connectez-vous pour voir le profil complet", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 3000,
      });
      return;
    }
    router.push(`/about?user=${collaboratorId}`);
  };

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

  return (
    <div className="container mx-auto px-4">
      <div className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 40 },
              opacity: { duration: 0.6 }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {getCurrentPageItems().map((collaborator) => (
              <div key={collaborator._id} onClick={() => handleCardClick(collaborator._id)}>
                <CollaboratorCard 
                  collaborator={collaborator} 
                  onLike={() => handleLike(collaborator._id)}
                  onMessage={() => handleMessage(collaborator._id.toString())}
                  hasLiked={!!user && !!collaborator.stats?.likedBy?.includes(user._id)}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, index) => (
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
        )}

        {collaborators.length > itemsPerPage && (
          <>
            <motion.button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white/80 text-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-primary/80 transition-all"
              onClick={() => {
                setDirection(-1);
                setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
              }}
              whileHover={{ scale: 1.1, x: -8 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">←</span>
            </motion.button>

            <motion.button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white/80 text-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:text-primary/80 transition-all"
              onClick={() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % totalPages);
              }}
              whileHover={{ scale: 1.1, x: 8 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">→</span>
            </motion.button>
          </>
        )}
      </div>

      
    </div>
  );
}