"use client";
import { checkConnectionHealth, isConnectionHealthy } from "@/services/chat-api";
import { useState, useEffect } from "react";

export function useApiStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiConnection = async () => {
    setIsChecking(true);
    try {
      const isHealthy = await checkConnectionHealth();
      setIsConnected(isHealthy);
    } catch (error) {
      console.error("API connection error:", error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    setIsConnected(isConnectionHealthy());
    
    checkApiConnection();

    const interval = setInterval(checkApiConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking, checkApiConnection };
} 