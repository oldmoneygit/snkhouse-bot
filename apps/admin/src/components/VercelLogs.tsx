"use client";

import { useVercelLogs } from "@/hooks/useVercelLogs";
import { Card } from "@/components/ui/card";

function getLogColor(type: string) {
  switch (type) {
    case "error":
      return "text-red-600 bg-red-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "info":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function getLogIcon(type: string) {
  switch (type) {
    case "error":
      return "❌";
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    default:
      return "📝";
  }
}

export function VercelLogs() {
  const { logs, loading, error, refetch } = useVercelLogs(30000); // Refresh every 30s

  if (loading && logs.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span className="ml-3">Loading Vercel logs...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Error Loading Vercel Logs
        </h3>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Vercel Logs (Real-time)</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {logs.length} logs • Auto-refresh 30s
          </span>
          <button
            onClick={refetch}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No logs available</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={`${log.timestamp}-${index}`}
              className={`p-3 rounded text-sm ${getLogColor(log.type)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getLogIcon(log.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </span>
                    {log.source && (
                      <span className="text-xs px-2 py-0.5 bg-white rounded">
                        {log.source}
                      </span>
                    )}
                  </div>
                  <p className="break-words">{log.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
