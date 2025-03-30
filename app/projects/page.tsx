"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaHeart, FaComment, FaGithub, FaExternalLinkAlt, FaTag } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";

type ProjectCategory = "all" | "web" | "mobile" | "design" | "other";

export default function ProjectsPage() {
  const { user } = useUser();
  const projects = useQuery(api.projects.getAllProjects);
  const likeProject = useMutation(api.projects.likeProject);

  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { value: ProjectCategory; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "web", label: "Web" },
    { value: "mobile", label: "Mobile" },
    { value: "design", label: "Design" },
    { value: "other", label: "Autres" },
  ];

  const filteredProjects = projects?.filter((project) => {
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = async (projectId: string) => {
    if (!user) {
      toast.error("Connectez-vous pour liker un projet");
      return;
    }

    try {
      await likeProject({ projectId, userId: user._id });
      toast.success("Projet liké !");
    } catch (error) {
      toast.error("Erreur lors du like");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Nos Projets
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Découvrez nos réalisations dans différents domaines du développement.
          </p>

          {/* Filtres et Recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center gap-2"
                >
                  <FaTag className="h-4 w-4" />
                  {category.label}
                </Button>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Rechercher un projet..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Liste des projets */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects?.map((project) => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="relative h-48">
                    <Image
                      src={project.images[0] || "/images/default-project.jpg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    {project.images[1] && (
                      <div className="absolute top-2 right-2 w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                        <Image
                          src={project.images[1]}
                          alt={`${project.title} - Image 2`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {project.category}
                      </span>
                      <div className="flex gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          src={project.author.image || "/images/default-avatar.png"}
                          alt={project.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium">{project.author.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(project._id)}
                          className="hover:text-red-500"
                        >
                          <FaHeart
                            className={user && project.likes.includes(user._id) ? "text-red-500" : ""}
                          />
                        </Button>
                        {project.githubLink && (
                          <Link href={project.githubLink} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-primary"
                            >
                              <FaGithub />
                            </Button>
                          </Link>
                        )}
                        {project.demoLink && (
                          <Link href={project.demoLink} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-primary"
                            >
                              <FaExternalLinkAlt />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
} 