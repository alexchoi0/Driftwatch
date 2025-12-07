"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

interface SessionData {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setData({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
          },
        });
      }
      setIsPending(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setData({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
          },
        });
      } else {
        setData(null);
      }
      setIsPending(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { data, isPending };
}

export async function signIn(provider: "google" | "github" = "google") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut(options?: { fetchOptions?: { onSuccess?: () => void } }) {
  const { error } = await supabase.auth.signOut();
  if (!error && options?.fetchOptions?.onSuccess) {
    options.fetchOptions.onSuccess();
  }
  return { error };
}
