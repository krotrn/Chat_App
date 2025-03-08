"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import heroVariants from "@/animations/landing/heroVariants";

const HeroContent = () => {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={heroVariants}
      className="flex flex-col justify-center space-y-4"
    >
      <div
        className="space-y-2 flex flex-col items-center justify-center text-center"
      >
        <h1
          className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
        >
          Connect with anyone, anywhere</h1>
        <p className="max-w-xl text-center text-zinc-500 md:text-xl dark:text-zinc-400">
          ChatApp makes it easy to stay connected with friends, family, and
          colleagues. Send messages, share photos, and make video calls—all in
          one place.
        </p>
      </div>
      <div className="flex flex-col gap-2 justify-center sm:flex-row sm:gap-4">
        <Button asChild size='lg' className="gap-1">
          <Link href="/dashboard">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default HeroContent;
