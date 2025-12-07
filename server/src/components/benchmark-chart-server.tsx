import { getSession, createGraphQLToken } from "@/lib/auth";
import { createAuthenticatedClient } from "@/lib/graphql/client";
import { PERF_QUERY } from "@/lib/graphql/queries";
import { getProjectBySlug } from "@/lib/db/queries";
import {
  BenchmarkChartClient,
  type Series,
} from "./benchmark-chart";

interface BenchmarkChartProps {
  projectSlug: string;
  userId: string;
}

export async function BenchmarkChart({
  projectSlug,
  userId,
}: BenchmarkChartProps) {
  // Fetch project data inside the Suspense boundary for streaming
  const project = await getProjectBySlug(userId, projectSlug);

  if (!project) {
    return null;
  }

  const { benchmarks, branches, testbeds, measures } = project;

  // Show empty state if no benchmarks
  if (benchmarks.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">
          Submit your first benchmark report to see performance data
        </p>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto flex-1">
          <code>
{`# Install the CLI
cargo install rabbitbench

# Configure with your API token
rabbitbench auth login

# Run benchmarks and submit
cargo bench -- --save-baseline main | rabbitbench run \\
  --project ${projectSlug} \\
  --branch main \\
  --testbed local`}
          </code>
        </pre>
      </div>
    );
  }

  const session = await getSession();
  let series: Series[] = [];

  if (session && branches.length && testbeds.length && measures.length) {
    const token = await createGraphQLToken(session);
    const client = createAuthenticatedClient(token);

    const result = await client.query(PERF_QUERY, {
      projectSlug,
      benchmarks: benchmarks.map((b) => b.id),
      branches: branches.map((b) => b.id),
      testbeds: testbeds.map((t) => t.id),
      measures: measures.map((m) => m.id),
    });

    if (!result.error && result.data?.perf?.series) {
      series = result.data.perf.series;
    }
  }

  return (
    <BenchmarkChartClient
      benchmarks={benchmarks}
      branches={branches}
      testbeds={testbeds}
      measures={measures}
      initialSeries={series}
    />
  );
}
