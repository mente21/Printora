"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
    Clock, CheckCircle, Truck, XCircle, PenTool,
    Package, ArrowRight, Loader2, LogOut, Home,
    Sparkles, ShieldCheck, User, Star, ShoppingBag,
    AlertCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Menu,
    UploadCloud
} from "lucide-react";
import { getPrimaryMockup } from "@/lib/utils";

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    description: string;
    step: number;
}> = {
    PENDING_ADMIN: {
        label: "Awaiting Review",
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        description: "Your design has been submitted and is waiting for admin review.",
        step: 1,
    },
    ASSIGNED_TO_SUPPLIER: {
        label: "Admin Approved",
        icon: ShieldCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        description: "Admin has approved your design. A supplier is now preparing your order.",
        step: 2,
    },
    SAMPLE_AWAITING_APPROVAL: {
        label: "Sample Ready",
        icon: Package,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        description: "The supplier has finished the sample. Please review it below.",
        step: 2,
    },
    SAMPLE_REJECTED: {
        label: "Sample Rejected",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        description: "You've requested changes to the sample. The supplier is updating it.",
        step: 2,
    },
    FINAL_PAYMENT_PENDING: {
        label: "Verifying Payment",
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        description: "Your receipt has been submitted. Waiting for admin to verify the final payment.",
        step: 3,
    },
    PRODUCTION_APPROVED_AND_PAID: {
        label: "In Production",
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        description: "Payment verified! The supplier has been notified to start full-scale production.",
        step: 3,
    },
    COMPLETED_BY_SUPPLIER: {
        label: "Ready for Delivery",
        icon: CheckCircle,
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200",
        description: "The supplier has completed production! Your order is ready and waiting for delivery confirmation.",
        step: 3,
    },
    COMPLETED: {
        label: "Ready for Delivery",
        icon: CheckCircle,
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200",
        description: "Your order is complete and ready for delivery. The admin will confirm once it has been handed to you.",
        step: 3,
    },
    DELIVERED: {
        label: "Delivered",
        icon: Truck,
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200",
        description: "Your order has been delivered! Please share your feedback.",
        step: 4,
    },
    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        description: "Unfortunately, this design could not be approved. Please redesign.",
        step: 0,
    },
};

const STEPS = [
    { id: 1, label: "Design Submitted", icon: PenTool },
    { id: 2, label: "Admin Review", icon: ShieldCheck },
    { id: 3, label: "In Production", icon: Package },
    { id: 4, label: "Delivered", icon: Truck },
];

function OrdersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const justSubmitted = searchParams.get("submitted") === "true";

    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(justSubmitted);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    useEffect(() => {
        initPage();
        // Hide the success banner after 5 seconds
        if (justSubmitted) {
            const t = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(t);
        }
    }, []);

    const initPage = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data: prof } = await supabase
            .from("profiles").select("*").eq("id", user.id).single();

        // Profile is loaded, proceed
        setProfile(prof);

        const { data: ordersData } = await supabase
            .from("custom_orders")
            .select("*, supplier_product:supplier_products(price)")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

        setOrders(ordersData || []);
        setLoading(false);

        // Update selectedOrder if it exists to reflect latest changes
        if (selectedOrder) {
            const updated = (ordersData || []).find(o => o.id === selectedOrder.id);
            console.log("Updated selected order found:", updated);
            if (updated) setSelectedOrder(updated);
        }

        // Auto-select the most recent order if just submitted
        if (justSubmitted && ordersData && ordersData.length > 0) {
            setSelectedOrder(ordersData[0]);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
                <Loader2 size={44} className="animate-spin text-[#A1FF4D]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans">
            {/* Top Nav */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity" />
                        </Link>
                        <div className="hidden sm:block w-px h-5 bg-gray-200" />
                        <span className="hidden sm:block text-[11px] font-black text-gray-400 uppercase tracking-widest">My Orders</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {profile && (
                            <div className="flex items-center gap-2.5 bg-gray-50 rounded-full px-3 py-1.5">
                                <div className="w-7 h-7 rounded-full bg-[#A1FF4D] flex items-center justify-center text-[#1B2412] font-black text-xs">
                                    {profile.full_name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <span className="text-[12px] font-bold text-[#1B2412] hidden sm:block max-w-[100px] truncate">
                                    {profile.full_name}
                                </span>
                            </div>
                        )}
                        <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors p-2">
                            <Home size={18} />
                        </Link>

                        <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 lg:px-6 py-10">
                {/* Success Banner */}
                {showSuccess && (
                    <div className="mb-8 bg-[#A1FF4D] rounded-3xl p-4 lg:p-6 flex items-center gap-3 lg:gap-5 shadow-lg shadow-[#A1FF4D]/20 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Sparkles size={28} className="text-[#1B2412]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[#1B2412] font-black text-xl">Design Submitted Successfully! 🎉</h2>
                            <p className="text-[#2B3220]/80 font-medium text-sm mt-0.5">
                                Your order is now in the review queue. We'll notify you once it's approved and sent to production.
                            </p>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="text-[#1B2412]/50 hover:text-[#1B2412] transition-colors flex-shrink-0">
                            <XCircle size={20} />
                        </button>
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-3xl lg:text-4xl font-black text-[#111] uppercase tracking-widest" style={{ fontFamily: "Impact, sans-serif" }}>
                        My Orders
                    </h1>
                    <p className="text-gray-500 font-medium text-xs lg:text-sm mt-1">
                        Track all your custom designs from submission to delivery.
                    </p>
                </div>

                {orders.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                            <Package size={44} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-[#111] mb-2">No orders yet</h2>
                        <p className="text-gray-500 font-medium max-w-sm mb-8">
                            Design your first custom product and it will appear here for you to track.
                        </p>
                        <Link
                            href="/products"
                            className="bg-[#A1FF4D] text-[#1B2412] px-8 py-4 rounded-2xl font-black text-base hover:bg-[#8ee53f] hover:shadow-xl hover:shadow-[#A1FF4D]/20 transition-all flex items-center gap-2"
                        >
                            <ShoppingBag size={18} /> Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* ── Sidebar ── */}
                        <div
                            className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
                                !selectedOrder
                                    ? "w-full lg:max-w-lg"          /* no order selected — full width list */
                                    : sidebarExpanded
                                        ? "w-full lg:w-72"                  /* expanded sidebar */
                                        : "hidden lg:block lg:w-[88px]"              /* collapsed icon-rail (hide on mobile if order selected) */
                            } ${selectedOrder ? "hidden lg:block" : "block"}`}
                        >
                            {/* ── Sidebar header ── */}
                            <div className="flex items-center justify-between mb-3">
                                {/* Title — hide when icon-rail */}
                                <p className={`text-[11px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300 overflow-hidden whitespace-nowrap ${
                                    selectedOrder && !sidebarExpanded ? "w-0 opacity-0" : "opacity-100"
                                }`}>
                                    {orders.length} Order{orders.length !== 1 ? "s" : ""}
                                </p>


                                {/* Toggle button — only visible when an order is selected */}
                                {selectedOrder && (
                                    <button
                                        onClick={() => setSidebarExpanded(prev => !prev)}
                                        title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                                        className={`flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-gray-100 text-gray-400 hover:border-[#A1FF4D] hover:text-[#2B3220] hover:bg-[#A1FF4D]/10 transition-all shadow-sm ${
                                            !sidebarExpanded ? "mx-auto" : "ml-auto"
                                        }`}
                                    >
                                        {sidebarExpanded
                                            ? <ChevronLeft size={15} />
                                            : <Menu size={15} />}
                                    </button>
                                )}
                            </div>

                            {/* ── Order cards ── */}
                            <div className="space-y-2">
                                {orders.map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_ADMIN;
                                    const Icon = cfg.icon;
                                    const isSelected = selectedOrder?.id === order.id;
                                    const compact = selectedOrder && !sidebarExpanded;
                                    return (
                                        <button
                                            key={order.id}
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setSidebarExpanded(false);
                                            }}
                                            title={order.product_type}
                                            className={`w-full text-left rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
                                                isSelected
                                                    ? "border-[#A1FF4D] bg-white shadow-xl"
                                                    : "border-gray-100 bg-white hover:border-gray-200"
                                            } ${compact ? "p-2" : "p-4"}`}
                                        >
                                            {compact ? (
                                                /* Icon-rail mode — thumbnail + status dot */
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                                                        {getPrimaryMockup(order)
                                                            ? <img src={getPrimaryMockup(order)!} className="w-full h-full object-contain p-0.5" alt="Design" />
                                                            : <Package size={18} className="text-gray-300" />}
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-[#A1FF4D]" : "bg-gray-200"}`} />
                                                </div>
                                            ) : (
                                                /* Full card mode */
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                        {getPrimaryMockup(order)
                                                            ? <img src={getPrimaryMockup(order)!} className="w-full h-full object-contain p-0.5" alt="Design" />
                                                            : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={20} /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-[#111] text-sm truncate">{order.product_type}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold truncate">{order.variants?.color} • {order.variants?.view}</p>
                                                        <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                                            <Icon size={9} />{cfg.label}
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={14} className={`flex-shrink-0 transition-colors ${isSelected ? "text-[#A1FF4D]" : "text-gray-200"}`} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                                {/* New Design — icon only in rail mode */}
                                <Link
                                    href="/editor"
                                    title="New Design"
                                    className={`flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#A1FF4D] hover:text-[#2B3220] hover:bg-[#A1FF4D]/5 transition-all font-bold text-sm ${
                                        selectedOrder && !sidebarExpanded ? "p-3" : "p-4"
                                    }`}
                                >
                                    <PenTool size={14} />
                                    {!(selectedOrder && !sidebarExpanded) && <span>New Design</span>}
                                </Link>
                            </div>

                        </div>

                        {/* ── Order Detail panel ── */}
                        <div
                            className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${
                                selectedOrder
                                    ? "opacity-100 translate-x-0"
                                    : "opacity-0 pointer-events-none translate-x-8"
                            }`}
                        >
                            {selectedOrder
                                ? (
                                    <div className="flex flex-col gap-4">
                                        <button 
                                            onClick={() => setSelectedOrder(null)}
                                            className="lg:hidden flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-[#111] transition-colors mb-2 w-fit px-4 py-2 bg-white border border-gray-100 rounded-full"
                                        >
                                            <ChevronLeft size={14} /> Back to Orders
                                        </button>
                                        <OrderDetail order={selectedOrder} onRefresh={initPage} />
                                    </div>
                                )
                                : null}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function OrderDetail({ order, onRefresh }: { order: any, onRefresh: () => Promise<void> }) {
    const [finalReceipt, setFinalReceipt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [declineMessage, setDeclineMessage] = useState("");
    const [rating, setRating] = useState(order.variants?.customer_rating || 0);
    const [feedback, setFeedback] = useState(order.variants?.customer_feedback || "");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [activeAction, setActiveAction] = useState<'none' | 'approve' | 'decline'>('none');
    const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Sync local state when the order prop changes (e.g. after refresh)
    useEffect(() => {
        setRating(order.variants?.customer_rating || 0);
        setFeedback(order.variants?.customer_feedback || "");
        setActiveAction('none');
    }, [order.id, order.variants]);

    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_ADMIN;
    const Icon = cfg.icon;
    const currentStep = cfg.step;

    // Build the edit link: map product_type → template ID
    const PRODUCT_TYPE_MAP: Record<string, string> = {
        'Classic T-Shirt': 'classic-tshirt',
        'Premium Hoodie': 'premium-hoodie',
        'Crewneck Sweater': 'crewneck-sweater',
        'Classic Cap': 'classic-cap',
    };
    const templateId = PRODUCT_TYPE_MAP[order.product_type] || 'classic-tshirt';
    const editUrl = `/editor?edit_order=${order.id}&template=${templateId}`;

    return (
        <div className="bg-white rounded-2xl lg:rounded-[3.5rem] border border-gray-100/50 overflow-hidden shadow-2xl shadow-black/5 ring-1 ring-black/[0.02] relative">

            {/* ── Lightbox Overlay ── */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                    style={{ backgroundColor: 'rgba(180,185,195,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', animation: 'lb-fade-in 0.25s ease' }}
                    onClick={() => setLightbox(null)}
                >
                    <style>{`
                        @keyframes lb-fade-in { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes lb-scale-in { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
                    `}</style>

                    {/* Close button */}
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-md transition-all"
                    >
                        <XCircle size={20} />
                    </button>

                    {/* Image card */}
                    <div
                        className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-[90vw] max-h-[88vh] flex flex-col"
                        style={{ animation: 'lb-scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Label bar */}
                        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-[#fafafa]">
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#1B2412]">{lightbox.label}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Design Preview</span>
                        </div>
                        <div className="p-8 flex items-center justify-center" style={{ minWidth: 320, minHeight: 320 }}>
                            <img
                                src={lightbox.src}
                                alt={lightbox.label}
                                className="object-contain mix-blend-multiply"
                                style={{ maxWidth: '75vw', maxHeight: '72vh' }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Status Header */}
            <div className={`p-6 lg:p-8 ${cfg.bg} border-b ${cfg.border}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shadow-inner flex-shrink-0`}>
                        <Icon size={22} className={cfg.color} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] lg:tracking-[0.2em]">Current Status</p>
                        <h3 className={`text-xl lg:text-2xl font-black ${cfg.color} uppercase tracking-wider truncate`} style={{ fontFamily: 'Impact, sans-serif' }}>{cfg.label}</h3>
                    </div>
                    <div className="ml-auto text-right flex-shrink-0">
                        <p className="text-[8px] lg:text-[9px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                        <p className="text-[10px] lg:text-xs font-black text-gray-600 font-mono bg-white px-2 lg:px-3 py-1 rounded-full border border-gray-100">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 font-bold mt-4 leading-relaxed max-w-2xl">{cfg.description}</p>
                {order.status === "REJECTED" && order.variants?.admin_rejection_reason && (
                    <div className="mt-4 bg-red-100/50 p-4 rounded-xl border border-red-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Reason for Rejection</p>
                        <p className="font-bold text-sm text-red-800 italic">"{order.variants.admin_rejection_reason}"</p>
                    </div>
                )}
            </div>

            {/* Progress Stepper */}
            {order.status !== "REJECTED" && (
                <div className="px-6 lg:px-8 py-6 border-b border-gray-50 bg-[#fafafa]/50 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center justify-between gap-8 min-w-[500px] lg:min-w-0 lg:gap-4">
                        {STEPS.map((step, idx) => {
                            const done = currentStep >= step.id;
                            const active = currentStep + 1 === step.id;
                            const StepIcon = step.icon;
                            return (
                                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done
                                                ? "bg-[#A1FF4D] text-[#1B2412] shadow-lg shadow-[#A1FF4D]/20"
                                                : active
                                                    ? "bg-white border-2 border-[#A1FF4D] text-[#A1FF4D] scale-110"
                                                    : "bg-gray-100 text-gray-300"
                                            }`}>
                                            {done ? <CheckCircle size={18} /> : <StepIcon size={16} />}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest text-center whitespace-nowrap ${done ? "text-[#2B3220]" : active ? "text-[#A1FF4D]" : "text-gray-400"}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-4 -mt-6 transition-all ${currentStep > step.id ? "bg-[#A1FF4D]" : "bg-gray-100"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="p-3 lg:p-6 space-y-6">
                {/* 2-Column Balanced Layout — Gallery & Details Stack */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                    {/* Mockup Gallery */}
                    <div className="bg-[#fafafa] rounded-3xl p-3 border border-gray-100 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between px-3 pt-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Design Views</p>
                            {order.design_views && order.design_views.length > 1 && (
                                <span className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-md shadow-sm">{order.design_views.length} Angles</span>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 flex-1">
                            {(() => {
                                // Gather all unique views up to 4
                                const allViews = [];
                                const primary = getPrimaryMockup(order);
                                if (primary) {
                                    allViews.push({ mockup_url: primary, viewName: 'Primary View' });
                                }
                                if (order.design_views) {
                                    const others = order.design_views.filter((v: any) => v.mockup_url !== primary);
                                    allViews.push(...others);
                                }
                                
                                // Ensure exactly 4 items for 2x2 grid if we have them, else just render what we have nicely
                                return allViews.slice(0, 4).map((view, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-2 relative group overflow-hidden cursor-zoom-in min-h-[180px] lg:min-h-[220px]"
                                        onClick={() => setLightbox({ src: view.mockup_url, label: view.viewName })}
                                    >
                                        <img 
                                            src={view.mockup_url} 
                                            alt={view.viewName} 
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 scale-[1.2]" 
                                        />
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm text-[#111] text-[9px] font-black px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none uppercase tracking-wider">
                                            {view.viewName}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* ── Details Stack (Specs + Financial) ── */}
                    <div className="flex flex-col gap-4">
                        {/* ── Specifications Card ── */}
                        <div className="group/spec relative bg-white rounded-3xl border border-gray-100 p-3 lg:p-5 flex flex-col gap-3 overflow-hidden
                            hover:border-gray-200 hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.10)] transition-all duration-500 ease-out flex-1">


                            <style>{`
                                /* Radial spotlight bloom from top-right corner */
                                @keyframes spotlightReveal {
                                    from { opacity: 0; transform: scale(0.3); }
                                    to   { opacity: 1; transform: scale(1); }
                                }
                                /* Left accent bar sweeps in per row */
                                @keyframes accentBarIn {
                                    from { transform: scaleY(0); opacity: 0; }
                                    to   { transform: scaleY(1); opacity: 1; }
                                }
                                /* Row glide right */
                                @keyframes rowGlide {
                                    from { transform: translateX(-6px); opacity: 0.4; }
                                    to   { transform: translateX(0);    opacity: 1; }
                                }
                                .spec-row-accent {
                                    transform-origin: center;
                                    transform: scaleY(0);
                                    opacity: 0;
                                    transition: none;
                                }
                                .group\/spec:hover .spec-row-accent {
                                    animation: accentBarIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
                                }
                                .spec-row-accent.delay-0 { animation-delay: 0ms; }
                                .spec-row-accent.delay-1 { animation-delay: 60ms; }
                                .spec-row-accent.delay-2 { animation-delay: 120ms; }
                                .spec-row-accent.delay-3 { animation-delay: 180ms; }

                                .spec-row-inner {
                                    transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
                                }
                                .spec-row-inner.delay-0 { transition-delay: 0ms; }
                                .spec-row-inner.delay-1 { transition-delay: 40ms; }
                                .spec-row-inner.delay-2 { transition-delay: 80ms; }
                                .spec-row-inner.delay-3 { transition-delay: 120ms; }
                                .group\/spec:hover .spec-row-inner { transform: translateX(6px); }

                                .spec-spotlight {
                                    opacity: 0;
                                    transform: scale(0.3);
                                    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
                                }
                                .group\/spec:hover .spec-spotlight {
                                    opacity: 1;
                                    transform: scale(1);
                                }
                                .spec-icon-wrap {
                                    transition: background 0.4s ease, border-color 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
                                }
                                .group\/spec:hover .spec-icon-wrap {
                                    background: #111;
                                    border-color: #111;
                                    transform: rotate(12deg) scale(1.1);
                                    box-shadow: 0 8px 24px -4px rgba(0,0,0,0.3);
                                }
                                .spec-icon {
                                    transition: color 0.4s ease;
                                }
                                .group\/spec:hover .spec-icon { color: #A1FF4D; }

                                .spec-label {
                                    transition: color 0.3s ease, letter-spacing 0.3s ease;
                                }
                                .group\/spec:hover .spec-label {
                                    color: #555;
                                    letter-spacing: 0.15em;
                                }
                            `}</style>

                            {/* Radial spotlight — blooms from top-right on hover */}
                            <div
                                className="spec-spotlight absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(161,255,77,0.18) 0%, transparent 70%)' }}
                            />

                            {/* Card header */}
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Product Details</p>
                                    <h4 className="text-base lg:text-xl font-black text-[#111] leading-tight tracking-tighter">
                                        {order.product_type}
                                    </h4>
                                </div>
                                {/* Corner icon — rotates + scales on hover */}
                                <div className="spec-icon-wrap w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                    <Package size={16} className="spec-icon text-gray-300" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-gray-100 relative z-10" />

                            {/* Spec rows */}
                            <div className="space-y-0 flex-1 relative z-10">
                                {[
                                    { label: 'Color', value: order.variants?.color || 'N/A', swatch: order.variants?.color },
                                    { label: 'Size', value: order.variants?.size || 'N/A' },
                                    { label: 'Base View', value: order.variants?.view || 'Front' },
                                    { label: 'Quantity', value: `${order.variants?.quantity || 1} units`, highlight: true },
                                    ...(order.delivery_location ? [{ label: 'Delivery', value: order.delivery_location }] : []),
                                ].map((row, i) => (
                                    <div key={i} className="relative flex items-center justify-between py-1.5 lg:py-2.5 pl-3">
                                        {/* Glowing left accent bar */}
                                        <div
                                            className={`spec-row-accent delay-${i} absolute left-0 top-1 bottom-1 w-[3px] rounded-full`}
                                            style={{ background: 'linear-gradient(to bottom, #A1FF4D, #5fdb3a)' }}
                                        />
                                        {/* Gliding content */}
                                        <div className={`spec-row-inner delay-${i} flex items-center justify-between w-full`}>
                                            <span className="spec-label text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.label}</span>
                                            <div className="flex items-center gap-2">
                                                {row.swatch && (
                                                    <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm"
                                                        style={{ backgroundColor: row.swatch.toLowerCase() }} />
                                                )}
                                                <span className={`text-xs font-black tracking-tight transition-all duration-500 ${row.highlight
                                                    ? 'bg-[#111] text-white px-2.5 lg:px-3 py-1 rounded-full group-hover/spec:bg-[#A1FF4D] group-hover/spec:text-[#111] group-hover/spec:shadow-[0_0_16px_rgba(161,255,77,0.5)]'
                                                    : 'text-[#111]'
                                                }`}>{row.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* ── Financial Card ── */}
                        <div className="group/fin relative bg-gradient-to-br from-[#0c1a12] to-[#122618] rounded-3xl p-3 lg:p-5 flex flex-col gap-3 overflow-hidden
                            hover:shadow-[0_24px_64px_-12px_rgba(161,255,77,0.2)] hover:-translate-y-1 transition-all duration-500 ease-out flex-1 border border-[#1b3624]">

                            {/* Sweeping shimmer on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover/fin:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                                <div className="absolute top-0 -left-full w-[60%] h-full"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(161,255,77,0.06), transparent)',
                                        animation: 'shimmerSlide 1.2s ease forwards',
                                    }}
                                />
                            </div>

                            {/* Card header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-[#8ec8a2] uppercase tracking-[0.3em] mb-1">Order Total</p>
                                    <p className="text-2xl lg:text-3xl font-black text-white leading-none tracking-tighter">
                                        {(() => { const b = order.supplier_product?.price || 600; return (b * (order.variants?.quantity || 1)).toLocaleString(); })()}
                                        <span className="text-sm lg:text-base font-bold text-[#8ec8a2] ml-1.5">ETB</span>
                                    </p>
                                </div>
                                {/* Live dot */}
                                <div className="flex flex-col items-center gap-1 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-[#3b7a51] group-hover/fin:bg-[#A1FF4D] transition-colors duration-500 group-hover/fin:shadow-[0_0_12px_rgba(161,255,77,0.7)]" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-[#1d3d28] transition-colors duration-500" />

                            {/* Breakdown rows */}
                            <div className="space-y-2.5 flex-1">
                                {/* Deposit */}
                                <div className="flex items-center justify-between rounded-2xl px-3 lg:px-4 py-3 bg-[#162d1d] border border-[#1e3b26]
                                    hover:bg-[#193622] hover:border-[#25462e] transition-all duration-300 group/row">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg bg-[#1e3b26] flex items-center justify-center group-hover/row:bg-[#25462e] transition-colors duration-300">
                                            <CheckCircle size={12} className="text-[#A1FF4D] opacity-90 group-hover/row:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] lg:text-[10px] font-black text-[#A1FF4D] uppercase tracking-widest">Deposit Paid</p>
                                            <p className="text-sm lg:text-base font-black text-white mt-0.5">
                                                {(() => { const b = order.supplier_product?.price || 600; return (b * (order.variants?.quantity || 1) / 2).toLocaleString(); })()} <span className="text-[10px] lg:text-[11px] font-bold text-[#A1FF4D]">ETB</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border border-[#25462e] flex items-center justify-center bg-[#193622]">
                                        <span className="text-[#A1FF4D] text-[10px]">✓</span>
                                    </div>
                                </div>

                                {/* Balance Due / Paid */}
                                <div className="flex items-center justify-between rounded-2xl px-3 lg:px-4 py-3 bg-[#162d1d] border border-[#1e3b26]
                                    hover:bg-[#193622] hover:border-[#25462e] transition-all duration-300 group/row2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-lg flex items-center justify-center transition-colors duration-300 ${['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'bg-[#A1FF4D]/20' : 'bg-[#1e3b26] group-hover/row2:bg-[#25462e]'}`}>
                                            {['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? (
                                                <CheckCircle size={12} className="text-[#A1FF4D]" />
                                            ) : order.status === 'FINAL_PAYMENT_PENDING' ? (
                                                <Loader2 size={12} className="text-amber-400 animate-spin" />
                                            ) : (
                                                <span className="text-[#8ec8a2] text-[10px] group-hover/row2:text-white transition-colors duration-300">→</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'text-[#A1FF4D]' : 'text-[#8ec8a2]'}`}>
                                                {['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'Balance Paid' : order.status === 'FINAL_PAYMENT_PENDING' ? 'Verifying Payment' : 'Balance Due'}
                                            </p>
                                            <p className="text-sm lg:text-base font-black text-white mt-0.5 group-hover/fin:text-[#A1FF4D] transition-colors duration-500">
                                                {(() => { const b = order.supplier_product?.price || 600; return (b * (order.variants?.quantity || 1) / 2).toLocaleString(); })()} <span className="text-[10px] lg:text-[11px] font-bold text-[#8ec8a2] group-hover/fin:text-[#A1FF4D]/70 transition-colors duration-500">ETB</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border border-[#25462e] flex items-center justify-center bg-[#193622]">
                                        <span className={`text-[10px] ${['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? 'text-[#A1FF4D]' : 'text-[#8ec8a2]'}`}>
                                            {['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED', 'COMPLETED'].includes(order.status) ? '✓' : '→'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full-Width Action Section */}
                <div className="pt-8">
                    {/* Supplier proof & Approval Logic */}
                    {order.supplier_proof_image_url && (
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl lg:rounded-[3rem] p-5 lg:p-10 shadow-sm relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                {/* Proof Image Container */}
                                <div className="w-full sm:w-48 flex-shrink-0 group">
                                    <div className="relative rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                                        <img src={order.supplier_proof_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Proof" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={order.supplier_proof_image_url}
                                                download={`proof-${order.id.slice(0,8)}.jpg`}
                                                className="bg-white text-[#1B2412] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-110 transition-all flex items-center gap-2"
                                            >
                                                Download Proof
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Content and Actions */}
                                <div className="flex-1 flex flex-col justify-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                                            Sample Review
                                        </div>
                                        <p className="text-sm font-bold text-emerald-800/80">Inspect color, placement &amp; finish before approving the full batch.</p>
                                    </div>

                                    {!order.variants?.finalReceiptUrl ? (
                                        <div className="space-y-6">
                                            {order.variants?.finalReceiptRejected && (
                                                <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-4 lg:p-6 mb-4 animate-in fade-in slide-in-from-top-4">
                                                    <div className="flex items-center gap-3 mb-2 text-red-600">
                                                        <AlertCircle size={20} />
                                                        <p className="text-sm font-black uppercase tracking-widest">Payment Receipt Rejected</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-red-500 leading-relaxed italic">
                                                        "{order.variants.finalReceiptRejectionReason}"
                                                    </p>
                                                    <p className="text-[10px] font-black text-red-400 mt-3 uppercase tracking-tighter">Please re-upload a valid receipt below to proceed.</p>
                                                </div>
                                            )}
                                            {order.status === 'SAMPLE_AWAITING_APPROVAL' && (
                                                <div className="flex flex-col gap-4">
                                                    {activeAction === 'none' && (
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => setActiveAction('decline')}
                                                                className="flex-1 bg-white border-2 border-red-100 text-red-500 py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wide hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                            >
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                            <button 
                                                                onClick={() => setActiveAction('approve')}
                                                                className="flex-[2] bg-[#1B2412] text-white py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wide hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                            >
                                                                <CheckCircle size={14} className="text-[#A1FF4D]" /> Approve & Pay
                                                            </button>
                                                        </div>
                                                    )}

                                                    {activeAction === 'decline' && (
                                                        <div className="bg-white/80 p-5 lg:p-6 rounded-3xl border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <label className="text-[11px] font-black text-red-600 uppercase tracking-widest">Rejection Feedback</label>
                                                                <button onClick={() => setActiveAction('none')} className="text-[10px] font-black text-gray-400 hover:text-gray-600">Cancel</button>
                                                            </div>
                                                            <textarea 
                                                                value={declineMessage}
                                                                onChange={e => setDeclineMessage(e.target.value)}
                                                                placeholder="What specific changes are needed? (e.g. Logo size, color shade, etc.)"
                                                                className="w-full text-sm p-4 rounded-2xl border border-red-50 outline-none focus:ring-2 focus:ring-red-400 mb-4 resize-none min-h-[100px]"
                                                            />
                                                            <button 
                                                                onClick={async () => {
                                                                    if (!declineMessage.trim()) return alert('Please provide a reason');
                                                                    setIsDeclining(true);
                                                                    const newVariants = { ...order.variants, sample_rejection_message: declineMessage };
                                                                    await supabase.from('custom_orders').update({ variants: newVariants, status: 'SAMPLE_REJECTED' }).eq('id', order.id);
                                                                    setIsDeclining(false);
                                                                    onRefresh();
                                                                }}
                                                                disabled={isDeclining || !declineMessage.trim()}
                                                                className="w-full bg-red-500 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {isDeclining ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Confirm Rejection'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {activeAction === 'approve' && (
                                                        <div className="bg-white/80 p-5 lg:p-8 rounded-3xl lg:rounded-[3rem] border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <label className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Final Batch Payment Receipt</label>
                                                                <button onClick={() => setActiveAction('none')} className="text-[10px] font-black text-gray-400 hover:text-gray-600">Cancel</button>
                                                            </div>
                                                            <div className="relative border-4 border-dashed border-emerald-100 rounded-[2rem] p-6 lg:p-10 bg-emerald-50/30 flex flex-col items-center group/upload">
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => setFinalReceipt(event.target?.result as string);
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                                />
                                                                {finalReceipt ? (
                                                                    <div className="flex flex-col items-center gap-4">
                                                                        <img src={finalReceipt} className="h-40 rounded-2xl object-contain shadow-2xl" alt="Receipt Preview" />
                                                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Receipt Captured ✓</p>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mb-4 shadow-lg group-hover/upload:scale-110 transition-transform">
                                                                            <UploadCloud className="text-emerald-500" size={32} />
                                                                        </div>
                                                                        <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Drop receipt or click to upload</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {finalReceipt && (
                                                                <button 
                                                                    onClick={async () => {
                                                                        setIsSubmitting(true);
                                                                        const newVariants = { ...order.variants, finalReceiptUrl: finalReceipt };
                                                                        await supabase.from('custom_orders').update({ variants: newVariants, status: 'FINAL_PAYMENT_PENDING' }).eq('id', order.id);
                                                                        await onRefresh();
                                                                        setIsSubmitting(false);
                                                                    }}
                                                                    disabled={isSubmitting}
                                                                    className="w-full mt-8 bg-[#A1FF4D] text-[#1B2412] py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-[#A1FF4D]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                                >
                                                                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Approve & Start Production'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {order.status === 'SAMPLE_REJECTED' && (
                                                <div className="bg-red-50 rounded-3xl p-5 lg:p-8 border border-red-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                                            <XCircle className="text-red-500" size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">Correction Requested</p>
                                                            <p className="text-sm font-black text-red-900 uppercase">Supplier is reviewing your feedback</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/60 p-5 rounded-2xl border border-red-50">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Feedback:</p>
                                                        <p className="text-sm font-bold text-red-800 leading-relaxed italic">&ldquo;{order.variants?.sample_rejection_message}&rdquo;</p>
                                                    </div>
                                                </div>
                                            )}

                                            {order.status === 'FINAL_PAYMENT_PENDING' && (
                                                <div className="bg-amber-500/10 rounded-3xl p-5 lg:p-8 border border-amber-500/20 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20">
                                                            <Clock className="text-[#1B2412]" size={24} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-lg font-black text-amber-900 uppercase leading-tight">Verifying Payment</h5>
                                                            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-widest">Admin Review in Progress</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-amber-800/80 font-medium leading-relaxed mb-6">
                                                        Your final payment receipt has been received. Our team is verifying the transaction. 
                                                        Full-scale production will commence immediately after approval.
                                                    </p>
                                                    <a 
                                                        href={order.variants?.finalReceiptUrl} 
                                                        target="_blank"
                                                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-700 border border-amber-200 hover:bg-amber-50 transition-all"
                                                    >
                                                        <ImageIcon size={14} /> View Submitted Receipt
                                                    </a>
                                                </div>
                                            )}

                                            {['PRODUCTION_APPROVED_AND_PAID', 'COMPLETED_BY_SUPPLIER', 'DELIVERED'].includes(order.status) && (
                                                <div className="bg-emerald-500/10 rounded-3xl p-5 lg:p-8 border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#A1FF4D] flex items-center justify-center shadow-lg shadow-[#A1FF4D]/20">
                                                            <CheckCircle className="text-[#1B2412]" size={24} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-lg font-black text-emerald-900 uppercase leading-tight">Sample Approved! ✅</h5>
                                                            <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest">Production Batch Initiated</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-emerald-800/80 font-medium leading-relaxed">
                                                        The supplier is now processing the full production batch of {order.variants?.quantity || 1} units. 
                                                        You will be notified once the batch is ready for shipment.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/80 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-[#1B2412] uppercase tracking-wider">Order in Production</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Final payment verified ✓</p>
                                                </div>
                                            </div>
                                            <a
                                                href={order.variants.finalReceiptUrl}
                                                download={`final-receipt-${order.id.slice(0,8)}.jpg`}
                                                className="bg-emerald-600 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
                                            >
                                                Receipt
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-50 px-3 py-2 rounded-full border border-gray-100 flex items-center gap-2">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {order.status === "DELIVERED" && (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle size={14} />
                                <span className="text-xs font-black uppercase tracking-widest">Completed</span>
                            </div>
                        )}
                    </div>

                    {["PENDING_ADMIN", "REJECTED"].includes(order.status) && (
                        <div className="flex flex-col items-end gap-2">
                            <Link 
                                href={editUrl}
                                className="bg-white border-2 border-gray-100 text-[#1B2412] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <PenTool size={13} /> {order.status === "REJECTED" ? "Fix Design" : "Edit Design"}
                            </Link>
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                <AlertCircle size={10} /> After approved by admin, design edits will be disabled
                            </p>
                        </div>
                    )}
                </div>

                {/* Feedback Section for Delivered Orders */}
                {order.status === "DELIVERED" && (
                        Number(order.variants?.customer_rating) > 0 ? (
                            /* Already submitted — show compact thank-you card only */
                            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mt-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Star size={16} className="fill-white text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest">Review Submitted</p>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={12} className={s <= (order.variants?.customer_rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    {order.variants?.customer_feedback && (
                                        <p className="text-xs text-teal-600 font-medium mt-1 italic">"{order.variants.customer_feedback}"</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Not yet submitted — show the feedback form */
                            <div className="bg-white border border-gray-100 rounded-2xl p-5 mt-4 shadow-sm">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3">Rate your Experience</p>
                                
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-90 hover:scale-110"
                                        >
                                            <Star 
                                                size={28} 
                                                className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 hover:text-yellow-300"} 
                                            />
                                        </button>
                                    ))}
                                </div>

                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Write your feedback here..."
                                    className="w-full text-sm p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-teal-400 min-h-[100px] resize-none mb-3"
                                />

                                <button 
                                    onClick={async () => {
                                        if (rating === 0) return alert("Please select a rating");
                                        setSubmittingFeedback(true);
                                        const newVariants = { ...order.variants, customer_rating: rating, customer_feedback: feedback };
                                        const { error, count } = await supabase
                                            .from("custom_orders")
                                            .update({ variants: newVariants })
                                            .eq("id", order.id)
                                            .select();
                                        setSubmittingFeedback(false);
                                        if (error) {
                                            console.error("Feedback error:", error);
                                            alert("Error saving feedback: " + error.message);
                                        } else {
                                            console.log("Feedback update result — rows affected:", count);
                                            onRefresh();
                                        }
                                    }}
                                    disabled={submittingFeedback || rating === 0}
                                    className="w-full bg-teal-500 text-white py-3 rounded-xl font-black text-sm hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submittingFeedback ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Feedback"}
                                </button>
                            </div>
                        )
                    )}
                {/* Removed Timeline as requested */}
                </div>
            </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={44} className="animate-spin text-[#A1FF4D]" />
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
