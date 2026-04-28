"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useRecentBranch = (title: string, customPath?: string) => {
  const pathname = usePathname();

  useEffect(() => {
    if (title) {
      localStorage.setItem("last_visited_branch", JSON.stringify({
        title,
        path: customPath || pathname,
        timestamp: Date.now()
      }));
    }
  }, [title, pathname, customPath]);
};
