import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <main className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friend Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming friend requests.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
            <CardDescription>
              Manage your incoming friend requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
