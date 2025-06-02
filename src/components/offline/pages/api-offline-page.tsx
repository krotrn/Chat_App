"use client";
import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Wifi, Coffee } from "lucide-react";
import { config } from "@/config";
import Link from "next/link";
import { useConnectionHealthQuery } from "@/hooks/queries/useConnectionHealthQuery";
import { serverCheckVariants } from "@/animations/chat/servercheckVariant";

export function ApiOfflinePage() {
  const { data, isLoading, refetch } = useConnectionHealthQuery();
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isLoading && data) {
      window.location.reload();
    }
  }, [data, isLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.div
        className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-6"
        variants={serverCheckVariants.containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated server icon */}
        <motion.div
          className="relative"
          variants={serverCheckVariants.itemVariants}
        >
          <motion.div
            className="rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 p-6 relative"
            variants={serverCheckVariants.pulseVariants}
            animate="pulse"
          >
            <motion.div
              variants={serverCheckVariants.floatingVariants}
              animate="float"
            >
              <Server className="h-16 w-16 text-primary" />
            </motion.div>

            {/* Animated wifi signals */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Wifi className="h-6 w-6 text-green-500" />
            </motion.div>
          </motion.div>

          {/* Coffee cup for "waking up" theme */}
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{
              y: [-2, 2, -2],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Coffee className="h-8 w-8 text-amber-600" />
          </motion.div>
        </motion.div>

        {/* Animated title */}
        <motion.div
          variants={serverCheckVariants.itemVariants}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Server is Waking Up...
          </h1>

          {/* Animated dots */}
          <motion.div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Animated description */}
        <motion.p
          className="text-muted-foreground text-lg leading-relaxed"
          variants={serverCheckVariants.itemVariants}
        >
          Our chat server is just having its morning coffee ☕ and will be ready
          in a moment. Thanks for your patience while we get everything warmed
          up!
        </motion.p>

        {/* Animated refresh button */}
        <motion.div variants={serverCheckVariants.itemVariants}>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="mt-4 px-8 py-3 text-lg"
            size="lg"
          >
            <RefreshCw
              className={`mr-2 h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Checking Connection..." : "Check Again"}
          </Button>
        </motion.div>

        {/* Animated progress indicator */}
        <motion.div
          className="w-full max-w-xs"
          variants={serverCheckVariants.itemVariants}
        >
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Establishing connection...
          </p>
        </motion.div>

        {/* Support email with animation */}
        <AnimatePresence>
          {config.supportEmail && (
            <motion.p
              className="text-xs text-muted-foreground"
              variants={serverCheckVariants.itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              Still having trouble? Contact us at{" "}
              <Link
                href={`mailto:${config.supportEmail}`}
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                {config.supportEmail}
              </Link>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
