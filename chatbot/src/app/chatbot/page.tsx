"use client";

import { useEffect, useState } from "react";
import ChatHeader from "@app/components/ChatHeader";
import ChatSidebar from "@/app/components/ChatSidebar";
import ChatInterface from "@/app/components/ChatInterface";
import ChatSettingsModal from "@/app/components/ChatSettingsModal";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatThread = {
  id: string;
  name: string;
  messages: Message[];
  context?: string[];
};

export type LLMConfig = {
  name: string;
  apiUrl: string;
};

export type ChatSettings = {
  llmConfigs: LLMConfig[];
  selectedModel: string;
  contextPrompts: string[];
  selectedContextPrompt: string;
};

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<ChatSettings>({
    llmConfigs: [
      { name: "Llama-3.2-1B-Instruct", apiUrl: "http://localhost:5002/generate" }
    ],
    selectedModel: "Llama-3.2-1B-Instruct",
    contextPrompts: [""],
    selectedContextPrompt: ""
  });

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("http://127.0.0.1:5003/api/chats");
        const data = await res.json();
        setChatHistory(data);
      } catch (error) {
        console.error("Error fetching chats: ", error);
      }
    }
    fetchChats();
  }, []);


  useEffect(() => {
    fetch("http://127.0.0.1:5003/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings", err));
  }, []);


  useEffect(() => {
    const activeChatId = localStorage.getItem("activeChatId");
    if (activeChatId) {
      const fetchActiveChat = async () => {
        try {
          const res = await fetch(`http://127.0.0.1:5003/api/chats/${activeChatId}`);
          if (!res.ok) {
            throw new Error("Active chat not found");
          }
          const data = await res.json();
          setActiveChat(data);
        } catch (error) {
          console.error("Error fetching active chat:", error);
        }
      };
      fetchActiveChat();
    }
  }, []);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem("activeChatId", activeChat.id);
    } else {
      localStorage.removeItem("activeChatId");
    }
  }, [activeChat]);

  const handleNewChat = async () => {
    if (activeChat && activeChat.messages.length === 0) return;

    const newChatData = {
      name: "New Chat",
      messages: [],
      context: settings.selectedContextPrompt ? [settings.selectedContextPrompt] : []
    };

    try {
      const res = await fetch("http://127.0.0.1:5003/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChatData),
      });
      if (!res.ok) {
        throw new Error("Failed to create chat");
      }
      const createdChat = await res.json();
      console.log("New chat created with id:", createdChat.id);
      setActiveChat(createdChat);
      setChatHistory((prev) => [createdChat, ...prev]);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const updateChat = async (updatedChat: ChatThread) => {
    if (!updatedChat.id) {
      console.error("Chat ID is missing in the updated chat object:", updatedChat);
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:5003/api/chats/${updatedChat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedChat.name,
          messages: updatedChat.messages,
          context: updatedChat.context,
        }),
      });
      if (!res.ok) {
        console.log("Updated chat id:", updatedChat.id);
        throw new Error("Failed to update chat");
      }
      const data = await res.json();
      setChatHistory((prev) =>
        prev.map((chat) => (chat.id === data.id ? data : chat))
      );
      setActiveChat(data);
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };
  

  const handleSettingsSave = () => {
    setIsSettingsOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5003/api/chats/${chatId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
      if (activeChat && activeChat.id === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        disableNewChat={activeChat?.messages.length === 0}
      />

      <div className="flex flex-1 overflow-y-auto">
        {isHistoryOpen && (
          <ChatSidebar
            chatHistory={chatHistory}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
            onDeleteChat={handleDeleteChat}
          />
        )}

        <main className="flex-1 bg-white">
          {activeChat ? (
            <ChatInterface
              activeChat={activeChat}
              updateChat={updateChat}
              settings={settings}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Start a new chat to begin.</p>
            </div>
          )}
        </main>
      </div>

      {isSettingsOpen && (
        <ChatSettingsModal
          settings={settings}
          setSettings={setSettings}
          onSave={handleSettingsSave}
          onCancel={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
