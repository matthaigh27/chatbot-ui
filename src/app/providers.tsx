"use client";

import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js");
      }
    };
    window.addEventListener("load", registerServiceWorker);

    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return children;
}
