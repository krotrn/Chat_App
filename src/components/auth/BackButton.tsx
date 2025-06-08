import Link from "next/link";
import { Button, Label } from "@/components/ui";

interface BackButtonProps {
  label: string;
  href: string;
}

const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Button variant="link" className="font-normal w-full" size="sm" asChild>
      <Link href={href}>
        <Label>{label}</Label>
      </Link>
    </Button>
  );
};

export { BackButton };
