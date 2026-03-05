"use client";

import { useState } from "react";
import { OdooUser } from "@/lib/types";
import LoginScreen from "@/components/LoginScreen";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [user, setUser] = useState<OdooUser | null>(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <ChatInterface user={user} onLogout={() => setUser(null)} />;
}
