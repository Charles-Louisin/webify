"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaUserFriends, FaUsers, FaPaperPlane, FaImage, FaPlus } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function MessagesPage() {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedTab, setSelectedTab] = useState<"friends" | "groups">("friends");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Requêtes
  const friends = useQuery(api.social.getUserFriends, user ? { userId: user._id } : "skip");
  const groups = useQuery(api.messages.getUserGroups, user ? { userId: user._id } : "skip");
  const messages = useQuery(
    api.messages.getPrivateMessages,
    selectedChat && user ? { userId1: user._id, userId2: selectedChat } : "skip"
  );
  const groupMessages = useQuery(
    api.messages.getGroupMessages,
    selectedChat && selectedTab === "groups" ? { groupId: selectedChat } : "skip"
  );

  // Mutations
  const sendMessage = useMutation(api.messages.sendPrivateMessage);
  const sendGroupMessage = useMutation(api.messages.sendGroupMessage);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, groupMessages]);

  const handleSendMessage = async () => {
    if (!user || !selectedChat || !messageInput.trim()) return;

    try {
      if (selectedTab === "friends") {
        await sendMessage({
          senderId: user._id,
          receiverId: selectedChat,
          content: messageInput,
        });
      } else {
        await sendGroupMessage({
          senderId: user._id,
          groupId: selectedChat,
          content: messageInput,
        });
      }
      setMessageInput("");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connectez-vous pour accéder à la messagerie</h1>
          <Link href="/sign-in">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-lg shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-[300px,1fr] h-[calc(100vh-200px)]">
            {/* Sidebar */}
            <div className="border-r">
              <Tabs value={selectedTab} onValueChange={(value: "friends" | "groups") => setSelectedTab(value)}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="friends" className="flex items-center gap-2">
                    <FaUserFriends />
                    Amis
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex items-center gap-2">
                    <FaUsers />
                    Groupes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="m-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-4 space-y-4">
                      {friends?.map((friend) => (
                        <button
                          key={friend._id}
                          onClick={() => setSelectedChat(friend._id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            selectedChat === friend._id
                              ? "bg-primary/10"
                              : "hover:bg-muted"
                          }`}
                        >
                          <Image
                            src={friend.image || "/images/default-avatar.png"}
                            alt={friend.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="text-left">
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {friend.status || "En ligne"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="groups" className="m-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-4 space-y-4">
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 mb-4"
                      >
                        <FaPlus />
                        Créer un groupe
                      </Button>
                      {groups?.map((group) => (
                        <button
                          key={group._id}
                          onClick={() => setSelectedChat(group._id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            selectedChat === group._id
                              ? "bg-primary/10"
                              : "hover:bg-muted"
                          }`}
                        >
                          <Image
                            src={group.image || "/images/default-group.png"}
                            alt={group.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="text-left">
                            <p className="font-medium">{group.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {group.members.length} membres
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Zone de chat */}
            <div className="flex flex-col">
              {selectedChat ? (
                <>
                  {/* En-tête du chat */}
                  <div className="p-4 border-b">
                    {selectedTab === "friends" ? (
                      <div className="flex items-center gap-4">
                        <Image
                          src={friends?.find(f => f._id === selectedChat)?.image || "/images/default-avatar.png"}
                          alt="Contact"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <h2 className="font-semibold">
                            {friends?.find(f => f._id === selectedChat)?.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">En ligne</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Image
                          src={groups?.find(g => g._id === selectedChat)?.image || "/images/default-group.png"}
                          alt="Groupe"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <h2 className="font-semibold">
                            {groups?.find(g => g._id === selectedChat)?.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {groups?.find(g => g._id === selectedChat)?.members.length} membres
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {(selectedTab === "friends" ? messages : groupMessages)?.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.senderId === user._id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === user._id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.senderId !== user._id && (
                              <p className="text-sm font-medium mb-1">
                                {selectedTab === "friends"
                                  ? friends?.find(f => f._id === message.senderId)?.name
                                  : message.senderName}
                              </p>
                            )}
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Zone de saisie */}
                  <div className="p-4 border-t">
                    <div className="flex gap-4">
                      <Button variant="outline" size="icon">
                        <FaImage className="h-5 w-5" />
                      </Button>
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Écrivez votre message..."
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <FaPaperPlane className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Sélectionnez une conversation pour commencer à discuter
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 