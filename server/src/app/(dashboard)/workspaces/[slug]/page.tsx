import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UrlTabs, TabsContent, TabsList, TabsTrigger } from "@/components/url-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/auth";
import { getProjectBasic, getProjectBySlug, getActiveAlerts, ensureUser } from "@/lib/db/queries";
import { BenchmarkChart } from "@/components/benchmark-chart-server";

// Alerts component for Suspense
async function AlertsSection({ projectId }: { projectId: string }) {
  const alerts = await getActiveAlerts(projectId);

  if (alerts.length === 0) return null;

  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="text-destructive flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          {alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {alert.metric.benchmark.name} / {alert.metric.measure.name}
              </span>
              <span className="text-destructive font-mono">
                {alert.percentChange > 0 ? "+" : ""}
                {alert.percentChange.toFixed(1)}%
              </span>
            </div>
          ))}
          {alerts.length > 3 && (
            <p className="text-xs text-muted-foreground">
              and {alerts.length - 3} more...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Reports list data component for Suspense (minimal)
async function ReportsList({ userId, slug }: { userId: string; slug: string }) {
  const project = await getProjectBySlug(userId, slug);

  if (!project || project.reports.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No reports yet. Reports will appear here once you submit benchmark data.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {project.reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div>
            <div className="font-mono text-sm">
              {report.gitHash?.slice(0, 7) || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              {report.branch.name} / {report.testbed.name}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Thresholds list data component for Suspense (minimal)
async function ThresholdsList({ userId, slug }: { userId: string; slug: string }) {
  const project = await getProjectBySlug(userId, slug);

  if (!project || project.thresholds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No thresholds configured. Add thresholds to automatically detect performance regressions.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {project.thresholds.map((threshold) => {
        const measure = project.measures.find(
          (m) => m.id === threshold.measureId
        );
        const branch = threshold.branchId
          ? project.branches.find((b) => b.id === threshold.branchId)
          : null;
        const testbed = threshold.testbedId
          ? project.testbeds.find((t) => t.id === threshold.testbedId)
          : null;

        return (
          <Card key={threshold.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {measure?.name || "Unknown measure"}
              </CardTitle>
              <CardDescription>
                {branch?.name || "All branches"} /{" "}
                {testbed?.name || "All testbeds"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                {threshold.upperBoundary && (
                  <div>
                    <span className="text-muted-foreground">Upper: </span>
                    <span className="font-mono">
                      +{threshold.upperBoundary}%
                    </span>
                  </div>
                )}
                {threshold.lowerBoundary && (
                  <div>
                    <span className="text-muted-foreground">Lower: </span>
                    <span className="font-mono">
                      -{threshold.lowerBoundary}%
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">
                    Min samples:{" "}
                  </span>
                  <span className="font-mono">
                    {threshold.minSampleSize}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Ensure user exists in database
  await ensureUser(session.user);

  const { slug } = await params;

  // Only fetch basic project info for the header (fast)
  const project = await getProjectBasic(session.user.id, slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/workspaces" className="hover:underline">
              Workspaces
            </Link>
            <span>/</span>
            <span>{project.slug}</span>
          </div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <LinkButton variant="outline" href={`/workspaces/${project.slug}/settings`}>
            Settings
          </LinkButton>
        </div>
      </div>

      <Suspense fallback={null}>
        <AlertsSection projectId={project.id} />
      </Suspense>

      <UrlTabs defaultValue="perf" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perf">Performance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="perf" className="space-y-4">
          <Card className="min-h-[580px]">
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-none" />}>
                <BenchmarkChart
                  projectSlug={project.slug}
                  userId={session.user.id}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[120px] w-full rounded-none" />}>
                <ReportsList userId={session.user.id} slug={project.slug} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Thresholds</h3>
              <p className="text-sm text-muted-foreground">
                Configure regression detection rules
              </p>
            </div>
            <LinkButton variant="outline" href={`/workspaces/${project.slug}/thresholds/new`}>
              Add Threshold
            </LinkButton>
          </div>
          <Suspense fallback={<Skeleton className="h-[120px] w-full rounded-none" />}>
            <ThresholdsList userId={session.user.id} slug={project.slug} />
          </Suspense>
        </TabsContent>
      </UrlTabs>
    </div>
  );
}
