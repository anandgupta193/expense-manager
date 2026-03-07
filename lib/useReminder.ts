"use client";

import { useEffect, useRef } from "react";
import { storage } from "./storage";

export function useReminder() {
  const lastFiredRef = useRef<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const config = storage.getReminder();
      if (!config.enabled) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const today = now.toISOString().slice(0, 10);

      if (currentTime === config.time && lastFiredRef.current !== today) {
        lastFiredRef.current = today;
        new Notification("Expense Manager", {
          body: "Don't forget to log today's expenses!",
          icon: "/icons/icon-192.svg",
        });
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);
}
