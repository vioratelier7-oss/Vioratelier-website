"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/brand/Logo";

/** VA monogram intro, shown once per browser session (a UI preference only, no content is stored). */
export function Loader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("va-intro") === "1"; sessionStorage.setItem("va-intro", "1"); } catch {}
    const t = setTimeout(() => setShow(false), seen || reduce ? 0 : 1500);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.2 }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <Monogram className="h-14 w-auto text-navy md:h-16" />
            </motion.div>
            <motion.span
              className="mt-6 block h-px bg-champagne"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
