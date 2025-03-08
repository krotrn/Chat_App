"use client";
import { motion } from "framer-motion";
import heroVariants from "@/animations/landing/heroVariants";
import HeroContent from "./HeroContent";

export default function HeroSection() {
  return (
    <motion.section
      className="flex flex-col items-center justify-center text-center py-24 px-6"
      initial="hidden"
      animate="visible"
      variants={heroVariants}
    >
      <div className="container px-4 md:px-6">
        <HeroContent />
      </div>
      <div className="absolute inset-0 -z-20 h-full w-full bg-white dark:bg-zinc-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-zinc-800 dark:bg-zinc-300 opacity-5 blur-[80px]"></div>
      </div>
    </motion.section>
  );
}
