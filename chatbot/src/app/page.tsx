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
  context?: number[]; // Adjust type as needed.
};

type ChatSettings = {
  selectedModel: string;
};

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    selectedModel: "qwen:0.5b",
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
      {/* Header Bar */}
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
            disabled={activeChat?.messages.length === 0}
            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">LLM Model</label>
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
                <option value="qwen:0.5b">qwen:0.5b</option>
                <option value="Llama">Llama</option>
                <option value="Deepseek">Deepseek</option>
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
  
    console.log("[Client] Sending prompt:", prompt);
  
    let updatedChat = { ...activeChat };
    if (updatedChat.messages.length === 0) {
      updatedChat = { ...updatedChat, name: prompt.trim().slice(0, 25) };
    }
  
    // Append the user message
    const userMessage: Message = { role: "user", text: prompt };
    updatedChat = {
      ...updatedChat,
      messages: [...updatedChat.messages, userMessage],
    };
    updateChat(updatedChat);
  
    setLoading(true);
    // Capture the current prompt before clearing
    const currentPrompt = prompt;
    setPrompt("");
  
    try {
      const dockerizedEndpoint =
        process.env.NEXT_PUBLIC_DOCKERIZED_API_URL ||
        "http://localhost:11434/api/generate";
  
      // Log the current active chat context (if any)
      console.log("[Client] Active chat context before sending:", activeChat?.context);
  
      // Option 1: Use the returned context (if provided by the API)
      const payload: any = {
        model: settings.selectedModel,
        prompt: currentPrompt,
        stream: false,
      };
      if (activeChat?.context) {
        payload.context = activeChat.context;
        console.log("[Client] Including context in payload:", activeChat.context);
      } else {
        console.log("[Client] No existing context to include.");
      }
  
      // Option 2 (optional): Concatenate conversation history into the prompt.
      // Uncomment the following if you prefer to include full history:
      /*
      const historyText = activeChat?.messages
        .map((msg) => `${msg.role}: ${msg.text}`)
        .join("\n");
      payload.prompt = `${historyText}\nuser: ${currentPrompt}`;
      console.log("[Client] Full prompt with history:", payload.prompt);
      */
  
      console.log("[Client] Calling endpoint:", dockerizedEndpoint);
      console.log("[Client] Payload:", payload);
  
      const res = await fetch(dockerizedEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[Client] Fetch response status:", res.status);
  
      const data = await res.json();
      console.log("[Client] Data received:", data);
  
      // Log the new context received
      if (data.context) {
        console.log("[Client] New context received from API:", data.context);
        updatedChat.context = data.context;
      } else {
        console.log("[Client] No new context received from API.");
      }
  
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
      console.error("[Client] Error fetching response from API:", error);
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
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {activeChat.messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
