"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/app/hooks/useUser";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { toast } from "react-hot-toast";
import {
  FaUserShield,
  FaUserTie, 
  FaUserAlt,
  FaSearch,
  FaEdit,
  FaTrash
} from "react-icons/fa";

export default function UserStats() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | "user" | "colab" | "admin">("all");
  const [userIdToUpdate, setUserIdToUpdate] = useState<Id<"users"> | null>(null);
  const [newRole, setNewRole] = useState<"user" | "colab" | "admin">("user");

  // Récupérer tous les utilisateurs
  const allUsers = useQuery(api.users.getUsers, {}) || [];
  
  // Mutations
  const updateUserRole = useMutation(api.auth.updateUserRole);
  const deleteUser = useMutation(api.users.deleteUser);

  // Filtrer les utilisateurs
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" ? true : u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Obtenir les stats d'un utilisateur
  const getUserStats = (userId: Id<"users">) => {
    if (!user) return null;
    return useQuery(api.admin.getUserStats, { targetUserId: userId, adminId: user._id });
  };

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (userId: Id<"users">, newRole: "user" | "colab" | "admin") => {
    try {
      if (!user) return;
      await updateUserRole({ userId, adminId: user._id, newRole });
      toast.success(`Rôle modifié avec succès`);
      setUserIdToUpdate(null);
      setNewRole("user");
    } catch (error) {
      toast.error("Erreur lors de la modification du rôle");
      console.error(error);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId: Id<"users">) => {
    try {
      if (!user) return;
      
      if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
        return;
      }
      
      await deleteUser({ userId });
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      console.error(error);
    }
  };

  // Obtenir l'icône en fonction du rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="h-4 w-4 text-red-500" />;
      case "colab":
        return <FaUserTie className="h-4 w-4 text-blue-500" />;
      default:
        return <FaUserAlt className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestion des utilisateurs</h2>
      
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={(value: "all" | "user" | "colab" | "admin") => setSelectedRole(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="user">Utilisateurs</SelectItem>
            <SelectItem value="colab">Collaborateurs</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <Card key={u._id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={u.imageUrl || "/images/img1"} alt={u.name} />
                    <AvatarFallback>{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{u.name}</CardTitle>
                    <CardDescription className="text-xs truncate max-w-[150px]">
                      {u.email}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="flex items-center gap-1">
                  {getRoleIcon(u.role)}
                  {u.role === "colab" ? "Collaborateur" : u.role === "admin" ? "Admin" : "Utilisateur"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                <div>Posts: {u.stats?.postsCreated || 0}</div>
                <div>Projets: {u.stats?.projectsCreated || 0}</div>
                <div>Blogs: {u.stats?.commentsCreated || 0}</div>
                <div>Likes reçus: {u.stats?.likedBy?.length || 0}</div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                {userIdToUpdate === u._id ? (
                  <>
                    <Select value={newRole} onValueChange={(value) => setNewRole(value as "user" | "colab" | "admin")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="colab">Collaborateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      className="bg-primary text-white hover:bg-primary/90"
                      onClick={() => handleRoleChange(u._id, newRole)}
                    >
                      Sauvegarder
                    </Button>
                    <Button 
                      type="button"
                      className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setUserIdToUpdate(null);
                        setNewRole("user");
                      }}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="button"
                      className="border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full"
                      onClick={() => {
                        setUserIdToUpdate(u._id);
                        setNewRole(u.role as "user" | "colab" | "admin");
                      }}
                    >
                      <FaEdit className="mr-2" /> Modifier le rôle
                    </Button>
                    {u._id !== user?._id && (
                      <Button 
                        type="button"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 