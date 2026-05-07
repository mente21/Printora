"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // If not logged in
        if (!session) {
          if (pathname.startsWith('/admin') || pathname.startsWith('/supplier')) {
            router.replace('/login');
          }
          if (mounted) setIsChecking(false);
          return;
        }

        // We are on auth callback, allow it to process the role choice
        if (pathname.startsWith('/auth/callback')) {
          if (mounted) setIsChecking(false);
          return;
        }

        // If logged in, fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role || 'CUSTOMER';

        // 🔒 Protected Routes Logic
        if (role === 'ADMIN') {
          // Admins can go anywhere EXCEPT the supplier panel
          if (pathname.startsWith('/supplier')) {
            router.replace('/admin');
          } else {
            if (mounted) setIsChecking(false);
          }
        } else if (role === 'SUPPLIER') {
          // Suppliers are restricted to their panel and profile
          const isAllowedPath = pathname.startsWith('/supplier') || pathname.startsWith('/profile') || pathname.startsWith('/auth');
          
          if (!isAllowedPath || pathname === '/') {
            router.replace('/supplier');
          } else {
            if (mounted) setIsChecking(false);
          }
        } else {
          // CUSTOMERS cannot see admin or supplier panels
          if (pathname.startsWith('/admin') || pathname.startsWith('/supplier')) {
            router.replace('/');
          } else if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
            router.replace('/');
          } else {
            if (mounted) setIsChecking(false);
          }
        }

      } catch (e) {
        console.error("Auth check error:", e);
        if (mounted) setIsChecking(false);
      }
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
         checkAuthAndRole();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Block render while checking on restricted routes to avoid flash
  if (isChecking && (pathname.startsWith('/admin') || pathname.startsWith('/supplier'))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f3e7]">
           <div className="w-8 h-8 border-4 border-[#A1FF4C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  return <>{children}</>;
}
