"use client";

import { useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import { signOut, useSession } from "@/lib/auth-client";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center text-foreground"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-14 z-50 bg-background border-t">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/docs"
              className="text-lg text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <div className="border-t pt-4">
              {isPending ? (
                <div className="h-10 w-full bg-muted animate-pulse" />
              ) : session ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                  <Link
                    href="/workspaces"
                    className="block text-lg text-foreground py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Workspaces
                  </Link>
                  <Link
                    href="/settings"
                    className="block text-lg text-foreground py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/" } } });
                      setIsOpen(false);
                    }}
                    className="text-lg text-foreground py-2"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <LinkButton className="w-full" href="/login" onClick={() => setIsOpen(false)}>
                  Sign In
                </LinkButton>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
