'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface WelcomeCardProps {
  userName: string;
}

const WelcomeCard = ({ userName }: WelcomeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Welcome Back, {userName}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className=" mb-4">
            Ready to connect? Start a new chat or check your messages.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/chats">Go to Chats</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeCard;