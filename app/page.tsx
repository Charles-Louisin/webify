"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import HeroSection from "./components/home/HeroSection";
import AboutMeSection from "./components/home/AboutMeSection";
import CollaboratorsSection from "./components/home/CollaboratorsSection";
import ReviewsSection from "./components/home/ReviewsSection";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const collaborators = useQuery(api.users.getCollaborators, {}) || [];
  const appReviews = useQuery(api.social.getAppReviews, {});
  
  // Debug logs
  useEffect(() => {
    console.log("App Reviews:", appReviews);
    console.log("Reviews length:", appReviews?.length || 0);
  }, [appReviews]);
  
  const { ref: collaboratorsRef, inView: collaboratorsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  const { ref: reviewsRef, inView: reviewsInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="min-h-screen pt-16 overflow-hidden">
      <HeroSection />
      
      <AboutMeSection />

      <motion.div
        ref={collaboratorsRef}
        initial={{ opacity: 0 }}
        animate={collaboratorsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="py-20 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white z-0" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        
        {/* Cercles décoratifs subtils */}
        <div className="absolute top-40 left-10 w-64 h-64 rounded-full bg-primary opacity-3 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-3 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={collaboratorsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              Nos Collaborateurs Talentueux
            </h2>
            <p className="section-description">
              Découvrez notre équipe de professionnels passionnés, prêts à donner vie à vos projets numériques avec créativité et expertise.
            </p>
          </motion.div>
          
          <CollaboratorsSection collaborators={collaborators} />
        </div>
      </motion.div>

      <motion.div
        ref={reviewsRef}
        initial={{ opacity: 0 }}
        animate={reviewsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="py-20 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-secondary/5 to-white z-0" />
        
        {/* Effets de particules subtils */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary opacity-3 blur-3xl" />
        <div className="absolute bottom-40 left-10 w-96 h-96 rounded-full bg-secondary opacity-3 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              Ce que nos utilisateurs disent
            </h2>
            <p className="section-description">
              Les retours de nos clients témoignent de notre engagement envers l'excellence et la satisfaction. Voici quelques-unes de leurs expériences.
            </p>
          </motion.div>
          
          <ReviewsSection reviews={appReviews || []} />
        </div>
      </motion.div>
      
      <motion.div 
        className="py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="glassmorphism p-8 md:p-12 rounded-2xl text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold font-futuristic mb-6 text-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Prêt à donner vie à votre vision ?
            </motion.h2>
            
            <motion.p 
              className="text-gray-700 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transformez vos idées en réalité avec notre expertise. Contactez-nous dès aujourd'hui pour discuter de votre projet.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
              >
                Contactez-nous
              </motion.a>
              <motion.a
                href="/projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors shadow-glow-secondary font-futuristic"
              >
                Voir nos projets
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
