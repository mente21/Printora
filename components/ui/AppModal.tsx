"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Info, Trash2, X, Loader2 } from "lucide-react";

// ─── Shared backdrop ─────────────────────────────────────────────────────────
function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
      <div className="relative z-10 animate-in zoom-in-95 fade-in duration-200">
        {children}
      </div>
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export type ConfirmVariant = "danger" | "warning" | "success" | "info" | "error";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const VARIANT_STYLES: Record<ConfirmVariant, { icon: React.ReactNode; btn: string; ring: string; iconBg: string }> = {
  danger:  { icon: <Trash2 size={22} />,        btn: "bg-red-500 hover:bg-red-600 text-white",     ring: "ring-red-100",     iconBg: "bg-red-100 text-red-500" },
  warning: { icon: <AlertTriangle size={22} />,  btn: "bg-amber-400 hover:bg-amber-500 text-[#1B2412]", ring: "ring-amber-100", iconBg: "bg-amber-100 text-amber-500" },
  success: { icon: <CheckCircle size={22} />,    btn: "bg-emerald-500 hover:bg-emerald-600 text-white", ring: "ring-emerald-100", iconBg: "bg-emerald-100 text-emerald-500" },
  info:    { icon: <Info size={22} />,           btn: "bg-[#1B2412] hover:bg-[#2d3d1e] text-[#A1FF4D]", ring: "ring-gray-100",  iconBg: "bg-gray-100 text-gray-500" },
  error:   { icon: <Trash2 size={22} />,        btn: "bg-red-500 hover:bg-red-600 text-white",     ring: "ring-red-100",     iconBg: "bg-red-100 text-red-500" },
};

export function ConfirmModal({
  open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel",
  variant = "info", onConfirm, onCancel,
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open) setIsProcessing(false);
  }, [open]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;
  const s = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  return (
    <Backdrop>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 ring-4 ${s.ring}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${s.iconBg}`}>
          {s.icon}
        </div>
        <h3 className="text-xl font-black text-[#111] mb-2 leading-tight">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 py-3 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'} ${s.btn}`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ─── AlertModal ───────────────────────────────────────────────────────────────
interface AlertModalProps {
  open: boolean;
  title?: string;
  message: string;
  variant?: "error" | "info" | "success";
  onClose: () => void;
}

export function AlertModal({ open, title, message, variant = "error", onClose }: AlertModalProps) {
  if (!open) return null;
  const styles = {
    error:   { icon: <AlertTriangle size={22} />, iconBg: "bg-red-100 text-red-500",     ring: "ring-red-100" },
    info:    { icon: <Info size={22} />,           iconBg: "bg-blue-100 text-blue-500",   ring: "ring-blue-100" },
    success: { icon: <CheckCircle size={22} />,    iconBg: "bg-emerald-100 text-emerald-500", ring: "ring-emerald-100" },
  }[variant];

  return (
    <Backdrop>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 ring-4 ${styles.ring}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-all">
            <X size={16} />
          </button>
        </div>
        {title && <h3 className="text-lg font-black text-[#111] mb-2">{title}</h3>}
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-[#1B2412] text-[#A1FF4D] font-black text-sm hover:bg-[#2d3d1e] transition-all active:scale-95"
        >
          OK
        </button>
      </div>
    </Backdrop>
  );
}

// ─── PromptModal ──────────────────────────────────────────────────────────────
interface PromptModalProps {
  open: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

export function PromptModal({
  open, title, message, placeholder = "Type here...",
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  onConfirm, onCancel,
}: PromptModalProps) {
  const [value, setValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) { 
      setValue(""); 
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 50); 
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!value.trim()) return;
    setIsProcessing(true);
    try {
      await onConfirm(value.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;
  return (
    <Backdrop>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 ring-4 ring-gray-100">
        <h3 className="text-xl font-black text-[#111] mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-500 font-medium mb-4">{message}</p>}
        <textarea
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#A1FF4D]/40 focus:border-[#A1FF4D] resize-none mb-6 transition-all"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim() || isProcessing}
            className={`flex-1 py-3 rounded-2xl bg-[#1B2412] text-[#A1FF4D] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${(!value.trim() || isProcessing) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#2d3d1e] active:scale-95'}`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
