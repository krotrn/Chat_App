import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

export default BackButton;
