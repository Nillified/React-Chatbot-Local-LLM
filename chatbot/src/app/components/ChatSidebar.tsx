import React, { useState, useEffect } from "react";
import type { ChatThread } from "../chatbot/page";

type ChatSidebarProps = {
  chatHistory: ChatThread[];
  activeChat: ChatThread | null;
  onSelectChat: (chat: ChatThread) => void;
  onDeleteChat: (chatId: string) => void;
};

const ChatSidebar = ({ chatHistory, activeChat, onSelectChat, onDeleteChat }: ChatSidebarProps) => {
  // State to control the sliding effect.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the slide-in animation when the component mounts.
    // Optionally, you can delay this with setTimeout if needed.
    setIsVisible(true);
  }, []);

  const getChatDisplayName = (chat: ChatThread) => {
    if (chat.name === "New Chat" && chat.messages.length > 0) {
      // Find the first user message and return its content (up to 25 characters)
      const userMessage = chat.messages.find((msg) => msg.role === "user");
      if (userMessage) {
        return userMessage.content.slice(0, 25);
      }
    }
    return chat.name;
  };

  return (
    <aside
      className={`w-64 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto transform transition-transform duration-300 ease-out ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <h3 className="text-lg font-bold mb-2">Chat History</h3>
      <ul>
        {chatHistory.map((chat) => (
          <li key={chat.id} className="mb-2 flex items-center justify-between">
            <button
              onClick={() => onSelectChat(chat)}
              className={`w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                activeChat?.id === chat.id ? "bg-gray-200" : ""
              }`}
            >
              {getChatDisplayName(chat)}
            </button>
            <button
              onClick={() => onDeleteChat(chat.id)}
              className="ml-2 text-red-600 hover:text-red-800"
              title="Delete chat"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ChatSidebar;
