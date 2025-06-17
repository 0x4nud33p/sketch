// components/ConnectionStatus.tsx
import React from "react";

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
  error?: string | null;
  onReconnect?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  error,
  onReconnect,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          text: "Connected",
          className: "bg-green-100 text-green-800 border-green-200",
          icon: "🟢",
        };
      case "connecting":
        return {
          text: "Connecting...",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "🟡",
        };
      case "disconnected":
        return {
          text: "Disconnected",
          className: "bg-red-100 text-red-800 border-red-200",
          icon: "🔴",
        };
      default:
        return {
          text: "Unknown",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "⚪",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="absolute top-4 right-4 z-30">
      <div
        className={`px-3 py-2 rounded-lg text-sm font-medium border ${config.className} flex items-center gap-2`}
      >
        <span>{config.icon}</span>
        <span>{config.text}</span>

        {status === "disconnected" && onReconnect && (
          <button
            onClick={onReconnect}
            className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 px-3 py-2 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
};
