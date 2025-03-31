"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/app/hooks/useUser";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { FaPlus, FaTrash, FaEdit, FaSearch, FaHeart, FaComment } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function ProjectStats() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);

  // État du formulaire pour la création/mise à jour de projet
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    images: ["", ""],
    video: "",
    githubLink: "",
    demoLink: "",
    technologies: "",
  });

  // Récupérer tous les projets
  const projects = useQuery(api.projects.getAllProjects, {}) || [];
  const authors = useQuery(api.users.getCollaborators, {}) || [];

  // Mutations
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  // Filtrer les projets
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Gérer la soumission du formulaire de création
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
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
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
      console.error(error);
    }
  };

  // Gérer la mise à jour d'un projet
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user || !selectedProjectId) return;
      
      // Vérifier que les champs obligatoires sont remplis
      if (!formState.title || !formState.description || !formState.technologies) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Filtrer les images vides
      const images = formState.images.filter(img => img.trim() !== "");
      
      // Mise à jour du projet
      await updateProject({
        projectId: selectedProjectId,
        authorId: user._id,
        title: formState.title,
        description: formState.description,
        images,
        video: formState.video || undefined,
        githubLink: formState.githubLink || undefined,
        demoLink: formState.demoLink || undefined,
        technologies: formState.technologies.split(",").map(t => t.trim()),
      });
      
      toast.success("Projet mis à jour avec succès");
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      resetForm();
      setIsUpdateDialogOpen(false);
      setSelectedProjectId(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du projet");
      console.error(error);
    }
  };

  // Gérer la suppression d'un projet
  const handleDeleteProject = async (projectId: Id<"projects">) => {
    try {
      if (!user) return;
      
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
        return;
      }
      
      await deleteProject({ projectId, userId: user._id });
      toast.success("Projet supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du projet");
      console.error(error);
    }
  };

  // Préparer la mise à jour d'un projet
  const prepareProjectUpdate = (project: any) => {
    setSelectedProjectId(project._id);
    setFormState({
      title: project.title,
      description: project.description,
      images: [...project.images, "", ""].slice(0, 2),
      video: project.video || "",
      githubLink: project.githubLink || "",
      demoLink: project.demoLink || "",
      technologies: project.technologies.join(", "),
    });
    setIsUpdateDialogOpen(true);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Gestion des projets</h2>
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
      </div>
      
      {/* Boîte de dialogue de mise à jour */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="update-title" className="text-sm font-medium">Titre*</label>
              <Input
                id="update-title"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="Titre du projet"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-description" className="text-sm font-medium">Description*</label>
              <Textarea
                id="update-description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Description du projet"
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-image1" className="text-sm font-medium">Image 1 (URL)</label>
              <Input
                id="update-image1"
                value={formState.images[0]}
                onChange={(e) => setFormState({ 
                  ...formState, 
                  images: [e.target.value, formState.images[1]] 
                })}
                placeholder="URL de l'image principale"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-image2" className="text-sm font-medium">Image 2 (URL - optionnelle)</label>
              <Input
                id="update-image2"
                value={formState.images[1]}
                onChange={(e) => setFormState({ 
                  ...formState, 
                  images: [formState.images[0], e.target.value] 
                })}
                placeholder="URL de la seconde image"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-video" className="text-sm font-medium">Vidéo (URL - optionnelle)</label>
              <Input
                id="update-video"
                value={formState.video}
                onChange={(e) => setFormState({ ...formState, video: e.target.value })}
                placeholder="URL de la vidéo"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="update-githubLink" className="text-sm font-medium">Lien GitHub</label>
                <Input
                  id="update-githubLink"
                  value={formState.githubLink}
                  onChange={(e) => setFormState({ ...formState, githubLink: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="update-demoLink" className="text-sm font-medium">Lien démo</label>
                <Input
                  id="update-demoLink"
                  value={formState.demoLink}
                  onChange={(e) => setFormState({ ...formState, demoLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-technologies" className="text-sm font-medium">Technologies* (séparées par des virgules)</label>
              <Input
                id="update-technologies"
                value={formState.technologies}
                onChange={(e) => setFormState({ ...formState, technologies: e.target.value })}
                placeholder="React, Next.js, Tailwind, etc."
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  setSelectedProjectId(null);
                  setIsUpdateDialogOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">Mettre à jour</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Recherche */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project._id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={project.images[0] || "/images/default-project.jpg"}
                alt={project.title}
                layout="fill"
                objectFit="cover"
              />
              {project.images[1] && (
                <div className="absolute top-2 right-2 w-16 h-16 rounded-lg overflow-hidden border-2 border-white">
                  <Image
                    src={project.images[1]}
                    alt={`${project.title} - Image 2`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <div className="flex gap-1">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Image
                  src={authors.find(a => a._id === project.authorId)?.imageUrl || "/images/default-avatar.png"}
                  alt={authors.find(a => a._id === project.authorId)?.name || "Auteur"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                {authors.find(a => a._id === project.authorId)?.name || "Auteur"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-500" />
                  {project.likes.length}
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="text-blue-500" />
                  {project.comments.length}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                onClick={() => prepareProjectUpdate(project)}
              >
                <FaEdit className="mr-2" /> Modifier
              </Button>
              <Button
                onClick={() => handleDeleteProject(project._id)}
              >
                <FaTrash />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 