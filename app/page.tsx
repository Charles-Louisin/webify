"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import HeroSection from "@/components/home/HeroSection";
import CollaboratorsSection from "@/components/home/CollaboratorsSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const collaborators = useQuery(api.users.getCollaborators);
  const appReviews = useQuery(api.social.getAppReviews);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="min-h-screen pt-16">
      <HeroSection />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-16 bg-secondary/50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nos Collaborateurs Talentueux
          </h2>
          <CollaboratorsSection collaborators={collaborators || []} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ce que nos utilisateurs disent
          </h2>
          <ReviewsSection reviews={appReviews || []} />
        </div>
      </motion.div>
    </div>
  );
}
