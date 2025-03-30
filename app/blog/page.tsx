"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaHeart, FaBookmark, FaShare, FaTag } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";

type BlogCategory = "all" | "development" | "design" | "tutorial" | "news";

export default function BlogPage() {
  const { user } = useUser();
  const blogs = useQuery(api.blogs.getAllBlogs);
  const likeBlog = useMutation(api.blogs.likeBlog);
  const saveBlog = useMutation(api.blogs.saveBlog);
  const shareBlog = useMutation(api.blogs.shareBlog);

  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: { value: BlogCategory; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "development", label: "Développement" },
    { value: "design", label: "Design" },
    { value: "tutorial", label: "Tutoriels" },
    { value: "news", label: "Actualités" },
  ];

  const filteredBlogs = blogs?.filter((blog) => {
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = async (blogId: string) => {
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

  const handleSave = async (blogId: string) => {
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

  const handleShare = async (blogId: string) => {
    try {
      await shareBlog({ blogId });
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${blogId}`);
      toast.success("Lien copié !");
    } catch (error) {
      toast.error("Erreur lors du partage");
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
            Blog
          </h1>
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
                        {blog.category}
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
                      {blog.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          src={blog.author.image || "/images/default-avatar.png"}
                          alt={blog.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium">{blog.author.name}</span>
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
                            className={user && blog.savedBy.includes(user._id) ? "text-primary" : ""}
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