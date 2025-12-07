"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Minimum time (ms) before showing the progress bar
const DELAY_BEFORE_SHOW = 150;

// Custom event for programmatic navigation
export const NAVIGATION_START_EVENT = "navigation-start";

export function triggerNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NAVIGATION_START_EVENT));
  }
}

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (delayRef.current) clearTimeout(delayRef.current);
    isNavigatingRef.current = false;
  }, []);

  const complete = useCallback(() => {
    const wasNavigating = isNavigatingRef.current;
    cleanup();

    const bar = barRef.current;
    if (!bar) return;

    // Only animate completion if the bar was visible
    if (wasNavigating && bar.style.opacity === "1") {
      bar.style.width = "100%";
      timeoutRef.current = setTimeout(() => {
        bar.style.opacity = "0";
        timeoutRef.current = setTimeout(() => {
          bar.style.width = "0%";
        }, 200);
      }, 100);
    } else {
      // Fast navigation - just reset without showing
      bar.style.opacity = "0";
      bar.style.width = "0%";
    }
  }, [cleanup]);

  const start = useCallback(() => {
    cleanup();
    isNavigatingRef.current = true;

    const bar = barRef.current;
    if (!bar) return;

    // Delay showing the progress bar
    delayRef.current = setTimeout(() => {
      if (!isNavigatingRef.current) return;

      bar.style.opacity = "1";
      bar.style.width = "0%";

      let progress = 0;
      intervalRef.current = setInterval(() => {
        if (!isNavigatingRef.current) return;
        // Slow down as we approach 90%
        const increment = (90 - progress) * 0.1;
        progress = Math.min(progress + Math.max(increment, 0.5), 90);
        bar.style.width = `${progress}%`;
      }, 100);
    }, DELAY_BEFORE_SHOW);
  }, [cleanup]);

  // Complete on route change
  useEffect(() => {
    complete();
  }, [pathname, searchParams, complete]);

  // Listen for navigation starts
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.target &&
        !link.download &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const url = new URL(link.href);
        if (url.pathname !== pathname || url.search !== window.location.search) {
          start();
        }
      }
    };

    const handleSubmit = () => start();
    const handleNavigationStart = () => start();

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      cleanup();
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
      window.removeEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
    };
  }, [pathname, start, cleanup]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 pointer-events-none">
      <div
        ref={barRef}
        className={cn(
          "h-full bg-primary transition-[width] duration-200 ease-out",
          "opacity-0"
        )}
        style={{ width: "0%" }}
      />
    </div>
  );
}
