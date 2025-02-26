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

    let updatedChat = { ...activeChat };
    if (updatedChat.messages.length === 0) {
      updatedChat = { ...updatedChat, name: prompt.trim().slice(0, 25) };
    }

    // Prepare the full prompt by always prepending the context prompt if available.
    const contextTag = settings.selectedContextPrompt.trim()
      ? `<contextprompt: "${settings.selectedContextPrompt}">`
      : "";
    const fullPrompt = contextTag ? `${contextTag} ${prompt}` : prompt;

    // Append the user message (display the original prompt)
    const userMessage: Message = { role: "user", text: prompt };
    updatedChat = {
      ...updatedChat,
      messages: [...updatedChat.messages, userMessage],
    };

    // (Optional) If you want to also store the context prompt in the chat context,
    // you can update it here. In this example we let the API update context.
    // For example, you might uncomment the next lines if desired:
    // if (settings.selectedContextPrompt.trim() !== "") {
    //   updatedChat.context = [settings.selectedContextPrompt];
    // }

    updateChat(updatedChat);

    setLoading(true);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      // Look up the active model configuration.
      const activeConfig = settings.llmConfigs.find(
        (config) => config.name === settings.selectedModel
      );
      if (!activeConfig) {
        throw new Error("Active model configuration not found.");
      }
      const dockerizedEndpoint = activeConfig.apiUrl;

      // Build the payload using the full prompt.
      const payload: any = {
        model: settings.selectedModel,
        prompt: fullPrompt,
        stream: false,
      };

      if (updatedChat.context && updatedChat.context.length > 0) {
        payload.context = updatedChat.context;
        console.log("[Client] Including context in payload:", payload.context);
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

      if (data.context) {
        console.log("[Client] New context received from API:", data.context);
        // Update context with new data (storing it as an array).
        updatedChat.context = Array.isArray(data.context)
          ? data.context
          : [data.context];
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
};

export default ChatInterface;
