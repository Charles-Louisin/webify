"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/hooks/useUser";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {collaborators.map((collaborator, index) => {
        const hasLiked = user && collaborator.stats?.likedBy?.includes(user._id);
        
        return (
          <motion.div
            key={collaborator._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={collaborator.imageUrl || "/placeholder.jpg"}
                alt={collaborator.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              {collaborator.name}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {collaborator.role}
            </p>
            <p className="text-sm text-center mb-6">{collaborator.bio}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleLike(collaborator._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  hasLiked 
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-primary/10 hover:bg-primary/20"
                }`}
              >
                <span>{hasLiked ? "❤️" : "🤍"}</span>
                <span>{collaborator.stats?.likedBy?.length || 0}</span>
              </button>
              <button
                onClick={() => handleMessage(collaborator._id.toString())}
                className="px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors"
              >
                Message
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 