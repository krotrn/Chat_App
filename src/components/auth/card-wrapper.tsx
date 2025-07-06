import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui";
import { BackButton, Social } from "@/components";
import { Header } from "@/components";
import { MagicCard } from "../magicui/magic-card";

interface CardWrapperProps {
  children?: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonHref,
  backButtonLabel,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className="w-96 shadow-md">
      <MagicCard>

        <CardHeader>
          <CardTitle>
            <Header label={headerLabel} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {children}
          {showSocial && <Social />}
        </CardContent>

        <CardFooter>
          <BackButton label={backButtonLabel} href={backButtonHref} />
        </CardFooter>
      </MagicCard>
    </Card>
  );
};
