"use client"
import { motion } from "framer-motion";
import heroVariants from "@/animations/landing/heroVariants";
import { Button } from "../ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <motion.section
      className={`flex flex-col items-center justify-center text-center py-24 px-6`}
      initial="hidden"
      animate="visible"
      variants={heroVariants}
    >
      <motion.h1
        className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        Welcome to Chat App
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
        variants={heroVariants}
      >
        Your hub for seamless conversations and secure connections.
      </motion.p>
      <motion.div className="space-x-4" variants={heroVariants}>
        <Button
          asChild
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500"
        >
          <Link href="/login">Log In</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="dark:border-gray-600 dark:text-gray-300"
        >
          <Link href="/register">Sign Up</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
};
export default HeroSection;
