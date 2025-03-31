"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { FaUsers, FaProjectDiagram, FaBlog, FaChartBar, FaCog } from "react-icons/fa";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

// Importer les composants de tableau de bord
import UserStats from "./components/UserStats";
import ProjectStats from "./components/ProjectStats";
import BlogStats from "./components/BlogStats";
import GlobalStats from "./components/GlobalStats";
import Settings from "./components/Settings";

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Récupérer les statistiques globales
  const globalStats = useQuery(
    api.admin.getGlobalStats,
    user?._id ? { adminId: user._id } : "skip"
  );

  // Rediriger si l'utilisateur n'est pas administrateur
  if (!isLoading && (!user || user.role !== "admin")) {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <h1 className="text-4xl font-bold mb-8">
            Tableau de bord administrateur
          </h1>

          {/* Menu latéral et contenu */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Menu latéral */}
            <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
              <Button
                className={`justify-start ${
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <FaChartBar className="mr-2" /> Vue d'ensemble
              </Button>
              <Button
                className={`justify-start ${
                  activeTab === "users"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <FaUsers className="mr-2" /> Utilisateurs
              </Button>
              <Button
                className={`justify-start ${
                  activeTab === "projects"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("projects")}
              >
                <FaProjectDiagram className="mr-2" /> Projets
              </Button>
              <Button
                className={`justify-start ${
                  activeTab === "blogs"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("blogs")}
              >
                <FaBlog className="mr-2" /> Blogs
              </Button>
              <Button
                className={`justify-start ${
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <FaCog className="mr-2" /> Paramètres
              </Button>
            </div>

            {/* Contenu principal */}
            <div className="flex-1">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Vue d'ensemble</h2>
                  
                  {globalStats ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Utilisateurs
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{globalStats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                              {globalStats.users.colabs} collaborateurs, {globalStats.users.admins} administrateurs
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Projets
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{globalStats.projects.total}</div>
                            <p className="text-xs text-muted-foreground">
                              {globalStats.projects.likes} likes, {globalStats.projects.comments} commentaires
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Articles de blog
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{globalStats.blogs.total}</div>
                            <p className="text-xs text-muted-foreground">
                              {globalStats.blogs.likes} likes, {globalStats.blogs.shares} partages
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              Avis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{globalStats.reviews.averageAppRating.toFixed(1)}/5</div>
                            <p className="text-xs text-muted-foreground">
                              {globalStats.reviews.total} avis au total
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <GlobalStats stats={globalStats} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "users" && <UserStats />}
              {activeTab === "projects" && <ProjectStats />}
              {activeTab === "blogs" && <BlogStats />}
              {activeTab === "settings" && <Settings />}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 