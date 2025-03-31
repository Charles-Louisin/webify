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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { FaPlus, FaTrash, FaEdit, FaSearch, FaHeart, FaComment, FaBookmark, FaShare } from "react-icons/fa";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function BlogStats() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<Id<"blogs"> | null>(null);

  // État du formulaire pour la création/mise à jour du blog
  const [formState, setFormState] = useState({
    title: "",
    content: "",
    image: "",
    tags: "",
  });

  // Récupérer tous les blogs
  const blogs = useQuery(api.blogs.getAllBlogs, {}) || [];
  const authors = useQuery(api.users.getCollaborators, {}) || [];

  // Mutations
  const createBlog = useMutation(api.blogs.createBlog);
  const updateBlog = useMutation(api.blogs.updateBlog);
  const deleteBlog = useMutation(api.blogs.deleteBlog);

  // Catégories pour le filtre
  const categories = [
    { value: "development", label: "Développement" },
    { value: "design", label: "Design" },
    { value: "tutorial", label: "Tutoriels" },
    { value: "news", label: "Actualités" },
  ];

  // Filtrer les blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? blog.tags.includes(selectedCategory) : true;
    return matchesSearch && matchesCategory;
  });

  // Gérer la soumission du formulaire de création
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      // Vérifier que les champs obligatoires sont remplis
      if (!formState.title || !formState.content || !formState.tags) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Créer le blog
      await createBlog({
        authorId: user._id,
        title: formState.title,
        content: formState.content,
        image: formState.image || undefined,
        tags: formState.tags.split(",").map(tag => tag.trim()),
      });
      
      toast.success("Article créé avec succès");
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la création de l'article");
      console.error(error);
    }
  };

  // Gérer la mise à jour d'un blog
  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user || !selectedBlogId) return;
      
      // Vérifier que les champs obligatoires sont remplis
      if (!formState.title || !formState.content || !formState.tags) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Mise à jour du blog
      await updateBlog({
        blogId: selectedBlogId,
        authorId: user._id,
        title: formState.title,
        content: formState.content,
        image: formState.image || undefined,
        tags: formState.tags.split(",").map(tag => tag.trim()),
      });
      
      toast.success("Article mis à jour avec succès");
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      resetForm();
      setIsUpdateDialogOpen(false);
      setSelectedBlogId(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'article");
      console.error(error);
    }
  };

  // Gérer la suppression d'un blog
  const handleDeleteBlog = async (blogId: Id<"blogs">) => {
    try {
      if (!user) return;
      
      if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
        return;
      }
      
      await deleteBlog({ blogId, userId: user._id });
      toast.success("Article supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'article");
      console.error(error);
    }
  };

  // Préparer la mise à jour d'un blog
  const prepareBlogUpdate = (blog: any) => {
    setSelectedBlogId(blog._id);
    setFormState({
      title: blog.title,
      content: blog.content,
      image: blog.image || "",
      tags: blog.tags.join(", "),
    });
    setIsUpdateDialogOpen(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormState({
      title: "",
      content: "",
      image: "",
      tags: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Gestion des articles</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <FaPlus size={14} /> Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Créer un nouvel article</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBlog} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Titre*</label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="Titre de l'article"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Contenu*</label>
                <Textarea
                  id="content"
                  value={formState.content}
                  onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                  placeholder="Contenu de l'article..."
                  rows={12}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">Image (URL)</label>
                <Input
                  id="image"
                  value={formState.image}
                  onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                  placeholder="URL de l'image"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">Tags* (séparés par des virgules)</label>
                <Input
                  id="tags"
                  value={formState.tags}
                  onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                  placeholder="development, design, tutorial, news, etc."
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBlog} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="update-title" className="text-sm font-medium">Titre*</label>
              <Input
                id="update-title"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="Titre de l'article"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-content" className="text-sm font-medium">Contenu*</label>
              <Textarea
                id="update-content"
                value={formState.content}
                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                placeholder="Contenu de l'article..."
                rows={12}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-image" className="text-sm font-medium">Image (URL)</label>
              <Input
                id="update-image"
                value={formState.image}
                onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                placeholder="URL de l'image"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="update-tags" className="text-sm font-medium">Tags* (séparés par des virgules)</label>
              <Input
                id="update-tags"
                value={formState.tags}
                onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                placeholder="development, design, tutorial, news, etc."
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  setSelectedBlogId(null);
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
      
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Liste des blogs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBlogs.map((blog) => (
          <Card key={blog._id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={blog.image || "/images/default-blog.jpg"}
                alt={blog.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <div className="text-xs text-muted-foreground">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="text-xl">{blog.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Image
                  src={authors.find(a => a._id === blog.authorId)?.imageUrl || "/images/default-avatar.png"}
                  alt={authors.find(a => a._id === blog.authorId)?.name || "Auteur"}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                {authors.find(a => a._id === blog.authorId)?.name || "Auteur"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {blog.content}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FaHeart className="text-red-500" />
                  {blog.likes.length}
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="text-blue-500" />
                  {blog.comments.length}
                </div>
                <div className="flex items-center gap-1">
                  <FaBookmark className="text-green-500" />
                  {blog.saves.length}
                </div>
                <div className="flex items-center gap-1">
                  <FaShare className="text-purple-500" />
                  {blog.shares}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                onClick={() => prepareBlogUpdate(blog)}
              >
                <FaEdit className="mr-2" /> Modifier
              </Button>
              <Button
                onClick={() => handleDeleteBlog(blog._id)}
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