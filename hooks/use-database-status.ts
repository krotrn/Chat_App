"use client";
import { checkDB } from "@/actions/checks";
import { useState, useEffect } from "react";

export function useDatabaseStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseConnection = async () => {
    setIsChecking(true);
    try {
      const data = await checkDB();
      setIsConnected(data.status === "ok");
    } catch (error) {
      console.error("Database connection error:", error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseConnection();

    const interval = setInterval(checkDatabaseConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking, checkDatabaseConnection };
}
