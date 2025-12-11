# Driftwatch Server

Next.js application providing the web dashboard and GraphQL API for Driftwatch.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth (GitHub OAuth)
- **GraphQL**: graphql-yoga
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Environment Variables

Create a `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Auth secret for JWT signing
AUTH_SECRET="your-random-secret-key"

# Optional: Dev mode (bypasses auth)
DEV_MODE=false
DEV_API_TOKEN="dw_..."
```

### Installation

```bash
pnpm install
```

### Database Setup

```bash
# Push schema to database
pnpm exec prisma db push

# Generate Prisma client
pnpm exec prisma generate
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, etc.)
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── api/
│   │   │   └── graphql/   # GraphQL endpoint
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # App components
│   └── lib/
│       ├── auth.ts        # Auth utilities
│       ├── db/
│       │   ├── prisma.ts  # Prisma client
│       │   └── queries.ts # Database queries
│       └── graphql/
│           ├── schema.ts  # GraphQL schema
│           └── resolvers/ # GraphQL resolvers
└── package.json
```

## API

### GraphQL Endpoint

`POST /api/graphql`

Authentication via Bearer token:
```
Authorization: Bearer <api_token>
```

### Key Queries

```graphql
# Get current user
query {
  me {
    id
    email
    name
  }
}

# List projects
query {
  projects {
    id
    slug
    name
  }
}

# Get project details
query {
  project(slug: "my-project") {
    id
    name
    branches { id name }
    testbeds { id name }
    benchmarks { id name }
    measures { id name units }
  }
}

# Performance data
query {
  perf(
    projectSlug: "my-project"
    branches: ["branch-id"]
    testbeds: ["testbed-id"]
    benchmarks: ["benchmark-id"]
    measures: ["measure-id"]
  ) {
    series {
      benchmark { id name }
      branch { id name }
      data { x y gitHash }
    }
  }
}
```

### Key Mutations

```graphql
# Create project
mutation {
  createProject(input: {
    slug: "my-project"
    name: "My Project"
  }) {
    id
    slug
  }
}

# Submit benchmark report
mutation {
  createReport(input: {
    projectSlug: "my-project"
    branch: "main"
    testbed: "ci-linux"
    gitHash: "abc123"
    metrics: [
      {
        benchmark: "parse_json"
        measure: "nanoseconds"
        value: 1234.56
      }
    ]
  }) {
    id
    alerts {
      id
      percentChange
    }
  }
}
```

## Authentication

### Web (Dashboard)

Uses Supabase Auth with GitHub OAuth. Session is stored in cookies.

### API (CLI/CI)

Uses API tokens in the format `dw_<uuid>`. Tokens are hashed (SHA256) before storage.

Create tokens in the dashboard settings or via the CLI browser auth flow.

## Dev Mode

For local development without Supabase:

```bash
DEV_MODE=true
DEV_API_TOKEN=dw_your_test_token  # Optional: use real user
```

When `DEV_MODE=true`:
- Auth is bypassed with a mock user
- If `DEV_API_TOKEN` is set, looks up the real user from the database
