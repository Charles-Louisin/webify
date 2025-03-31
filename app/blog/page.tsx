"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { FaHeart, FaBookmark, FaShare, FaTag, FaPlus } from "react-icons/fa";
import { useUser } from "@/app/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";

type BlogCategory = "all" | "development" | "design" | "tutorial" | "news";

export default function BlogPage() {
  const { user } = useUser();
  const blogs = useQuery(api.blogs.getAllBlogs, {});
  const authors = useQuery(api.users.getCollaborators, user ? { userId: user._id as Id<"users"> } : "skip") || [];
  const likeBlog = useMutation(api.blogs.likeBlog);
  const saveBlog = useMutation(api.blogs.saveBlog);
  const shareBlog = useMutation(api.blogs.shareBlog);
  const createBlog = useMutation(api.blogs.createBlog);

  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // État du formulaire pour la création du blog
  const [formState, setFormState] = useState({
    title: "",
    content: "",
    image: "",
    tags: "",
  });

  const categories: { value: BlogCategory; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "development", label: "Développement" },
    { value: "design", label: "Design" },
    { value: "tutorial", label: "Tutoriels" },
    { value: "news", label: "Actualités" },
  ];

  const filteredBlogs = blogs?.filter((blog) => {
    const matchesCategory = selectedCategory === "all" || blog.tags.includes(selectedCategory);
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = async (blogId: Id<"blogs">) => {
    if (!user) {
      toast.error("Connectez-vous pour liker un article");
      return;
    }

    try {
      await likeBlog({ blogId, userId: user._id });
      toast.success("Article liké !");
    } catch (error) {
      toast.error("Erreur lors du like");
    }
  };

  const handleSave = async (blogId: Id<"blogs">) => {
    if (!user) {
      toast.error("Connectez-vous pour sauvegarder un article");
      return;
    }

    try {
      await saveBlog({ blogId, userId: user._id });
      toast.success("Article sauvegardé !");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleShare = async (blogId: Id<"blogs">) => {
    try {
      await shareBlog({ blogId, userId: user?._id as Id<"users"> });
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blogId}`);
      toast.success("Lien copié !");
    } catch (error) {
      toast.error("Erreur lors du partage");
    }
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

  // Gérer la soumission du formulaire de création
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) {
        toast.error("Connectez-vous pour créer un article");
        return;
      }
      
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
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'article");
      console.error(error);
    }
  };

  // Vérifier si l'utilisateur est admin ou collaborateur
  const canCreateBlog = user && (user.role === "admin" || user.role === "colab");

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
              Blog
            </h1>
            {canCreateBlog && (
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
            Découvrez nos articles sur le développement web, le design et les dernières technologies.
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
              placeholder="Rechercher un article..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Liste des articles */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs?.map((blog) => (
                <motion.div
                  key={blog._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg overflow-hidden shadow-lg"
                >
                  <Link href={`/blog/${blog._id}`}>
                    <div className="relative h-48 cursor-pointer">
                      <Image
                        src={blog.image || "/images/default-blog.jpg"}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {blog.tags[0] || "Non catégorisé"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link href={`/blog/${blog._id}`}>
                      <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {blog.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          src={authors.find((a) => a._id === blog.authorId)?.imageUrl || "/images/default-avatar.png"}
                          alt={authors.find((a) => a._id === blog.authorId)?.name || "Auteur"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium">
                          {authors.find((a) => a._id === blog.authorId)?.name || "Auteur"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(blog._id)}
                          className="hover:text-red-500"
                        >
                          <FaHeart
                            className={user && blog.likes.includes(user._id) ? "text-red-500" : ""}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSave(blog._id)}
                          className="hover:text-primary"
                        >
                          <FaBookmark
                            className={user && blog.saves.includes(user._id) ? "text-primary" : ""}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(blog._id)}
                          className="hover:text-primary"
                        >
                          <FaShare />
                        </Button>
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