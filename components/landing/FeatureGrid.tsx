"use client"
import { container, featureVariants } from "@/animations/landing/featureVariants";
import { features } from "@/lib/landing/features";
import { motion } from "framer-motion";
import FeatureCard from "@/components/landing/FeatureCard";

export default function FeatureGrid() {
  return (
    <motion.div
    className="mx-auto grid mx-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
    initial="hidden"
    whileInView="visible"
    variants={container}
    viewport={{ once: true, margin: "-100px" }}
  >
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
  </motion.div>
  )
}
