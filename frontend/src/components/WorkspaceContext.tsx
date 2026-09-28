"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Workspace, IntegrationStatusItem } from "../lib/types";
import { api } from "../lib/api";

interface NotificationItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message?: string;
  timestamp: Date;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  currentUser: UserProfile;
  demoMode: boolean;
  integrations: IntegrationStatusItem[];
  isHindsightLive: boolean;
  activePersona: string;
  switchPersona: (personaKey: "judge" | "aisha" | "rahul" | "kiran") => void;
  notifications: NotificationItem[];
  addNotification: (type: "success" | "info" | "warning" | "error", title: string, message?: string) => void;
  removeNotification: (id: string) => void;
  refreshWorkspaceData: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  uid: "user-demo-judge",
  email: "judge@vibecoders.ai",
  display_name: "Demo User (You)",
  role: "owner",
  is_demo_user: true,
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
};

const PERSONAS: Record<string, UserProfile> = {
  judge: DEFAULT_USER,
  aisha: {
    uid: "user-aisha",
    email: "aisha@vibecoders.ai",
    display_name: "Aisha Patel",
    role: "member",
    is_demo_user: true,
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
  },
  rahul: {
    uid: "user-rahul",
    email: "rahul@vibecoders.ai",
    display_name: "Rahul Sharma",
    role: "member",
    is_demo_user: true,
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
  },
  kiran: {
    uid: "user-kiran",
    email: "kiran@vibecoders.ai",
    display_name: "Kiran Rao",
    role: "member",
    is_demo_user: true,
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
  }
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [activePersona, setActivePersona] = useState<string>("judge");
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [integrations, setIntegrations] = useState<IntegrationStatusItem[]>([]);
  const [isHindsightLive, setIsHindsightLive] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (type: "success" | "info" | "warning" | "error", title: string, message?: string) => {
    const item: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [item, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeNotification(item.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const switchPersona = (personaKey: "judge" | "aisha" | "rahul" | "kiran") => {
    const selected = PERSONAS[personaKey] || DEFAULT_USER;
    setCurrentUser(selected);
    setActivePersona(personaKey);
    api.setToken(`demo-token-${personaKey}`);
    addNotification("info", `Switched to persona: ${selected.display_name}`, `Acting as ${selected.role} in workspace`);
  };

  const refreshWorkspaceData = async () => {
    try {
      const [wsList, intData] = await Promise.allSettled([
        api.getWorkspaces(),
        api.getIntegrationsStatus()
      ]);

      if (wsList.status === "fulfilled" && wsList.value.length > 0) {
        setWorkspace(wsList.value[0]);
      }

      if (intData.status === "fulfilled") {
        setIntegrations(intData.value.integrations);
        setDemoMode(intData.value.demo_mode_active);
        const hs = intData.value.integrations.find(i => i.name === "hindsight");
        setIsHindsightLive(hs?.status === "connected");
      }
    } catch (e) {
      console.warn("Could not fetch workspace initial state:", e);
    }
  };

  useEffect(() => {
    refreshWorkspaceData();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        currentUser,
        demoMode,
        integrations,
        isHindsightLive,
        activePersona,
        switchPersona,
        notifications,
        addNotification,
        removeNotification,
        refreshWorkspaceData
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
