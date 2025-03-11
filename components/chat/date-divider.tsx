import { cn } from "@/lib/utils"

interface DateDividerProps {
  date: string
  className?: string
}

export default function DateDivider({ date, className }: DateDividerProps) {
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-xs text-muted-foreground">{date}</span>
      </div>
    </div>
  )
}

