"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MobileNavProps {
  activePage?: string;
}

const links = [
  { href: "/before-you-start", label: "Before You Start", key: "before-you-start" },
  { href: "/inspiration", label: "Inspiration", key: "inspiration" },
  { href: "/how-it-works", label: "How it works", key: "how-it-works" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

export default function MobileNav({ activePage }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch auth state
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Use createPortal to render the drawer directly into document.body
  // This prevents issues with fixed positioning being trapped by parent elements with transforms or filters (like backdrop-blur)
  const drawerContent = (
    <AnimatePresence>
      {open && (
        <div className="portal-root">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]"
            onClick={() => setOpen(false)}
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[400px] bg-white z-[10000] shadow-2xl flex flex-col"
          >
            {/* Top bar with logo and close */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                <div className="h-6 w-[1px] bg-gray-200" />
                <span className="text-xs font-black tracking-tighter uppercase text-gray-400">Menu</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-6 py-10 bg-white">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-4"
              >
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 px-4">Navigation</p>
                  <div className="flex flex-col gap-2">
                    {links.map((link) => (
                      <motion.div key={link.key} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={`group relative flex items-center justify-between px-5 py-5 rounded-[1.5rem] transition-all duration-300 ${
                            activePage === link.key
                              ? "bg-[#9DF542] text-[#111] shadow-lg shadow-[#9DF542]/20"
                              : "hover:bg-gray-50 text-[#111]"
                          }`}
                        >
                          <span className="text-[19px] font-bold tracking-tight">{link.label}</span>
                          {activePage === link.key ? (
                            <div className="w-2 h-2 rounded-full bg-[#111]" />
                          ) : (
                            <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gray-300" />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Extra section for visual flair */}
                <motion.div variants={itemVariants} className="mt-8 p-6 bg-[#faf9f6] rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#9DF542] flex items-center justify-center">
                      <Sparkles size={14} className="text-[#111]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tighter">Premium Print</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">
                    Transform your ideas into high-quality merchandise with our expert design team.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Fixed bottom actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto shrink-0">
              <div className="flex flex-col gap-3">
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#111] text-white font-bold text-center text-lg hover:bg-black transition-all active:scale-[0.98] shadow-xl"
                >
                  Explore Catalog
                </Link>
                
                {!user && (
                  <>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="w-full py-4 rounded-2xl bg-[#9DF542] text-[#111] font-bold text-center text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#9DF542]/10"
                    >
                      Start Creating Free
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="w-full py-3.5 rounded-2xl bg-white border border-gray-200 text-[#111] font-bold text-center text-base hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
              <p className="text-center text-[11px] text-gray-400 font-medium mt-6">
                © {new Date().getFullYear()} Stenvo. All Rights Reserved.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        className="lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-95"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} className="text-[#111]" />
      </button>

      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
