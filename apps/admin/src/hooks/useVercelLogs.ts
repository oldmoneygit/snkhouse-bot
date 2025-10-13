"use client";

import { useEffect, useState } from "react";
import type { VercelLogEntry } from "@/lib/vercel-api";

export function useVercelLogs(refreshInterval = 30000) {
  const [logs, setLogs] = useState<VercelLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      console.log("📥 Fetching Vercel logs from API...");

      const response = await fetch("/api/vercel/logs?limit=50");
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setError(null);
        console.log(`✅ Loaded ${data.logs.length} Vercel logs`);
      } else {
        setError(data.error || "Failed to fetch logs");
        console.error("❌ Error fetching logs:", data.error);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Exception fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLogs();

    // Setup polling
    const interval = setInterval(fetchLogs, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { logs, loading, error, refetch: fetchLogs };
}
