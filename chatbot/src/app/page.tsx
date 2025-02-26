"use client";

import { useState } from "react";
import ChatHeader from "./components/ChatHeader";
import ChatSidebar from "./components/ChatSidebar";
import ChatInterface from "./components/ChatInterface";
import ChatSettingsModal from "./components/ChatSettingsModal";

export type Message = {
  role: "user" | "assistant";
  text: string;
};

export type ChatThread = {
  id: string;
  name: string;
  messages: Message[];
  context?: string[]; // changed from number[] to string[]
};

export type LLMConfig = {
  name: string;
  apiUrl: string;
};

export type ChatSettings = {
  llmConfigs: LLMConfig[];
  selectedModel: string;
  contextPrompts: string[];         // add this field for available prompts
  selectedContextPrompt: string;    // add this field for the active prompt
};




export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<ChatSettings>({
    llmConfigs: [
      { name: "qwen:0.5b", apiUrl: "http://localhost:11434/api/generate" }
    ],
    selectedModel: "qwen:0.5b",
    contextPrompts: [""],           // default empty prompt
    selectedContextPrompt: ""
  });
  

  // Create a new chat thread and set it as active.
  const handleNewChat = () => {
    if (activeChat && activeChat.messages.length === 0) return;
    const newChat: ChatThread = {
      id: Date.now().toString(),
      name: "New Chat",
      messages: [],
    };
    console.log("[NewChat] Creating new chat:", newChat);
    setActiveChat(newChat);
    setChatHistory((prev) => [newChat, ...prev]);
  };

  const updateChat = (updatedChat: ChatThread) => {
    console.log("[UpdateChat] Updating chat:", updatedChat);
    setChatHistory((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
    setActiveChat(updatedChat);
  };

  const handleSettingsSave = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-screen relative">
      <ChatHeader
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        disableNewChat={activeChat?.messages.length === 0}
      />

      <div className="flex flex-1">
        {isHistoryOpen && (
          <ChatSidebar
            chatHistory={chatHistory}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
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
