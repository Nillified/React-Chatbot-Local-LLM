import React from "react";

type ChatHeaderProps = {
  onToggleHistory: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  disableNewChat: boolean;
};

const ChatHeader = ({
  onToggleHistory,
  onNewChat,
  onOpenSettings,
  disableNewChat,
}: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between bg-gray-800 text-white p-4">
      <div className="flex gap-2">
        <button
          onClick={onToggleHistory}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          Chat History
        </button>
        <button
          onClick={onNewChat}
          disabled={disableNewChat}
          className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
        >
          New Chat
        </button>
      </div>
      <button
        onClick={onOpenSettings}
        className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
      >
        Settings
      </button>
    </header>
  );
};

export default ChatHeader;
