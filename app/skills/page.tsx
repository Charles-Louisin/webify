"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FaCode, FaServer, FaTools } from "react-icons/fa";

type SkillLevel = "débutant" | "intermédiaire" | "expert";

interface Skill {
  name: string;
  level: SkillLevel;
  category: string;
}

const levelToPercentage = {
  débutant: 33,
  intermédiaire: 66,
  expert: 100,
};

export default function SkillsPage() {
  const frontendSkills = useQuery(api.skills.getSkillsByCategory, { category: "Frontend" });
  const backendSkills = useQuery(api.skills.getSkillsByCategory, { category: "Backend" });
  const toolsSkills = useQuery(api.skills.getSkillsByCategory, { category: "Outils" });

  const categories = [
    {
      name: "Frontend",
      icon: <FaCode className="h-6 w-6" />,
      skills: frontendSkills || [],
      description: "Technologies et frameworks pour le développement frontend",
    },
    {
      name: "Backend",
      icon: <FaServer className="h-6 w-6" />,
      skills: backendSkills || [],
      description: "Technologies pour le développement backend et bases de données",
    },
    {
      name: "Outils",
      icon: <FaTools className="h-6 w-6" />,
      skills: toolsSkills || [],
      description: "Outils de développement, déploiement et collaboration",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Nos Compétences
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Découvrez notre expertise technique dans différents domaines du développement web.
          </p>

          <div className="grid gap-12">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-card rounded-lg p-8 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {category.skills.map((skill: Skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {skill.level}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelToPercentage[skill.level]}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 