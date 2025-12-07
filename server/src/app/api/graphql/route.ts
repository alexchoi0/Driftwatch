import { createYoga } from "graphql-yoga";
import { schema } from "@/lib/graphql/schema";
import { createContext } from "@/lib/graphql/context";
import { NextRequest } from "next/server";

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  maskedErrors: false, // Show actual error messages in responses
});

export async function GET(request: NextRequest) {
  return yoga.handleRequest(request, { request });
}

export async function POST(request: NextRequest) {
  return yoga.handleRequest(request, { request });
}
