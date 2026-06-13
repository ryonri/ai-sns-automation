"use client";

import { useEffect } from "react";

export function SourceLock() {
  useEffect(() => {
    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    const blockKeys = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const blocked =
        event.key === "F12" ||
        ((event.ctrlKey || event.metaKey) && key === "u") ||
        ((event.ctrlKey || event.metaKey) && key === "s") ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c", "k"].includes(key));
      if (blocked) block(event);
    };

    document.addEventListener("contextmenu", block, { capture: true });
    document.addEventListener("dragstart", block, { capture: true });
    document.addEventListener("keydown", blockKeys, { capture: true });
    return () => {
      document.removeEventListener("contextmenu", block, { capture: true });
      document.removeEventListener("dragstart", block, { capture: true });
      document.removeEventListener("keydown", blockKeys, { capture: true });
    };
  }, []);

  return null;
}
