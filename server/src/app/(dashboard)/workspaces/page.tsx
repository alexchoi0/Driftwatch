import Link from "next/link";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getProjectsForUser, ensureUser } from "@/lib/db/queries";

export default async function WorkspacesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Ensure user exists in database
  await ensureUser(session.user);

  // Direct Prisma query - no GraphQL HTTP overhead
  const projects = await getProjectsForUser(session.user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">
            Manage your Cargo workspaces for benchmark tracking
          </p>
        </div>
        <LinkButton href="/workspaces/new">New Workspace</LinkButton>
      </div>

      {projects.length === 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>No workspaces yet</CardTitle>
            <CardDescription>
              Create your first workspace to start tracking your Cargo workspace benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton href="/workspaces/new">Create Workspace</LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/workspaces/${project.slug}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {project.name}
                    {project.public && (
                      <span className="text-xs font-normal text-muted-foreground">
                        Public
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{project.slug}</CardDescription>
                </CardHeader>
                {project.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
