import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-32">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
