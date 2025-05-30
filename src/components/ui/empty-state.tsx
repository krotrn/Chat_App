import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileQuestion, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  type?: "error" | "empty" | "loading";
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  type = "empty",
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      case "loading":
        return (
          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        );
      case "empty":
      default:
        return <FileQuestion className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "error":
        return "bg-destructive/5";
      default:
        return "bg-muted/50";
    }
  };

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center text-center p-6",
          getBackgroundColor(),
        )}
      >
        <div className="mb-4">{icon || getDefaultIcon()}</div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </CardContent>
    </Card>
  );
}
