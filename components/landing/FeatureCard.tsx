import featureProps from "@/types/features";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const FeatureCard = ({ feature }: { feature: featureProps }) => {
  return (
    <Card className="bg-white/90 dark:bg-purple-700 shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2 text-xl text-gray-800 dark:text-gray-100">
        <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span>{feature.title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
    </CardContent>
  </Card>
  );
};

export default FeatureCard;
