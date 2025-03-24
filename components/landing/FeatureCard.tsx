import featureProps from "@/types/features";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

const FeatureCard = ({ feature }: { feature: featureProps }) => {
  return (
    <motion.div className="div">
      <Card className=" shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <feature.icon className="h-6 w-6" />
            <span>{feature.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{feature.description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
