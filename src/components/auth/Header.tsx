import { config } from "@/config";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { Poppins } from "next/font/google";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className={cn("text-3xl font-bold", font.className)}>
        {config.appName}
      </h1>
      <Label className="text-muted-foreground text-sm">{label}</Label>
    </div>
  );
};

export { Header };
