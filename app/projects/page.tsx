"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { FaHeart, FaComment, FaGithub, FaExternalLinkAlt, FaTag, FaPlus } from "react-icons/fa";
import { useUser } from "@/app/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

type ProjectCategory = "all" | "web" | "mobile" | "design" | "other";

export default function ProjectsPage() {
  const { user } = useUser();
  const projects = useQuery(api.projects.getAllProjects, {});
  const authors = useQuery(api.users.getCollaborators, {}) || [];
  const likeProject = useMutation(api.projects.likeProject);
  const createProject = useMutation(api.projects.createProject);

  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // État du formulaire pour la création de projet
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    images: ["", ""],
    video: "",
    githubLink: "",
    demoLink: "",
    technologies: "",
  });

  const categories: { value: ProjectCategory; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "web", label: "Web" },
    { value: "mobile", label: "Mobile" },
    { value: "design", label: "Design" },
    { value: "other", label: "Autres" },
  ];

  const filteredProjects = projects?.filter((project) => {
    const matchesCategory = selectedCategory === "all" || project.technologies.includes(selectedCategory);
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
      await likeProject({ projectId: projectId as Id<"projects">, userId: user._id as Id<"users"> });
      toast.success("Projet liké !");
    } catch (error) {
      toast.error("Erreur lors du like");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormState({
      title: "",
      description: "",
      images: ["", ""],
      video: "",
      githubLink: "",
      demoLink: "",
      technologies: "",
    });
  };

  // Gérer la soumission du formulaire de création
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) {
        toast.error("Connectez-vous pour créer un projet");
        return;
      }
      
      // Vérifier que les champs obligatoires sont remplis
      if (!formState.title || !formState.description || !formState.technologies) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Filtrer les images vides
      const images = formState.images.filter(img => img.trim() !== "");
      
      // Créer le projet
      await createProject({
        authorId: user._id,
        title: formState.title,
        description: formState.description,
        images,
        video: formState.video || undefined,
        githubLink: formState.githubLink || undefined,
        demoLink: formState.demoLink || undefined,
        technologies: formState.technologies.split(",").map(t => t.trim()),
      });
      
      toast.success("Projet créé avec succès");
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du projet");
      console.error(error);
    }
  };

  // Vérifier si l'utilisateur est admin ou collaborateur
  const canCreateProject = user && (user.role === "admin" || user.role === "colab");

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">
              Nos Projets
            </h1>
            {canCreateProject && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <FaPlus size={14} /> Nouveau projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau projet</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Titre*</label>
                      <Input
                        id="title"
                        value={formState.title}
                        onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                        placeholder="Titre du projet"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Description*</label>
                      <Textarea
                        id="description"
                        value={formState.description}
                        onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                        placeholder="Description du projet"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="image1" className="text-sm font-medium">Image 1 (URL)</label>
                      <Input
                        id="image1"
                        value={formState.images[0]}
                        onChange={(e) => setFormState({ 
                          ...formState, 
                          images: [e.target.value, formState.images[1]] 
                        })}
                        placeholder="URL de l'image principale"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="image2" className="text-sm font-medium">Image 2 (URL - optionnelle)</label>
                      <Input
                        id="image2"
                        value={formState.images[1]}
                        onChange={(e) => setFormState({ 
                          ...formState, 
                          images: [formState.images[0], e.target.value] 
                        })}
                        placeholder="URL de la seconde image"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="video" className="text-sm font-medium">Vidéo (URL - optionnelle)</label>
                      <Input
                        id="video"
                        value={formState.video}
                        onChange={(e) => setFormState({ ...formState, video: e.target.value })}
                        placeholder="URL de la vidéo"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="githubLink" className="text-sm font-medium">Lien GitHub</label>
                        <Input
                          id="githubLink"
                          value={formState.githubLink}
                          onChange={(e) => setFormState({ ...formState, githubLink: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="demoLink" className="text-sm font-medium">Lien démo</label>
                        <Input
                          id="demoLink"
                          value={formState.demoLink}
                          onChange={(e) => setFormState({ ...formState, demoLink: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="technologies" className="text-sm font-medium">Technologies* (séparées par des virgules)</label>
                      <Input
                        id="technologies"
                        value={formState.technologies}
                        onChange={(e) => setFormState({ ...formState, technologies: e.target.value })}
                        placeholder="React, Next.js, Tailwind, etc."
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setIsCreateDialogOpen(false);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit">Créer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
                        {project.technologies.join(", ")}
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
                          src={authors.find(a => a._id === project.authorId)?.imageUrl || "/images/default-avatar.png"}
                          alt={authors.find(a => a._id === project.authorId)?.name || "Auteur"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {authors.find(a => a._id === project.authorId)?.name || "Auteur"}
                        </span>
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