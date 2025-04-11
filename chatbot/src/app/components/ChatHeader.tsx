"use client";

import React, { useState, useRef, useEffect } from "react";

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
  // Added state to control the visibility of the prompt helper modal.
  const [showPromptHelper, setShowPromptHelper] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Event listener to close modal when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowPromptHelper(false);
      }
    };

    if (showPromptHelper) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPromptHelper]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gray-800 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onToggleHistory}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
            >
              Chat History
            </button>
            <button
              onClick={onNewChat}
              disabled={disableNewChat}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 transition"
            >
              New Chat
            </button>
          </div>
          <div className="flex gap-2">
            {/* On mobile, each of these buttons takes up 50% of the available width */}
            <button
              onClick={() => setShowPromptHelper(true)}
              className="w-1/2 sm:w-auto px-4 py-2 bg-purple-500 rounded hover:bg-purple-600 transition"
            >
              Help
            </button>
            <button
              onClick={onOpenSettings}
              className="w-1/2 sm:w-auto px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600 transition"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      {showPromptHelper && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white text-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl mx-4 overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-bold mb-4">How to Write a Precise Prompt</h2>

            <p className="mb-2">
              For effective use of the LLM chat, write a clear, detailed, and unambiguous prompt.
              Follow these guidelines to include all necessary information and avoid the need for iterative follow-ups.
            </p>

            <h3 className="text-lg font-semibold mb-2">Core Guidelines</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>
                <strong>Be Complete:</strong> Detail every aspect of the issue, including observed behaviors, error messages, and contextual system information. Do not assume the model will infer missing details.
              </li>
              <li>
                <strong>Specify Constraints:</strong> Clearly state any technical limitations or environmental specifics, such as hardware configurations, software versions, or operational conditions.
              </li>
              <li>
                <strong>Use Precise Language:</strong> Replace vague statements with exact descriptions. Instead of saying “it isn’t working properly,” specify the symptoms or errors encountered.
              </li>
              <li>
                <strong>Define Formatting Requirements:</strong> If you need the output in a particular format, such as a structured checklist or step-by-step guide, state this explicitly.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Examples</h3>
            <p className="mb-2">
              <strong>Poor Example:</strong> "The flight dynamics dashboard is experiencing issues."
            </p>
            <p className="mb-2">
              <strong>Effective Example:</strong> "In the flight dynamics dashboard, real-time aircraft data is not updating. The display continues to show outdated information even though there have been recent alerts. Please tell me the steps on how I can fix the data not updating issue."
            </p>

            <h3 className="text-lg font-semibold mb-2">Best Practices for One-Shot Success</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>
                <strong>Start with Clear Intent:</strong> State the precise troubleshooting task right at the beginning.
              </li>
              <li>
                <strong>Include All Relevant Information:</strong> Provide any system logs, error messages, or steps already taken to diagnose the issue.
              </li>
              <li>
                <strong>State Technical Constraints:</strong> Clearly mention operational parameters, such as the specific version of the flight dynamics software or current environmental conditions.
              </li>
              <li>
                <strong>Minimize Follow-Ups:</strong> A comprehensive and detailed prompt ensures an accurate, complete answer on the first attempt.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Understanding Context Prompts</h3>
            <p className="mb-2">
              A context prompt provides the essential background information or operational parameters that guide the chatbot's responses throughout the conversation. This helps maintain consistency and relevance in its answers. You can change the context prompt at any time by navigating to the settings page on the chat bot interface.
            </p>

            <p className="text-sm text-gray-500">
              Click outside this box to close.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
