import React, { useState, useEffect } from "react";
import type { ChatSettings } from "../chatbot/page";

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
  const [activeTab, setActiveTab] = useState<"context" | "llm">("context");
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [isEditingLLM, setIsEditingLLM] = useState(false);
  const [localConfigs, setLocalConfigs] = useState(settings.llmConfigs);
  const [localSelectedModel, setLocalSelectedModel] = useState(
    settings.selectedModel || (settings.llmConfigs[0] && settings.llmConfigs[0].name) || ""
  );
  const [localContextPrompts, setLocalContextPrompts] = useState(settings.contextPrompts);
  const [localSelectedContextPrompt, setLocalSelectedContextPrompt] = useState(
    settings.selectedContextPrompt || (settings.contextPrompts[0] || "")
  );

  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "">("");

  useEffect(() => {
    setLocalConfigs(settings.llmConfigs);
    setLocalSelectedModel(
      settings.selectedModel || (settings.llmConfigs[0] && settings.llmConfigs[0].name) || ""
    );
    setLocalContextPrompts(settings.contextPrompts);
    setLocalSelectedContextPrompt(
      settings.selectedContextPrompt || (settings.contextPrompts[0] || "")
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
    const removed = newConfigs.splice(index, 1)[0];
    let newSelected = localSelectedModel;
    if (removed.name === localSelectedModel) newSelected = newConfigs[0]?.name || "";
    setLocalConfigs(newConfigs);
    setLocalSelectedModel(newSelected);
  };

  const handleSelectedModelChange = (value: string) => {
    setLocalSelectedModel(value);
  };

  const handleContextChange = (index: number, value: string) => {
    const newContexts = [...localContextPrompts];
    newContexts[index] = value;
    setLocalContextPrompts(newContexts);
  };

  const addNewContextPrompt = () => {
    setLocalContextPrompts([...localContextPrompts, ""]);
  };

  const removeContextPrompt = (index: number) => {
    const newContexts = [...localContextPrompts];
    const removed = newContexts.splice(index, 1)[0];
    let newSelected = localSelectedContextPrompt;
    if (removed === localSelectedContextPrompt) {
      newSelected = newContexts[0] || "";
    }
    setLocalContextPrompts(newContexts);
    setLocalSelectedContextPrompt(newSelected);
  };

  const handleSelectedContextPromptChange = (value: string) => {
    setLocalSelectedContextPrompt(value);
  };

  const handleSave = async () => {
    const newSettings = {
      ...settings,
      llmConfigs: localConfigs,
      selectedModel:
        localConfigs.find((cfg) => cfg.name === localSelectedModel)?.name ||
        localConfigs[0]?.name ||
        "",
      contextPrompts: localContextPrompts,
      selectedContextPrompt:
        localContextPrompts.find((ctx) => ctx === localSelectedContextPrompt) ||
        localContextPrompts[0] ||
        "",
    };
    try {
      const res = await fetch("http://127.0.0.1:5003/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const updatedSettings = await res.json();
      setSettings(updatedSettings);
      setSaveStatus("success");
      if (activeTab === "context") {
        setTimeout(() => {
          setIsEditingContext(false);
          setIsEditingLLM(false);
          onSave();
        }, 2000);
      } else {
        setIsEditingLLM(false);
        onSave();
      }
    } catch (err) {
      console.error("Save error", err);
      setSaveStatus("error");
    }
  };

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("context")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "context" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"
            }`}
          >
            Context prompt
          </button>
          <button
            onClick={() => setActiveTab("llm")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "llm" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"
            }`}
          >
            LLM Configuration
          </button>
        </div>

        {activeTab === "context" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Context Prompt</label>
              <textarea
                value={localContextPrompts[0] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalContextPrompts([value]);
                  setLocalSelectedContextPrompt(value);
                }}
                className="w-full border rounded p-2"
                rows={4}
                placeholder="Enter a context prompt"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
                Save
              </button>
            </div>
            {saveStatus === "success" && (
              <p className="mt-2 text-green-500">Context prompt saved successfully.</p>
            )}
            {saveStatus === "error" && (
              <p className="mt-2 text-red-500">Failed to save context prompt.</p>
            )}
          </>
        )}

        {activeTab === "llm" && (
          <>
            {isEditingLLM ? (
              <>
                {localConfigs.map((config, index) => (
                  <div key={index} className="mb-4 border p-2 rounded">
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => handleModelChange(index, "name", e.target.value)}
                      className="w-full mb-2 p-2 border rounded"
                      placeholder="Model Name"
                    />
                    <input
                      type="text"
                      value={config.apiUrl}
                      onChange={(e) => handleModelChange(index, "apiUrl", e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="LLM API URL"
                    />
                    <button
                      onClick={() => removeModel(index)}
                      className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button onClick={addNewModel} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4">
                  Add New Model
                </button>
              </>
            ) : (
              localConfigs.map((config, i) => (
                <div key={i} className="mb-2 p-2 border rounded text-gray-700">
                  <strong>{config.name || `Model ${i + 1}`}</strong>: {config.apiUrl}
                </div>
              ))
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Select Active Model</label>
              <select
                value={localSelectedModel}
                onChange={(e) => handleSelectedModelChange(e.target.value)}
                className="w-full border rounded p-2"
              >
                {localConfigs.map((config, i) => (
                  <option key={i} value={config.name}>
                    {config.name || `Model ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              {isEditingLLM ? (
                <>
                  <button onClick={() => setIsEditingLLM(false)} className="px-4 py-2 bg-gray-300 rounded">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Save
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingLLM(true)} className="px-4 py-2 bg-yellow-500 text-white rounded">
                  Edit
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-6 text-right">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
