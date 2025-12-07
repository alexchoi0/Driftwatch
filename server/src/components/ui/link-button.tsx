"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button, buttonVariants } from "./button";
import { triggerNavigationStart } from "@/components/progress-bar";
import type { VariantProps } from "class-variance-authority";

interface LinkButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export function LinkButton({
  href,
  children,
  onClick,
  ...props
}: LinkButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset loading state when navigation completes
  React.useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    setIsLoading(true);
    triggerNavigationStart();
    router.push(href);
  };

  return (
    <Button onClick={handleClick} loading={isLoading} {...props}>
      {children}
    </Button>
  );
}
