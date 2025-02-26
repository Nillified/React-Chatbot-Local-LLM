import React, { useState, useRef, useEffect } from "react";
import type { ChatThread, ChatSettings, Message } from "../page";

type ChatInterfaceProps = {
  activeChat: ChatThread;
  updateChat: (updatedChat: ChatThread) => void;
  settings: ChatSettings;
};

const ChatInterface = ({ activeChat, updateChat, settings }: ChatInterfaceProps) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    console.log("[Client] Sending prompt:", prompt);

    // Create a copy of the current activeChat
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
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const dockerizedEndpoint =
        process.env.NEXT_PUBLIC_DOCKERIZED_API_URL ||
        "http://localhost:11434/api/generate";

      // Build the payload using updatedChat.context
      const payload: any = {
        model: settings.selectedModel,
        prompt: currentPrompt,
        stream: false,
      };

      if (updatedChat.context) {
        payload.context = updatedChat.context;
        console.log("[Client] Including context in payload:", updatedChat.context);
      } else {
        console.log("[Client] No existing context to include.");
      }

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

      // Update context with the new value from the API (if provided)
      if (data.context) {
        console.log("[Client] New context received from API:", data.context);
        updatedChat.context = data.context;
      } else {
        console.log("[Client] No new context received from API.");
      }

      // Append the assistant's reply
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
};

export default ChatInterface;
