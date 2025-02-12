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

export default function ChatPage() {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);

  // Creates a new chat thread and sets it as active.
  const startNewChat = () => {
    const newChat: ChatThread = {
      id: Date.now().toString(),
      name: "New Chat",
      messages: [],
    };
    setActiveChat(newChat);
    setChatHistory((prev) => [newChat, ...prev]);
  };

  // Update the chat thread in both chatHistory and activeChat.
  const updateChat = (updatedChat: ChatThread) => {
    setChatHistory((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
    setActiveChat(updatedChat);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-300 p-4 bg-gray-50">
        <button
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={startNewChat}
        >
          New Chat
        </button>
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Chat History</h3>
          <ul>
            {chatHistory.map((chat) => (
              <li key={chat.id} className="mb-2">
                <button
                  className={`w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                    activeChat?.id === chat.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setActiveChat(chat)}
                >
                  {chat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatInterface activeChat={activeChat} updateChat={updateChat} />
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-gray-500">Select a chat or start a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

type ChatInterfaceProps = {
  activeChat: ChatThread;
  updateChat: (updatedChat: ChatThread) => void;
};

function ChatInterface({ activeChat, updateChat }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the latest message when messages change.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    // Create a mutable copy of the active chat.
    let updatedChat = { ...activeChat };

    // If this is the first user message, update the chat title using the first 10 characters.
    if (updatedChat.messages.length === 0) {
      updatedChat = { ...updatedChat, name: prompt.trim().slice(0, 25) };
    }

    // Append the user's message.
    const userMessage: Message = { role: "user", text: prompt };
    updatedChat = { ...updatedChat, messages: [...updatedChat.messages, userMessage] };
    updateChat(updatedChat);

    setLoading(true);
    setPrompt("");

    try {
      // Simulate an API call; replace with your LLM endpoint as needed.
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      // Append the assistant's response.
      const assistantMessage: Message = { role: "assistant", text: data.response };
      updatedChat = { ...updatedChat, messages: [...updatedChat.messages, assistantMessage] };
      updateChat(updatedChat);
    } catch (error) {
      const errorMessage: Message = { role: "assistant", text: "Error fetching response" };
      updatedChat = { ...updatedChat, messages: [...updatedChat.messages, errorMessage] };
      updateChat(updatedChat);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
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

      {/* Input Area */}
      <div className="p-4 border-t border-gray-300 bg-white flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendPrompt();
          }}
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
