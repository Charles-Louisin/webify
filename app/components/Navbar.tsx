"use client";

import { useUser } from "../hooks/useUser";
import Link from "next/link";
import Image from "next/image";
import { signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const routes = [
  {
    label: "Accueil",
    href: "/",
    public: true,
  },
  {
    label: "À propos",
    href: "/about",
    public: true,
  },
  {
    label: "Projets",
    href: "/projects",
    public: true,
  },
  {
    label: "Compétences",
    href: "/skills",
    public: true,
  },
  {
    label: "Blog",
    href: "/blog",
    public: true,
  },
  {
    label: "Contact",
    href: "/contact",
    public: true,
  },
  {
    label: "Messages",
    href: "/messages",
    public: false,
  },
  {
    label: "Profile",
    href: "/profile",
    public: false,
  },
  {
    label: "Dashboard",
    href: "/admin",
    admin: true,
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const { user, session } = useUser();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user.role === "admin";
  const isAuthenticated = session;

  return (
    <div className="fixed w-full h-fit z-50 flex justify-between items-center py-2 px-4 border-b border-white/10 bg-white/10 backdrop-blur-lg">
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Menu className="h-6 w-6 text-gray-800" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              {routes.map((route) => {
                if (route.admin && !isAdmin) return null;
                if (!route.public && !isAuthenticated) return null;

                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                      pathname === route.href ? "text-primary bg-primary/10" : "text-gray-700",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 h-fit ml-4 lg:ml-0">
          <Image
            src="/images/webifyLogo1.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full size-11 object-cover"
          />
          <h1 className="text-xl font-bold hidden md:block text-gray-800 font-futuristic">
            Webify
          </h1>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-6 mx-6">
        {routes.map((route) => {
          if (route.admin && !isAdmin) return null;
          if (!route.public && !isAuthenticated) return null;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-gray-700"
              )}
            >
              {route.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-4">
        {!isAuthenticated && (
          <Button 
            onClick={() => signIn("google")}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            Se connecter
          </Button>
        )}
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Image
              src={user?.imageUrl || "/default-avatar.png"}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full cursor-pointer size-12 object-cover border-2 border-white/50"
              onClick={() => signOut()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar; 