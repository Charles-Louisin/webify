"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Label } from "@/app/components/ui/label";
import { FaSave, FaServer, FaEnvelope, FaDesktop, FaDatabase } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  
  // États pour les différents paramètres
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Webify",
    siteDescription: "Votre vision, notre création",
    contactEmail: "contact@webify.com",
    enableRegistration: true,
    enableContactForm: true,
    enableBlogComments: true,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@webify.com",
    enableEmailNotifications: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: "#3b82f6",
    darkMode: true,
    enableAnimations: true,
    showBadges: true,
    customCss: "",
  });

  // Gestion de la soumission des formulaires
  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Paramètres généraux sauvegardés:", generalSettings);
    toast.success("Paramètres généraux sauvegardés avec succès");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Paramètres email sauvegardés:", emailSettings);
    toast.success("Paramètres email sauvegardés avec succès");
  };

  const handleAppearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Paramètres d'apparence sauvegardés:", appearanceSettings);
    toast.success("Paramètres d'apparence sauvegardés avec succès");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Paramètres du site</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="general" onClick={() => setActiveTab("general")}>
            <FaServer className="mr-2" /> Général
          </TabsTrigger>
          <TabsTrigger value="email" onClick={() => setActiveTab("email")}>
            <FaEnvelope className="mr-2" /> Email
          </TabsTrigger>
          <TabsTrigger value="appearance" onClick={() => setActiveTab("appearance")}>
            <FaDesktop className="mr-2" /> Apparence
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres de base de votre site
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGeneralSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description du site</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRegistration"
                      checked={generalSettings.enableRegistration}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableRegistration: checked })}
                    />
                    <Label htmlFor="enableRegistration">Activer l'inscription des utilisateurs</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableContactForm"
                      checked={generalSettings.enableContactForm}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableContactForm: checked })}
                    />
                    <Label htmlFor="enableContactForm">Activer le formulaire de contact</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableBlogComments"
                      checked={generalSettings.enableBlogComments}
                      onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, enableBlogComments: checked })}
                    />
                    <Label htmlFor="enableBlogComments">Autoriser les commentaires sur les blogs</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto">
                  <FaSave className="mr-2" /> Enregistrer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des emails</CardTitle>
              <CardDescription>
                Paramètres pour l'envoi d'emails depuis l'application
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Serveur SMTP</Label>
                  <Input
                    id="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port SMTP</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                      placeholder="587"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">Email d'expédition</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Utilisateur SMTP</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableEmailNotifications"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableEmailNotifications: checked })}
                  />
                  <Label htmlFor="enableEmailNotifications">Activer les notifications par email</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto">
                  <FaSave className="mr-2" /> Enregistrer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre site
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAppearanceSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Couleur principale</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                      className="flex-grow"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="darkMode"
                      checked={appearanceSettings.darkMode}
                      onCheckedChange={(checked) => setAppearanceSettings({ ...appearanceSettings, darkMode: checked })}
                    />
                    <Label htmlFor="darkMode">Activer le mode sombre par défaut</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableAnimations"
                      checked={appearanceSettings.enableAnimations}
                      onCheckedChange={(checked) => setAppearanceSettings({ ...appearanceSettings, enableAnimations: checked })}
                    />
                    <Label htmlFor="enableAnimations">Activer les animations</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showBadges"
                      checked={appearanceSettings.showBadges}
                      onCheckedChange={(checked) => setAppearanceSettings({ ...appearanceSettings, showBadges: checked })}
                    />
                    <Label htmlFor="showBadges">Afficher les badges des utilisateurs</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customCss">CSS personnalisé</Label>
                  <Textarea
                    id="customCss"
                    value={appearanceSettings.customCss}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, customCss: e.target.value })}
                    placeholder=".my-custom-class { color: red; }"
                    rows={6}
                    className="font-mono"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto">
                  <FaSave className="mr-2" /> Enregistrer
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 