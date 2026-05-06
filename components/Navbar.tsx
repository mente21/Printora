"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from("profiles").select("role").eq("id", user.id).single().then(({ data }) => {
          if (data) setUserRole(data.role);
        });
      }
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setImgError(false);
      if (currentUser) {
        supabase.from("profiles").select("role").eq("id", currentUser.id).single().then(({ data }) => {
          if (data) setUserRole(data.role);
        });
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full flex justify-center sticky top-1 lg:top-2 z-50 px-4 lg:px-6">
      <header className="w-full max-w-7xl bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/50 rounded-[2rem] h-[76px] lg:h-[84px] flex items-center px-6 lg:px-10 relative">
        <div className="flex-1 flex items-center">
          {/* Logo */}
          {userRole === 'ADMIN' || userRole === 'SUPPLIER' ? (
            <img
              src="/logo.png"
              alt="Stenvo Logo"
              className="h-[56px] md:h-[68px] w-auto object-contain relative z-10 -ml-1"
            />
          ) : (
            <Link href="/">
              <img
                src="/logo.png"
                alt="Stenvo Logo"
                className="h-[56px] md:h-[68px] w-auto cursor-pointer object-contain relative z-10 -ml-1 transition-transform hover:scale-105"
              />
            </Link>
          )}
        </div>

        {/* Centered Nav - Floating Style */}
        <nav className="hidden lg:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
          <Link 
            href="/before-you-start" 
            className="px-6 py-2 text-[16px] font-black text-[#1B2412] rounded-full transition-all duration-300 ease-out hover:bg-[#A1FF4D] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_10px_20px_rgba(161,255,77,0.3)] whitespace-nowrap active:scale-95"
          >
            Before You Start
          </Link>
          <Link 
            href="/inspiration" 
            className="px-6 py-2 text-[16px] font-black text-[#1B2412] rounded-full transition-all duration-300 ease-out hover:bg-[#A1FF4D] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_10px_20px_rgba(161,255,77,0.3)] whitespace-nowrap active:scale-95"
          >
            Inspiration
          </Link>
          <Link 
            href="/how-it-works" 
            className="px-6 py-2 text-[16px] font-black text-[#1B2412] rounded-full transition-all duration-300 ease-out hover:bg-[#A1FF4D] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_10px_20px_rgba(161,255,77,0.3)] whitespace-nowrap active:scale-95"
          >
            How it works
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
                {(user.user_metadata?.avatar_url && !imgError) ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    onError={() => setImgError(true)}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#A1FF4D]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#A1FF4D] flex items-center justify-center text-[#1B2412] font-black text-sm uppercase">
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[14px] font-bold text-[#1B2412] max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>

              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-[#1B2412] truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-2">
                    {userRole === "ADMIN" && (
                      <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                        <ShoppingBag size={15} /> Admin Panel
                      </Link>
                    )}
                    {userRole === "SUPPLIER" && (
                      <Link href="/supplier" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                        <ShoppingBag size={15} /> Supplier Panel
                      </Link>
                    )}
                    {userRole === "CUSTOMER" && (
                      <Link href="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                        <ShoppingBag size={15} /> Orders
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                      <UserIcon size={15} /> Profile Settings
                    </Link>
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
              <Link href="/login" className="flex items-center justify-center rounded-md px-6 h-11 text-[16px] font-extrabold tracking-wide text-[#1B2412] bg-white border border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-gray-50 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center rounded-xl px-8 h-12 text-[16px] font-black tracking-tight transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_25px_rgba(161,255,77,0.4)] active:scale-95"
                style={{ backgroundColor: '#A1FF4D', color: '#1B2412' }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
