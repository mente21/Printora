"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Type, Shapes, LayoutTemplate } from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const GUTTER = 4; // 4% unprintable margin on each side

const UNIT_TO_MM: Record<string, number> = { mm: 1, cm: 10, m: 1000, in: 25.4 };

const RATIO_PRESETS = [
    { label: '1:1', sub: 'Square', w: 1, h: 1 },
    { label: '2:1', sub: 'Banner', w: 2, h: 1 },
    { label: '3:1', sub: 'Wide', w: 3, h: 1 },
    { label: '1:2', sub: 'Tall', w: 1, h: 2 },
    { label: '4:1', sub: 'Strip', w: 4, h: 1 },
    { label: '16:9', sub: 'HD', w: 16, h: 9 },
];

const SWATCHES = [
    { bg: '#1C1C1C', border: false },
    { bg: '#1B3A6B', border: false },
    { bg: '#ffffff', border: true },
    { bg: '#888888', border: false },
    { bg: '#6DCC5A', border: false },
];

const SIDEBAR_ITEMS = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'text', label: 'Add text', icon: Type },
    { id: 'graphics', label: 'Graphics', icon: Shapes },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }

function simplifyRatio(w: number, h: number): string {
    const wR = Math.round(w), hR = Math.round(h);
    const g = gcd(wR, hR);
    return `${wR / g}:${hR / g}`;
}

function fromMm(v: number, unit: string): number {
    const divisor = UNIT_TO_MM[unit];
    const result = v / divisor;
    if (unit === 'm') return parseFloat(result.toFixed(3));
    if (unit === 'in') return parseFloat(result.toFixed(2));
    return Math.round(result);
}

/* ─── SVG Overlay ────────────────────────────────────────────────────────── */
function drawOverlaySvg(cw: number, ch: number): string {
    const gW = (cw * GUTTER) / 100;
    const gH = (ch * GUTTER) / 100;
    const pX = gW, pY = gH;
    const pW = cw - gW * 2;
    const pH = ch - gH * 2;
    const labelSize = Math.max(8, Math.min(13, cw * 0.025));
    const cornerSize = Math.max(6, Math.min(10, gW * 0.4));

    return `
    <defs>
      <pattern id="hp" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 6 L6 0" stroke="rgba(160,160,160,0.28)" stroke-width="0.7" vector-effect="non-scaling-stroke"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="${cw}" height="${gH}" fill="rgba(140,140,140,0.06)" vector-effect="non-scaling-stroke"/>
    <rect x="0" y="${ch - gH}" width="${cw}" height="${gH}" fill="rgba(140,140,140,0.06)" vector-effect="non-scaling-stroke"/>
    <rect x="0" y="0" width="${gW}" height="${ch}" fill="rgba(140,140,140,0.06)" vector-effect="non-scaling-stroke"/>
    <rect x="${cw - gW}" y="0" width="${gW}" height="${ch}" fill="rgba(140,140,140,0.06)" vector-effect="non-scaling-stroke"/>
    <rect x="0" y="0" width="${cw}" height="${gH}" fill="url(#hp)" vector-effect="non-scaling-stroke"/>
    <rect x="0" y="${ch - gH}" width="${cw}" height="${gH}" fill="url(#hp)" vector-effect="non-scaling-stroke"/>
    <rect x="0" y="0" width="${gW}" height="${ch}" fill="url(#hp)" vector-effect="non-scaling-stroke"/>
    <rect x="${cw - gW}" y="0" width="${gW}" height="${ch}" fill="url(#hp)" vector-effect="non-scaling-stroke"/>
    <rect x="${pX}" y="${pY}" width="${pW}" height="${pH}"
          fill="none" stroke="rgba(120,120,120,0.25)" stroke-width="0.8"
          stroke-dasharray="4 2.5" vector-effect="non-scaling-stroke"/>
    <line x1="${cw / 2}" y1="${pY}" x2="${cw / 2}" y2="${pY + pH}"
          stroke="rgba(100,130,200,0.15)" stroke-width="0.6"
          stroke-dasharray="2.5 2.5" vector-effect="non-scaling-stroke"/>
    <line x1="${pX}" y1="${ch / 2}" x2="${pX + pW}" y2="${ch / 2}"
          stroke="rgba(100,130,200,0.15)" stroke-width="0.6"
          stroke-dasharray="2.5 2.5" vector-effect="non-scaling-stroke"/>
    <text x="${cw / 2}" y="${ch / 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="${labelSize}" fill="rgba(190,190,190,0.8)"
          font-family="DM Sans,Inter,sans-serif" letter-spacing="1"
          vector-effect="non-scaling-stroke">PRINT AREA</text>
    <text x="${gW / 2}" y="${gH / 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="${cornerSize}" fill="rgba(150,150,150,0.7)"
          font-family="DM Sans,Inter,sans-serif" vector-effect="non-scaling-stroke">4%</text>
    <text x="${cw - gW / 2}" y="${gH / 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="${cornerSize}" fill="rgba(150,150,150,0.7)"
          font-family="DM Sans,Inter,sans-serif" vector-effect="non-scaling-stroke">4%</text>
    <text x="${gW / 2}" y="${ch - gH / 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="${cornerSize}" fill="rgba(150,150,150,0.7)"
          font-family="DM Sans,Inter,sans-serif" vector-effect="non-scaling-stroke">4%</text>
    <text x="${cw - gW / 2}" y="${ch - gH / 2}" text-anchor="middle" dominant-baseline="middle"
          font-size="${cornerSize}" fill="rgba(150,150,150,0.7)"
          font-family="DM Sans,Inter,sans-serif" vector-effect="non-scaling-stroke">4%</text>
    `;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function BannerEditorUI() {
    const outerRef = useRef<HTMLDivElement>(null);

    // Load DM Sans font
    useEffect(() => {
        const id = 'dmsans-font';
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    // Real-world dimensions in mm
    const [realW, setRealW] = useState(2000);
    const [realH, setRealH] = useState(1000);
    const [unit, setUnit] = useState('mm');
    const [dpi, setDpi] = useState(72);
    const [activeSwatch, setActiveSwatch] = useState(0);
    const [activeSidebar, setActiveSidebar] = useState('upload');

    // Canvas pixel dimensions (computed)
    const [canvasW, setCanvasW] = useState(429);
    const [canvasH, setCanvasH] = useState(215);
    const [scaleN, setScaleN] = useState(5);

    // Input field values (in current unit)
    const [inputW, setInputW] = useState('2000');
    const [inputH, setInputH] = useState('1000');

    /* ── Compute canvas size from real dimensions ── */
    const computeCanvas = useCallback(() => {
        const outer = outerRef.current;
        if (!outer) return;
        const maxW = outer.clientWidth - 40;
        const maxH = outer.clientHeight - 56;
        if (maxW <= 0 || maxH <= 0) return;

        const r = realW / realH;
        let cw: number, ch: number;
        if (r >= 1) {
            cw = maxW;
            ch = Math.round(cw / r);
            if (ch > maxH) { ch = maxH; cw = Math.round(ch * r); }
        } else {
            ch = maxH;
            cw = Math.round(ch * r);
            if (cw > maxW) { cw = maxW; ch = Math.round(cw / r); }
        }
        const N = Math.max(1, Math.round(realW / cw));
        setCanvasW(cw);
        setCanvasH(ch);
        setScaleN(N);
    }, [realW, realH]);

    useEffect(() => { computeCanvas(); }, [computeCanvas]);

    useEffect(() => {
        const handler = () => setTimeout(computeCanvas, 40);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [computeCanvas]);

    /* ── Sync inputs when unit or real dims change ── */
    useEffect(() => {
        setInputW(String(fromMm(realW, unit)));
        setInputH(String(fromMm(realH, unit)));
    }, [realW, realH, unit]);

    /* ── Handlers ── */
    const handleRatioBtn = (rW: number, rH: number) => {
        const newW = Math.round(realH * rW / rH);
        setRealW(newW);
    };

    const handleManualInput = (field: 'w' | 'h', val: string) => {
        const v = parseFloat(val) || 1;
        const mm = v * UNIT_TO_MM[unit];
        if (field === 'w') { setInputW(val); setRealW(mm); }
        else { setInputH(val); setRealH(mm); }
    };

    const activeRatio = (rW: number, rH: number) => {
        const r = realW / realH;
        const br = rW / rH;
        return Math.abs(br - r) < 0.01;
    };

    /* ── Derived display values ── */
    const dpiPerMm = dpi / 25.4;
    const expW = Math.round(realW * dpiPerMm);
    const expH = Math.round(realH * dpiPerMm);
    const ratioTag = simplifyRatio(realW, realH);
    const sizeTag = `${fromMm(realW, unit)} × ${fromMm(realH, unit)} ${unit}`;
    const overlaySvg = drawOverlaySvg(canvasW, canvasH);

    /* ── Styles (matching the original design system) ── */
    const s = {
        bg: '#F2F1EE',
        surface: '#fff',
        sidebar: '#1C1C1C',
        border: '#E0DDD8',
        accent: '#6DCC5A',
        text: '#1A1A1A',
        text2: '#666',
        text3: '#999',
    };

    return (
        <div style={{
            display: 'flex', height: '100vh', background: s.bg,
            fontFamily: "'DM Sans', 'Inter', sans-serif", flexDirection: 'column', overflow: 'hidden',
        }}>
            {/* ── Top Bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 20px', background: s.surface, borderBottom: `1px solid ${s.border}`,
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/products" style={{
                        display: 'flex', alignItems: 'center', gap: 6, color: s.text2,
                        textDecoration: 'none', fontSize: 13, fontWeight: 500,
                    }}>
                        <ArrowLeft size={16} /> Products
                    </Link>
                    <div style={{ width: 1, height: 18, background: s.border }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: s.text }}>Banner Editor</span>
                    <span style={{
                        fontSize: 11, background: '#E8E6E1', color: s.text2,
                        padding: '2px 8px', borderRadius: 20,
                    }}>{ratioTag}</span>
                    <span style={{
                        fontSize: 11, background: '#E8E6E1', color: s.text2,
                        padding: '2px 8px', borderRadius: 20,
                    }}>{sizeTag}</span>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                    <BtnTB>Edit</BtnTB>
                    <BtnTB>Preview</BtnTB>
                    <BtnTB accent>ORDER</BtnTB>
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

                {/* ── Sidebar ── */}
                <div style={{
                    width: 72, background: s.sidebar, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0,
                }}>
                    {SIDEBAR_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        const active = activeSidebar === item.id;
                        if (idx === 2) {
                            // separator before Graphics
                            return (
                                <React.Fragment key={item.id}>
                                    <div style={{ width: 36, height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                                    <SbItem label={item.label} active={active} onClick={() => setActiveSidebar(item.id)}>
                                        <Icon size={20} color={active ? '#fff' : '#666'} />
                                    </SbItem>
                                </React.Fragment>
                            );
                        }
                        return (
                            <SbItem key={item.id} label={item.label} active={active} onClick={() => setActiveSidebar(item.id)}>
                                <Icon size={20} color={active ? '#fff' : '#666'} />
                            </SbItem>
                        );
                    })}
                </div>

                {/* ── Canvas Area ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 20px', gap: 12, overflow: 'hidden', minWidth: 0 }}>
                    {/* Canvas outer */}
                    <div
                        ref={outerRef}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', minHeight: 0, position: 'relative',
                        }}
                    >
                        {/* White print surface */}
                        <div style={{
                            position: 'relative',
                            width: canvasW,
                            height: canvasH,
                            background: '#fff',
                            boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
                            flexShrink: 0,
                        }}>
                            {/* SVG overlay */}
                            <svg
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}
                                viewBox={`0 0 ${canvasW} ${canvasH}`}
                                width={canvasW}
                                height={canvasH}
                                dangerouslySetInnerHTML={{ __html: overlaySvg }}
                            />
                            {/* Scale badge */}
                            <div style={{
                                position: 'absolute', bottom: -28, right: 0,
                                background: 'rgba(255,255,255,0.95)', border: `0.5px solid ${s.border}`,
                                borderRadius: 5, padding: '3px 9px', fontSize: 11, color: s.text2,
                                whiteSpace: 'nowrap', pointerEvents: 'none',
                            }}>
                                Scale <strong style={{ color: s.text, fontWeight: 600 }}>1:{scaleN}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={{
                    width: 224, background: s.surface, borderLeft: `1px solid ${s.border}`,
                    display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0,
                }}>

                    {/* Aspect Ratio */}
                    <RpSection title="Aspect ratio">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                            {RATIO_PRESETS.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => handleRatioBtn(p.w, p.h)}
                                    style={{
                                        padding: '6px 0', fontSize: 11, fontWeight: 500,
                                        border: `1px solid ${activeRatio(p.w, p.h) ? s.text : s.border}`,
                                        borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                                        background: activeRatio(p.w, p.h) ? s.text : 'transparent',
                                        color: activeRatio(p.w, p.h) ? '#fff' : s.text2,
                                        fontFamily: 'inherit', lineHeight: 1.35, transition: 'all .15s',
                                    }}
                                >
                                    {p.label}
                                    <span style={{
                                        fontSize: 9, display: 'block',
                                        color: activeRatio(p.w, p.h) ? 'rgba(255,255,255,0.55)' : s.text3,
                                    }}>{p.sub}</span>
                                </button>
                            ))}
                        </div>
                    </RpSection>

                    {/* Size */}
                    <RpSection title="Size">
                        {/* Unit row */}
                        <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
                            {['mm', 'cm', 'm', 'in'].map(u => (
                                <button
                                    key={u}
                                    onClick={() => setUnit(u)}
                                    style={{
                                        flex: 1, padding: '4px 0', fontSize: 11,
                                        border: `1px solid ${unit === u ? s.text : s.border}`,
                                        borderRadius: 5,
                                        background: unit === u ? s.text : 'transparent',
                                        color: unit === u ? '#fff' : s.text2,
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                    }}
                                >{u === 'in' ? 'inch' : u}</button>
                            ))}
                        </div>
                        {/* Dim inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 6 }}>
                            <DimField label="Width" value={inputW} onChange={v => handleManualInput('w', v)} />
                            <span style={{ fontSize: 13, color: s.text3, textAlign: 'center' }}>×</span>
                            <DimField label="Height" value={inputH} onChange={v => handleManualInput('h', v)} />
                        </div>
                    </RpSection>

                    {/* Scale Proxy */}
                    <RpSection title="Scale proxy">
                        <div style={{
                            background: s.bg, borderRadius: 7, padding: '9px 11px',
                            fontSize: 11, color: s.text2, lineHeight: 1.65,
                        }}>
                            <ProxyRow label="Real size" value={`${realW} × ${realH} mm`} />
                            <hr style={{ border: 'none', borderTop: `1px solid ${s.border}`, margin: '5px 0' }} />
                            <ProxyRow label="Canvas (px)" value={`${canvasW} × ${canvasH} px`} />
                            <ProxyRow label="Scale ratio" value={`1 : ${scaleN}  (1 px = ${scaleN} mm)`} />
                            <ProxyRow label="Export res." value={`${expW} × ${expH} px`} />
                            <div style={{ fontSize: 10, color: s.text3, fontStyle: 'italic', marginTop: 4 }}>
                                {realW} mm ÷ 25.4 × {dpi} = {expW} px
                            </div>
                        </div>
                        {/* DPI row */}
                        <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                            {[72, 150, 300].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDpi(d)}
                                    style={{
                                        flex: 1, padding: '4px 0', fontSize: 11,
                                        border: `1px solid ${dpi === d ? '#1B4DFF' : s.border}`,
                                        borderRadius: 5,
                                        background: dpi === d ? '#1B4DFF' : 'transparent',
                                        color: dpi === d ? '#fff' : s.text2,
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                                    }}
                                >{d} dpi</button>
                            ))}
                        </div>
                    </RpSection>

                    {/* Variants */}
                    <RpSection title="Variants">
                        <div style={{ fontSize: 12, color: s.text2, marginBottom: 8 }}>Colors</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {SWATCHES.map((sw, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSwatch(i)}
                                    title={sw.bg}
                                    style={{
                                        width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                                        background: sw.bg,
                                        border: activeSwatch === i
                                            ? `2px solid ${s.text}`
                                            : sw.border ? '1.5px solid #ddd' : '2px solid transparent',
                                        transform: activeSwatch === i ? 'scale(1.12)' : 'scale(1)',
                                        transition: 'all .15s', outline: 'none',
                                    }}
                                />
                            ))}
                        </div>
                    </RpSection>
                </div>
            </div>
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SbItem({ children, label, active, onClick }: {
    children: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: 52, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '8px 0', borderRadius: 8, cursor: 'pointer', border: 'none',
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                transition: 'background .15s',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
            {children}
            <span style={{ fontSize: 10, color: active ? '#fff' : '#666', textAlign: 'center', lineHeight: 1.2 }}>
                {label}
            </span>
        </button>
    );
}

function BtnTB({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
    return (
        <button style={{
            padding: '5px 13px', fontSize: 12, fontWeight: 500, borderRadius: 6,
            cursor: 'pointer', border: accent ? '1px solid #6DCC5A' : '1px solid #E0DDD8',
            background: accent ? '#6DCC5A' : '#fff',
            color: accent ? '#fff' : '#1A1A1A',
            fontFamily: 'inherit',
        }}>
            {children}
        </button>
    );
}

function RpSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ padding: '13px 15px', borderBottom: '1px solid #E0DDD8' }}>
            <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#999', marginBottom: 10,
            }}>{title}</div>
            {children}
        </div>
    );
}

function DimField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, color: '#999', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</label>
            <input
                type="number"
                min={1}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: '100%', padding: '5px 7px', fontSize: 13, fontWeight: 500,
                    fontFamily: 'inherit', border: '1px solid #E0DDD8', borderRadius: 6,
                    background: '#F2F1EE', color: '#1A1A1A', outline: 'none',
                }}
            />
        </div>
    );
}

function ProxyRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span>{label}</span>
            <strong style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{value}</strong>
        </div>
    );
}
