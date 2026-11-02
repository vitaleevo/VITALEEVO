"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type RevealVariant = "curtain" | "doors" | "slide-left" | "slide-right" | "zoom" | "rise";

type ScrollRevealProps = {
  children: React.ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  amount?: number;
};

const revealVariants: Record<Exclude<RevealVariant, "doors">, Variants> = {
  curtain: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 32 },
    visible: { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -64, rotateY: 5 },
    visible: { opacity: 1, x: 0, rotateY: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 64, rotateY: -5 },
    visible: { opacity: 1, x: 0, rotateY: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.9, y: 24 },
    visible: { opacity: 1, scale: 1, y: 0 },
  },
  rise: {
    hidden: { opacity: 0, y: 56 },
    visible: { opacity: 1, y: 0 },
  },
};

const transition = {
  duration: 0.85,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function ScrollReveal({
  children,
  variant = "rise",
  className = "",
  delay = 0,
  amount = 0.18,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (variant === "doors") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount }}
        className={`relative isolate overflow-hidden ${className}`}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.97, filter: "blur(8px)" },
            visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
          }}
          transition={{ ...transition, delay: delay + 0.18 }}
        >
          {children}
        </motion.div>

        <motion.div
          aria-hidden
          variants={{ hidden: { x: "0%" }, visible: { x: "-101%" } }}
          transition={{ duration: 1.05, delay, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 origin-left bg-gradient-to-r from-primary-darker via-primary to-primary-light shadow-[18px_0_48px_rgba(15,23,42,0.28)]"
        >
          <span className="absolute right-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_22px_6px_rgba(16,185,129,0.5)]" />
        </motion.div>
        <motion.div
          aria-hidden
          variants={{ hidden: { x: "0%" }, visible: { x: "101%" } }}
          transition={{ duration: 1.05, delay, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 origin-right bg-gradient-to-l from-primary-darker via-primary to-primary-light shadow-[-18px_0_48px_rgba(15,23,42,0.28)]"
        >
          <span className="absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_22px_6px_rgba(16,185,129,0.5)]" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={revealVariants[variant]}
      transition={{ ...transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
