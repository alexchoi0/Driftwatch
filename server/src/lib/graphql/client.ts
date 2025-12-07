import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

// Build the GraphQL URL - needs absolute URL for server-side requests
function getGraphQLUrl(): string {
  // If explicitly configured, use that
  if (process.env.GRAPHQL_URL) {
    return process.env.GRAPHQL_URL;
  }

  // Server-side needs absolute URL
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 3000}`;
  return `${host}/api/graphql`;
}

const makeClient = () => {
  return new Client({
    url: getGraphQLUrl(),
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      method: "POST",
    },
  });
};

export const { getClient } = registerUrql(makeClient);

export const createAuthenticatedClient = (token: string) => {
  return new Client({
    url: getGraphQLUrl(),
    exchanges: [fetchExchange],
    preferGetMethod: false,
    fetchOptions: {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store" as RequestCache,
    },
  });
};

