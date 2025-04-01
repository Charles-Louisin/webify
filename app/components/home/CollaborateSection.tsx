"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Collaborator {
  _id: string;
  name: string;
  role: string;
  image: string;
  expertise: string[];
}

interface CollaborateSectionProps {
  collaborators: Collaborator[];
}

export default function CollaborateSection({ collaborators }: CollaborateSectionProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collaborators.map((collaborator, index) => (
          <motion.div
            key={collaborator._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            className="group"
          >
            <Link href={`/collaborator/${collaborator._id}`}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="glassmorphism h-full rounded-2xl p-8 flex flex-col items-center hover:shadow-glow-primary hover:border-primary/50 transition-all duration-300"
              >
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary blur-md opacity-40" />
                  <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/50">
                    <Image
                      src={collaborator.image}
                      alt={collaborator.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      ease: "linear",
                      repeat: Infinity
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                  </motion.div>
                </div>

                <motion.h3
                  className="text-xl font-futuristic text-gray-800 mb-2 text-center"
                  initial={{ backgroundPosition: "0%" }}
                  animate={{ backgroundPosition: "100%" }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  {collaborator.name}
                </motion.h3>

                <p className="text-gray-700 mb-4 text-center font-medium">
                  {collaborator.role}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mt-auto">
                  {collaborator.expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/20 text-gray-700 rounded-full text-xs font-futuristic backdrop-blur-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-6 group-hover:via-primary transition-colors"
                />

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="mt-6 flex items-center justify-center text-gray-800 text-sm font-futuristic opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <span className="mr-2">Voir le profil</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-16 text-center"
      >
        <motion.div
          className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200"
        >
          <h3 className="text-2xl font-futuristic text-gray-800 mb-4">
            Rejoignez notre communauté de collaborateurs
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Vous êtes un professionnel du web design ou du développement ? Rejoignez notre plateforme pour proposer vos services, trouver de nouveaux clients et collaborer sur des projets passionnants.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-glow-primary font-futuristic"
          >
            Devenir collaborateur
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
} 