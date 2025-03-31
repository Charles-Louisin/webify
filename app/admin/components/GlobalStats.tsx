"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Définir les couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function GlobalStats({ stats }: { stats: any }) {
  // Données pour le graphique en barres (utilisateurs)
  const userData = [
    {
      name: 'Utilisateurs',
      Utilisateurs: stats.users.total - stats.users.colabs - stats.users.admins,
      Collaborateurs: stats.users.colabs,
      Administrateurs: stats.users.admins,
    },
  ];

  // Données pour le graphique en barres (contenus)
  const contentData = [
    {
      name: 'Posts',
      Nombre: stats.posts.total,
      Likes: stats.posts.likes,
      Commentaires: stats.posts.comments,
      Partages: stats.posts.shares,
    },
    {
      name: 'Projets',
      Nombre: stats.projects.total,
      Likes: stats.projects.likes,
      Commentaires: stats.projects.comments,
    },
    {
      name: 'Blogs',
      Nombre: stats.blogs.total,
      Likes: stats.blogs.likes,
      Commentaires: stats.blogs.comments,
      Partages: stats.blogs.shares,
    },
  ];

  // Données pour le graphique circulaire (répartition du contenu)
  const contentDistributionData = [
    { name: 'Posts', value: stats.posts.total },
    { name: 'Projets', value: stats.projects.total },
    { name: 'Blogs', value: stats.blogs.total },
  ];

  // Données pour le graphique circulaire (avis)
  const reviewsData = [
    { name: 'Avis sur l\'app', value: stats.reviews.appReviews },
    { name: 'Autres avis', value: stats.reviews.total - stats.reviews.appReviews },
  ];

  return (
    <div className="space-y-8">
      {/* Statistiques des utilisateurs */}
      <div>
        <h3 className="text-lg font-medium mb-4">Répartition des utilisateurs</h3>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Types d'utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Utilisateurs" fill={COLORS[0]} />
                  <Bar dataKey="Collaborateurs" fill={COLORS[1]} />
                  <Bar dataKey="Administrateurs" fill={COLORS[2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques du contenu */}
      <div>
        <h3 className="text-lg font-medium mb-4">Statistiques du contenu</h3>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Engagements par type de contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contentData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Nombre" fill={COLORS[0]} />
                  <Bar dataKey="Likes" fill={COLORS[1]} />
                  <Bar dataKey="Commentaires" fill={COLORS[2]} />
                  <Bar dataKey="Partages" fill={COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques circulaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Répartition du contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Avis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reviewsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-lg font-medium">Note moyenne: {stats.reviews.averageAppRating.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 