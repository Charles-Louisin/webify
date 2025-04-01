"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia(query);
    
    // Fonction qui met à jour l'état quand le media query change
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Initialisation
    updateMatches();
    
    // Ajout de l'écouteur d'événement
    if (media.addEventListener) {
      media.addEventListener("change", updateMatches);
    } else {
      // Fallback pour les anciens navigateurs
      media.addListener(updateMatches);
    }
    
    // Nettoyage
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", updateMatches);
      } else {
        // Fallback pour les anciens navigateurs
        media.removeListener(updateMatches);
      }
    };
  }, [query]);

  return matches;
} 