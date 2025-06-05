"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

export default function FloatingElements({
  count = 6,
  className,
}: FloatingElementsProps) {
  const [elements, setElements] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
    setElements(newElements);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 backdrop-blur-sm"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay,
          }}
        />
      ))}
    </div>
  );
}
