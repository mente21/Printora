"use client";

import { fabric } from 'fabric';

import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { PRODUCT_TEMPLATES } from '@/lib/editor-constants';
import { useEditorCanvas } from '@/hooks/useEditorCanvas';
import { useSearchParams } from 'next/navigation';
import TshirtMockup from './TshirtMockup';
import HoodieMockup from './HoodieMockup';
import SweaterMockup from './SweaterMockup';
import HatMockup from './HatMockup';
import {
    Type,
    UploadCloud,
    Folder,
    Shapes,
    LayoutTemplate,
    HelpCircle,
    Undo2,
    Redo2,
    ArrowLeft,
    X,
    Minus,
    Plus,
    Wand2,
    Search,
    ChevronRight,
    ChevronDown,
    ShoppingBag,
    CreditCard,
    Check,
    Smartphone,
    Building2,
    ArrowRight,
    AlertCircle,
    Loader2,
    MapPin,
    Truck
} from 'lucide-react';
import { ProductTemplate, ProductView, CanvasDesignState } from '@/types/editor';
import { supabase } from '@/lib/supabase';
import CustomSelect from '@/components/ui/CustomSelect';
import { notifyNewOrder } from '@/lib/email-service';

/* ─── Font catalogue ─────────────────────────────────────────────────────── */
const FONTS = [
    { name: 'Inter', category: 'Display', style: 'sans-serif' },
    { name: 'Outfit', category: 'Display', style: 'sans-serif' },
    { name: 'Playfair Display', category: 'Display', style: 'serif' },
    { name: 'Oswald', category: 'Display', style: 'sans-serif' },
    { name: 'Montserrat', category: 'Display', style: 'sans-serif' },
    { name: 'Lora', category: 'Display', style: 'serif' },
    { name: 'Bebas Neue', category: 'Display', style: 'sans-serif' },
    { name: 'Cinzel', category: 'Display', style: 'serif' },
    { name: 'ABeeZee', category: 'Display', style: 'sans-serif' },
    { name: 'Abel', category: 'Display', style: 'sans-serif' },
    { name: 'Abhaya Libre', category: 'Display', style: 'serif' },
    { name: 'Aboreto', category: 'Display', style: 'sans-serif', caps: true },
    { name: 'Abril Fatface', category: 'Display', style: 'serif', weight: '900' },
    { name: 'Abyssinica SIL', category: 'Display', style: 'serif' },
    { name: 'Acme', category: 'Display', style: 'sans-serif' },
    { name: 'Alegreya', category: 'Display', style: 'serif' },
    { name: 'Alfa Slab One', category: 'Display', style: 'serif', weight: '900' },
    { name: 'Caveat', category: 'Handwriting', style: 'cursive' },
    { name: 'Cinzel', category: 'Display', style: 'serif' },
    { name: 'Courier Prime', category: 'Monospace', style: 'monospace' },
    { name: 'Dancing Script', category: 'Handwriting', style: 'cursive', weight: '700' },
    { name: 'IBM Plex Mono', category: 'Monospace', style: 'monospace' },
    { name: 'Inter', category: 'Display', style: 'sans-serif' },
    { name: 'Kalam', category: 'Handwriting', style: 'cursive' },
    { name: 'Kaushan Script', category: 'Handwriting', style: 'cursive' },
    { name: 'Lora', category: 'Display', style: 'serif' },
    { name: 'Montserrat', category: 'Display', style: 'sans-serif' },
    { name: 'Noto Sans Ethiopic', category: 'Display', style: 'sans-serif' },
    { name: 'Noto Serif Ethiopic', category: 'Display', style: 'serif' },
    { name: 'Oswald', category: 'Display', style: 'sans-serif' },
    { name: 'Outfit', category: 'Display', style: 'sans-serif' },
    { name: 'Pacifico', category: 'Handwriting', style: 'cursive' },
    { name: 'Playfair Display', category: 'Display', style: 'serif' },
    { name: 'Roboto Mono', category: 'Monospace', style: 'monospace' },
    { name: 'Sacramento', category: 'Handwriting', style: 'cursive' },
    { name: 'Satisfy', category: 'Handwriting', style: 'cursive' },
    { name: 'Share Tech Mono', category: 'Monospace', style: 'monospace' },
    { name: 'Source Code Pro', category: 'Monospace', style: 'monospace' },
    { name: 'Space Mono', category: 'Monospace', style: 'monospace' },
];

/* ─── Google-Fonts loader ────────────────────────────────────────────────── */
const GFONTS_URL =
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Outfit:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;700&family=Montserrat:wght@400;700;900&family=Lora:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&family=Cinzel:wght@400;700&family=ABeeZee&family=Abel&family=Abhaya+Libre&family=Aboreto&family=Abril+Fatface&family=Acme&family=Alegreya&family=Alfa+Slab+One&family=Dancing+Script:wght@700&family=Caveat&family=Satisfy&family=Sacramento&family=Kalam&family=Pacifico&family=Kaushan+Script&family=Space+Mono&family=Courier+Prime&family=Roboto+Mono&family=IBM+Plex+Mono&family=Source+Code+Pro&family=Share+Tech+Mono&family=Noto+Sans+Ethiopic:wght@400;700&family=Noto+Serif+Ethiopic:wght@400;700&family=Abyssinica+SIL&display=swap';

/* ─── Curved-text preview SVGs ──────────────────────────────────────────── */
function CurvedPreview1() {
    return (
        <svg viewBox="0 0 90 90" className="w-full h-full">
            <path id="cp1a" d="M12,55 A34,34 0 0,1 78,55" fill="none" />
            <path id="cp1b" d="M18,63 A28,28 0 0,0 72,63" fill="none" />
            <text fontSize="9" fontFamily="Georgia,serif" fill="#1a1a1a">
                <textPath href="#cp1a" startOffset="4%">art lover boutique</textPath>
            </text>
            <text fontSize="6.5" fontFamily="Georgia,serif" fill="#666" letterSpacing="0.5">
                <textPath href="#cp1b" startOffset="2%">PRINTS MADE WITH LOVE</textPath>
            </text>
        </svg>
    );
}
function CurvedPreview2() {
    return (
        <svg viewBox="0 0 90 90" className="w-full h-full">
            <path id="cp2" d="M6,56 A40,40 0 0,1 84,56" fill="none" />
            <text fontSize="15" fontWeight="900" fontFamily="Impact,sans-serif" fill="#1a1a1a">
                <textPath href="#cp2" startOffset="4%">NEW DAY</textPath>
            </text>
            <text x="50%" y="72" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fill="#555" letterSpacing="1">IT&apos;S A</text>
            <text x="50%" y="82" textAnchor="middle" fontSize="7" fontFamily="sans-serif" fill="#555">RISE N&apos; SHINE</text>
        </svg>
    );
}
function CurvedPreview3() {
    return (
        <svg viewBox="0 0 90 90" className="w-full h-full">
            <circle cx="45" cy="45" r="32" fill="none" stroke="#1a1a1a" strokeWidth="1" />
            <path id="cp3t" d="M13,45 a32,32 0 1,1 64,0" fill="none" />
            <path id="cp3b" d="M13,45 a32,32 0 0,0 64,0" fill="none" />
            <text fontSize="18" fontWeight="900" fontFamily="Impact,sans-serif" fill="#1a1a1a">
                <textPath href="#cp3t" startOffset="28%">WYZ</textPath>
            </text>
            <text fontSize="5.5" fontFamily="sans-serif" fill="#555" letterSpacing="1.8">
                <textPath href="#cp3b" startOffset="1%">SHIPPING GLOBALLY · DESIGNED LOCALLY ·</textPath>
            </text>
        </svg>
    );
}

/* ─── Text Panel ────────────────────────────────────────────────────────── */
function TextPanel({ onClose, onAddText, onAddCurvedText }: { onClose: () => void; onAddText: (font?: string) => void; onAddCurvedText: () => void }) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        const existing = document.getElementById('gfonts-printora');
        if (existing) return;
        const link = document.createElement('link');
        link.id = 'gfonts-printora';
        link.rel = 'stylesheet';
        link.href = GFONTS_URL;
        document.head.appendChild(link);
    }, []);

    const filtered = FONTS.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !activeCategory || f.category === activeCategory;
        return matchSearch && matchCat;
    });

    return (
        <div className="absolute left-[88px] top-0 bottom-0 w-[340px] bg-white border-r border-gray-200 flex flex-col z-30 shadow-[2px_0_12px_rgba(0,0,0,0.06)] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Add text</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">

                {/* Add a heading CTA */}
                <div className="px-4 pt-4 pb-2">
                    <button
                        onClick={() => onAddText()}
                        className="w-full bg-gray-900 text-white rounded-xl py-3.5 text-[14px] font-bold shadow-sm hover:bg-gray-800 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Type className="w-4 h-4" />
                        Add a text box
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pt-2 pb-1">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-gray-400 transition-colors">
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search fonts…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none w-full"
                        />
                    </div>
                </div>

                {/* ── Curved Text ── */}
                <section className="px-4 pt-5 pb-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-800">Curved Text</span>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Editable</span>
                        </div>
                        <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                            <Plus className="w-3 h-3" /> Show more
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[<CurvedPreview1 key="1" />, <CurvedPreview2 key="2" />, <CurvedPreview3 key="3" />].map((Preview, i) => (
                            <button
                                key={i}
                                onClick={() => onAddCurvedText()}
                                className="aspect-square bg-[#f8f8f6] rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden flex items-center justify-center p-2"
                            >
                                {Preview}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── My Fonts ── */}
                <section className="px-4 pt-5 pb-2">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-bold text-gray-800">My fonts</span>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">New</span>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-[13px] text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all font-medium">
                        <UploadCloud className="w-4 h-4" />
                        Upload font
                    </button>
                </section>

                {/* ── Discover Fonts ── */}
                <section className="px-4 pt-5 pb-6">
                    <span className="text-[13px] font-bold text-gray-800 block mb-3">Discover fonts</span>

                    {/* Category pills */}
                    <div className="flex gap-2 mb-4">
                        {['Display', 'Handwriting', 'Monospace'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${activeCategory === cat
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Font list */}
                    <div className="flex flex-col">
                        {filtered.map(font => (
                            <button
                                key={font.name}
                                onClick={() => onAddText(font.name)}
                                className="text-left py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors group flex items-center justify-between"
                            >
                                <span
                                    style={{
                                        fontFamily: `'${font.name}', ${font.style || 'sans-serif'}`,
                                        fontWeight: font.weight || 'normal',
                                        textTransform: font.caps ? 'uppercase' : 'none',
                                    }}
                                    className="text-[15px] text-gray-800 group-hover:text-gray-900"
                                >
                                    {font.name}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-[13px] text-gray-400 text-center py-6">No fonts match &ldquo;{search}&rdquo;</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

/* ─── Library Panel ──────────────────────────────────────────────────────── */
type UserAsset = { id: string; file_name: string; file_url: string; created_at: string };

function LibraryPanel({ onClose, onAddImage }: { onClose: () => void; onAddImage: (src: string) => void }) {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [assets, setAssets] = useState<UserAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadAssets = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data } = await supabase
            .from('user_assets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setAssets(data ?? []);
        setLoading(false);
    };

    useEffect(() => { loadAssets(); }, []);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { alert('Please log in to save images to your library.'); setUploading(false); return; }
            const ext = file.name.split('.').pop();
            const path = `${user.id}/${Date.now()}_${file.name}`;
            const { error: upErr } = await supabase.storage.from('user_assets').upload(path, file, { upsert: false });
            if (upErr) throw upErr;
            const { data: { publicUrl } } = supabase.storage.from('user_assets').getPublicUrl(path);
            const { error: dbErr } = await supabase.from('user_assets').insert({
                user_id: user.id,
                file_name: file.name,
                file_url: publicUrl,
            });
            if (dbErr) throw dbErr;
            // Add to canvas immediately
            onAddImage(publicUrl);
            await loadAssets();
        } catch (e: any) {
            console.error('Upload failed:', e);
            alert('Upload failed: ' + e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (asset: UserAsset, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(asset.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            // Extract storage path from public URL
            const url = new URL(asset.file_url);
            const storagePath = url.pathname.split('/user_assets/')[1];
            if (storagePath) await supabase.storage.from('user_assets').remove([storagePath]);
            await supabase.from('user_assets').delete().eq('id', asset.id);
            setAssets(prev => prev.filter(a => a.id !== asset.id));
        } catch (e: any) {
            console.error('Delete failed:', e);
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = assets.filter(a => a.file_name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute left-[88px] top-0 bottom-0 w-[340px] bg-white border-r border-gray-200 flex flex-col z-30 shadow-[2px_0_12px_rgba(0,0,0,0.06)] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">My library</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Upload CTA bar */}
            <div className="px-4 pt-4 pb-2">
                <label className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 text-[13px] font-semibold cursor-pointer transition-all ${uploading
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                    {uploading ? (
                        <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Uploading…</>
                    ) : (
                        <><UploadCloud className="w-4 h-4" /> Upload image</>
                    )}
                    <input
                        type="file" accept="image/*" className="hidden"
                        disabled={uploading}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
                    />
                </label>
            </div>

            {/* Search */}
            <div className="px-4 pt-2 pb-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-gray-400 transition-colors">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search library…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none w-full"
                    />
                </div>
            </div>

            {/* Sort + View toggle */}
            <div className="px-4 pb-3 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium">{assets.length} image{assets.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
                            <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`w-8 h-8 flex items-center justify-center border-l border-gray-200 transition-colors ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="2" width="14" height="2" rx="1" /><rect x="1" y="7" width="14" height="2" rx="1" /><rect x="1" y="12" width="14" height="2" rx="1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                        <svg className="w-8 h-8 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        <span className="text-[12px] text-gray-400">Loading your library…</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-24 h-24">
                            <svg viewBox="0 0 130 130" className="w-full h-full" fill="none">
                                <rect x="10" y="40" width="45" height="55" rx="4" fill="#e5e7eb" transform="rotate(-15 10 40)" />
                                <rect x="75" y="35" width="45" height="55" rx="4" fill="#e5e7eb" transform="rotate(12 75 35)" />
                                <rect x="32" y="26" width="66" height="80" rx="5" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                                <polygon points="58,44 66,56 74,44 70,44 70,36 62,36 62,44" fill="#16a34a" transform="rotate(-10 66 46)" />
                                <polygon points="48,60 56,72 64,60 60,60 60,52 52,52 52,60" fill="#4ade80" transform="rotate(5 56 62)" />
                                <polygon points="68,62 76,74 84,62 80,62 80,54 72,54 72,62" fill="#16a34a" transform="rotate(-5 76 64)" />
                                <line x1="42" y1="86" x2="88" y2="86" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-[14px] font-bold text-gray-800 text-center">{search ? `No results for "${search}"` : 'Nothing here yet'}</h3>
                        <p className="text-[12px] text-gray-400 text-center leading-relaxed">
                            {search ? 'Try a different search term.' : 'Upload images above — they\'ll be saved here for future use.'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-2">
                        {filtered.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => onAddImage(asset.file_url)}
                                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:border-gray-400 hover:shadow-md transition-all bg-gray-50"
                            >
                                <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 text-[11px] font-semibold px-2 py-1 rounded-full shadow-sm transition-all">Add to design</span>
                                </div>
                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDelete(asset, e)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                >
                                    {deletingId === asset.id ? (
                                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    ) : (
                                        <X className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {filtered.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => onAddImage(asset.file_url)}
                                className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer group transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                    <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-gray-800 truncate">{asset.file_name}</p>
                                    <p className="text-[11px] text-gray-400">{new Date(asset.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(asset, e)}
                                    className="w-7 h-7 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                                >
                                    {deletingId === asset.id ? (
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    ) : (
                                        <X className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Graphics Panel ───────────────────────────────────────────────── */
function GraphicsPanel({ onClose, onAddShape, onAddCurvedText }: { onClose: () => void; onAddShape: (type: string) => void; onAddCurvedText: () => void }) {
    const shapes = [
        { id: 'star', svg: <polygon points="50,5 61,37 95,37 67,57 78,89 50,69 22,89 33,57 5,37 39,37" fill="#64645A" /> },
        { id: 'heart', svg: <path d="M50,85 C20,55 5,35 5,20 C5,5 25,5 35,15 C45,25 50,30 50,30 C50,30 55,25 65,15 C75,5 95,5 95,20 C95,35 80,55 50,85 Z" fill="#64645A" /> },
        { id: 'line', svg: <line x1="10" y1="50" x2="90" y2="50" stroke="#64645A" strokeWidth="8" strokeLinecap="round" /> },
        { id: 'triangle', svg: <polygon points="50,15 90,85 10,85" fill="#64645A" /> },
        { id: 'circle', svg: <circle cx="50" cy="50" r="40" fill="#64645A" /> },
        { id: 'square', svg: <rect x="15" y="15" width="70" height="70" fill="#64645A" /> },
        { id: 'hexagon', svg: <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#64645A" /> },
        { id: 'pentagon', svg: <polygon points="50,10 90,40 75,90 25,90 10,40" fill="#64645A" /> },
        { id: 'diamond', svg: <polygon points="50,10 90,50 50,90 10,50" fill="#64645A" /> },
        { id: 'arrow', svg: <path d="M10,40 L70,40 L70,20 L90,50 L70,80 L70,60 L10,60 Z" fill="#64645A" /> },
        { id: 'cross', svg: <path d="M35,10 L65,10 L65,35 L90,35 L90,65 L65,65 L65,90 L35,90 L35,65 L10,65 L10,35 L35,35 Z" fill="#64645A" /> },
        { id: 'badge', svg: <path d="M50,10 L80,20 L90,50 L80,80 L50,90 L20,80 L10,50 L20,20 Z" fill="#64645A" /> },
    ];

    return (
        <div className="absolute left-[88px] top-0 bottom-0 w-[340px] bg-white border-r border-gray-200 flex flex-col z-30 shadow-[2px_0_12px_rgba(0,0,0,0.06)] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Graphics</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">

                {/* ── Shapes ── */}
                <section className="px-4 pt-5 pb-2 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-800">Shapes</span>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Editable</span>
                        </div>
                        <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                            <Plus className="w-3 h-3" /> Show more
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {shapes.map((shape) => (
                            <button
                                key={shape.id}
                                onClick={() => onAddShape(shape.id)}
                                className="aspect-square rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all overflow-hidden flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZjJmMmYyIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZjJmMmYyIiAvPgo8L3N2Zz4=')]"
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                                    {shape.svg}
                                </svg>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Curved Text (Reused from TextPanel) ── */}
                <section className="px-4 pt-5 pb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-800">Curved Text</span>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Editable</span>
                        </div>
                        <button className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                            <Plus className="w-3 h-3" /> Show more
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[<CurvedPreview3 key="3" />, <CurvedPreview1 key="1" />, <CurvedPreview2 key="2" />].map((Preview, i) => (
                            <button
                                key={i}
                                onClick={() => onAddCurvedText()}
                                className="aspect-square bg-[#f8f8f6] rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden flex items-center justify-center p-2"
                            >
                                {Preview}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

/* ─── Templates Panel ────────────────────────────────────────────────────── */
function TemplatesPanel({ onClose, onLoadTemplate }: { onClose: () => void; onLoadTemplate: (template: any) => void }) {
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('printora_templates') || '[]');
        setTemplates(saved);
    }, []);

    const handleDelete = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = [...templates];
        updated.splice(index, 1);
        setTemplates(updated);
        localStorage.setItem('printora_templates', JSON.stringify(updated));
    };

    return (
        <div className="absolute left-[88px] top-0 bottom-0 w-[340px] bg-white border-r border-gray-200 flex flex-col z-30 shadow-[2px_0_12px_rgba(0,0,0,0.06)] animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">My templates</h2>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
                {templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <LayoutTemplate className="w-12 h-12 text-gray-200" />
                        <div className="text-center">
                            <h3 className="text-[14px] font-bold text-gray-800 mb-1">No templates yet</h3>
                            <p className="text-[12px] text-gray-400 max-w-[200px] leading-relaxed">Save your current design as a template to see it here.</p>
                        </div>
                    </div>
                ) : (
                    templates.map((t, i) => (
                        <div
                            key={i}
                            className="group relative flex flex-col p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all bg-gray-50 cursor-pointer"
                            onClick={() => onLoadTemplate(t)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[14px] text-gray-800 truncate pr-6">{t.name || `Template ${i + 1}`}</h4>
                                <button
                                    onClick={(e) => handleDelete(i, e)}
                                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-gray-400 hover:text-red-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: t.color }} />
                                <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{t.productTemplateId.replace(/-/g, ' ')}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">Click to resume editing</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* ─── Main Editor UI ─────────────────────────────────────────────────────── */
export default function EditorUI() {
    const searchParams = useSearchParams();
    const requestedTemplate = searchParams.get('template');
    const supplierProductId = searchParams.get('supplier_product_id');
    const editOrderId = searchParams.get('edit_order'); // null for new designs
    const initialTemplate = PRODUCT_TEMPLATES.find((p) => p.id === requestedTemplate) || PRODUCT_TEMPLATES[0];

    const isReload = typeof window !== 'undefined' &&
        (performance.getEntriesByType('navigation') as PerformanceNavigationTiming[])[0]?.type === 'reload';

    const [selectedProduct, setSelectedProduct] = useState<ProductTemplate>(() => {
        // Priority 1: URL parameter (Fresh navigation or Reload with query)
        if (requestedTemplate) {
            let p = PRODUCT_TEMPLATES.find(t => t.id === requestedTemplate);
            if (!p) p = PRODUCT_TEMPLATES.find(t => t.category === requestedTemplate || t.id.includes(requestedTemplate) || requestedTemplate.includes(t.category));

            // If it's a reload, and we have a saved session for this exact product, we can use it.
            // But fundamentally, the product is the one requested in the URL.
            if (p) return p;
            return initialTemplate;
        }

        // Priority 2: Saved state (Only if no specific template is requested in URL, e.g. /editor)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('printora_editor_state');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    const p = PRODUCT_TEMPLATES.find(t => t.id === data.productTemplateId);
                    if (p) return p;
                } catch { }
            }
        }
        return initialTemplate;
    });

    const [selectedColor, setSelectedColor] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            // If it's a fresh navigation to a specific template, we don't want the stale saved color.
            // But if it's a reload, we do want to restore their progress.
            if (requestedTemplate && !isReload) {
                return selectedProduct.defaultColorHex;
            }

            const saved = localStorage.getItem('printora_editor_state');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.productTemplateId === selectedProduct.id && data.color) {
                        return data.color;
                    }
                } catch { }
            }
        }
        return selectedProduct.defaultColorHex;
    });

    const [selectedView, setSelectedView] = useState<ProductView>(() => {
        if (typeof window !== 'undefined') {
            if (requestedTemplate && !isReload) {
                return selectedProduct.views.find(v => v.id === selectedProduct.defaultViewId) || selectedProduct.views[0];
            }

            const saved = localStorage.getItem('printora_editor_state');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.productTemplateId === selectedProduct.id && data.viewId) {
                        const v = selectedProduct.views.find(view => view.id === data.viewId);
                        if (v) return v;
                    }
                } catch { }
            }
        }
        return selectedProduct.views.find(v => v.id === selectedProduct.defaultViewId) || selectedProduct.views[0];
    });

    const [viewStates, setViewStates] = useState<Record<string, CanvasDesignState>>(() => {
        // Only restore canvas objects on refresh or when loading a saved state directly without a requested template
        if (typeof window !== 'undefined' && !editOrderId) {
            // If it's a fresh navigation to a specific product, start blank
            if (requestedTemplate && !isReload) return {};

            const sess = sessionStorage.getItem('printora_canvas_session');
            if (sess) {
                try {
                    const data = JSON.parse(sess);
                    // Ensure the saved session actually belongs to the product we are loading
                    if (data.productTemplateId === selectedProduct.id) {
                        return data.viewStates || {};
                    }
                } catch { }
            }
        }
        return {};
    });
    const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
    const [showTextPanel, setShowTextPanel] = useState(false);
    const [showLibraryPanel, setShowLibraryPanel] = useState(false);
    const [showGraphicsPanel, setShowGraphicsPanel] = useState(false);
    const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
    const [activeLeftTool, setActiveLeftTool] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    // Restore loadedTemplateId from session (survives refresh, not nav-away)
    const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            if (requestedTemplate && !isReload) return null;

            const sess = sessionStorage.getItem('printora_canvas_session');
            if (sess) {
                try {
                    const data = JSON.parse(sess);
                    if (data.productTemplateId === selectedProduct.id) {
                        return data.loadedTemplateId || null;
                    }
                } catch { }
            }
        }
        return null;
    });
    const [showExitDialog, setShowExitDialog] = useState(false);
    // Track the DB order ID when editing an existing order
    const [dbOrderId, setDbOrderId] = useState<string | null>(editOrderId);

    // Payment modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderSize, setOrderSize] = useState("L");
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [orderQuality, setOrderQuality] = useState("Standard");
    const [receiptDataUrl, setReceiptDataUrl] = useState("");
    const [supplierColors, setSupplierColors] = useState<{ name: string, hex: string }[] | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('telebirr');
    const [basePrice, setBasePrice] = useState(25);
    const [bulkRules, setBulkRules] = useState<{ threshold: number, value: number } | null>(null);
    const [originalOrder, setOriginalOrder] = useState<any>(null);
    const [deliveryLocation, setDeliveryLocation] = useState('');

    const PAYMENT_METHODS = [
        { id: 'telebirr', name: 'Telebirr', type: 'mobile', shortcode: '123456', icon: Smartphone, image: '/telebirr.png' },
        { id: 'cbe-birr', name: 'CBE Birr', type: 'mobile', shortcode: '654321', icon: Smartphone, image: '/cbe-birr.png' },
        { id: 'm-pesa', name: 'M-Pesa', type: 'mobile', shortcode: '987654', icon: Smartphone, image: '/m-pesa.png' },
        { id: 'cbe', name: 'Commercial Bank of Ethiopia', type: 'bank', account: '100021312323', icon: Building2, image: '/cbe.png' },
        { id: 'abyssinia', name: 'Bank of Abyssinia', type: 'bank', account: '888999000', icon: Building2, image: '/abyssinia.png' },
        { id: 'dashen', name: 'Dashen Bank', type: 'bank', account: '111222333', icon: Building2, image: '/dashen.png' },
    ];

    // Fetch supplier product details if customizing a specific supplier product
    useEffect(() => {
        if (!supplierProductId) return;
        (async () => {
            const { data, error } = await supabase.from('supplier_products').select('available_colors, price, bulk_pricing').eq('id', supplierProductId).single();
            if (!error && data) {
                if (data.available_colors?.length > 0) {
                    setSupplierColors(data.available_colors);
                    // Switch to the first available color if current is not in the list
                    const hasColor = data.available_colors.find((c: any) => c.hex === selectedColor);
                    if (!hasColor) setSelectedColor(data.available_colors[0].hex);
                }
                if (data.price) setBasePrice(data.price);
                if (data.bulk_pricing) {
                    try {
                        let rules = data.bulk_pricing;
                        if (typeof rules === 'string') {
                            const trimmed = rules.trim();
                            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                                rules = JSON.parse(trimmed);
                            } else {
                                // It's a descriptive label, not a programmatic rule
                                rules = null;
                            }
                        }

                        // Validate the rules object structure
                        if (rules && (typeof rules.threshold !== 'number' || typeof rules.value !== 'number')) {
                            rules = null;
                        }

                        setBulkRules(rules);
                    } catch (e) {
                        console.error("Failed to parse bulk pricing", e);
                        setBulkRules(null);
                    }
                }
            }
        })();
    }, [supplierProductId]);

    const printArea = selectedView.printAreas[0];

    const {
        canvasRef, canvas, addText, addCurvedText, addShape, addImage, updateActiveObject, canvasRevision, liveProps,
        undo, redo, canUndo, canRedo
    } = useEditorCanvas({
        printArea,
        canvasSize: { width: 500, height: 540 },
        onSelectionChange: setActiveObject,
        initialState: viewStates[selectedView.id],
        viewId: selectedView.id,
    });

    const handleLoadTemplate = (template: any) => {
        const product = PRODUCT_TEMPLATES.find(p => p.id === template.productTemplateId);
        if (product) {
            setSelectedProduct(product);
            setSelectedColor(template.color);
            setViewStates(template.viewStates || {});
            const view = product.views.find(v => v.id === product.defaultViewId) || product.views[0];
            setSelectedView(view);
            setLoadedTemplateId(template.id || null);
            // We NO LONGER track dbOrderId from templates. Templates should be order-agnostic.
            // Close panel after loading
            setShowTemplatesPanel(false);
            setActiveLeftTool(null);
        }
    };

    const handleViewChange = (viewId: string) => {
        if (canvas) {
            setViewStates(prev => ({
                ...prev,
                [selectedView.id]: { objects: canvas.toJSON().objects },
            }));
        }
        const newView = selectedProduct.views.find(v => v.id === viewId);
        if (newView) setSelectedView(newView);
    };

    // Persistence: Update state when URL query changes (Next.js client-side navigation)
    useEffect(() => {
        if (requestedTemplate) {
            let p = PRODUCT_TEMPLATES.find(t => t.id === requestedTemplate);
            if (!p) p = PRODUCT_TEMPLATES.find(t => t.category === requestedTemplate || t.id.includes(requestedTemplate) || requestedTemplate.includes(t.category));

            if (p && p.id !== selectedProduct.id) {
                setSelectedProduct(p);
                setSelectedColor(p.defaultColorHex);
                setSelectedView(p.views.find(v => v.id === p.defaultViewId) || p.views[0]);
                setViewStates({});
                setLoadedTemplateId(null);
            }
        }
    }, [requestedTemplate]);

    // When opening an existing order for editing, load its saved design data
    useEffect(() => {
        if (!editOrderId) return;
        (async () => {
            const { data: order } = await supabase
                .from('custom_orders')
                .select('design_data, design_views, variants, product_type, status')
                .eq('id', editOrderId)
                .single();
            if (!order) return;
            setOriginalOrder(order);

            // Lock order if it's already approved/processed
            if (order.status !== 'PENDING_ADMIN' && order.status !== 'REJECTED') {
                alert("This order is already approved or in production and cannot be edited.");
                window.location.href = '/orders';
                return;
            }

            // Restore color
            if (order.variants?.color) setSelectedColor(order.variants.color);
            if (order.variants?.size) setOrderSize(order.variants.size);
            if (order.variants?.quantity) setOrderQuantity(order.variants.quantity);
            if (order.variants?.quality) setOrderQuality(order.variants.quality);
            if (order.delivery_location) setDeliveryLocation(order.delivery_location);

            // Rebuild viewStates from design_views (preferred) or design_data
            if (order.design_views && order.design_views.length > 0) {
                const restored: Record<string, any> = {};
                order.design_views.forEach((dv: any) => {
                    if (dv.design?.objects?.length) {
                        restored[dv.viewId] = { objects: dv.design.objects };
                    }
                });
                setViewStates(restored);
            } else if (order.design_data?.objects?.length) {
                // Fallback: old single-view format
                setViewStates({ [selectedView.id]: { objects: order.design_data.objects } });
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editOrderId]);

    // Ref always holds the current view ID — updated each render before effects run.
    // This lets the sync effect use the latest view ID without listing it as a dependency.
    const selectedViewIdRef = React.useRef(selectedView.id);
    selectedViewIdRef.current = selectedView.id;

    // Sync viewStates with canvas changes.
    // IMPORTANT: selectedView.id is intentionally NOT in deps — adding it would cause the
    // effect to fire on view-switch while the canvas still shows the old view's objects,
    // corrupting the new view's slot in viewStates.
    useEffect(() => {
        if (canvas && canvasRevision > 0) {
            setViewStates(prev => ({
                ...prev,
                [selectedViewIdRef.current]: { objects: canvas.toJSON().objects },
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRevision]);

    // Persistence: Save canvas state to sessionStorage on every change
    // (survives refresh but cleared on fresh navigation)
    useEffect(() => {
        const state = {
            productTemplateId: selectedProduct.id,
            color: selectedColor,
            viewId: selectedView.id,
            viewStates,
            loadedTemplateId,
        };
        sessionStorage.setItem('printora_canvas_session', JSON.stringify(state));
        // Also keep localStorage for backwards compat / crash recovery
        localStorage.setItem('printora_editor_state', JSON.stringify(state));
    }, [selectedProduct, selectedColor, selectedView, viewStates, loadedTemplateId]);

    // Check if user is logged in before showing the payment modal
    const handleOrderClick = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Save their work to localStorage so they don't lose it
                localStorage.setItem('printora_pending_design', JSON.stringify({
                    productTemplateId: selectedProduct.id,
                    color: selectedColor,
                    view: selectedView.id,
                    viewStates,
                }));
                window.location.href = "/login";
                return;
            }
            setShowPaymentModal(true);
            setIsSaving(false);
        } catch (e) {
            console.error('Auth error', e);
            setIsSaving(false);
        }
    };

    // ── Helper: composite SVG silhouette from a given viewId onto an offscreen canvas ──
    const compositeViewMockup = async (viewDesignJson: any): Promise<string> => {
        try {
            const captureArea = document.getElementById('product-capture-area');
            const mockupContainer = (captureArea?.firstElementChild as HTMLElement) ?? captureArea;
            if (!mockupContainer) return '';
            const refRect = mockupContainer.getBoundingClientRect();
            const scale = 3; // 3x resolution for high quality
            const W = Math.round(refRect.width * scale);
            const H = Math.round(refRect.height * scale);
            const offscreen = document.createElement('canvas');
            offscreen.width = W;
            offscreen.height = H;
            const ctx = offscreen.getContext('2d')!;
            ctx.scale(scale, scale);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, refRect.width, refRect.height);
            // Draw SVG silhouettes (garment shape) from the live DOM
            const svgEls = mockupContainer.querySelectorAll<SVGSVGElement>('svg');
            for (const svgEl of svgEls) {
                const r = svgEl.getBoundingClientRect();
                const x = r.left - refRect.left;
                const y = r.top - refRect.top;
                const w = r.width; const h = r.height;
                if (w < 1 || h < 1) continue;
                const clone = svgEl.cloneNode(true) as SVGSVGElement;
                clone.setAttribute('width', String(w));
                clone.setAttribute('height', String(h));
                const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                await new Promise<void>(resolve => {
                    const img = new Image();
                    img.onload = () => { ctx.drawImage(img, x, y, w, h); URL.revokeObjectURL(url); resolve(); };
                    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
                    img.src = url;
                });
            }
            // Draw the live Fabric canvas (already shows current view's design)
            const fabricEl = mockupContainer.querySelector<HTMLCanvasElement>('canvas');
            if (fabricEl) {
                const fr = fabricEl.getBoundingClientRect();
                ctx.drawImage(fabricEl, fr.left - refRect.left, fr.top - refRect.top, fr.width, fr.height);
            }
            return offscreen.toDataURL('image/jpeg', 0.85);
        } catch { return ''; }
    };

    const handleSaveProduct = async () => {
        if (!canvas) return;
        setIsSaving(true);
        try {
            // 1. Flush the current active view into viewStates before saving
            canvas.discardActiveObject();
            canvas.renderAll();
            const currentDesign = canvas.toJSON();
            const allViewStates = {
                ...viewStates,
                [selectedView.id]: { objects: currentDesign.objects },
            };

            // 2. Composite the current (active) view mockup for the primary preview image
            let dataUrl = '';
            let printFileDataUrl = '';
            try {
                dataUrl = await compositeViewMockup(currentDesign);
                // High-res design-only print file at 3× multiplier
                printFileDataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 });
            } catch {
                dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.6, multiplier: 1 });
                printFileDataUrl = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
            }

            // 3. Build design_views: one entry per view that has at least one design object
            //    Each entry contains the view name, design JSON, and the composite mockup JPEG.
            //    For views other than the currently active one we re-use the SVG silhouette from
            //    the live DOM (same garment shape, just different design objects drawn via a
            //    temporary Fabric canvas).
            const design_views: Array<{
                viewId: string; viewName: string;
                design: any; mockup_url: string; print_file: string;
            }> = [];

            const originalView = selectedView;

            for (const view of selectedProduct.views) {
                const state = allViewStates[view.id];
                // Only include views that the user actually put something on
                if (!state?.objects?.length) continue;

                const isActiveView = view.id === selectedView.id;
                let viewMockupUrl = '';
                let viewPrintFile = '';

                if (isActiveView) {
                    // Active view: already composited above
                    viewMockupUrl = dataUrl;
                    viewPrintFile = printFileDataUrl;
                } else {
                    try {
                        // 1. Switch the DOM to this view's SVG silhouette using flushSync
                        //    so the mockup component renders the correct garment shape
                        //    (e.g. hoodie BACK instead of hoodie FRONT)
                        flushSync(() => setSelectedView(view));
                        // 2. Wait one frame for the browser to paint the new SVG
                        await new Promise<void>(r => setTimeout(r, 100));

                        // 3. Load this view's design into a temp Fabric canvas
                        const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
                            width: 500, height: 540, selection: false,
                        });
                        await new Promise<void>(resolve => tempCanvas.loadFromJSON(
                            { version: '5.3.0', objects: state.objects },
                            () => { tempCanvas.renderAll(); resolve(); }
                        ));
                        viewPrintFile = tempCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 });

                        // 4. Composite: correct SVG silhouette (now in DOM) + temp design canvas
                        const captureArea = document.getElementById('product-capture-area');
                        const mockupContainer = (captureArea?.firstElementChild as HTMLElement) ?? captureArea;
                        if (mockupContainer) {
                            const refRect = mockupContainer.getBoundingClientRect();
                            const W = Math.round(refRect.width);
                            const H = Math.round(refRect.height);
                            const offscreen = document.createElement('canvas');
                            offscreen.width = W; offscreen.height = H;
                            const ctx = offscreen.getContext('2d')!;
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, W, H);
                            for (const svgEl of mockupContainer.querySelectorAll<SVGSVGElement>('svg')) {
                                const r = svgEl.getBoundingClientRect();
                                const x = r.left - refRect.left;
                                const y = r.top - refRect.top;
                                if (r.width < 1 || r.height < 1) continue;
                                const clone = svgEl.cloneNode(true) as SVGSVGElement;
                                clone.setAttribute('width', String(r.width));
                                clone.setAttribute('height', String(r.height));
                                const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
                                const url = URL.createObjectURL(blob);
                                await new Promise<void>(res => {
                                    const img = new Image();
                                    img.onload = () => { ctx.drawImage(img, x, y, r.width, r.height); URL.revokeObjectURL(url); res(); };
                                    img.onerror = () => { URL.revokeObjectURL(url); res(); };
                                    img.src = url;
                                });
                            }
                            // Draw the temp canvas (correct design for this view) on top
                            ctx.drawImage(tempCanvas.getElement() as HTMLCanvasElement, 0, 0, W, H);
                            viewMockupUrl = offscreen.toDataURL('image/jpeg', 0.85);
                        }
                        tempCanvas.dispose();
                    } catch (e) {
                        console.warn('Could not composite view', view.id, e);
                    }
                }

                design_views.push({
                    viewId: view.id,
                    viewName: view.name,
                    design: { version: '5.3.0', objects: state.objects },
                    mockup_url: viewMockupUrl,
                    print_file: viewPrintFile,
                });
            }

            // Restore original view after compositing all views
            flushSync(() => setSelectedView(originalView));

            console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

            // Attempt to get logged-in user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (!user) {
                // Save their work to localStorage so they don't lose it
                localStorage.setItem('printora_pending_design', JSON.stringify({
                    productTemplateId: selectedProduct.id,
                    color: selectedColor,
                    view: selectedView.id,
                    viewStates: allViewStates,
                }));
                window.location.href = "/login";
                return;
            }

            const finalVariants = {
                ...(originalOrder?.variants || {}),
                color: selectedColor,
                view: selectedView.name,
                size: orderSize,
                quantity: orderQuantity,
                quality: orderQuality,
                receiptDataUrl: receiptDataUrl || originalOrder?.variants?.receiptDataUrl || null,
            };

            if (dbOrderId) {
                // ── UPDATE existing order ──
                const { error } = await supabase.from('custom_orders').update({
                    product_type: selectedProduct.name,
                    supplier_product_id: supplierProductId || null,
                    variants: finalVariants,
                    design_data: {
                        _printFile: printFileDataUrl,
                        objects: allViewStates[selectedView.id]?.objects ?? [],
                    },
                    design_views: design_views,
                    mockup_image_url: dataUrl,
                    status: 'PENDING_ADMIN',
                    delivery_location: deliveryLocation,
                }).eq('id', dbOrderId);

                if (error) {
                    console.error('Error updating order:', error);
                    alert('Failed to update design: ' + error.message);
                } else {
                    window.location.href = '/orders?submitted=true';
                }
            } else {
                // ── INSERT new order ──
                const { data: newOrder, error } = await supabase.from('custom_orders').insert({
                    customer_id: user.id,
                    product_type: selectedProduct.name,
                    supplier_product_id: supplierProductId || null,
                    variants: finalVariants,
                    design_data: {
                        _printFile: printFileDataUrl,
                        objects: allViewStates[selectedView.id]?.objects ?? [],
                    },
                    design_views: design_views,
                    mockup_image_url: dataUrl,
                    status: 'PENDING_ADMIN',
                    delivery_location: deliveryLocation,
                    ...(supplierProductId ? { supplier_product_id: supplierProductId } : {}),
                }).select().single();

                if (error) {
                    console.error('Error saving order:', error);
                    alert('Failed to save product: ' + error.message);
                } else {
                    if (newOrder) {
                        setDbOrderId(newOrder.id);
                        // Server looks up all real emails from DB — just pass orderId + productType
                        notifyNewOrder(newOrder.id, selectedProduct.name);
                    }
                    window.location.href = '/orders?submitted=true';
                }
            }
        } catch (e: any) {
            console.error('Save error:', e);
            alert('An error occurred while saving: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // UseEffect for requestedTemplate was duplicate and handled above, removing the duplicate.

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        e.target.value = '';
        // Try to save to Supabase Storage + library
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const path = `${user.id}/${Date.now()}_${file.name}`;
                const { error: upErr } = await supabase.storage.from('user_assets').upload(path, file, { upsert: false });
                if (!upErr) {
                    const { data: { publicUrl } } = supabase.storage.from('user_assets').getPublicUrl(path);
                    await supabase.from('user_assets').insert({ user_id: user.id, file_name: file.name, file_url: publicUrl });
                    addImage(publicUrl);
                    return;
                }
            }
        } catch { /* fall back to local data URL */ }
        // Fallback: use local data URL (not logged in or upload failed)
        const reader = new FileReader();
        reader.onload = (f) => { const data = f.target?.result as string; if (data) addImage(data); };
        reader.readAsDataURL(file);
    };

    const handleLeftTool = (tool: string) => {
        if (activeLeftTool === tool) {
            setActiveLeftTool(null);
            setShowTextPanel(false);
            setShowLibraryPanel(false);
            setShowGraphicsPanel(false);
            setShowTemplatesPanel(false);
        } else {
            setActiveLeftTool(tool);
            setShowTextPanel(tool === 'text');
            setShowLibraryPanel(tool === 'library');
            setShowGraphicsPanel(tool === 'graphics');
            setShowTemplatesPanel(tool === 'templates');
        }
    };

    const handleAddText = (font?: string) => {
        if (activeObject && activeObject.type === 'i-text' && font) {
            updateActiveObject({ fontFamily: font });
        } else {
            addText('Double click to edit', font ? { fontFamily: font } : undefined);
        }
    };

    const renderMockup = () => {
        const props = { selectedView, selectedColor, printArea, canvasRef };
        switch (selectedProduct.id) {
            case 'premium-hoodie': return <HoodieMockup {...props} />;
            case 'crewneck-sweater': return <SweaterMockup {...props} />;
            case 'classic-cap': return <HatMockup {...props} />;
            default: return <TshirtMockup {...props} />;
        }
    };

    const leftTools = [
        {
            id: 'upload',
            label: 'Upload',
            icon: <UploadCloud className="w-6 h-6 group-hover:scale-110 transition-transform" />,
            isLabel: true,
        },
        {
            id: 'text',
            label: 'Add text',
            icon: <Type className="w-6 h-6 group-hover:scale-110 transition-transform" />,
        },
        {
            id: 'library',
            label: 'My library',
            icon: <Folder className="w-6 h-6 group-hover:scale-110 transition-transform" />,
        },
        {
            id: 'graphics',
            label: 'Graphics',
            icon: <Shapes className="w-6 h-6 group-hover:scale-110 transition-transform" />,
        },
        {
            id: 'templates',
            label: 'My templates',
            icon: <LayoutTemplate className="w-6 h-6 group-hover:scale-110 transition-transform" />,
        },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#F4F4F4] text-gray-800 font-sans overflow-hidden">

            {/* Top Navigation Bar */}
            <div className="h-14 bg-white flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => {
                            if (canvasRevision > 0) {
                                setShowExitDialog(true);
                            } else {
                                window.history.back();
                            }
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-5 w-[1px] bg-gray-300" />
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-gray-500" />
                        <button
                            onClick={undo}
                            disabled={!canUndo}
                            className={`${canUndo ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <Undo2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={!canRedo}
                            className={`${canRedo ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <Redo2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-md p-1">
                        <button className="px-6 py-1.5 text-sm font-semibold bg-[#64645C] text-white rounded shadow-sm">Edit</button>
                        <button className="px-6 py-1.5 text-sm font-semibold text-gray-700 bg-white shadow-sm rounded ml-1">Preview</button>
                    </div>
                    <button className="w-9 h-9 flex items-center justify-center bg-[#E5E5DF] rounded-md text-gray-700">
                        <Wand2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleOrderClick}
                        disabled={isSaving}
                        className={`${isSaving ? 'bg-gray-300' : 'bg-[#A1FF4D] hover:bg-[#8ee643] text-[#1B2412]'} font-bold px-8 py-1.5 rounded text-sm uppercase transition-colors ml-2 shadow-sm flex items-center justify-center gap-2`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Checking...
                            </>
                        ) : dbOrderId ? 'Update Order' : 'Order'}
                    </button>
                    <button
                        onClick={() => {
                            if (!canvas) return;
                            // Flush current canvas into viewStates before saving template
                            const currentObjects = canvas.toJSON().objects;
                            const freshViewStates = { ...viewStates, [selectedView.id]: { objects: currentObjects } };

                            const existing = loadedTemplateId
                                ? JSON.parse(localStorage.getItem('printora_templates') || '[]').find((t: any) => t.id === loadedTemplateId)
                                : null;

                            const state = {
                                id: loadedTemplateId || `${selectedProduct.id}-${Date.now()}`,
                                productTemplateId: selectedProduct.id,
                                color: selectedColor,
                                viewStates: freshViewStates,
                                // Keep original creation name; only set on first save
                                name: existing?.name || `Template ${new Date().toLocaleTimeString()}`,
                            };
                            const templates = JSON.parse(localStorage.getItem('printora_templates') || '[]');
                            const existingIndex = templates.findIndex((t: any) => t.id === state.id);
                            if (existingIndex >= 0) templates[existingIndex] = state;
                            else templates.push(state);
                            localStorage.setItem('printora_templates', JSON.stringify(templates));
                            setLoadedTemplateId(state.id);
                            setShowTemplatesPanel(true);
                            setActiveLeftTool('templates');
                        }}
                        className="bg-white border border-gray-300 text-gray-700 font-bold px-4 py-1.5 rounded text-sm uppercase transition-colors ml-2 hover:bg-gray-50 shadow-sm"
                    >
                        {loadedTemplateId ? 'Update Template' : 'Save Template'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">

                {/* ═══════════ LEFT TOOLBAR (icons) ═══════════ */}
                <div className="w-[88px] flex-shrink-0 flex flex-col items-center py-4 bg-white border-r border-gray-200 shadow-sm z-20">
                    <div className="flex flex-col gap-1 w-full items-center">
                        {leftTools.map(tool => {
                            const isActive = activeLeftTool === tool.id;
                            if (tool.isLabel) {
                                return (
                                    <label
                                        key={tool.id}
                                        className={`w-full flex flex-col items-center gap-1.5 cursor-pointer py-3 rounded-lg transition-colors group ${isActive ? 'bg-[#f0f0ec] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {tool.icon}
                                        <span className="text-[10px] font-medium">{tool.label}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                );
                            }
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => handleLeftTool(tool.id)}
                                    className={`w-full flex flex-col items-center gap-1.5 py-3 rounded-lg transition-colors group ${isActive ? 'bg-[#f0f0ec] text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {tool.icon}
                                    <span className="text-[10px] font-medium text-center leading-tight">{tool.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════════ TEXT PANEL (slide-in) ═══════════ */}
                {showTextPanel && (
                    <TextPanel
                        onClose={() => { setShowTextPanel(false); setActiveLeftTool(null); }}
                        onAddText={handleAddText}
                        onAddCurvedText={addCurvedText}
                    />
                )}

                {/* ═══════════ LIBRARY PANEL (slide-in) ═══════════ */}
                {showLibraryPanel && (
                    <LibraryPanel
                        onClose={() => { setShowLibraryPanel(false); setActiveLeftTool(null); }}
                        onAddImage={addImage}
                    />
                )}

                {/* ═══════════ GRAPHICS PANEL (slide-in) ═══════════ */}
                {showGraphicsPanel && (
                    <GraphicsPanel
                        onClose={() => { setShowGraphicsPanel(false); setActiveLeftTool(null); }}
                        onAddShape={addShape}
                        onAddCurvedText={addCurvedText}
                    />
                )}

                {/* ═══════════ TEMPLATES PANEL (slide-in) ═══════════ */}
                {showTemplatesPanel && (
                    <TemplatesPanel
                        onClose={() => { setShowTemplatesPanel(false); setActiveLeftTool(null); }}
                        onLoadTemplate={handleLoadTemplate}
                    />
                )}

                {/* ═══════════ CENTER: Canvas ═══════════ */}
                <div className="flex-1 flex flex-col relative bg-[#F4F4F4]">
                    {/* PROPERTIES TOOLBAR — reads from liveProps (plain state) for live drag updates */}
                    {activeObject && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-200 flex items-center px-3 py-2 gap-2 z-40 transition-all animate-in fade-in slide-in-from-top-4 duration-200">
                            {liveProps.type === 'i-text' && (
                                <>
                                    {/* Font Size */}
                                    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
                                        <button onClick={() => updateActiveObject({ fontSize: Math.max(10, (liveProps.fontSize || 32) - 2) })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"><Minus className="w-4 h-4" /></button>
                                        <span className="text-[13px] font-bold w-8 text-center">{Math.round(liveProps.fontSize || 32)}</span>
                                        <button onClick={() => updateActiveObject({ fontSize: (liveProps.fontSize || 32) + 2 })} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    {/* Font Styles */}
                                    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
                                        <button onClick={() => updateActiveObject({ fontWeight: liveProps.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors ${liveProps.fontWeight === 'bold' ? 'bg-gray-200 text-gray-900 font-bold' : 'text-gray-600'}`}>B</button>
                                        <button onClick={() => updateActiveObject({ fontStyle: liveProps.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors italic ${liveProps.fontStyle === 'italic' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 font-serif'}`}>I</button>
                                        <button onClick={() => updateActiveObject({ underline: !liveProps.underline })} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors underline ${liveProps.underline ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}>U</button>
                                    </div>
                                </>
                            )}

                            {/* Color Picker (for everything except images) */}
                            {liveProps.type !== 'image' && (
                                <div className="flex items-center gap-3 border-r border-gray-200 pr-3 mr-1">
                                    {/* Fill */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">Fill</span>
                                        <div className="flex items-center gap-0.5">
                                            <button onClick={() => updateActiveObject(liveProps.type === 'line' ? { stroke: 'transparent' } : { fill: 'transparent' })} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="No Fill"><X className="w-3.5 h-3.5" /></button>
                                            <label className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 cursor-pointer overflow-hidden shadow-sm hover:scale-110 transition-transform relative"
                                                style={{ backgroundColor: (liveProps.type === 'line' ? liveProps.stroke : liveProps.fill) === 'transparent' ? '#ffffff' : (liveProps.type === 'line' ? liveProps.stroke : liveProps.fill) || '#000000' }}
                                                title="Fill Color">
                                                {(liveProps.type === 'line' ? liveProps.stroke : liveProps.fill) === 'transparent' && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[120%] h-px bg-red-500 rotate-45" /></div>
                                                )}
                                                <input type="color"
                                                    value={(liveProps.type === 'line' ? liveProps.stroke : liveProps.fill) === 'transparent' ? '#000000' : (liveProps.type === 'line' ? liveProps.stroke : liveProps.fill) || '#000000'}
                                                    onChange={(e) => updateActiveObject(liveProps.type === 'line' ? { stroke: e.target.value } : { fill: e.target.value })}
                                                    className="opacity-0 w-full h-full cursor-pointer" />
                                            </label>
                                        </div>
                                    </div>
                                    {/* Stroke color */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">Stroke</span>
                                        <div className="flex items-center gap-0.5">
                                            <button onClick={() => updateActiveObject({ stroke: 'transparent', strokeWidth: 0 })} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="No Stroke"><X className="w-3.5 h-3.5" /></button>
                                            <label className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 cursor-pointer overflow-hidden shadow-sm hover:scale-110 transition-transform relative"
                                                style={{ backgroundColor: (liveProps.stroke === 'transparent' || !liveProps.strokeWidth) ? '#ffffff' : liveProps.stroke || '#000000' }}
                                                title="Stroke Color">
                                                {(liveProps.stroke === 'transparent' || !liveProps.strokeWidth) && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[120%] h-px bg-red-500 rotate-45" /></div>
                                                )}
                                                <input type="color"
                                                    value={liveProps.stroke === 'transparent' ? '#000000' : liveProps.stroke || '#000000'}
                                                    onChange={(e) => updateActiveObject({ stroke: e.target.value, strokeWidth: liveProps.strokeWidth || 1 })}
                                                    className="opacity-0 w-full h-full cursor-pointer" />
                                            </label>
                                        </div>
                                    </div>
                                    {/* Border width slider */}
                                    <div className="flex flex-col items-center gap-0.5 w-16">
                                        <span className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">Border</span>
                                        <input type="range" min="0" max="20"
                                            value={liveProps.strokeWidth || 0}
                                            onChange={(e) => updateActiveObject({ strokeWidth: parseInt(e.target.value), stroke: (liveProps.stroke && liveProps.stroke !== 'transparent') ? liveProps.stroke : '#000000' }, false)}
                                            onPointerUp={(e) => updateActiveObject({ strokeWidth: parseInt((e.target as HTMLInputElement).value), stroke: (liveProps.stroke && liveProps.stroke !== 'transparent') ? liveProps.stroke : '#000000' }, true)}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700" />
                                    </div>
                                </div>
                            )}

                            {/* Opacity slider */}
                            <div className="flex items-center gap-2 pr-1">
                                <div className="flex flex-col items-center gap-0.5 w-16">
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wide font-bold">Opacity</span>
                                    <input type="range" min="0" max="100"
                                        value={Math.round((liveProps.opacity ?? 1) * 100)}
                                        onChange={(e) => updateActiveObject({ opacity: parseInt(e.target.value) / 100 }, false)}
                                        onPointerUp={(e) => updateActiveObject({ opacity: parseInt((e.target as HTMLInputElement).value) / 100 }, true)}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-hidden">
                        <style>{`
                            .has-design .print-area-placeholder {
                                opacity: 0;
                                transition: opacity 0.2s ease-in-out;
                                pointer-events: none;
                            }
                        `}</style>
                        <div id="product-capture-area" className={`relative z-10 w-full h-full max-w-2xl flex justify-center items-center drop-shadow-md ${(canvas?.getObjects().length || 0) > 0 ? 'has-design' : ''}`}>
                            {renderMockup()}
                        </div>
                    </div>

                    {/* View Pills */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 z-30">
                        {selectedProduct.views.map(view => (
                            <button
                                key={view.id}
                                onClick={() => handleViewChange(view.id)}
                                className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all shadow-sm ${selectedView.id === view.id
                                    ? 'bg-[#64645A] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                {view.name}
                            </button>
                        ))}
                    </div>

                </div>

                {/* ═══════════ RIGHT PANEL: Variants & Layers ═══════════ */}
                <div className="absolute right-4 top-4 w-[320px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 z-30 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-[15px] text-gray-800">Variants and layers</h3>
                    </div>
                    <div className="p-5 flex-1 min-h-[150px] bg-white">
                        <h4 className="font-bold text-[13px] text-gray-800 mb-4">Variants</h4>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600 text-[13px]">Colors</span>
                            <button className="border border-gray-300 px-3 py-1.5 rounded text-[12px] text-gray-700 hover:bg-gray-50 font-bold">
                                Select variants
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(supplierColors?.length ? supplierColors : selectedProduct.variants).map((c: any) => {
                                const hex = c.hex || c.colorHex;
                                const name = c.name || c.colorName;
                                return (
                                    <button
                                        key={hex}
                                        title={name}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === hex
                                            ? 'border-gray-400 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        style={{ backgroundColor: hex }}
                                        onClick={() => setSelectedColor(hex)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Professional Exit Dialog */}
            {showExitDialog && (
                <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Unsaved changes</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                You have unsaved changes in your design. If you leave now, you might lose your recent edits. Do you want to save before leaving?
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    handleOrderClick();
                                    setShowExitDialog(false);
                                }}
                                className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-gray-800 transition-colors shadow-sm"
                            >
                                Continue to Order
                            </button>
                            <button
                                onClick={() => {
                                    window.history.back();
                                }}
                                className="w-full bg-white text-red-600 rounded-lg py-2.5 font-semibold text-sm hover:bg-red-50 transition-colors border border-red-100"
                            >
                                Leave without saving
                            </button>
                            <button
                                onClick={() => setShowExitDialog(false)}
                                className="w-full text-gray-500 rounded-lg py-2 font-medium text-sm hover:bg-gray-100 transition-colors mt-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment / Order Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4 lg:p-10 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl flex flex-col lg:flex-row animate-in zoom-in-95 duration-300 overflow-hidden max-h-[95vh]">

                        {/* Left Column: Selections & Payment (Scrollable) */}
                        <div className="flex-[1.4] flex flex-col p-8 lg:p-12 overflow-y-auto custom-scrollbar border-r border-gray-100">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Inter, sans-serif' }}>Order Details</h2>
                                <button onClick={() => setShowPaymentModal(false)} className="lg:hidden text-gray-400 hover:text-gray-900 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Section 1: Customization */}
                            <div className="space-y-8 mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center text-[13px] font-black">1</div>
                                    <h3 className="text-lg font-bold text-gray-900">Choose Size & Quality</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Size</label>
                                        <CustomSelect
                                            value={orderSize}
                                            options={["S", "M", "L", "XL", "XXL"]}
                                            onChange={(val) => setOrderSize(val)}
                                            className="custom-editor-select"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Garment Quality</label>
                                        <CustomSelect
                                            value={orderQuality}
                                            options={["Standard", "Premium"]}
                                            onChange={(val) => setOrderQuality(val)}
                                            className="custom-editor-select"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3 max-w-[200px]">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={orderQuantity}
                                            onChange={(e) => setOrderQuantity(e.target.value === '' ? ('' as any) : parseInt(e.target.value))}
                                            onBlur={() => setOrderQuantity(Math.max(1, parseInt(orderQuantity as any) || 1))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ccff00] transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Location</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={deliveryLocation}
                                                onChange={(e) => setDeliveryLocation(e.target.value)}
                                                placeholder="e.g. Bole, Addis Ababa"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#ccff00] transition-all"
                                            />
                                            <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Payment Gateway */}
                            <div className="space-y-8 mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center text-[13px] font-black">2</div>
                                    <h3 className="text-lg font-bold text-gray-900">Select Payment Method</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PAYMENT_METHODS.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedPaymentMethod(method.id)}
                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${selectedPaymentMethod === method.id
                                                ? 'border-[#ccff00] bg-[#ccff00]/5 ring-1 ring-[#ccff00]'
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${selectedPaymentMethod === method.id ? 'bg-[#ccff00] text-[#1B2412]' : 'bg-gray-50 text-gray-400'}`}>
                                                {method.image ? (
                                                    <img src={method.image} alt={method.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <method.icon size={24} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-gray-900">{method.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{method.type}</p>
                                            </div>
                                            {selectedPaymentMethod === method.id && (
                                                <div className="w-6 h-6 rounded-full bg-[#ccff00] flex items-center justify-center">
                                                    <Check size={14} className="text-[#1B2412] font-black" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Payment Instructions */}
                                {selectedPaymentMethod && (
                                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 overflow-hidden p-1">
                                            {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.image ? (
                                                <img
                                                    src={PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.image}
                                                    alt="Bank Logo"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <CreditCard size={28} className="text-[#ccff00]" />
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Transfer to the following {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.type === 'mobile' ? 'shortcode' : 'account'}:</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-2xl font-black text-gray-900 tracking-widest">
                                                {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.shortcode || PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.account}
                                            </p>
                                            <p className="text-[10px] font-black text-[#ccff00] uppercase tracking-widest bg-[#1B2412] px-3 py-1 rounded-full inline-block mx-auto">
                                                {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Receipt Upload */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center text-[13px] font-black">3</div>
                                    <h3 className="text-lg font-bold text-gray-900">Upload Transfer Receipt</h3>
                                </div>

                                <div
                                    onClick={() => document.getElementById('checkout-receipt-upload')?.click()}
                                    className="relative border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#ccff00] hover:bg-[#ccff00]/5 transition-all bg-white shadow-sm"
                                >
                                    <input
                                        id="checkout-receipt-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => setReceiptDataUrl(event.target?.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                    />

                                    {receiptDataUrl ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#ccff00] shadow-xl">
                                                <img src={receiptDataUrl} className="w-full h-full object-cover" alt="Receipt Preview" />
                                            </div>
                                            <div className="bg-[#ccff00] text-[#1B2412] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Check size={12} /> Receipt Attached
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setReceiptDataUrl(""); }}
                                                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                            >
                                                Remove and Change
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center group-hover:bg-white group-hover:text-[#ccff00] transition-all group-hover:scale-110">
                                                <UploadCloud size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-900 mb-1">Click to browse or drag receipt here</p>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Supports JPG, PNG, PDF (Max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="flex-1 bg-gray-50/80 p-8 lg:p-12 flex flex-col relative overflow-hidden">
                            <button onClick={() => setShowPaymentModal(false)} className="hidden lg:flex absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 shadow-sm z-20">
                                <X size={24} />
                            </button>

                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-[11px] font-black text-[#ccff00] uppercase tracking-[0.2em] bg-[#1B2412] px-3 py-1.5 rounded-lg inline-block self-start mb-10">Order Summary</h3>

                                <div className="space-y-10 flex-1">
                                    {(() => {
                                        const isBulkDiscountApplied = bulkRules && orderQuantity >= bulkRules.threshold;
                                        const discountPercentage = isBulkDiscountApplied ? bulkRules.value : 0;
                                        const unitPrice = basePrice * (1 - discountPercentage / 100);
                                        const premiumExtra = orderQuality === "Premium" ? 5 : 0;
                                        const finalUnitPrice = unitPrice + premiumExtra;
                                        const finalTotalPrice = finalUnitPrice * orderQuantity;

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                                    <span>Base Price</span>
                                                    <span className="text-gray-900">
                                                        {isBulkDiscountApplied ? (
                                                            <>
                                                                <span className="line-through text-gray-400 mr-2">ETB {basePrice.toFixed(2)}</span>
                                                                <span>ETB {unitPrice.toFixed(2)}</span>
                                                            </>
                                                        ) : (
                                                            `ETB ${basePrice.toFixed(2)}`
                                                        )}
                                                    </span>
                                                </div>
                                                {isBulkDiscountApplied && (
                                                    <div className="flex justify-between items-center text-sm font-bold text-[#ccff00]">
                                                        <span>Bulk Discount Applied</span>
                                                        <span className="bg-[#1B2412] px-2 py-0.5 rounded-md text-[10px]">{bulkRules.value}% Off!</span>
                                                    </div>
                                                )}
                                                {orderQuality === "Premium" && (
                                                    <div className="flex justify-between items-center text-sm font-bold text-[#ccff00]">
                                                        <span>Premium Upgrade</span>
                                                        <span className="bg-[#1B2412] px-2 py-0.5 rounded-md text-[10px]">+ETB 5.00</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                                    <span>Quantity</span>
                                                    <span className="text-gray-900">x {orderQuantity}</span>
                                                </div>
                                                <div className="h-px bg-gray-200 my-6" />

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Price</p>
                                                        <p className="text-3xl font-black text-gray-900">ETB {finalTotalPrice.toFixed(2)}</p>
                                                    </div>
                                                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex justify-between items-center mt-6">
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#3da85b] uppercase tracking-widest">Pay Now (50%)</p>
                                                            <p className="text-xl font-black text-gray-900">ETB {(finalTotalPrice / 2).toFixed(2)}</p>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                    </div>

                                                    {/* Production Guarantee Note */}
                                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-1 duration-500 shadow-sm">
                                                        <div className="text-amber-600 mt-0.5 flex-shrink-0">
                                                            <AlertCircle size={18} />
                                                        </div>
                                                        <p className="text-[13px] font-medium text-amber-900 leading-normal">
                                                            <span className="font-black block mb-0.5 uppercase tracking-widest text-[11px] text-amber-700">Production Requirement</span>
                                                            A <span className="font-black underline">50% deposit</span> is required to secure raw materials and initiate your custom production immediately.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <button
                                    onClick={() => {
                                        if (!receiptDataUrl) {
                                            alert("Please upload your payment receipt before submitting.");
                                            return;
                                        }
                                        setShowPaymentModal(false);
                                        handleSaveProduct();
                                    }}
                                    className="w-full bg-[#1B2412] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#A1FF4D] hover:text-[#1B2412] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-10 group"
                                >
                                    Confirm & Submit Order <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                                </button>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
