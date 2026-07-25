"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { RhythmWave } from "@/components/landing/rhythm-wave";

export function Hero() {
  return (
    <section className="container pb-20 pt-16 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted"
        >
          Built for the semester, not the streak
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl"
        >
          Your grades and your sleep
          <br />
          <span className="italic text-focus">were never separate problems.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-balance text-base text-muted sm:text-lg"
        >
          Student Wellness Tracker connects study hours, sleep, mood, hydration, and
          attendance in one dashboard — so you can see what&apos;s actually driving your
          worst weeks, and repeat your best ones.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Start tracking — it&apos;s free
          </Link>
          <Link href="#rhythm" className={buttonVariants({ variant: "outline", size: "lg" })}>
            See how it works
          </Link>
        </motion.div>
      </div>

      <motion.div
        id="rhythm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="glass mx-auto mt-16 max-w-4xl scroll-mt-24 rounded-3xl p-8 sm:p-12"
      >
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
          A Tuesday, tracked
        </p>
        <RhythmWave />
      </motion.div>
    </section>
  );
}
