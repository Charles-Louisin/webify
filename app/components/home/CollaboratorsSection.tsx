"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/hooks/useUser";
import { useState, useEffect } from "react";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

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

  const handleLike = async (collaboratorId: Id<"users">) => {
    if (!session || !user) {
      toast.error("Connectez-vous pour aimer un profil");
      return;
    }

    try {
      await likeProfile({ collaboratorId, userId: user._id });
      toast.success("Profil mis à jour !");
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleMessage = (collaboratorId: string) => {
    if (!session) {
      toast.error("Connectez-vous pour envoyer un message");
      return;
    }
    router.push(`/messages?chat=${collaboratorId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
      {collaborators.map((collaborator, index) => (
        <CollaboratorCard 
          key={collaborator._id}
          collaborator={collaborator} 
          index={index}
          onLike={() => handleLike(collaborator._id)}
          onMessage={() => handleMessage(collaborator._id.toString())}
          hasLiked={user && collaborator.stats?.likedBy?.includes(user._id)}
        />
      ))}
    </div>
  );
}

interface CollaboratorCardProps {
  collaborator: Collaborator;
  index: number;
  onLike: () => void;
  onMessage: () => void;
  hasLiked?: boolean;
}

function CollaboratorCard({ collaborator, index, onLike, onMessage, hasLiked }: CollaboratorCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const mobileCardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut",
        onComplete: () => {
          if (isMobile) {
            // Add wobble animation class after the card appears
            const cardElement = document.getElementById(`card-${collaborator._id}`);
            if (cardElement) {
              cardElement.classList.add('card-animate-mobile');
            }
          }
        }
      }
    }
  };

  const glowVariants = {
    idle: { opacity: 0.5, scale: 1 },
    hover: { opacity: 0.8, scale: 1.05 }
  };

  return (
    <motion.div
      id={`card-${collaborator._id}`}
      variants={isMobile ? mobileCardVariants : cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        className="card-3d glassmorphism rounded-xl p-6 relative z-10 overflow-hidden"
        style={{ 
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transition: "transform 0.2s ease"
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl z-0"
          variants={glowVariants}
          animate={isHovered ? "hover" : "idle"}
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10">
          <div className="relative w-32 h-32 mx-auto mb-6 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-32 h-32">
              <Image
                src={collaborator.imageUrl || "/placeholder.jpg"}
                alt={collaborator.name}
                fill
                className="rounded-full object-cover border-2 border-white/50"
              />
              
              {collaborator.stats.online && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-2 gap-2">
            <h3 className="text-xl font-futuristic font-semibold text-center text-gradient">
              {collaborator.name}
            </h3>
            <span 
              className={collaborator.role === "admin" ? "badge-admin" : "badge-colab"}
            >
              <div className="flex items-center gap-1">
                <Image 
                  src="/images/verify.svg" 
                  width={12} 
                  height={12} 
                  alt="Vérifié" 
                  className="brightness-200 contrast-200"
                />
                <span>{collaborator.role === "admin" ? "Admin" : "Colab"}</span>
              </div>
            </span>
          </div>
          
          <p className="text-muted-foreground text-center mb-4">
            {collaborator.role === "admin" ? "Administrateur" : "Collaborateur"}
          </p>
          
          <p className="text-sm text-center mb-6 line-clamp-3 text-white/80">
            {collaborator.bio || "Membre de l'équipe Webify, expert en création numérique."}
          </p>
          
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                hasLiked 
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-glow-primary"
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <span>{hasLiked ? "❤️" : "🤍"}</span>
              <span>{collaborator.stats?.likedBy?.length || 0}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMessage}
              className="px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors shadow-glow-secondary font-futuristic text-sm"
            >
              Message
            </motion.button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-around text-xs text-center">
              <div>
                <p className="font-bold text-gradient">{collaborator.stats.projectsCreated || 0}</p>
                <p>Projets</p>
              </div>
              <div>
                <p className="font-bold text-gradient">{collaborator.stats.postsCreated || 0}</p>
                <p>Posts</p>
              </div>
              <div>
                <p className="font-bold text-gradient">{
                  (collaborator.stats.projectsLiked || 0) + 
                  (collaborator.stats.postsLiked || 0) + 
                  (collaborator.stats.commentsLiked || 0)
                }</p>
                <p>Likes</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 