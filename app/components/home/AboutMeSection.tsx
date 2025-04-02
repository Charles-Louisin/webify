"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AboutMeSection() {
  const adminProfile = useQuery(api.users.getAdminProfile);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/5 to-white z-0" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-64 h-64 mx-auto lg:w-96 lg:h-96">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image
                  src={adminProfile?.imageUrl || "/images/default-avatar.png"}
                  alt="Charles"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="bg-gradient-to-r from-primary to-secondary rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              {adminProfile?.title || "Salut, moi c'est Charles"}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {adminProfile?.bio || "Développeur web full stack passionné, je crée des expériences numériques innovantes et intuitives. Spécialisé dans les technologies modernes, je m'efforce de combiner créativité et performance pour donner vie à vos projets."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {adminProfile?.skills?.map((skill: string, index: number) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 bg-white rounded-full shadow-md text-primary border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 