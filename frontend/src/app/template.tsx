"use client";

import { motion } from "framer-motion";

// template.tsx re-mounts on every navigation, so this gives smooth
// route transitions (a requested UX improvement) without touching page internals.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
