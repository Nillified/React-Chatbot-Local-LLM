import React, { useState, useEffect } from "react";
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
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [localConfigs, setLocalConfigs] = useState(settings.llmConfigs);
  const [localSelectedModel, setLocalSelectedModel] = useState(
    settings.selectedModel || (settings.llmConfigs[0] && settings.llmConfigs[0].name) || ""
  );

  useEffect(() => {
    // Refresh local state when external settings change
    setLocalConfigs(settings.llmConfigs);
    setLocalSelectedModel(
      settings.selectedModel || (settings.llmConfigs[0] && settings.llmConfigs[0].name) || " "
    );
  }, [settings]);

  const handleModelChange = (
    index: number,
    key: "name" | "apiUrl",
    value: string
  ) => {
    const newConfigs = [...localConfigs];
    newConfigs[index] = { ...newConfigs[index], [key]: value };
    setLocalConfigs(newConfigs);
  };

  const addNewModel = () => {
    setLocalConfigs([...localConfigs, { name: "", apiUrl: "" }]);
  };

  const removeModel = (index: number) => {
    const newConfigs = [...localConfigs];
    const removedConfig = newConfigs.splice(index, 1)[0];
    // If the removed model was the selected one, default to the first available
    let newSelectedModel = localSelectedModel;
    if (removedConfig.name === localSelectedModel) {
      newSelectedModel = newConfigs[0]?.name || "";
    }
    setLocalConfigs(newConfigs);
    setLocalSelectedModel(newSelectedModel);
  };

  const handleSelectedModelChange = (value: string) => {
    setLocalSelectedModel(value);
  };

  const handleSave = () => {
    // Ensure the selected model is valid—if not, default to the first model available.
    const validSelectedModel =
      localConfigs.find((cfg) => cfg.name === localSelectedModel)?.name ||
      localConfigs[0]?.name ||
      "";
    setSettings({
      ...settings,
      llmConfigs: localConfigs,
      selectedModel: validSelectedModel,
    });
    setIsEditing(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>

        {isEditing ? (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Edit LLM Configurations</h3>
            {localConfigs.map((config, index) => (
              <div key={index} className="mb-4 border p-2 rounded">
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) =>
                      handleModelChange(index, "name", e.target.value)
                    }
                    placeholder="Enter model name"
                    className="w-full border border-gray-300 rounded p-2"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 mb-1">
                    Docker API URL
                  </label>
                  <input
                    type="text"
                    value={config.apiUrl}
                    onChange={(e) =>
                      handleModelChange(index, "apiUrl", e.target.value)
                    }
                    placeholder="Paste your Docker API URL"
                    className="w-full border border-gray-300 rounded p-2"
                  />
                </div>
                <button
                  onClick={() => removeModel(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addNewModel}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
            >
              Add New Model
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">LLM Configurations</h3>
            {localConfigs.map((config, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <p className="text-gray-700">
                  <strong>Model:</strong> {config.name || `Model ${index + 1}`}
                </p>
                <p className="text-gray-700">
                  <strong>API URL:</strong> {config.apiUrl}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Active Model Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Select Active Model
          </label>
          <select
            value={localSelectedModel}
            onChange={(e) => handleSelectedModelChange(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            {localConfigs.map((config, index) => (
              <option key={index} value={config.name}>
                {config.name || `Model ${index + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel Edit
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit Models
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
