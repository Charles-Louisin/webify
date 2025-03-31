"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import { useUser } from "@/app/hooks/useUser";
import { Id } from "@/convex/_generated/dataModel";

export default function AboutPage() {
  const { user } = useUser();
  const collaborators = useQuery(api.users.getCollaborators, {});

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Présentation */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-8">
              À Propos de Webify
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              Webify est une équipe passionnée de développeurs et de créatifs dédiés à transformer vos idées en solutions numériques innovantes. Notre expertise couvre le développement web, mobile et le design d'interface.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4">Notre Mission</h3>
                <p className="text-muted-foreground">
                  Créer des expériences numériques exceptionnelles qui inspirent et transforment.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-card rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4">Notre Vision</h3>
                <p className="text-muted-foreground">
                  Devenir un leader dans l'innovation numérique et la création de solutions sur mesure.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-card rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold mb-4">Nos Valeurs</h3>
                <p className="text-muted-foreground">
                  Innovation, qualité, collaboration et satisfaction client.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Section Collaborateurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              Notre Équipe
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collaborators?.map((collaborator) => (
                <motion.div
                  key={collaborator._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-card rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={collaborator.imageUrl || "/images/default-avatar.png"}
                      alt={collaborator.name}
                      fill
                      className="object-cover"
                    />
                    {collaborator.role === "admin" && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white rounded-full text-sm">
                        Admin
                      </div>
                    )}
                    {collaborator.role === "collaborator" && (
                      <div className="absolute top-4 right-4">
                        <Image
                          src="/webifyLogo.png"
                          alt="Collaborateur certifié"
                          width={32}
                          height={32}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {collaborator.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {collaborator.bio}
                    </p>
                    <div className="flex justify-center gap-4">
                      {collaborator.linkedin && (
                        <Link href={collaborator.linkedin} target="_blank">
                          <Button variant="ghost" size="sm" className="hover:text-primary">
                            <FaLinkedin className="h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                      {collaborator.github && (
                        <Link href={collaborator.github} target="_blank">
                          <Button variant="ghost" size="sm" className="hover:text-primary">
                            <FaGithub className="h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                      {collaborator.website && (
                        <Link href={collaborator.website} target="_blank">
                          <Button variant="ghost" size="sm" className="hover:text-primary">
                            <FaTwitter className="h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 