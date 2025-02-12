"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

type ChatThread = {
  id: string;
  name: string;
  messages: Message[];
};

type ChatSettings = {
  contextPrompt: string;
  selectedModel: string;
};

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    contextPrompt: "",
    selectedModel: "gpt-3.5",
  });

  // Create a new chat thread and set it as active.
  const handleNewChat = () => {
    const newChat: ChatThread = {
      id: Date.now().toString(),
      name: "New Chat",
      messages: [],
    };
    setActiveChat(newChat);
    setChatHistory((prev) => [newChat, ...prev]);
  };

  // Update a chat thread in both chatHistory and activeChat.
  const updateChat = (updatedChat: ChatThread) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
    setActiveChat(updatedChat);
  };

  // Save settings and close the modal.
  const handleSettingsSave = () => {
    // Additional saving logic can be added here.
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header Bar with three buttons */}
      <header className="flex items-center justify-between bg-gray-800 text-white p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Chat History
          </button>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
          >
            New Chat
          </button>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
        >
          Settings
        </button>
      </header>

      <div className="flex flex-1">
        {/* Expandable Left Panel (Chat History) */}
        {isHistoryOpen && (
          <aside className="w-64 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Chat History</h3>
            <ul>
              {chatHistory.map((chat) => (
                <li key={chat.id} className="mb-2">
                  <button
                    onClick={() => setActiveChat(chat)}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                      activeChat?.id === chat.id ? "bg-gray-200" : ""
                    }`}
                  >
                    {chat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Main Chat Interface */}
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">
                Context Prompt
              </label>
              <textarea
                value={settings.contextPrompt}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contextPrompt: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded p-2"
                rows={3}
                placeholder="Enter a context prompt..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">
                LLM Model
              </label>
              <select
                value={settings.selectedModel}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    selectedModel: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded p-2"
              >
                <option value="gpt-3.5">GPT-3.5</option>
                <option value="gpt-4">GPT-4</option>
                <option value="llama">Llama</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSettingsSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ChatInterfaceProps = {
  activeChat: ChatThread;
  updateChat: (updatedChat: ChatThread) => void;
  settings: ChatSettings;
};

function ChatInterface({
  activeChat,
  updateChat,
  settings,
}: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom when messages update.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    let updatedChat = { ...activeChat };

    // If it's the first user message, update the chat title using the first 10 characters.
    if (updatedChat.messages.length === 0) {
      updatedChat = { ...updatedChat, name: prompt.trim().slice(0, 25) };
    }

    // Append user's message.
    const userMessage: Message = { role: "user", text: prompt };
    updatedChat = {
      ...updatedChat,
      messages: [...updatedChat.messages, userMessage],
    };
    updateChat(updatedChat);

    setLoading(true);
    setPrompt("");

    try {
      // Simulate an API call. You can pass context prompt or model info as needed.
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          contextPrompt: settings.contextPrompt,
          model: settings.selectedModel,
        }),
      });
      const data = await res.json();

      // Append assistant's response.
      const assistantMessage: Message = {
        role: "assistant",
        text: data.response,
      };
      updatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
      };
      updateChat(updatedChat);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        text: "Error fetching response",
      };
      updatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
      };
      updateChat(updatedChat);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {activeChat.messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-300 bg-white flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendPrompt}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
