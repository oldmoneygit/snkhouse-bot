"use client";

import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

export function RealtimeIndicator() {
  const { isConnected, metrics } = useRealtimeMetrics();

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`}
        />
        <span className="text-gray-600">
          {isConnected ? "Live" : "Disconnected"}
        </span>
      </div>
      {isConnected && (
        <span className="text-xs text-gray-400">
          Updated: {metrics.lastUpdate.toLocaleTimeString("pt-BR")}
        </span>
      )}
    </div>
  );
}
