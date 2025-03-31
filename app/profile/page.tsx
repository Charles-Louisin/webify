"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { FaHeart, FaComment, FaShare, FaBookmark, FaEdit, FaTrash } from "react-icons/fa";
import { useUser } from "@/app/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function ProfilePage() {
  const { user } = useUser();
  const userStats = useQuery(api.users.getCollaborators, user ? { userId: user._id as Id<"users"> } : "skip");
  const savedPosts = useQuery(api.posts.getSavedPosts, user ? { userId: user._id as Id<"users"> } : "skip");
  const savedBlogs = useQuery(api.blogs.getSavedBlogs, user ? { userId: user._id as Id<"users"> } : "skip");
  const userReviews = useQuery(api.social.getUserReviews, user ? { targetId: user._id as Id<"users"> } : "skip");
  const authors = useQuery(api.users.getCollaborators, user ? { userId: user._id as Id<"users"> } : "skip") || [];

  const updateProfile = useMutation(api.users.updateUser);
  const deleteAccount = useMutation(api.users.deleteUser);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    imageUrl: user?.imageUrl || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
  });

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      await updateProfile({
        userId: user._id,
        ...formData,
      });
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;

    try {
      await deleteAccount({ userId: user._id });
      toast.success("Compte supprimé avec succès");
      // Redirection vers la page d'accueil gérée par le hook useUser
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connectez-vous pour accéder à votre profil</h1>
          <Link href="/sign-in">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* En-tête du profil */}
          <div className="bg-card rounded-lg p-8 shadow-lg mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative w-32 h-32">
                <Image
                  src={user.imageUrl || "/images/default-avatar.png"}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.role === "admin" && (
                    <div className="flex items-center gap-0">
                    <Image
                      src="/images/verify.svg"
                      alt="Verifié"
                      width={24}
                      height={24}
                    />
                    <span className=" bg-primary text-white rounded-full text-sm">
                      Admin
                    </span>
                    </div>
                  )}
                  {user.role === "collaborator" && (
                    <div className="flex items-center gap-0">
                      <Image
                        src="/images/verify.svg"
                        alt="Verifié"
                        width={24}
                        height={24}
                      />
                      <span className=" bg-primary text-white rounded-full text-sm">
                        Colab
                      </span>
                      </div>
                  )}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{user.bio}</p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <FaEdit />
                    Modifier le profil
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2"
                  >
                    <FaTrash />
                    Supprimer le compte
                  </Button>
                </div>
              </div>
            </div>

            {/* Formulaire d'édition */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 border-t pt-8"
              >
                <div className="grid gap-6 max-w-2xl">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nom</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">LinkedIn</label>
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">GitHub</label>
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleUpdateProfile}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Statistiques et Contenu */}
          <Tabs defaultValue="stats" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="saved">Contenu Sauvegardé</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>

            <TabsContent value="stats">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FaHeart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Likes</h3>
                      <p className="text-2xl font-bold">{userStats?.[0]?.stats?.likes || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FaComment className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Commentaires</h3>
                      <p className="text-2xl font-bold">{userStats?.[0]?.stats?.comments || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FaShare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Partages</h3>
                      <p className="text-2xl font-bold">{userStats?.[0]?.stats?.shares || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FaBookmark className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Sauvegardés</h3>
                      <p className="text-2xl font-bold">
                        {(savedPosts?.length || 0) + (savedBlogs?.length || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Posts Sauvegardés</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPosts?.map((post) => (
                      <div key={post._id} className="bg-card rounded-lg p-6 shadow-lg">
                        <p className="line-clamp-3 mb-4">{post.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image
                              src={authors.find(a => a._id === post.authorId)?.imageUrl || "/images/default-avatar.png"}
                              alt={authors.find(a => a._id === post.authorId)?.name || "Auteur"}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="text-sm">{authors.find(a => a._id === post.authorId)?.name || "Auteur"}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <FaBookmark />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Blogs Sauvegardés</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedBlogs?.map((blog) => (
                      <div key={blog._id} className="bg-card rounded-lg overflow-hidden shadow-lg">
                        {blog.image && (
                          <div className="relative h-48">
                            <Image
                              src={blog.image}
                              alt={blog.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h4 className="font-semibold mb-2">{blog.title}</h4>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {blog.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Image
                                src={authors.find(a => a._id === blog.authorId)?.imageUrl || "/images/default-avatar.png"}
                                alt={authors.find(a => a._id === blog.authorId)?.name || "Auteur"}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span className="text-sm">{authors.find(a => a._id === blog.authorId)?.name || "Auteur"}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <FaBookmark />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                {userReviews?.map((review) => (
                  <div key={review._id} className="bg-card rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={review.userImage || "/images/default-avatar.png"}
                        alt={review.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaHeart
                              key={i}
                              className={i < review.rating ? "text-primary" : "text-muted"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 