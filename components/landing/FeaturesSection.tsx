import FeatureGrid from "@/components/landing/FeatureGrid";
import React from "react";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 bg-zinc-100 dark:bg-zinc-900 flex justify-center items-center"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Everything you need to stay connected
            </h2>
            <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
              ChatApp combines the best features of messaging apps with
              innovative new tools to make communication easier and more
              enjoyable.
            </p>
          </div>
        </div>
        <FeatureGrid />
      </div>
    </section>
  );
}
