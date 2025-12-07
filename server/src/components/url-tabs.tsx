"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UrlTabsProps {
  defaultValue: string;
  paramName?: string;
  children: React.ReactNode;
  className?: string;
}

// Custom hook to sync with URL search params
function useUrlParam(paramName: string, defaultValue: string): string {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("popstate", callback);
    return () => window.removeEventListener("popstate", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName) || defaultValue;
  }, [paramName, defaultValue]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function UrlTabs({
  defaultValue,
  paramName = "tab",
  children,
  className
}: UrlTabsProps) {
  const urlTab = useUrlParam(paramName, defaultValue);
  const [localTab, setLocalTab] = useState<string | null>(null);

  // Use local tab if set, otherwise use URL tab
  const currentTab = localTab ?? urlTab;

  const handleValueChange = (value: string) => {
    setLocalTab(value);

    // Update URL without causing re-render
    const params = new URLSearchParams(window.location.search);
    if (value === defaultValue) {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleValueChange} className={className}>
      {children}
    </Tabs>
  );
}

export { TabsContent, TabsList, TabsTrigger };
