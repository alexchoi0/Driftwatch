"use client";

import { LinkButton } from "@/components/ui/link-button";

interface HomeButtonsProps {
  isSignedIn: boolean;
}

export function GetStartedButton({ isSignedIn }: HomeButtonsProps) {
  const href = isSignedIn ? "/workspaces" : "/login";

  return (
    <LinkButton href={href} size="lg" className="h-11 px-6 sm:h-12 sm:px-8">
      Get Started
    </LinkButton>
  );
}

export function GetStartedFreeButton({ isSignedIn }: HomeButtonsProps) {
  const href = isSignedIn ? "/workspaces" : "/login";

  return (
    <LinkButton href={href} size="lg" className="h-11 px-6 sm:h-12 sm:px-8">
      Get Started for Free
    </LinkButton>
  );
}
