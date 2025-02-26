import React from "react";
import type { ChatSettings } from "../page";

type ChatSettingsModalProps = {
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  onSave: () => void;
  onCancel: () => void;
};

const ChatSettingsModal = ({
  settings,
  setSettings,
  onSave,
  onCancel,
}: ChatSettingsModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>

        {/* Model Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Model Name</label>
          <input
            type="text"
            value={settings.selectedModel}
            onChange={(e) =>
              setSettings({
                ...settings,
                selectedModel: e.target.value,
              })
            }
            placeholder="Enter model name"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* Docker API URL Input */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Docker API URL</label>
          <input
            type="text"
            value={settings.apiUrl}
            onChange={(e) =>
              setSettings({
                ...settings,
                apiUrl: e.target.value,
              })
            }
            placeholder="Paste your Docker API URL"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
