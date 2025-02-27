"use client"
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 text-center bg-blue-600 dark:bg-blue-800 text-white">
      <motion.h2
        className="text-3xl font-semibold mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Ready to Connect?
      </motion.h2>
      <Button asChild size="lg" variant="secondary" className="group">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span>Join Now</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </section>
  );
};

export default CTASection;
