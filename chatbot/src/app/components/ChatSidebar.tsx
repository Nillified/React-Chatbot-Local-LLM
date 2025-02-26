import React from "react";
import type { ChatThread } from "../page";

type ChatSidebarProps = {
  chatHistory: ChatThread[];
  activeChat: ChatThread | null;
  onSelectChat: (chat: ChatThread) => void;
};

const ChatSidebar = ({ chatHistory, activeChat, onSelectChat }: ChatSidebarProps) => {
  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-300 p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2">Chat History</h3>
      <ul>
        {chatHistory.map((chat) => (
          <li key={chat.id} className="mb-2">
            <button
              onClick={() => onSelectChat(chat)}
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
  );
};

export default ChatSidebar;
