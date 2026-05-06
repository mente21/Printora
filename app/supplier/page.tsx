"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag, Plus, LogOut, CheckCircle, Clock, XCircle,
  BarChart3, Box, Image as ImageIcon, User, Palette, Tag,
  Package, Upload, Loader2, ChevronDown, UploadCloud, X, Trash2,
  Edit2, Lock, ShieldCheck, Layers, Timer, ShoppingBasket, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal, AlertModal } from "@/components/ui/AppModal";
import CustomSelect from "@/components/ui/CustomSelect";
import { getPrimaryMockup } from "@/lib/utils";

const PRODUCT_TYPES = ["T-Shirts", "Hoodies", "Sweaters", "Mugs", "Hats", "Phone Cases", "Accessories", "Tote Bags", "Posters"];
const PRESET_COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Red", hex: "#dc2626" },
  { name: "Forest Green", hex: "#166534" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Lime", hex: "#A1FF4D" },
  { name: "Orange", hex: "#f97316" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Pink", hex: "#ec4899" },
];

const INITIAL_FORM = {
  name: "",
  description: "",
  long_description: "",
  product_type: "T-Shirts",
  price: "",
  bulk_threshold: "",
  bulk_discount: "",
  image_url: "",
  hover_image_url: "",
  detail_images: "",
  turnaround_time: "2-4 Business Days",
  quality: "Premium",
  tags: [] as string[],
  available_colors: [] as { name: string; hex: string }[],
  available_sizes: [] as string[],
};

export default function SupplierDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeViewIdx, setActiveViewIdx] = useState(0);
  const [supplierImgError, setSupplierImgError] = useState(false);

  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [fulfillLoading, setFulfillLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("my-products");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state initialized with INITIAL_FORM
  const [form, setForm] = useState(INITIAL_FORM);

  // ── Custom modal state (replaces all native confirm/alert) ──────────────
  type ModalAction = (() => Promise<void>) | (() => void);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; variant?: any; onConfirm: ModalAction }>(
    { open: false, title: "", message: "", onConfirm: () => {} }
  );
  const [alertModal, setAlertModal] = useState<{ open: boolean; title?: string; message: string; variant?: "error" | "info" | "success" }>(
    { open: false, message: "" }
  );
  const showConfirm = (title: string, message: string, onConfirm: ModalAction, confirmLabel = "Confirm", variant: any = "info") =>
    setConfirmModal({ open: true, title, message, confirmLabel, variant, onConfirm });
  const showAlert = (message: string, title?: string, variant: "error" | "info" | "success" = "error") =>
    setAlertModal({ open: true, message, title, variant });

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    setLoading(true);
    setSupplierImgError(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Fetch profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // 🔒 SUPPLIER / ADMIN ONLY
    if (!prof || !["SUPPLIER", "ADMIN"].includes(prof.role)) {
      window.location.href = "/";
      return;
    }

    setProfile({ ...prof, avatar_url: user.user_metadata?.avatar_url });
    await Promise.all([fetchProducts(user.id), fetchOrders(user.id)]);
    setLoading(false);
  };

  const fetchProducts = async (uid: string) => {
    const { data } = await supabase
      .from("supplier_products")
      .select("*")
      .eq("supplier_id", uid)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const fetchOrders = async (uid: string) => {
    const { data, error } = await supabase
      .from("custom_orders")
      .select("*, supplier_product:supplier_products(price, bulk_pricing)")
      .eq("supplier_id", uid)
      .order("created_at", { ascending: false });

    if (error) { console.error("Fetch orders error:", error); setOrders([]); return; }

    setOrders(data || []);
  };

  const handleColorToggle = (color: { name: string; hex: string }) => {
    setForm(f => {
      const exists = f.available_colors.find(c => c.hex === color.hex);
      return {
        ...f,
        available_colors: exists
          ? f.available_colors.filter(c => c.hex !== color.hex)
          : [...f.available_colors, color]
      };
    });
  };

  const handleTagToggle = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  const handleSizeToggle = (size: string) => {
    setForm(f => ({
      ...f,
      available_sizes: f.available_sizes.includes(size) ? f.available_sizes.filter(s => s !== size) : [...f.available_sizes, size]
    }));
  };

  const handleFileUpload = async (file: File, field: 'image_url' | 'hover_image_url' | 'detail_images') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${Date.now()}_${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('user_assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      showAlert('Error uploading image. Please try again.', 'Upload Failed');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user_assets')
      .getPublicUrl(filePath);

    if (field === 'detail_images') {
      setForm(f => {
        const current = f.detail_images ? f.detail_images.split(',').map(s => s.trim()).filter(Boolean) : [];
        return { ...f, detail_images: [...current, publicUrl].join(', ') };
      });
    } else {
      setForm(f => ({ ...f, [field]: publicUrl }));
    }
    
    return publicUrl;
  };

  const removeImage = (field: 'image_url' | 'hover_image_url' | 'detail_images', urlToRemove?: string) => {
    if (field === 'detail_images' && urlToRemove) {
      setForm(f => ({
        ...f,
        detail_images: f.detail_images.split(',')
          .map(s => s.trim())
          .filter(s => s !== urlToRemove)
          .join(', ')
      }));
    } else {
      setForm(f => ({ ...f, [field]: "" }));
    }
  };

  const FileDropzone = ({ label, field, value, multiple = false }: any) => {
    const [dragging, setDragging] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const onDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        setLocalLoading(true);
        for (const file of files) {
          await handleFileUpload(file, field);
          if (!multiple) break;
        }
        setLocalLoading(false);
      }
    };

    const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setLocalLoading(true);
        for (const file of files) {
          await handleFileUpload(file, field);
          if (!multiple) break;
        }
        setLocalLoading(false);
      }
    };

    const images = multiple 
      ? (value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
      : (value ? [value] : []);

    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">{label}</label>
        
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
            dragging ? 'border-[#A1FF4D] bg-[#A1FF4D]/5' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
          onClick={() => document.getElementById(`file-input-${field}`)?.click()}
        >
          <input 
            id={`file-input-${field}`}
            type="file" 
            multiple={multiple} 
            accept="image/*" 
            className="hidden" 
            onChange={onFileSelect}
          />
          
          {localLoading ? (
            <Loader2 className="animate-spin text-gray-400" size={24} />
          ) : (
            <UploadCloud className={`transition-transform group-hover:-translate-y-1 ${dragging ? 'text-[#A1FF4D]' : 'text-gray-400'}`} size={28} />
          )}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {localLoading ? "Uploading..." : dragging ? "Drop files here" : "Click or drag images"}
          </p>
        </div>

        {/* Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img: string, i: number) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white group">
                <img src={img} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(field, img); }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleEditProduct = (p: any) => {
    if (p.status === "APPROVED") {
      showAlert(
        "This product is already APPROVED and Live.\n\nTo ensure consistency for active customer orders, approved products cannot be edited directly. If you need to update information or images, please contact the admin team.",
        "Product is Live",
        "info"
      );
      return;
    }
    setEditingProductId(p.id);
    let bulk_threshold = "";
    let bulk_discount = "";
    if (p.bulk_pricing) {
        try {
            const bp = JSON.parse(p.bulk_pricing);
            bulk_threshold = bp.threshold?.toString() || "";
            bulk_discount = bp.value?.toString() || "";
        } catch(e) {}
    }

    setForm({
      name: p.name,
      description: p.description || "",
      long_description: p.long_description || "",
      product_type: p.product_type,
      price: p.price?.toString() || "",
      bulk_threshold,
      bulk_discount,
      image_url: p.image_url || "",
      hover_image_url: p.hover_image_url || "",
      detail_images: (p.detail_images || []).join(', '),
      turnaround_time: p.turnaround_time || "2-4 Business Days",
      quality: p.quality || "Premium",
      tags: p.tags || [],
      available_colors: p.available_colors || [],
      available_sizes: p.available_sizes || [],
    });
    setActiveTab("add-product");
  };

  const handleDeleteProduct = (id: string) => {
    showConfirm(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      async () => {
        const { error } = await supabase.from("supplier_products").delete().eq("id", id);
        setConfirmModal(m => ({ ...m, open: false }));
        if (error) showAlert(error.message, "Error");
        else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) fetchProducts(user.id);
        }
      },
      "Delete", "danger"
    );
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setFormLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let bulk_pricing = "";
    if (form.bulk_threshold && form.bulk_discount) {
        bulk_pricing = JSON.stringify({
            threshold: parseInt(form.bulk_threshold) || 0,
            value: parseFloat(form.bulk_discount) || 0
        });
    }

    const payload = {
      supplier_id: user.id,
      name: form.name,
      description: form.description,
      long_description: form.long_description,
      product_type: form.product_type,
      price: parseFloat(form.price) || 0,
      bulk_pricing,
      image_url: form.image_url,
      hover_image_url: form.hover_image_url,
      detail_images: form.detail_images ? form.detail_images.split(',').map(s => s.trim()).filter(Boolean) : [],
      turnaround_time: form.turnaround_time,
      quality: form.quality,
      tags: form.tags,
      available_colors: form.available_colors,
      available_sizes: form.available_sizes,
      status: "PENDING",
    };

    let error;
    if (editingProductId) {
      const res = await supabase.from("supplier_products").update(payload).eq("id", editingProductId);
      error = res.error;
    } else {
      const res = await supabase.from("supplier_products").insert(payload);
      error = res.error;
    }

    if (error) {
      showAlert(error.message, "Error submitting product");
    } else {
      setEditingProductId(null);
      setActiveTab('my-products');
      setForm({ name: "", description: "", long_description: "", product_type: "T-Shirts", price: "", bulk_threshold: "", bulk_discount: "", image_url: "", hover_image_url: "", detail_images: "", turnaround_time: "2-4 Business Days", quality: "Premium", tags: [], available_colors: [], available_sizes: [] });
      await fetchProducts(user.id);
    }
    setFormLoading(false);
  };

  const handleFulfill = async () => {
    if (!selectedOrder || !proofUrl.trim()) return;
    setFulfillLoading(true);

    let nextStatus = "COMPLETED_BY_SUPPLIER";

    if (["ASSIGNED_TO_SUPPLIER", "SAMPLE_REJECTED"].includes(selectedOrder.status)) {
      nextStatus = "SAMPLE_AWAITING_APPROVAL";
    }

    const { error } = await supabase
      .from("custom_orders")
      .update({ status: nextStatus, supplier_proof_image_url: proofUrl.trim() })
      .eq("id", selectedOrder.id);

    if (error) {
      showAlert(error.message, "Error");
    } else {
      setSelectedOrder(null);
      setProofUrl('');
      setProofPreview('');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await fetchOrders(user.id);
    }
    setFulfillLoading(false);
  };

  // Extract design layers from Fabric.js design_data JSON (like Printify)
  const extractLayers = (designData: any) => {
    if (!designData?.objects) return [];
    return designData.objects.map((obj: any, i: number) => {
      if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
        return { kind: 'text', index: i, text: obj.text, font: obj.fontFamily || 'sans-serif', size: Math.round(obj.fontSize || 16), color: obj.fill || '#000', bold: obj.fontWeight === 'bold', italic: obj.fontStyle === 'italic' };
      }
      if (obj.type === 'image') {
        return { kind: 'image', index: i, src: obj.src, w: Math.round(obj.width * (obj.scaleX||1)), h: Math.round(obj.height * (obj.scaleY||1)) };
      }
      return { kind: 'shape', index: i, type: obj.type, color: obj.fill || obj.stroke || '#000', w: Math.round((obj.width||0) * (obj.scaleX||1)), h: Math.round((obj.height||0) * (obj.scaleY||1)) };
    });
  };

  // Trigger a browser download from a data URL
  const downloadFile = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download the embedded high-res print file
  const downloadPrintFile = (order: any) => {
    // Prefer the active view's print_file if design_views exists
    const views: any[] = order.design_views || [];
    const activeView = views[activeViewIdx];
    const pf = activeView?.print_file || order.design_data?._printFile;
    if (pf) {
      const suffix = activeView ? `-${activeView.viewName.replace(/\s+/g, '-').toLowerCase()}` : '';
      downloadFile(pf, `print-file${suffix}-${order.id.slice(0, 8)}.png`);
    } else {
      alert('No print file found for this order. Ask the customer to re-save.');
    }
  };

  // Download an individual layer as a PNG
  const downloadLayer = (layer: any, orderDesignData: any, index: number) => {
    if (layer.kind === 'image') {
      // The image src is the raw base64 data URL from Fabric
      const src = orderDesignData?.objects?.[layer.index]?.src || layer.src;
      if (src) downloadFile(src, `image-layer-${index + 1}.png`);
      else alert('Image source not found.');
      return;
    }

    // For text and shapes: render to a high-DPI canvas
    const SCALE = 4; // 4x = ~300 DPI equivalent
    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d')!;

    if (layer.kind === 'text') {
      const weight  = layer.bold   ? 'bold '   : '';
      const style   = layer.italic ? 'italic ' : '';
      const fs      = (layer.size || 16) * SCALE;
      ctx.font = `${style}${weight}${fs}px ${layer.font}`;
      const metrics = ctx.measureText(layer.text);
      const tw = Math.ceil(metrics.width) + 20 * SCALE;
      const th = Math.ceil(fs * 1.6) + 10 * SCALE;
      offscreen.width  = tw;
      offscreen.height = th;
      ctx.clearRect(0, 0, tw, th);
      ctx.font = `${style}${weight}${fs}px ${layer.font}`;
      ctx.fillStyle = layer.color || '#000000';
      ctx.fillText(layer.text, 10 * SCALE, fs + 5 * SCALE);
    } else {
      // Shape: just export a colour swatch at correct proportions
      const W = Math.max(layer.w * SCALE, 10);
      const H = Math.max(layer.h * SCALE, 10);
      offscreen.width  = W;
      offscreen.height = H;
      ctx.fillStyle = layer.color || '#000000';
      ctx.fillRect(0, 0, W, H);
    }

    downloadFile(offscreen.toDataURL('image/png'), `${layer.kind}-layer-${index + 1}.png`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const stats = [
    { label: "Total Products", value: products.length, icon: Layers, color: "bg-[#1B2412]" },
    { label: "Approved", value: products.filter(p => p.status === "APPROVED").length, icon: ShieldCheck, color: "bg-emerald-500" },
    { label: "Pending", value: products.filter(p => p.status === "PENDING").length, icon: Timer, color: "bg-amber-500" },
    { label: "Assigned Orders", value: orders.length, icon: ShoppingBasket, color: "bg-indigo-500" },
  ];

  const STATUS_STYLE: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="animate-spin text-[#A1FF4D]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {profile && (
          <div className="p-4 mx-4 my-4 bg-[#A1FF4D]/10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#A1FF4D] flex items-center justify-center text-[#1B2412] font-black text-sm overflow-hidden">
                {(profile.avatar_url && !supplierImgError) ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Supplier" 
                    onError={() => setSupplierImgError(true)}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  profile.full_name?.[0]?.toUpperCase() || 'S'
                )}
              </div>
              <div>
                <p className="text-[13px] font-black text-[#1B2412] leading-none">{profile.full_name || 'Supplier'}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5 tracking-widest uppercase">Supplier</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab("my-products")}
            className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "my-products" ? "bg-[#A1FF4D]/10 text-[#2B3220]" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <BarChart3 size={18} /> My Products
          </button>
          
          <div className="pt-2">
            <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Products</p>
            <button 
              onClick={() => setActiveTab("add-product")}
              className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "add-product" ? "bg-[#A1FF4D]/10 text-[#2B3220]" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div className="pt-2">
            <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Orders</p>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "orders" ? "bg-[#1B2412] text-[#A1FF4D]" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-3"><ShoppingBag size={16} /> New Order</span>
              {orders.filter(o => o.status === "ASSIGNED_TO_SUPPLIER").length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${activeTab === "orders" ? "bg-[#A1FF4D] text-[#1B2412]" : "bg-gray-200 text-gray-600"}`}>
                  {orders.filter(o => o.status === "ASSIGNED_TO_SUPPLIER").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("resubmissions")}
              className={`flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "resubmissions" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-red-400 hover:bg-red-50"}`}
            >
              <div className="flex items-center gap-3">
                <XCircle size={16} /> Resubmissions
              </div>
              {orders.filter(o => o.status === 'SAMPLE_REJECTED').length > 0 && (
                <span className="bg-white text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                  {orders.filter(o => o.status === 'SAMPLE_REJECTED').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("pending-approvals")}
              className={`flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "pending-approvals" ? "bg-[#A1FF4D]/10 text-[#2B3220]" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-3"><Clock size={16} /> Pending Approvals</span>
              {orders.filter(o => o.status === "SAMPLE_AWAITING_APPROVAL").length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${activeTab === "pending-approvals" ? "bg-[#1B2412] text-[#A1FF4D]" : "bg-amber-100 text-amber-700"}`}>
                  {orders.filter(o => o.status === "SAMPLE_AWAITING_APPROVAL").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("in-production")}
              className={`flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "in-production" ? "bg-blue-500/10 text-blue-700" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-3"><Package size={16} /> In Production</span>
              {orders.filter(o => o.status === "PRODUCTION_APPROVED_AND_PAID").length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${activeTab === "in-production" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                  {orders.filter(o => o.status === "PRODUCTION_APPROVED_AND_PAID").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("completed")}
              className={`flex items-center justify-between px-4 py-3 w-full text-left rounded-xl text-sm font-bold transition-all ${activeTab === "completed" ? "bg-[#A1FF4D]/10 text-[#2B3220]" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-3"><CheckCircle size={16} /> Completed</span>
              {orders.filter(o => ["COMPLETED_BY_SUPPLIER", "COMPLETED", "DELIVERED"].includes(o.status)).length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${activeTab === "completed" ? "bg-[#1B2412] text-[#A1FF4D]" : "bg-emerald-100 text-emerald-700"}`}>
                  {orders.filter(o => ["COMPLETED_BY_SUPPLIER", "COMPLETED", "DELIVERED"].includes(o.status)).length}
                </span>
              )}
            </button>
          </div>

          <div className="pt-2">
            <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Account</p>
            <Link 
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all"
            >
              <User size={16} /> Profile Settings
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-xl transition-all font-bold text-sm">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2B3220] uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
              Supplier Dashboard
            </h1>
            <p className="text-gray-500 font-medium text-sm">Manage your products and fulfill orders.</p>
          </div>
        </div>

        {activeTab === "my-products" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-xl text-white flex-shrink-0`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-black text-[#2B3220]">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1B2412] text-white p-2 rounded-xl"><Package size={18} /></div>
              <h2 className="text-xl font-black text-[#2B3220] uppercase tracking-normal" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
                Your Product Catalog
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-white">
                <Box size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No products listed yet</p>
                <button onClick={() => setActiveTab("add-product")} className="mt-6 bg-[#A1FF4D] text-[#1B2412] px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95">
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-6 group">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 bg-gray-50 rounded-[1.5rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-3">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{product.product_type}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                          product.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                          product.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <h3 className="font-black text-[#1B2412] text-lg truncate mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-400 font-medium line-clamp-1">{product.description || 'No description provided.'}</p>
                    </div>

                    {/* Colors & Price */}
                    <div className="hidden md:flex flex-col items-center gap-2 px-8 border-x border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available Colors</p>
                      <div className="flex -space-x-1.5">
                        {product.available_colors?.slice(0, 4).map((c: any, i: number) => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c.hex }} title={c.name} />
                        ))}
                        {product.available_colors?.length > 4 && (
                          <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-500">
                            +{product.available_colors.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right px-6">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base Price</p>
                      <p className="text-xl font-black text-[#2B3220] whitespace-nowrap">{product.price} <span className="text-[10px] opacity-60">ETB</span></p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pr-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                          product.status === 'APPROVED' 
                            ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' 
                            : 'bg-gray-50 text-gray-400 hover:bg-[#1B2412] hover:text-[#A1FF4D]'
                        }`}
                        title={product.status === 'APPROVED' ? "Locked (Live Product)" : "Edit Product"}
                      >
                        {product.status === 'APPROVED' ? <Lock size={16} /> : <Edit2 size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "add-product" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 max-w-5xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-[#2B3220] uppercase tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-gray-400 text-xs font-bold mt-1">Configure your product catalog listing details.</p>
              </div>
              {editingProductId && (
                <button onClick={() => { setEditingProductId(null); setForm(INITIAL_FORM); }} className="text-xs font-black text-red-500 uppercase tracking-widest border-b-2 border-red-100 pb-1 hover:border-red-500 transition-all">
                  Cancel Edit
                </button>
              )}
            </div>


            <form onSubmit={handleSubmitProduct} className="space-y-10">
              {/* Basic Details Section */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b pb-2">01. Basic Identity</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Product Display Name *</label>
                    <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Cotton Heavyweight Tee" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-[#A1FF4C]/20 focus:border-[#A1FF4C] outline-none text-sm font-black transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Short Summary</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief pitch for the product list page..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold min-h-[100px] outline-none focus:border-[#A1FF4C]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Full Technical Specs</label>
                    <textarea value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} placeholder="Detailed fabric composition, care instructions, etc..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold min-h-[100px] outline-none focus:border-[#A1FF4C]" />
                  </div>
                </div>
              </div>

              {/* Attributes Section */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b pb-2">02. Attributes & Logistics</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Category</label>
                    <CustomSelect
                      value={form.product_type}
                      options={PRODUCT_TYPES}
                      onChange={(val) => setForm(f => ({ ...f, product_type: val }))}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Base Payout (ETB)</label>
                    <div className="relative">
                      <input required type="number" value={form.price} onChange={e => {
                        const val = e.target.value;
                        const sanitized = val === "" ? "" : Number(val).toString();
                        setForm(f => ({ ...f, price: sanitized }));
                      }} placeholder="600" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-[#A1FF4C]" />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">ETB</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Lead Time</label>
                    <input type="text" value={form.turnaround_time} onChange={e => setForm(f => ({ ...f, turnaround_time: e.target.value }))} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-[#A1FF4C]" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Bulk Discount Threshold (Min Items)</label>
                    <input type="number" value={form.bulk_threshold} onChange={e => {
                      const val = e.target.value;
                      const sanitized = val === "" ? "" : Number(val).toString();
                      setForm(f => ({ ...f, bulk_threshold: sanitized }));
                    }} placeholder="e.g. 10" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-[#A1FF4C]" />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#1B2412] uppercase block mb-2 tracking-widest">Bulk Discount Value (%)</label>
                    <div className="relative">
                      <input type="number" value={form.bulk_discount} onChange={e => {
                        const val = e.target.value;
                        const sanitized = val === "" ? "" : Number(val).toString();
                        setForm(f => ({ ...f, bulk_discount: sanitized }));
                      }} placeholder="e.g. 15" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-[#A1FF4C]" />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors & Sizes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b pb-2">03. Available Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map(c => {
                      const isSelected = form.available_colors.some(ac => ac.hex === c.hex);
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => handleColorToggle(c)}
                          className={`group relative w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-[#A1FF4D] scale-110 shadow-md ring-4 ring-[#A1FF4D]/10' : 'border-white hover:border-gray-100 hover:scale-105'}`}
                          title={c.name}
                        >
                          <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hex === '#FFFFFF' ? '#fcfcfc' : c.hex }} />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-[#1B2412] text-[#A1FF4D] rounded-full p-0.5 z-10 shadow-sm">
                              <CheckCircle size={10} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b pb-2">04. Available Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map(s => {
                      const isSelected = form.available_sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSizeToggle(s)}
                          className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            isSelected ? 'bg-[#1B2412] text-[#A1FF4D] shadow-lg scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b pb-2">05. Product Imagery</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FileDropzone label="Hero Image (Default) *" field="image_url" value={form.image_url} />
                  <FileDropzone label="Hover / Secondary" field="hover_image_url" value={form.hover_image_url} />
                  <FileDropzone label="Detail Gallery (Multi)" field="detail_images" value={form.detail_images} multiple />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6">
                <button type="submit" disabled={formLoading} className="w-full bg-[#A1FF4D] text-[#1B2412] py-5 rounded-3xl font-black shadow-xl shadow-[#A1FF4D]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                  {formLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  {formLoading ? "Publishing to Marketplace..." : editingProductId ? "Update Marketplace Listing" : "Launch Product to Marketplace"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1B2412] text-white p-2 rounded-xl"><ShoppingBag size={18} /></div>
              <h2 className="text-xl font-black text-[#2B3220] uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
                Pending Fulfillments
              </h2>
            </div>
            <div className="space-y-4">
              {orders.filter(o => o.status === "ASSIGNED_TO_SUPPLIER").map(order => (
                <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-6 group">
                  <div className="w-28 h-28 bg-gray-50 rounded-[1.5rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src={getPrimaryMockup(order)!} alt="Order" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.product_type}</span>
                    </div>
                    <h3 className="font-black text-[#1B2412] text-lg truncate uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5"><Palette size={12} className="text-gray-400" /><span className="text-[11px] font-bold text-gray-600">{order.variants?.color}</span></div>
                      <div className="flex items-center gap-1.5"><Box size={12} className="text-gray-400" /><span className="text-[11px] font-bold text-gray-600">{order.variants?.size}</span></div>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end px-10 border-l border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                    <p className="text-2xl font-black text-[#1B2412]">{order.variants?.quantity || 1} <span className="text-xs text-gray-400 uppercase">Units</span></p>
                  </div>
                  <div className="pr-4">
                    <button 
                      onClick={() => {
                        setProcessingId(order.id);
                        setTimeout(() => {
                          setSelectedOrder(order);
                          setProcessingId(null);
                        }, 500);
                      }} 
                      disabled={processingId === order.id}
                      className="bg-[#1B2412] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A1FF4D] hover:text-[#1B2412] transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn disabled:opacity-50"
                    >
                      {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="group-hover/btn:rotate-90 transition-transform" />}
                      {processingId === order.id ? 'Loading...' : 'View & Fulfill'}
                    </button>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === "ASSIGNED_TO_SUPPLIER").length === 0 && (
                <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-100">
                   <p className="text-gray-400 font-bold">No pending assignments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "resubmissions" && (
          <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-[#2B3220] uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>Needs Resubmission</h2>
                <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 animate-pulse">Action Required</div>
            </div>
            <div className="space-y-6">
              {orders.filter(o => o.status === 'SAMPLE_REJECTED').map(order => (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-500/5 p-6 flex flex-col gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-3 border border-gray-100">
                        <img src={getPrimaryMockup(order)!} alt="Order" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.product_type}</span>
                            <div className="h-px w-8 bg-gray-200" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Sample Rejected</span>
                        </div>
                        <h3 className="font-black text-[#1B2412] text-2xl uppercase tracking-tight mb-2">Order #{order.id.slice(0, 8)}</h3>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: order.variants?.color?.toLowerCase() }} /><span className="text-xs font-bold text-gray-600">{order.variants?.color}</span></div>
                            <div className="text-xs font-bold text-gray-400">Qty: {order.variants?.quantity || 1} Units</div>
                        </div>
                    </div>

                    <div className="pr-2">
                        <button 
                          onClick={() => {
                            setProcessingId(order.id);
                            setTimeout(() => {
                              setSelectedOrder(order);
                              setProcessingId(null);
                            }, 500);
                          }} 
                          disabled={processingId === order.id}
                          className="bg-[#1B2412] text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl active:scale-95 flex items-center gap-3 group/btn disabled:opacity-50"
                        >
                          {processingId === order.id ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} className="group-hover/btn:-translate-y-1 transition-transform" />}
                          {processingId === order.id ? 'Loading...' : 'Correct & Resubmit'}
                        </button>
                    </div>
                  </div>

                  {/* Customer Feedback Block */}
                  <div className="bg-red-50 rounded-3xl p-6 border border-red-100 relative">
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle size={14} className="text-red-500" />
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Customer Feedback</p>
                    </div>
                    <p className="text-sm font-bold text-red-900 leading-relaxed italic">
                        &ldquo;{order.variants?.sample_rejection_message || "No specific feedback provided. Please review the design specs carefully."}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === 'SAMPLE_REJECTED').length === 0 && (
                <div className="p-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-lg font-black text-[#2B3220] uppercase mb-1">Clean Slate</h3>
                    <p className="text-sm text-gray-400 font-medium">No samples need resubmission at this time.</p>
                </div>
              )}

            </div>
          </div>
        )}

        {activeTab === "pending-approvals" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1B2412] text-white p-2 rounded-xl"><Clock size={18} /></div>
              <h2 className="text-xl font-black text-[#2B3220] uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
                Pending Approvals
              </h2>
            </div>
            <div className="space-y-4">
              {orders.filter(o => o.status === "SAMPLE_AWAITING_APPROVAL").map(order => (
                <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex items-center gap-6 opacity-90 group hover:opacity-100 transition-all">
                  <div className="w-28 h-28 bg-gray-50 rounded-[1.5rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src={getPrimaryMockup(order)!} alt="Order" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.product_type}</span>
                      <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {order.status === 'SAMPLE_AWAITING_APPROVAL' ? 'Awaiting Customer' : 'Ready for Production'}
                      </span>
                    </div>
                    <h3 className="font-black text-[#1B2412] text-lg truncate uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-bold text-gray-400">Qty: {order.variants?.quantity || 1}</span>
                      <span className="text-[11px] font-bold text-gray-400">{order.variants?.color} • {order.variants?.size}</span>
                    </div>
                  </div>
                  <div className="pr-4">
                    <button 
                      onClick={() => {
                        setProcessingId(order.id);
                        setTimeout(() => {
                          setSelectedOrder(order);
                          setProcessingId(null);
                        }, 500);
                      }} 
                      disabled={processingId === order.id}
                      className="bg-gray-100 text-gray-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1B2412] hover:text-white transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      {processingId === order.id ? 'Opening...' : 'Check Status'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "in-production" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#2B3220] uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>In Production</h2>
              <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Full Production Run</div>
            </div>
            <div className="space-y-4">
              {orders.filter(o => o.status === "PRODUCTION_APPROVED_AND_PAID").map(order => (
                <div key={order.id} className="bg-white rounded-[2rem] border border-blue-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-6 group">
                  <div className="w-28 h-28 bg-gray-50 rounded-[1.5rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src={getPrimaryMockup(order)!} alt="Order" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.product_type}</span>
                      <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Full Batch</span>
                    </div>
                    <h3 className="font-black text-[#1B2412] text-lg truncate uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] font-bold text-gray-500">Qty: {order.variants?.quantity || 1} units</span>
                      <span className="text-[11px] font-bold text-gray-400">{order.variants?.color} • {order.variants?.size}</span>
                    </div>
                  </div>
                  <div className="pr-4">
                    <button
                      onClick={() => {
                        showConfirm(
                          "Mark Completed",
                          `Mark Order #${order.id.slice(0, 8)} as completed and notify the admin?`,
                          async () => {
                            setProcessingId(order.id);
                            const { error } = await supabase.from('custom_orders').update({ status: 'COMPLETED_BY_SUPPLIER' }).eq('id', order.id);
                            if (error) {
                              showAlert('Error: ' + error.message);
                            } else {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) await fetchOrders(user.id);
                            }
                            setProcessingId(null);
                          }
                        );
                      }}
                      disabled={processingId === order.id}
                      className="bg-[#1B2412] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A1FF4D] hover:text-[#1B2412] transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} 
                      {processingId === order.id ? 'Processing...' : 'Mark Completed'}
                    </button>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === "PRODUCTION_APPROVED_AND_PAID").length === 0 && (
                <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-gray-100">
                  <Package size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 font-bold text-sm">No orders currently in full production.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#1B2412] text-white p-2 rounded-xl"><CheckCircle size={18} /></div>
              <h2 className="text-xl font-black text-[#2B3220] uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
                Completed Productions
              </h2>
            </div>
            <div className="space-y-4">
              {orders.filter(o => ["COMPLETED_BY_SUPPLIER", "COMPLETED", "DELIVERED"].includes(o.status)).length === 0 && (
                <div className="p-16 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-white">
                  <CheckCircle size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No completed orders yet</p>
                </div>
              )}
              {orders.filter(o => ["COMPLETED_BY_SUPPLIER", "COMPLETED", "DELIVERED"].includes(o.status)).map(order => (
                <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-4 flex items-center gap-6 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                  <div className="w-28 h-28 bg-gray-50 rounded-[1.5rem] flex-shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src={getPrimaryMockup(order) || order.supplier_proof_image_url} alt="Order" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.product_type}</p>
                    <h3 className="font-black text-[#1B2412] text-lg uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                      {order.status === "DELIVERED" ? "✓ Delivered to Customer" : "✓ Fulfillment Complete"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pr-4">
                    {order.status === "DELIVERED" ? (
                      <div className="px-6 py-2 rounded-full border border-teal-200 text-teal-600 font-black text-[10px] uppercase tracking-widest bg-teal-50">Delivered</div>
                    ) : (
                      <div className="px-6 py-2 rounded-full border border-emerald-100 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50">Completed</div>
                    )}
                    <button
                      onClick={() => {
                        showConfirm(
                          "Delete Order History",
                          "Are you sure you want to permanently remove this order from your history? This action cannot be undone.",
                          async () => {
                            setProcessingId(order.id);
                            const { error } = await supabase.from('custom_orders').delete().eq('id', order.id);
                            if (error) {
                              showAlert('Error deleting order: ' + error.message);
                            } else {
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) await fetchOrders(user.id);
                            }
                            setProcessingId(null);
                          },
                          "Delete Permanently",
                          "error"
                        );
                      }}
                      disabled={processingId === order.id}
                      className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 disabled:opacity-50"
                      title="Delete Order History"
                    >
                      {processingId === order.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ===== ORDER DETAIL + DESIGN EXTRACTION MODAL ===== */}
      {selectedOrder && (() => {
        const views: any[] = selectedOrder.design_views || [];
        const hasViews = views.length > 0;
        const activeViewData = hasViews ? views[Math.min(activeViewIdx, views.length - 1)] : null;
        const activeDesign  = activeViewData?.design || selectedOrder.design_data;
        const activeMockup  = activeViewData?.mockup_url || getPrimaryMockup(selectedOrder);
        const layers = extractLayers(activeDesign);

        const supplierProduct = selectedOrder.supplier_product || {};
        const basePrice = supplierProduct.price || 600;
        let unitPrice = basePrice;
        const qty = selectedOrder.variants?.quantity || 1;
        let bulkDiscountPercentage = 0;
        
        if (supplierProduct.bulk_pricing) {
            try {
                const bp = typeof supplierProduct.bulk_pricing === 'string' ? JSON.parse(supplierProduct.bulk_pricing) : supplierProduct.bulk_pricing;
                if (bp && qty >= bp.threshold) {
                    bulkDiscountPercentage = bp.value;
                    unitPrice = basePrice * (1 - bp.value / 100);
                }
            } catch(e) {}
        }
        
        const totalValue = unitPrice * qty;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl my-4 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between bg-[#1B2412]">
                <div>
                  <h2 className="text-lg font-black text-[#A1FF4D] uppercase tracking-tight">Print Order Details</h2>
                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">{selectedOrder.product_type} · {selectedOrder.variants?.color} · {selectedOrder.variants?.view}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadPrintFile(selectedOrder)}
                    title="Download high-res print file (PNG)"
                    className="flex items-center gap-1.5 bg-[#A1FF4D] text-[#1B2412] px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Upload size={13} />
                    Download Print File
                  </button>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                    <XCircle size={26} />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[85vh]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left Column: Design & Layers (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* View tabs */}
                    {hasViews && views.length > 1 && (
                      <div className="flex gap-2 flex-wrap">
                        {views.map((v: any, i: number) => (
                          <button
                            key={v.viewId}
                            onClick={() => setActiveViewIdx(i)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                              activeViewIdx === i
                                ? 'bg-[#1B2412] text-[#A1FF4D]'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {v.viewName}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Large Mockup Preview */}
                    {activeMockup && (
                      <div className="relative w-full aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 group shadow-inner">
                        <img src={activeMockup} alt="Mockup" className="w-full h-full object-contain p-4" />
                        <button
                          onClick={() => downloadFile(activeMockup, `mockup-${activeViewData?.viewName || 'front'}-${selectedOrder.id.slice(0,8)}.jpg`)}
                          title="Download mockup image"
                          className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-[#1B2412]/90 hover:bg-[#1B2412] text-white text-[11px] font-black px-4 py-2 rounded-xl backdrop-blur-sm transition-all active:scale-95 opacity-0 group-hover:opacity-100 shadow-xl"
                        >
                          <ImageIcon size={12} />
                          Download Mockup
                        </button>
                      </div>
                    )}

                    {/* Design layers list */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Component Breakdown — {activeViewData?.viewName || 'Front'} ({layers.length})
                      </p>
                      {layers.length === 0 ? (
                        <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl">No specific design layers found in this view.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {layers.map((layer: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-colors group/layer">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-black shadow-sm ${
                                layer.kind === 'text'  ? 'bg-blue-500'   :
                                layer.kind === 'image' ? 'bg-purple-500' : 'bg-orange-400'
                              }`}>
                                {layer.kind === 'text' ? 'T' : layer.kind === 'image' ? '🖼' : '◼'}
                              </div>
                              <div className="flex-1 min-w-0">
                                {layer.kind === 'text' && (
                                  <>
                                    <p className="text-[13px] font-black text-gray-800 truncate">&ldquo;{layer.text}&rdquo;</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                      {layer.font} · {layer.size}px
                                      {layer.bold ? ' · Bold' : ''}
                                    </p>
                                  </>
                                )}
                                {layer.kind === 'image' && (
                                  <>
                                    <p className="text-[13px] font-black text-gray-800">Uploaded Asset</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{layer.w} × {layer.h}px</p>
                                  </>
                                )}
                                {layer.kind === 'shape' && (
                                  <>
                                    <p className="text-[13px] font-black text-gray-800 capitalize">{layer.type} Shape</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{layer.w} × {layer.h}px</p>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {layer.color && (
                                  <div title={layer.color} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: layer.color }} />
                                )}
                                <button
                                  onClick={() => downloadLayer(layer, activeDesign, i)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all opacity-0 group-hover/layer:opacity-100"
                                >
                                  <Upload size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Order Details & Fulfillment (5 cols) */}
                  <div className="lg:col-span-5 space-y-8">
                    
                    {/* Primary Order Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1B2412] rounded-[2rem] p-6 text-[#A1FF4D]">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Quantity</p>
                        <p className="text-3xl font-black">{selectedOrder.variants?.quantity || 1}</p>
                        <p className="text-[10px] font-bold mt-1 opacity-80">Total Items</p>
                      </div>
                      <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Size</p>
                        <p className="text-3xl font-black text-[#1B2412]">{selectedOrder.variants?.size || 'M'}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">International</p>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-7 border border-gray-100 space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Unit Price</span>
                          <span className="text-sm font-black text-gray-800">
                            {bulkDiscountPercentage > 0 ? (
                                <>
                                    <span className="line-through text-gray-400 mr-2">{basePrice.toLocaleString()} ETB</span>
                                    <span>{unitPrice.toLocaleString()} ETB</span>
                                </>
                            ) : (
                                `${basePrice.toLocaleString()} ETB`
                            )}
                          </span>
                        </div>
                        {bulkDiscountPercentage > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                                <span>Bulk Discount Applied</span>
                                <span>{bulkDiscountPercentage}% Off</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-500">Total Value</span>
                          <span className="text-sm font-black text-gray-800">{totalValue.toLocaleString()} ETB</span>
                        </div>
                        <div className="h-px bg-gray-200 my-1" />
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-black text-emerald-600 uppercase">Your Payout (100%)</span>
                          <span className="text-xl font-black text-emerald-600">
                            {totalValue.toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="mt-4 bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Payment Secured</p>
                            <p className="text-[11px] text-emerald-600 font-bold">50% deposit already paid by customer. Balance held by Printora.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Meta info - No customer contact for privacy */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-6 border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Fulfillment Note</p>
                       <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                         Please follow the design specifications provided in the layout view. 
                         Ensure all high-resolution assets are correctly scaled before printing.
                       </p>
                    </div>

                    {/* Fulfillment Section */}
                    <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 space-y-5 shadow-xl shadow-gray-100/50">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submit Progress</p>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-wider">Required</span>
                      </div>

                      {/* Drop Zone - Hidden when waiting for customer approval */}
                      {selectedOrder.status !== 'SAMPLE_AWAITING_APPROVAL' && (
                        <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all p-6 ${
                          proofPreview ? 'border-[#A1FF4D] bg-[#A1FF4D]/5 shadow-inner' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}>
                          {proofPreview ? (
                            <div className="relative w-full group">
                              <img src={proofPreview} alt="Proof preview" className="w-full max-h-52 object-contain rounded-2xl" />
                              <button
                                type="button"
                                onClick={e => { e.preventDefault(); setProofUrl(''); setProofPreview(''); }}
                                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs hover:bg-black transition-colors backdrop-blur-sm"
                              >✕</button>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <UploadCloud className="text-gray-400" size={24} />
                              </div>
                              <div className="text-center">
                                <p className="text-[13px] font-black text-gray-800">Upload Final Proof</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">Drag and drop or click to browse</p>
                              </div>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => {
                                const base64 = ev.target?.result as string;
                                setProofUrl(base64);
                                setProofPreview(base64);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      )}

                      {/* Actions */}
                      {selectedOrder.status === 'SAMPLE_AWAITING_APPROVAL' ? (
                        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 p-5 rounded-[2rem] text-xs font-black text-center leading-relaxed">
                          ⚠️ Sample Proof Submitted.<br/>Waiting for customer approval before continuing.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleFulfill}
                            disabled={fulfillLoading || !proofUrl.trim()}
                            className="w-full bg-[#A1FF4D] text-[#1B2412] py-4 rounded-[2rem] font-black shadow-lg shadow-[#A1FF4D]/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                          >
                            {fulfillLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {fulfillLoading ? 'Processing...' : ((selectedOrder.variants?.quantity || 1) > 1 && ["ASSIGNED_TO_SUPPLIER", "SAMPLE_REJECTED"].includes(selectedOrder.status)) ? 'Submit Sample Proof' : 'Confirm Completion'}
                          </button>
                          <button onClick={() => setSelectedOrder(null)} className="w-full py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                            Close Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Custom Modals ───────────────────────────────────────── */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={async () => { await confirmModal.onConfirm(); setConfirmModal(m => ({ ...m, open: false })); }}
        onCancel={() => setConfirmModal(m => ({ ...m, open: false }))}
      />
      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        onClose={() => setAlertModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}
