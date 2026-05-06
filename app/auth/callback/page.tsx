"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, ShoppingBag, Loader2, CheckCircle } from "lucide-react";

type Role = "CUSTOMER" | "SUPPLIER";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [step, setStep] = useState<"loading" | "pick-role" | "saving" | "done">("loading");
    const [selectedRole, setSelectedRole] = useState<Role>("CUSTOMER");
    const [user, setUser] = useState<any>(null);
    const [phone_number, setPhoneNumber] = useState("");
    const [location, setLocation] = useState("");
    const [company_name, setCompanyName] = useState("");
    const [error, setError] = useState("");

    const redirectByRole = (role: string) => {
        if (role === "ADMIN") router.push("/admin");
        else if (role === "SUPPLIER") router.push("/supplier");
        else router.push("/");
    };

    useEffect(() => {
        let handled = false;

        const handleUser = async (sessionUser: any) => {
            if (handled) return;
            handled = true;
            setUser(sessionUser);

            // Check if a profile already exists for this user
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id, role")
                .eq("id", sessionUser.id)
                .single();

            if (existingProfile) {
                // Already registered — route directly
                redirectByRole(existingProfile.role);
            } else {
                // Brand new user — ask for role
                setStep("pick-role");
            }
        };

        // 1. Listen for auth state (fires after OAuth hash is parsed by Supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
                    await handleUser(session.user);
                }
            }
        );

        // 2. Also check synchronously in case session is already ready
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                handleUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRoleSelect = async () => {
        if (!user) return;
        setStep("saving");

        const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

        const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: selectedRole,
            avatar_url: user.user_metadata?.avatar_url || null,
            phone_number: phone_number,
            location: location,
            company_name: selectedRole === "SUPPLIER" ? company_name : null,
        });

        if (insertError) {
            // If duplicate (user already exists), just read and redirect
            if (insertError.code === "23505") {
                const { data: prof } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                redirectByRole(prof?.role || "CUSTOMER");
                return;
            }
            setError("Failed to save profile: " + insertError.message);
            setStep("pick-role");
            return;
        }

        setStep("done");
        setTimeout(() => redirectByRole(selectedRole), 800);
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (step === "loading") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f3e7] gap-4">
                <Loader2 size={48} className="animate-spin text-[#A1FF4D]" />
                <p className="text-[#2B3220] font-bold text-lg">Setting up your account…</p>
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f3e7] gap-4 px-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-sm">
                    <p className="text-red-500 font-bold text-sm mb-4">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-[#2B3220] text-white px-6 py-3 rounded-xl font-bold text-sm"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // ── Done state ─────────────────────────────────────────────────────────────
    if (step === "done") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f3e7] gap-4">
                <div className="w-20 h-20 rounded-full bg-[#A1FF4D] flex items-center justify-center animate-bounce">
                    <CheckCircle size={40} className="text-[#1B2412]" />
                </div>
                <p className="text-[#2B3220] font-black text-2xl">You're all set!</p>
                <p className="text-gray-500 text-sm font-medium">Redirecting you now…</p>
            </div>
        );
    }

    // ── Role picker ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f3e7] px-6 font-sans">
            <div className="w-full max-w-md">
                {/* Greeting */}
                <div className="text-center mb-10">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto mx-auto mb-6 object-contain" />
                    <h1
                        className="text-[42px] font-black uppercase text-[#2B3118] tracking-tight leading-none"
                        style={{ fontFamily: "Impact, sans-serif" }}
                    >
                        One Last Step
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-3">
                        Hi <strong>{user?.user_metadata?.given_name || user?.user_metadata?.name?.split(" ")[0] || "there"}</strong>! How will you use Stenvo?
                    </p>
                </div>

                {/* Role cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Customer */}
                    <button
                        onClick={() => setSelectedRole("CUSTOMER")}
                        className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 ${selectedRole === "CUSTOMER"
                                ? "border-[#A1FF4C] bg-[#A1FF4C]/10 shadow-xl shadow-[#A1FF4C]/20"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                            }`}
                    >
                        {selectedRole === "CUSTOMER" && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A1FF4C] flex items-center justify-center">
                                <CheckCircle size={14} className="text-[#1B2412]" />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === "CUSTOMER" ? "bg-[#A1FF4C] text-[#1B2412]" : "bg-gray-100 text-gray-500"
                            }`}>
                            <User size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-[#2B3220] text-base">Customer</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Design & order custom products</p>
                        </div>
                    </button>

                    {/* Supplier */}
                    <button
                        onClick={() => setSelectedRole("SUPPLIER")}
                        className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 ${selectedRole === "SUPPLIER"
                                ? "border-[#A1FF4C] bg-[#A1FF4C]/10 shadow-xl shadow-[#A1FF4C]/20"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                            }`}
                    >
                        {selectedRole === "SUPPLIER" && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#A1FF4C] flex items-center justify-center">
                                <CheckCircle size={14} className="text-[#1B2412]" />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${selectedRole === "SUPPLIER" ? "bg-[#A1FF4C] text-[#1B2412]" : "bg-gray-100 text-gray-500"
                            }`}>
                            <ShoppingBag size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-[#2B3220] text-base">Supplier</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">List products & fulfill orders</p>
                        </div>
                    </button>
                </div>

                {/* Additional Info Fields */}
                <div className="space-y-4 mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                        <input
                            type="tel"
                            value={phone_number}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A1FF4D] transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            {selectedRole === "SUPPLIER" ? "Production Facility Location" : "Primary Shipping Location"}
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="123 Output St, City, Country"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A1FF4D] transition-all"
                            required
                        />
                    </div>
                    {selectedRole === "SUPPLIER" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Supplier Company Name</label>
                            <input
                                type="text"
                                value={company_name}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="My Print Shop LLC"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A1FF4D] transition-all"
                                required={selectedRole === "SUPPLIER"}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleRoleSelect}
                    disabled={step === "saving" || !phone_number || !location || (selectedRole === "SUPPLIER" && !company_name)}
                    className="w-full bg-[#A1FF4C] hover:bg-[#8ee53f] text-[#1B2412] py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-[#A1FF4C]/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {step === "saving" ? (
                        <><Loader2 size={20} className="animate-spin" /> Saving…</>
                    ) : (
                        <>Continue as {selectedRole === "CUSTOMER" ? "Customer" : "Supplier"} →</>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400 font-medium mt-4">
                    You can always contact support to change your role later
                </p>
            </div>
        </div>
    );
}
