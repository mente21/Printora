"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  PenTool,
  CheckCircle,
  Truck,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserRole(data.role);
          });
      }
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()
          .then(({ data }) => {
            if (data) setUserRole(data.role);
          });
      } else {
        setUserRole(null);
      }
    });

    // Fetch approved supplier products for the landing page
    supabase
      .from("supplier_products")
      .select("*, supplier:profiles(full_name)")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false })
      .then(({ data }) => setSupplierProducts(data || []));

    return () => subscription.unsubscribe();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress || 0);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setScrollProgress(newProgress);
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollLeft =
        (newProgress / 100) * (scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <div className="w-full flex justify-center sticky top-1 lg:top-2 z-50 px-4 lg:px-6">
        <header className="w-full max-w-7xl bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/50 rounded-[2rem] h-[76px] lg:h-[84px] flex items-center px-6 lg:px-10 relative">
          <div className="flex-1 flex items-center">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Stenvo Logo"
              className="h-[56px] md:h-[68px] w-auto cursor-pointer object-contain relative z-10 -ml-1 transition-transform hover:scale-105"
            />
          </div>

          {/* Centered Nav */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <Link
              href="#catalog"
              className="text-[17px] font-normal text-[#2d3227] hover:text-[#525f48] transition-colors"
            >
              Catalog
            </Link>
            <Link
              href="#pricing"
              className="text-[17px] font-normal text-[#2d3227] hover:text-[#525f48] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-1.5 text-[17px] font-normal text-[#2d3227] hover:text-[#525f48] transition-colors"
            >
              How it works
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-[2px]"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
          </nav>

          <div className="flex-1 flex items-center justify-end gap-3">
            {user ? (
              // --- LOGGED IN STATE ---
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-full px-3 pr-4 py-1.5 hover:shadow-md transition-all group"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[#A1FF4D]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#A1FF4D] flex items-center justify-center text-[#1B2412] font-black text-sm">
                      {(user.user_metadata?.full_name ||
                        user.email ||
                        "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-[14px] font-bold text-[#1B2412] max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-[#1B2412] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/editor"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-[#A1FF4D]/20 hover:text-[#1B2412] transition-colors"
                      >
                        <PenTool size={15} /> Start Designing
                      </Link>

                      {userRole !== "SUPPLIER" && (
                        <Link
                          href="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-[#A1FF4D]/20 hover:text-[#1B2412] transition-colors"
                        >
                          <CheckCircle size={15} /> My Orders
                        </Link>
                      )}

                      {userRole === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <ShoppingBag size={15} /> Admin Panel
                        </Link>
                      )}

                      {(userRole === "SUPPLIER" || userRole === "ADMIN") && (
                        <Link
                          href="/supplier"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <CheckCircle size={15} /> Supplier Panel
                        </Link>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // --- LOGGED OUT STATE ---
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-md px-6 h-11 text-[16px] font-extrabold tracking-wide text-[#1B2412] bg-white border border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center rounded-md px-6 h-11 text-[16px] font-extrabold tracking-wide transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#A1FF4D", color: "#1B2412" }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-8 lg:pt-16 lg:pb-12 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="max-w-xl z-20 sm:ml-4 md:ml-8 lg:ml-12 xl:ml-16">
                <h1
                  className="text-6xl lg:text-[76px] font-black uppercase tracking-normal leading-[1.15] mb-6"
                  style={{
                    color: "#2B3220",
                    fontFamily:
                      'Impact, "Arial Black", "Segoe UI Black", sans-serif',
                  }}
                >
                  Design & Print <br />
                  Custom Products
                </h1>

                <p className="text-[#495439] text-[16px] sm:text-[17px] font-normal leading-normal mb-8 font-sans">
                  The ultimate destination for premium custom apparel. We
                  design, we print, you thrive. No upfront costs.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-4 sm:gap-6 text-[#2B3220] text-lg font-semibold mb-12">
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    100% Free to use
                  </span>
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    1300+ products
                  </span>
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Global delivery
                  </span>
                </div>

                <div className="flex flex-col items-start gap-4 mb-2">
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                    @keyframes vibrate-btn {
                      0% { transform: translateX(0) translateY(0); }
                      20% { transform: translateX(-2px) translateY(1px) rotate(-1deg); }
                      40% { transform: translateX(2px) translateY(-1px) rotate(1deg); }
                      60% { transform: translateX(-2px) translateY(1px) rotate(-1deg); }
                      80% { transform: translateX(2px) translateY(-1px) rotate(1deg); }
                      100% { transform: translateX(0) translateY(0); }
                    }
                    .hover-vibrate-trigger:hover {
                      animation: vibrate-btn 0.5s ease-in-out infinite !important;
                    }
                    @keyframes auto-wiggle {
                      0%, 100% { transform: rotate(6deg) translateX(0) translateY(0); }
                      20% { transform: rotate(7.5deg) translateX(-1.5px) translateY(0.5px); }
                      40% { transform: rotate(4.5deg) translateX(1.5px) translateY(-0.5px); }
                      60% { transform: rotate(7deg) translateX(-1px) translateY(0.5px); }
                      80% { transform: rotate(5deg) translateX(1px) translateY(-0.5px); }
                    }
                    .auto-wiggle {
                      animation: auto-wiggle 0.6s ease-in-out infinite;
                    }
                    @keyframes auto-wiggle-neg {
                      0%, 100% { transform: rotate(-3deg) translateX(0) translateY(0); }
                      20% { transform: rotate(-4.5deg) translateX(1.5px) translateY(0.5px); }
                      40% { transform: rotate(-1.5deg) translateX(-1.5px) translateY(-0.5px); }
                      60% { transform: rotate(-4deg) translateX(1px) translateY(0.5px); }
                      80% { transform: rotate(-2deg) translateX(-1px) translateY(-0.5px); }
                    }
                    .auto-wiggle-neg {
                      animation: auto-wiggle-neg 0.6s ease-in-out infinite;
                    }
                    @keyframes slide-two-photos {
                      0%, 35% { transform: translateX(0); }
                      45%, 85% { transform: translateX(-50%); }
                      95%, 100% { transform: translateX(0); }
                    }
                    .animate-slide-photos {
                      animation: slide-two-photos 4s infinite cubic-bezier(0.77, 0, 0.175, 1);
                    }
                    .animate-slide-photos-delayed {
                      animation: slide-two-photos 4s infinite cubic-bezier(0.77, 0, 0.175, 1);
                      animation-delay: -2s;
                    }
                    @keyframes sticker-fade-pop {
                      0%, 35% { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
                      42%, 88% { opacity: 0; transform: translateY(15px) scale(0.85); pointer-events: none; }
                      95%, 100% { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
                    }
                    .animate-sticker-fade {
                      animation: sticker-fade-pop 4s infinite cubic-bezier(0.77, 0, 0.175, 1);
                    }
                    .animate-sticker-fade-delayed {
                      animation: sticker-fade-pop 4s infinite cubic-bezier(0.77, 0, 0.175, 1);
                      animation-delay: -2s;
                    }
                  `,
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                      href="/products"
                      className="hover-vibrate-trigger rounded-md px-10 h-14 text-[17px] font-extrabold font-sans w-full sm:w-auto flex items-center justify-center"
                      style={{ backgroundColor: "#9DF542", color: "#1B2412" }}
                    >
                      Get started for free
                    </Link>
                    <button className="rounded-md px-10 h-14 text-[17px] font-extrabold font-sans border-[3px] border-[#2B3220] text-[#2B3220] transition-colors hover:bg-[#2B3220] hover:text-[#9DF542] w-full sm:w-auto flex items-center justify-center">
                      How it works
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Content - Images */}
              <div className="relative h-[600px] w-full hidden lg:block z-10">
                {/* Photo 1 - Top Left */}
                <div className="absolute top-8 left-4 w-[280px] h-[360px] z-10">
                  <div className="w-full h-full bg-[#e0f2fe] rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-sm transition-transform hover:-translate-y-2 duration-300">
                    <div className="w-[200%] h-full flex animate-slide-photos">
                      <div className="w-1/2 h-full relative">
                        <img
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&fit=crop"
                          alt="Student"
                          className="w-full h-[120%] object-cover object-top -mt-6"
                          loading="lazy"
                        />
                      </div>
                      <div className="w-1/2 h-full relative">
                        <img
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&fit=crop"
                          alt="Creative Writer"
                          className="w-full h-[120%] object-cover object-top -mt-6"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  {/* "Thank You. Next." Floating Sticker */}
                  <div className="absolute -top-2 -right-12 z-50 animate-sticker-fade pointer-events-none">
                    <div className="auto-wiggle group cursor-pointer scale-[0.9] pointer-events-auto">
                      <div className="bg-white rounded-[1.2rem] shadow-2xl px-6 py-4 flex items-center gap-4 border-2 border-gray-50 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                        {/* Beautiful Sparkles Icon rather than a messy OS Emoji */}
                        <div className="flex flex-col items-center justify-center text-[#2B3220]">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 1L14.59 9.41L23 12L14.59 14.59L12 23L9.41 14.59L1 12L9.41 9.41L12 1Z" />
                          </svg>
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="-mr-8 -mt-2 text-[#9DF542]"
                          >
                            <path d="M12 1L14.59 9.41L23 12L14.59 14.59L12 23L9.41 14.59L1 12L9.41 9.41L12 1Z" />
                          </svg>
                        </div>
                        <div
                          className="text-[28px] font-bold text-[#111827] flex flex-col tracking-tight italic"
                          style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            lineHeight: "0.85",
                          }}
                        >
                          <span>Create</span>
                          <span className="ml-[12px]">Your</span>
                          <span className="ml-[4px]">Design.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo 2 - Bottom Right */}
                <div className="absolute top-[160px] right-2 w-[300px] h-[380px] z-20">
                  <div className="w-full h-full bg-[#ede9fe] rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-sm transition-transform hover:-translate-y-2 duration-300">
                    <div className="w-[200%] h-full flex flex-row-reverse animate-slide-photos-delayed">
                      <div className="w-1/2 h-full relative">
                        <img
                          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&fit=crop"
                          alt="Student"
                          className="w-full h-full object-cover object-top pt-4"
                          loading="lazy"
                        />
                      </div>
                      <div className="w-1/2 h-full relative">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&fit=crop"
                          alt="Creative Designer"
                          className="w-full h-full object-cover object-top pt-4"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  {/* "Item Sold" Floating Sticker */}
                  <div className="absolute -top-4 -right-10 z-50 animate-sticker-fade-delayed pointer-events-none">
                    <div className="auto-wiggle-neg group cursor-pointer scale-[0.9] pointer-events-auto">
                      <div className="relative">
                        {/* Dark Rectangle */}
                        <div className="bg-[#151a10] rounded-lg px-5 py-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-transform group-hover:scale-105 border-[1px] border-[#313b24]">
                          <span
                            className="text-[#f8fafc] text-[25px] uppercase tracking-wider leading-none block"
                            style={{
                              fontFamily:
                                'Impact, "Arial Black", "Segoe UI Black", sans-serif',
                              textShadow:
                                "-2px 0px 0px #06b6d4, 2px 0px 0px #f43f5e",
                            }}
                          >
                            BEST SELLER
                          </span>
                        </div>
                        {/* Blue Oval */}
                        <div className="absolute -top-6 -right-8 bg-[#2563EB] w-[85px] h-[55px] rounded-[50%] flex items-center justify-center transform rotate-[15deg] shadow-[inset_0_-4px_10px_rgba(0,0,0,0.1),_0_10px_15px_-3px_rgba(0,0,0,0.2)] transition-transform group-hover:rotate-[25deg] group-hover:scale-110">
                          <div
                            className="text-white flex items-end justify-center leading-none"
                            style={{
                              fontFamily:
                                'Impact, "Arial Black", "Segoe UI Black", sans-serif',
                              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <span className="text-[20px] transform -rotate-[15deg] translate-y-[2px] translate-x-[2px] drop-shadow-sm">
                              $
                            </span>
                            <span className="text-[26px] transform -rotate-3 -ml-[2px] mb-[1px] drop-shadow-sm">
                              $
                            </span>
                            <span className="text-[34px] transform rotate-[12deg] -ml-[2px] mb-[1px] drop-shadow-sm">
                              $
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-[340px] left-[10px] w-6 h-6 text-[#a0d6a5]">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                </div>

                <div className="absolute top-[50px] right-[40px] w-[14px] h-[14px] rounded-full bg-[#c2b6f1]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories Section - Designed to match exactly */}
        <section className="bg-[#f4f3ec] pt-12 pb-10 px-6 lg:px-16 overflow-hidden flex flex-col justify-center">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .cards-scroll::-webkit-scrollbar { display: none; }
            .cards-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `,
            }}
          />

          <div className="max-w-[1400px] mx-auto w-full">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-gray-600 mb-4 font-sans">
                  Elevate your brand
                </p>
                <h2 className="text-[40px] md:text-[56px] font-medium text-[#111] leading-[1.05] tracking-tight max-w-[600px] font-sans">
                  Comprehensive Custom Merch for Everyone
                </h2>
              </div>
            </div>

            {/* Scrollable cards */}
            <div
              id="cards-track"
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="cards-scroll flex gap-6 overflow-x-auto pb-3 -mx-6 px-6 lg:-mx-16 lg:px-16"
            >
              {/* Card 1 — Green */}
              <div className="flex-shrink-0 w-[320px] h-[520px] bg-[#ccff00] rounded-[2rem] overflow-hidden flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="p-7 relative z-10 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full">
                        Apparel
                      </span>
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full">
                        Bestseller
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center text-[#ccff00]">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <h3 className="text-[36px] font-medium text-[#111] leading-[1.05] tracking-tight mb-3 font-sans">
                    T-Shirts &<br />
                    Hoodies
                  </h3>
                  <p className="text-[15px] text-[#222] leading-relaxed max-w-[90%] font-sans">
                    For fashion brands and personal styles. Premium fabric,
                    vivid prints.
                  </p>
                </div>
                {/* Photo inset */}
                <div className="absolute bottom-0 left-0 right-0 h-[260px]">
                  <div
                    className="absolute inset-0 rounded-t-[1.5rem] overflow-hidden bg-[#e0f2fe] transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Sliding Photos Container */}
                    <div
                      className="w-[200%] h-full flex animate-slide-photos"
                      style={{ animationDelay: "0s" }}
                    >
                      {/* Photo 1: Orange Faith Hoodie */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="/orange-hoodie.jpg"
                          alt="Orange Faith Hoodie Placeholder"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                      {/* Photo 2: Hustle Houston T-shirt */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="/hustle-tee.jpg"
                          alt="Hustle Houston T-Shirt Placeholder"
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>

                    {/* Read More button overlay */}
                    <Link
                      href="/products/tshirt"
                      className="absolute bottom-6 left-6 flex items-center gap-3 z-20 cursor-pointer pointer-events-auto"
                    >
                      <span className="text-white text-[15px] font-medium tracking-wide drop-shadow-md">
                        Design Now
                      </span>
                      <div className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#111] shadow-lg group-hover:bg-white transition-colors">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2 — Beige */}
              <div className="flex-shrink-0 w-[320px] h-[520px] bg-[#f0eae1] rounded-[2rem] overflow-hidden flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="p-7 relative z-10 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Accessories
                      </span>
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Trending
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#dfd7c8] flex items-center justify-center text-white">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <h3 className="text-[36px] font-medium text-[#111] leading-[1.05] tracking-tight mb-3 font-sans">
                    Bags &<br />
                    Tote Bags
                  </h3>
                  <p className="text-[15px] text-[#444] leading-relaxed max-w-[90%] font-sans">
                    Stylish carry-alls printed with your unique design. Perfect
                    for gifting and reselling.
                  </p>
                </div>
                {/* Photo inset */}
                <div className="absolute bottom-0 left-0 right-0 h-[260px]">
                  <div
                    className="absolute inset-0 rounded-t-[1.5rem] overflow-hidden bg-[#e8e4dc] transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Sliding Photos Container */}
                    <div
                      className="w-[200%] h-full flex animate-slide-photos"
                      style={{ animationDelay: "2s" }}
                    >
                      {/* Photo 1 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="/bag1.jpg"
                          alt="Canvas Bag"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {/* Photo 2 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="/bag2.jpg"
                          alt="Leather Bag"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>
                    {/* Read More button overlay */}
                    <Link
                      href="/products/bags"
                      className="absolute bottom-6 left-6 flex items-center gap-3 z-20 cursor-pointer pointer-events-auto"
                    >
                      <span className="text-white text-[15px] font-medium tracking-wide drop-shadow-md">
                        Design Now
                      </span>
                      <div className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#111] shadow-lg group-hover:bg-white transition-colors">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 3 — Beige */}
              <div className="flex-shrink-0 w-[320px] h-[520px] bg-[#f0eae1] rounded-[2rem] overflow-hidden flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="p-7 relative z-10 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Home
                      </span>
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        All levels
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#dfd7c8] flex items-center justify-center text-white">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <h3 className="text-[36px] font-medium text-[#111] leading-[1.05] tracking-tight mb-3 font-sans">
                    Mugs &<br />
                    Drinkware
                  </h3>
                  <p className="text-[15px] text-[#444] leading-relaxed max-w-[90%] font-sans">
                    Custom mugs that start every morning with your brand — from
                    beginner to advanced sellers.
                  </p>
                </div>
                {/* Photo inset */}
                <div className="absolute bottom-0 left-0 right-0 h-[260px]">
                  <div
                    className="absolute inset-0 rounded-t-[1.5rem] overflow-hidden bg-[#d8d4f0] transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Sliding Photos Container */}
                    <div
                      className="w-[200%] h-full flex animate-slide-photos"
                      style={{ animationDelay: "1s" }}
                    >
                      {/* Photo 1 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="d1.jpg"
                          alt="White Mug"
                          className="w-full h-full object-cover object-bottom"
                        />
                      </div>
                      {/* Photo 2 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="d2.jpg"
                          alt="Latte Cup"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>
                    {/* Read More button overlay */}
                    <Link
                      href="/products/mugs"
                      className="absolute bottom-6 left-6 flex items-center gap-3 z-20 cursor-pointer pointer-events-auto"
                    >
                      <span className="text-white text-[15px] font-medium tracking-wide drop-shadow-md">
                        Design Now
                      </span>
                      <div className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#111] shadow-lg group-hover:bg-white transition-colors">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 4 — Blue */}
              <div className="flex-shrink-0 w-[320px] h-[520px] bg-[#5bc2e7] rounded-[2rem] overflow-hidden flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="p-7 relative z-10 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-white/90 text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Stationery
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <h3 className="text-[36px] font-medium text-[#111] leading-[1.05] tracking-tight mb-3 font-sans">
                    Posters &<br />
                    ID badges
                  </h3>
                  <p className="text-[15px] text-[#111]/80 leading-relaxed max-w-[90%] font-sans">
                    Museum-quality prints of your artwork shipped directly to
                    your customers worldwide.
                  </p>
                </div>
                {/* Photo inset */}
                <div className="absolute bottom-0 left-0 right-0 h-[260px]">
                  <div
                    className="absolute inset-0 rounded-t-[1.5rem] overflow-hidden bg-[#e0f7fa] transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Sliding Photos Container */}
                    <div
                      className="w-[200%] h-full flex animate-slide-photos"
                      style={{ animationDelay: "3s" }}
                    >
                      {/* Photo 1 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="i2.jpg"
                          alt="Posters"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {/* Photo 2 */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="i1.jpg"
                          alt="ID Badges"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>
                    {/* Read More button overlay */}
                    <Link
                      href="/products/posters"
                      className="absolute bottom-6 left-6 flex items-center gap-3 z-20 cursor-pointer pointer-events-auto"
                    >
                      <span className="text-white text-[15px] font-medium tracking-wide drop-shadow-md">
                        Design Now
                      </span>
                      <div className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#111] shadow-lg group-hover:bg-white transition-colors">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 5 — Lavender (Hats & Phones) */}
              <div className="flex-shrink-0 w-[320px] h-[520px] bg-[#e6e0f8] rounded-[2rem] overflow-hidden flex flex-col relative group transition-transform hover:-translate-y-1">
                <div className="p-7 relative z-10 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Accessories
                      </span>
                      <span className="bg-white text-[#111] text-[14px] font-medium px-4 py-1.5 rounded-full shadow-sm">
                        Tech
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#5c4b8b]">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L2 22h20L12 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Title */}
                  <h3 className="text-[36px] font-medium text-[#111] leading-[1.05] tracking-tight mb-3 font-sans">
                    Hats &<br />
                    Phone Cases
                  </h3>
                  <p className="text-[15px] text-[#444] leading-relaxed max-w-[90%] font-sans">
                    Protect and style. Premium structured hats and durable,
                    custom-printed safety covers.
                  </p>
                </div>
                {/* Photo inset */}
                <div className="absolute bottom-0 left-0 right-0 h-[260px]">
                  <div
                    className="absolute inset-0 rounded-t-[1.5rem] overflow-hidden bg-[#dcd6f0] transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* Sliding Photos Container */}
                    <div
                      className="w-[200%] h-full flex animate-slide-photos"
                      style={{ animationDelay: "1.5s" }}
                    >
                      {/* Photo 1: Hat */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="p1.jpg"
                          alt="Premium structured hat"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      {/* Photo 2: Phone Case */}
                      <div className="w-1/2 h-full relative">
                        <img
                          src="p2.jpg"
                          alt="Custom phone safety cover"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>
                    {/* Read More button overlay */}
                    <Link
                      href="/products/hats"
                      className="absolute bottom-6 left-6 flex items-center gap-3 z-20 cursor-pointer pointer-events-auto"
                    >
                      <span className="text-white text-[15px] font-medium tracking-wide drop-shadow-md">
                        Design Now
                      </span>
                      <div className="w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#111] shadow-lg group-hover:bg-white transition-colors">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Progress & Navigation Graphic */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 mb-4 px-6 lg:px-4 w-full relative z-20 gap-8">
              {/* Graphic Tracker bar - Interactive */}
              <div className="hidden md:flex items-center gap-4 flex-1 max-w-sm mr-8 relative group">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  .custom-scrollbar::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 32px;
                    height: 16px;
                    border-radius: 8px;
                    background: #ccff00;
                    border: 3px solid #111;
                    cursor: pointer;
                    transition: transform 0.15s ease-out;
                  }
                  .custom-scrollbar::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                  }
                  .custom-scrollbar::-moz-range-thumb {
                    width: 32px;
                    height: 16px;
                    border-radius: 8px;
                    background: #ccff00;
                    border: 3px solid #111;
                    cursor: pointer;
                    transition: transform 0.15s ease-out;
                  }
                  .custom-scrollbar::-moz-range-thumb:hover {
                    transform: scale(1.15);
                  }
                `,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scrollProgress || 0}
                  onChange={handleSliderChange}
                  className="custom-scrollbar w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #111 0%, #111 ${scrollProgress}%, #e5e7eb ${scrollProgress}%, #e5e7eb 100%)`,
                  }}
                  aria-label="Scroll horizontal cards"
                />
              </div>

              {/* Interactive Slide Arrows */}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => {
                    if (scrollContainerRef.current)
                      scrollContainerRef.current.scrollBy({
                        left: -340,
                        behavior: "smooth",
                      });
                  }}
                  className="w-12 h-12 rounded-full border border-gray-200 bg-white text-[#111] flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (scrollContainerRef.current)
                      scrollContainerRef.current.scrollBy({
                        left: 340,
                        behavior: "smooth",
                      });
                  }}
                  className="w-12 h-12 rounded-full bg-[#111] text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-md"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-[#f0ebe1] pt-12 pb-24 px-6 lg:px-10 flex flex-col justify-center items-center">
          <div className="max-w-[1240px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Header Block */}
            <div className="flex flex-col justify-center pr-2 md:pr-4 py-8">
              <h2 className="text-[32px] md:text-[38px] font-extrabold text-[#202b2a] leading-tight mb-5 tracking-tight font-sans">
                Simple guide
              </h2>
              <p className="text-[#64716e] text-[14px] md:text-[15px] font-medium leading-[1.6] mb-8 pr-4">
                Follow this simple guide: choose your material, select a print
                house, design your product, and place your order.
              </p>
              <div>
                <Link
                  href="/products"
                  className="bg-white text-[#111] px-10 py-4 rounded-full font-bold text-[17px] hover-vibrate-trigger flex items-center justify-center gap-2 shadow-sm transition-all border border-gray-200/50"
                >
                  Start designing
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-[1px]"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Step 1 Card */}
            <div className="bg-[#ccff00] text-[#111] p-7 md:p-8 rounded-[1.2rem] flex flex-col justify-between shadow-sm z-10 w-full hover-vibrate-trigger transition-transform">
              <div>
                <div className="flex items-center gap-3 mb-5 text-[#111]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span className="font-bold text-[#111] text-[18px] md:text-[19px] tracking-tight">
                    1. Choose Material
                  </span>
                </div>
                <p className="text-[#222] text-[14px] leading-[1.6] mb-8 font-medium pr-2">
                  First, choose the material or product you want to design on
                  from our extensive catalog.
                </p>
              </div>
              <div>
                <Link
                  href="/products"
                  className="text-[#111] text-[13px] md:text-[14px] font-semibold hover:opacity-75 transition-opacity underline decoration-1 underline-offset-4"
                >
                  Browse catalog
                </Link>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="bg-[#e6e0f8] p-7 md:p-8 rounded-[1.2rem] flex flex-col justify-between hover-vibrate-trigger transition-transform shadow-sm w-full">
              <div>
                <div className="flex items-center gap-3 mb-5 text-[#111]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="font-bold text-[#111] text-[18px] md:text-[19px] tracking-tight">
                    2. Select Print House
                  </span>
                </div>
                <p className="text-[#444] text-[14px] leading-[1.6] mb-8 font-medium pr-2">
                  Second, select the best seller or print house that fits your
                  unique needs and location.
                </p>
              </div>
              <div>
                <Link
                  href="/supplier"
                  className="text-[#111] text-[13px] md:text-[14px] font-semibold hover:opacity-75 transition-opacity"
                >
                  Find sellers
                </Link>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="bg-[#5bc2e7] p-7 md:p-8 rounded-[1.2rem] flex flex-col justify-between hover-vibrate-trigger transition-transform shadow-sm w-full">
              <div>
                <div className="flex items-center gap-3 mb-5 text-[#111]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                  <span className="font-bold text-[#111] text-[18px] md:text-[19px] tracking-tight">
                    3. Design Material
                  </span>
                </div>
                <p className="text-[#111]/80 text-[14px] leading-[1.6] mb-8 font-medium pr-2">
                  Third, design the selected material using our powerful online
                  designer tool.
                </p>
              </div>
              <div>
                <Link
                  href="/editor"
                  className="text-[#111] text-[13px] md:text-[14px] font-semibold hover:opacity-75 transition-opacity"
                >
                  Open designer
                </Link>
              </div>
            </div>

            {/* Step 4 Card */}
            <div className="bg-[#f0eae1] p-7 md:p-8 rounded-[1.2rem] flex flex-col justify-between hover-vibrate-trigger transition-transform shadow-sm w-full">
              <div>
                <div className="flex items-center gap-3 mb-5 text-[#111]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <span className="font-bold text-[#111] text-[18px] md:text-[19px] tracking-tight">
                    4. Payment & Order
                  </span>
                </div>
                <p className="text-[#444] text-[14px] leading-[1.6] mb-8 font-medium pr-2">
                  Then, securely make your payment and place your order directly
                  through our platform.
                </p>
              </div>
              <div>
                <Link
                  href="#"
                  className="text-[#111] text-[13px] md:text-[14px] font-semibold hover:opacity-75 transition-opacity"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Step 5 Card */}
            <div className="bg-[#f6cdcd] p-7 md:p-8 rounded-[1.2rem] flex flex-col justify-between hover-vibrate-trigger transition-transform shadow-sm w-full">
              <div>
                <div className="flex items-center gap-3 mb-5 text-[#111]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-bold text-[#111] text-[18px] md:text-[19px] tracking-tight">
                    5. Process Complete
                  </span>
                </div>
                <p className="text-[#333] text-[14px] leading-[1.6] mb-8 font-medium pr-2">
                  Finally, the process is complete! Your custom designed product
                  will be on its way.
                </p>
              </div>
              <div>
                <Link
                  href="#"
                  className="text-[#111] text-[13px] md:text-[14px] font-semibold hover:opacity-75 transition-opacity"
                >
                  Track order
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SUPPLIER PRODUCTS CATALOG SECTION ====== */}
        {supplierProducts.length > 0 && (
          <section className="bg-[#fafafa] py-16 px-6 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.15em] text-[#A1FF4D] mb-2">
                    Verified Suppliers
                  </p>
                  <h2 className="text-[36px] md:text-[48px] font-black text-[#111] leading-tight tracking-tight">
                    Browse Supplier Products
                  </h2>
                  <p className="text-gray-500 font-medium text-sm mt-2">
                    Pick a product from one of our verified suppliers, then
                    design it yourself.
                  </p>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {supplierProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="h-52 bg-gray-50 overflow-hidden relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                          </svg>
                        </div>
                      )}
                      {/* Tags */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {(product.tags || []).slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-white/90 backdrop-blur-sm text-[#111] text-[9px] font-black px-2 py-1 rounded-full shadow-sm uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      {/* Supplier badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#A1FF4D] flex items-center justify-center text-[9px] font-black text-[#1B2412]">
                          {product.supplier?.full_name?.[0]?.toUpperCase() ||
                            "S"}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                          {product.supplier?.full_name}
                        </span>
                      </div>

                      <h3 className="font-black text-[#111] text-base mb-1 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 font-medium">
                        {product.description}
                      </p>

                      {/* Colors */}
                      {product.available_colors?.length > 0 && (
                        <div className="flex gap-1.5 mb-4 flex-wrap">
                          {product.available_colors
                            .slice(0, 8)
                            .map((c: any) => (
                              <div
                                key={c.hex}
                                title={c.name}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform"
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                          {product.available_colors.length > 8 && (
                            <span className="text-[9px] font-bold text-gray-400">
                              +{product.available_colors.length - 8}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {product.product_type}
                          </span>
                          <p className="text-lg font-black text-[#111]">
                            ${product.price}
                          </p>
                        </div>
                        <Link
                          href="/editor"
                          className="bg-[#111] text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-[#A1FF4D] hover:text-[#1B2412] transition-all active:scale-95"
                        >
                          Design →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Modern Bento Box Section */}
        <section className="bg-[#1e1e1e] w-full py-16 md:py-24 px-4 md:px-8 flex justify-center font-sans tracking-tight">
          <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Top Left Card (White) */}
            <div className="col-span-1 lg:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 lg:p-14 flex flex-col justify-between min-h-[420px] lg:min-h-[500px]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <div className="flex w-[26px] h-[34px] rounded-sm overflow-hidden flex-shrink-0">
                  <div className="w-[10px] h-full bg-[#111]"></div>
                  <div className="w-[16px] h-full bg-[#fced44]"></div>
                </div>
                <span className="font-bold text-[13px] tracking-widest text-[#111] uppercase whitespace-nowrap">
                  TIME FOR CREATORS — 24
                </span>
              </div>

              {/* Large Title */}
              <h2
                className="text-[60px] md:text-[88px] lg:text-[104px] font-black text-[#111] leading-[1.0] tracking-normal mb-10 md:mb-16 uppercase"
                style={{
                  fontFamily: "Impact, sans-serif",
                  fontStretch: "condensed",
                }}
              >
                OWN YOUR
                <br />
                MERCH,
                <br />
                OWN YOUR
                <br />
                BRAND
              </h2>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
                <button className="bg-[#111] text-white px-8 py-5 rounded-full font-extrabold text-[14px] tracking-wider hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95 w-max">
                  START YOUR JOURNEY
                </button>
                <div className="flex items-center gap-4 opacity-80">
                  <div className="flex items-end gap-1 h-6">
                    <div className="w-[2px] h-3 bg-gray-400"></div>
                    <div className="w-[2px] h-4 bg-gray-600"></div>
                    <div className="w-[2px] h-6 bg-gray-800"></div>
                    <div className="w-[2px] h-5 bg-gray-500"></div>
                    <div className="w-[2px] h-3 bg-gray-400"></div>
                  </div>
                  <div className="text-[10px] md:text-[11px] font-bold text-gray-800 leading-[1.2] tracking-widest uppercase">
                    LUXURY MERCH
                    <br />
                    EXPERIENCE
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right Card (Image) */}
            <div className="col-span-1 lg:col-span-5 bg-[#e4a38f] rounded-[2.5rem] overflow-hidden relative min-h-[420px] lg:min-h-[500px] group">
              <img
                src="/hustle-tee-new.jpg"
                alt="Model"
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply opacity-80"></div>

              <div className="absolute top-8 left-8">
                <div className="w-[52px] h-[52px] bg-[#111] rounded-2xl flex items-center justify-center p-[14px]">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M12 2L15 9l7 1-5 5.5L15.5 22 12 18.5 8.5 22 10 15.5 5 10l7-1z" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-10 inset-x-0 px-8">
                <h3
                  className="text-white font-black text-[34px] md:text-[42px] leading-[1.05] tracking-tight uppercase"
                  style={{ fontFamily: "sans-serif" }}
                >
                  DESIGN ON YOUR
                  <br />
                  OWN TIME
                </h3>
              </div>
            </div>

            {/* Bottom Left Card (Peach) */}
            <div className="col-span-1 lg:col-span-7 bg-[#eba79b] rounded-[2.5rem] p-6 lg:p-7 flex flex-col md:flex-row items-stretch gap-6 shadow-inset">
              {/* Image Block */}
              <div className="w-full md:w-[260px] aspect-video md:aspect-auto md:h-full bg-[#eecd1a] rounded-3xl overflow-hidden relative flex-shrink-0">
                <img
                  src="/orange-hoodie.jpg"
                  alt="Hoodie mock"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-95 grayscale"
                />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-32 bg-[#171717] rounded-l-2xl shadow-[-5px_0_15px_rgba(0,0,0,0.2)]"></div>
              </div>

              {/* Text Block */}
              <div className="flex flex-col justify-between w-full p-2 lg:p-4">
                <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                  <span className="text-[12px] font-bold tracking-widest text-[#111]">
                    24/7 SUPPORT
                  </span>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-[11px] font-bold tracking-widest text-[#111] leading-tight opacity-90">
                      12834 STENVO LN
                      <br />
                      BROOKLYN, NY
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#fced44]"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-[32px] md:text-[40px] lg:text-[46px] font-black text-[#111] leading-[1.0] tracking-tighter uppercase pr-4">
                  CONTACT US &<br />
                  SCALE FASTER
                </h3>
              </div>
            </div>

            {/* Bottom Right Card (White Stats) */}
            <div className="col-span-1 lg:col-span-5 bg-white rounded-[2.5rem] p-8 lg:p-10 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-10 w-full">
                <div className="flex items-end gap-5">
                  <span className="text-[64px] md:text-[76px] font-black text-[#111] leading-[0.8] tracking-tighter">
                    4.98
                  </span>
                  <div className="flex flex-col pb-1">
                    <div className="flex gap-1 mb-1.5 text-[#fced44]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-[#999] uppercase">
                      BASED ON 10K+ REVIEWS
                    </span>
                  </div>
                </div>
                {/* Logo icon */}
                <div className="w-10 h-10 -mt-2">
                  <svg viewBox="0 0 24 24" fill="#111">
                    <path d="M11.66 22.84l-9.5-9.5a1 1 0 0 1 0-1.42l9.5-9.5a1 1 0 0 1 1.42 0l4.24 4.24-2.83 2.83-2.83-2.83L4.93 12l6.73 6.73 2.83-2.83 2.83 2.83-4.24 4.24a1 1 0 0 1-1.42 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  "T-SHIRTS",
                  "HOODIES",
                  "O-NECK",
                  "PHONE CASES",
                  "MUGS",
                  "POSTERS",
                ].map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-gray-200 text-[#333] text-[10px] md:text-[11px] font-bold tracking-widest uppercase whitespace-nowrap hover:border-black transition-colors cursor-pointer"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white w-full overflow-hidden">
          <div
            className="flex flex-col lg:flex-row items-stretch w-full"
            style={{ minHeight: "580px" }}
          >
            {/* Left: Illustration Panel */}
            <div className="relative w-full lg:w-1/2 flex items-end justify-center min-h-[420px] lg:min-h-[580px] bg-[#fde8d8] overflow-hidden flex-shrink-0">
              {/* Big decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[420px] h-[420px] rounded-full bg-[#f9d0b8]/60 pointer-events-none" />

              {/* Team illustration image */}
              <img
                src="/u1.jpg"
                alt="Team collaborating"
                className="relative z-10 w-full h-full object-cover object-center absolute inset-0"
                style={{
                  maskImage:
                    "linear-gradient(to top, transparent 2%, black 20%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, transparent 2%, black 20%)",
                }}
              />

              {/* Bottom fade */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fde8d8] to-transparent z-20 pointer-events-none" />
            </div>

            {/* Right: Text Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-16 lg:py-0 flex-shrink-0">
              {/* Pill badge */}
              <div className="inline-flex mb-6">
                <span className="bg-[#fde8d8] text-[#b84c00] font-semibold text-[13px] px-4 py-1.5 rounded-full tracking-wide">
                  Design. Print. Deliver — Zero Hassle
                </span>
              </div>

              {/* Headline */}
              <h2
                className="text-[52px] md:text-[64px] lg:text-[76px] font-black text-[#111] leading-[1.0] tracking-[-0.03em] mb-6"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Create Merch,
                <br />
                Your Way
              </h2>

              {/* Description */}
              <p className="text-[#52525b] text-[17px] md:text-[19px] leading-[1.65] mb-10 max-w-[480px] font-medium">
                Design custom products, pick your print house, and get them
                delivered to your customers worldwide — all from one platform.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <button className="hover-vibrate-trigger bg-[#9DF542] text-[#111] px-8 py-4 rounded-full font-bold text-[16px] flex items-center gap-2 hover:bg-[#88DC2E] transition-all shadow-lg">
                  Get Started for Free
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="hover-vibrate-trigger px-8 py-4 rounded-full font-bold text-[16px] bg-[#111] text-white hover:bg-[#333] transition-all shadow-md">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white overflow-hidden">
        {/* Main footer grid */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-20 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Column 1: Logo + About + Contact */}
            <div className="lg:col-span-4">
              <div className="mb-8">
                <img
                  src="/logo-white.png"
                  alt="Stenvo"
                  className="h-[44px] md:h-[52px] w-auto mb-2 object-contain"
                />
              </div>

              <h4 className="text-[#9DF542] font-bold text-[20px] mb-4">
                About Us
              </h4>
              <p className="text-white text-[16px] leading-[1.8] mb-8 font-medium">
                We want to help bring talented students and unique startups
                together.
              </p>

              <h4 className="text-[#9DF542] font-bold text-[20px] mb-4">
                Contact Us
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-white text-[16px] font-medium">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9DF542"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.74a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  +91 9999 999 999
                </div>
                <div className="flex items-center gap-3 text-white text-[16px] font-medium">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9DF542"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  youremail@id.com
                </div>
              </div>
            </div>

            {/* Column 2: Information */}
            <div className="lg:col-span-2 lg:ml-10">
              <h4 className="text-[#9DF542] font-bold text-[20px] mb-6">
                Information
              </h4>
              <ul className="flex flex-col gap-5">
                {[
                  "About Us",
                  "More Search",
                  "Blog",
                  "Testimonials",
                  "Events",
                ].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white text-[17px] font-medium hover:text-[#9DF542] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Helpful Links */}
            <div className="lg:col-span-2">
              <h4 className="text-[#9DF542] font-bold text-[20px] mb-6">
                Helpful Links
              </h4>
              <ul className="flex flex-col gap-5">
                {[
                  "Services",
                  "Supports",
                  "Terms & Conditions",
                  "Privacy Policy",
                ].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white text-[17px] font-medium hover:text-[#9DF542] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Subscribe */}
            <div className="lg:col-span-4">
              <h4 className="text-white font-bold text-[20px] mb-6">
                Subscribe More Info
              </h4>
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  className="bg-transparent text-[16px] text-[#111] placeholder-gray-500 outline-none flex-1 font-medium"
                />
              </div>
              <button className="hover-vibrate-trigger bg-[#9DF542] text-[#111] font-bold text-[17px] py-3 px-8 rounded-lg hover:bg-[#88DC2E] transition-colors w-max">
                Subscribe
              </button>

              {/* Amazing Design - Trust Badge */}
              <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-5">
                {/* Rotating Stamp */}
                <div className="relative flex items-center justify-center w-[90px] h-[90px]">
                  <svg
                    className="absolute inset-0 w-full h-full animate-spin"
                    style={{ animationDuration: "10s" }}
                    viewBox="0 0 100 100"
                  >
                    <path
                      id="textPath"
                      d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                      fill="none"
                    />
                    <text
                      className="text-[12.5px] font-bold font-mono tracking-[0.16em]"
                      fill="rgba(255,255,255,0.4)"
                    >
                      <textPath href="#textPath" startOffset="0%">
                        • PREMIUM QUALITY • 100% SECURE
                      </textPath>
                    </text>
                  </svg>
                  {/* Center Star */}
                  <div className="text-[#9DF542]">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex flex-col gap-[2px]">
                  <div className="flex gap-[3px] text-[#9DF542]">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <h5 className="text-white font-bold text-[18px] mt-1 tracking-wide">
                    Top Rated Platform
                  </h5>
                  <p className="text-white/50 text-[15px] font-medium">
                    Trusted by 10k+ creators
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-1/3"></div>

            {/* Social Icons (Centered) */}
            <div className="md:w-1/3 flex items-center justify-center gap-4">
              {/* Facebook */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#9DF542] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* Twitter/X (Replaces Google+) */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#9DF542] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#9DF542] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="md:w-1/3 flex justify-end">
              <p className="text-white/70 text-[15px] font-medium">
                2024 © company Ltd. All Right reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
