"use client";

import featureVariants from "@/animations/landing/featureVariants";
import { features } from "@/lib/landing/features";
import { motion, useScroll, useTransform } from "framer-motion";
import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, -50]);
  return (
    <section className="max-w-6xl mx-auto py-20 px-6">
      <motion.h2
        style={{ y: yText }}
        className="text-4xl font-semibold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
      >
        Features That Shine
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={featureVariants}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
