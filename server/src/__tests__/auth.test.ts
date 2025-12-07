import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  hashApiToken,
  generateApiToken,
  extractBearerToken,
} from "@/lib/auth";

describe("auth utilities", () => {
  describe("hashApiToken", () => {
    it("returns consistent hash for same token", () => {
      const token = "rb_abc123def456";
      const hash1 = hashApiToken(token);
      const hash2 = hashApiToken(token);

      expect(hash1).toBe(hash2);
    });

    it("returns different hashes for different tokens", () => {
      const hash1 = hashApiToken("rb_token1");
      const hash2 = hashApiToken("rb_token2");

      expect(hash1).not.toBe(hash2);
    });

    it("returns base64 encoded hash", () => {
      const hash = hashApiToken("rb_testtoken");

      // Base64 pattern check
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
  });

  describe("generateApiToken", () => {
    it("generates token with rb_ prefix", () => {
      const token = generateApiToken();

      expect(token).toMatch(/^rb_/);
    });

    it("generates 32-character hex after prefix", () => {
      const token = generateApiToken();
      const suffix = token.substring(3); // Remove "rb_"

      expect(suffix).toHaveLength(32);
      expect(suffix).toMatch(/^[a-f0-9]+$/);
    });

    it("generates unique tokens", () => {
      const tokens = new Set<string>();

      for (let i = 0; i < 100; i++) {
        tokens.add(generateApiToken());
      }

      expect(tokens.size).toBe(100);
    });
  });

  describe("extractBearerToken", () => {
    it("extracts token from valid Bearer header", () => {
      const token = extractBearerToken("Bearer abc123");

      expect(token).toBe("abc123");
    });

    it("handles lowercase bearer", () => {
      const token = extractBearerToken("bearer abc123");

      expect(token).toBe("abc123");
    });

    it("returns null for null header", () => {
      const token = extractBearerToken(null);

      expect(token).toBeNull();
    });

    it("returns null for empty header", () => {
      const token = extractBearerToken("");

      expect(token).toBeNull();
    });

    it("returns null for invalid format", () => {
      expect(extractBearerToken("Basic abc123")).toBeNull();
      expect(extractBearerToken("abc123")).toBeNull();
      expect(extractBearerToken("Bearer")).toBeNull();
    });

    it("handles tokens with special characters", () => {
      const token = extractBearerToken("Bearer eyJhbGciOiJIUzI1NiJ9.test.signature");

      expect(token).toBe("eyJhbGciOiJIUzI1NiJ9.test.signature");
    });

    it("handles API tokens with underscore", () => {
      const token = extractBearerToken("Bearer rb_abc123def456789012345678901234");

      expect(token).toBe("rb_abc123def456789012345678901234");
    });
  });
});

describe("verifyJwt", () => {
  // These tests require AUTH_SECRET to be set
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      AUTH_SECRET: "test-secret-that-is-at-least-32-characters",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null for invalid token format", async () => {
    const { verifyJwt } = await import("@/lib/auth");

    expect(verifyJwt("invalid")).toBeNull();
    expect(verifyJwt("invalid.token")).toBeNull();
    expect(verifyJwt("")).toBeNull();
  });

  it("returns null for token with invalid signature", async () => {
    const { verifyJwt } = await import("@/lib/auth");

    // Valid format but wrong signature
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wrongsignature";

    expect(verifyJwt(token)).toBeNull();
  });

  it("returns null for expired token", async () => {
    const { verifyJwt } = await import("@/lib/auth");
    const crypto = await import("crypto");

    // Create a token that's already expired
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: "test-user",
      email: "test@example.com",
      iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
    };

    const base64UrlEncode = (data: string) =>
      Buffer.from(data).toString("base64url");

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac("sha256", process.env.AUTH_SECRET!)
      .update(signatureInput)
      .digest("base64url");

    const expiredToken = `${signatureInput}.${signature}`;

    expect(verifyJwt(expiredToken)).toBeNull();
  });

  it("verifies and decodes valid token", async () => {
    const { verifyJwt, createGraphQLToken } = await import("@/lib/auth");

    const token = await createGraphQLToken({
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/avatar.jpg",
      },
    });

    const claims = verifyJwt(token);

    expect(claims).not.toBeNull();
    expect(claims?.email).toBe("test@example.com");
    expect(claims?.name).toBe("Test User");
    expect(claims?.picture).toBe("https://example.com/avatar.jpg");
    expect(claims?.sub).toBe("user-123");
  });
});
