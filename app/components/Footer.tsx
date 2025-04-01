import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white/5 mt-auto backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-futuristic text-gray-800">À propos</h3>
            <p className="text-sm text-gray-600">
              Webify - Votre vision, notre création. Nous transformons vos idées en réalité numérique.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-futuristic text-gray-800">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-primary transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm text-gray-600 hover:text-primary transition">
                  Projets
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-primary transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-futuristic text-gray-800">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                Email: contact@webify.com
              </li>
              <li className="text-sm text-gray-600">
                Tél: +33 1 23 45 67 89
              </li>
              <li className="text-sm text-gray-600">
                Adresse: Paris, France
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-futuristic text-gray-800">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Webify. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 