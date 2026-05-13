const fs = require('fs');
let code = fs.readFileSync('components/editor/EditorUI.tsx', 'utf8');

// 1. Add Banner State and Helpers inside EditorUI component
const stateRegex = /const \[isSaving, setIsSaving\] = useState\(false\);/;
if (!code.includes('const [bannerRealW')) {
    code = code.replace(stateRegex, `const [isSaving, setIsSaving] = useState(false);
    // Banner State
    const [bannerRealW, setBannerRealW] = useState(2000);
    const [bannerRealH, setBannerRealH] = useState(1000);
    const [bannerUnit, setBannerUnit] = useState('m');
    const [bannerDpi, setBannerDpi] = useState(72);
    const [bannerInputW, setBannerInputW] = useState('2');
    const [bannerInputH, setBannerInputH] = useState('1');

    // Banner Unit Helpers
    const unitToMm = { mm: 1, cm: 10, m: 1000, in: 25.4 };
    const bannerFactor = unitToMm[bannerUnit] ?? 1;

    const handleBannerUnitChange = (newUnit: string) => {
        const newFactor = unitToMm[newUnit] ?? 1;
        setBannerInputW((bannerRealW / newFactor).toFixed(newUnit === 'mm' ? 0 : newUnit === 'cm' ? 1 : 2));
        setBannerInputH((bannerRealH / newFactor).toFixed(newUnit === 'mm' ? 0 : newUnit === 'cm' ? 1 : 2));
        setBannerUnit(newUnit);
    };

    const handleBannerWChange = (val: string) => {
        setBannerInputW(val);
        const px = parseFloat(val) * bannerFactor;
        if (!isNaN(px) && px > 0) setBannerRealW(Math.round(px));
    };

    const handleBannerHChange = (val: string) => {
        setBannerInputH(val);
        const px = parseFloat(val) * bannerFactor;
        if (!isNaN(px) && px > 0) setBannerRealH(Math.round(px));
    };`);
}

// 2. Adjust canvasSize in useEditorCanvas for banners
const canvasSizeRegex = /const canvasSize = selectedProduct\.id === 'ceramic-mug'[\s\S]*?\{ width: 500, height: 540 \};/;
if (code.match(canvasSizeRegex) && !code.includes("selectedProduct.id === 'banner' ? { width: bannerRealW")) {
    code = code.replace(canvasSizeRegex, `const canvasSize = selectedProduct.id === 'ceramic-mug' 
        ? { width: 1024, height: 512 } 
        : selectedProduct.id === 'banner'
        ? { width: Math.max(500, bannerRealW), height: Math.max(500, bannerRealH) }
        : { width: 500, height: 540 };`);
}

// 3. Inject BannerMockup before EditorUI
const bannerComponents = `
// --- BANNER MOCKUP ---
function BannerMockup({ printArea, canvasRef, bannerRealW, bannerRealH }: any) {
    const cw = bannerRealW;
    const ch = bannerRealH;

    const overlaySvg = \`
        <line x1="\${cw / 2}" y1="0" x2="\${cw / 2}" y2="\${ch}"
              stroke="rgba(100,130,200,0.18)" stroke-width="1.5"
              stroke-dasharray="8 6" vector-effect="non-scaling-stroke"/>
        <line x1="0" y1="\${ch / 2}" x2="\${cw}" y2="\${ch / 2}"
              stroke="rgba(100,130,200,0.18)" stroke-width="1.5"
              stroke-dasharray="8 6" vector-effect="non-scaling-stroke"/>
        <rect x="1" y="1" width="\${cw - 2}" height="\${ch - 2}"
              fill="none" stroke="rgba(120,120,120,0.22)" stroke-width="2"
              stroke-dasharray="10 6" vector-effect="non-scaling-stroke"/>
    \`;

    return (
        <div className="relative shadow-lg rounded overflow-hidden mx-auto" style={{ aspectRatio: \`\${cw}/\${ch}\`, width: \`min(90%, calc(65vh * (\${cw} / \${ch})))\`, maxHeight: '100%' }}>
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 z-20 outline-none focus:outline-none banner-canvas-wrapper">
                <canvas ref={canvasRef} className="outline-none" />
            </div>
            <div className="absolute inset-0 z-30 pointer-events-none print-area-placeholder" dangerouslySetInnerHTML={{ __html: \`<svg viewBox="0 0 \${cw} \${ch}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">\${overlaySvg}</svg>\` }} />
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center print-area-placeholder">
                <span style={{ fontSize: '11px', fontFamily: 'DM Sans, Inter, sans-serif', fontWeight: 600, letterSpacing: '2px', color: 'rgba(170,170,170,0.85)', textTransform: 'uppercase', userSelect: 'none', whiteSpace: 'nowrap' }}>PRINT AREA</span>
            </div>
        </div>
    );
}
`;

if (!code.includes('function BannerMockup')) {
    code = code.replace(/export default function EditorUI/, bannerComponents + '\nexport default function EditorUI');
}

// 4. Update renderMockup switch
const renderMockupRegex = /case 'ceramic-mug': return <MugMockup \{\.\.\.props\} \/>;/;
if (!code.includes("case 'banner': return <BannerMockup")) {
    code = code.replace(renderMockupRegex, `$&
            case 'banner': return <BannerMockup {...props} bannerRealW={bannerRealW} bannerRealH={bannerRealH} />;`);
}

// 5. Replace Right Panel conditionally
const rightPanelRegex = /<div className="hidden md:flex absolute right-4 top-4 bottom-4 w-\[320px\] bg-white rounded-xl shadow-\[0_4px_24px_rgba\(0,0,0,0\.06\)\] border border-gray-100 z-30 overflow-hidden flex-col">([\s\S]*?)<\/div>\s*\{\/\* ═══════════ MOBILE BOTTOM TAB BAR ═══════════ \*\/\}/;

const rightPanelReplacement = `
<div className="hidden md:flex absolute right-4 top-4 bottom-4 w-[320px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 z-30 overflow-hidden flex-col">
    {selectedProduct.id === 'banner' ? (
        <div className="flex flex-col h-full bg-[#FAFAFA]">
            <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10 flex-shrink-0">
                <h3 className="font-bold text-[15px] text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#EAF8E5] text-[#6DCC5A] flex items-center justify-center">📐</span> Dimensions
                </h3>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
                <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: '1:1', w: 1000, h: 1000 },
                            { label: '2:1', w: 2000, h: 1000 },
                            { label: '3:1', w: 3000, h: 1000 },
                            { label: '1:2', w: 1000, h: 2000 },
                            { label: '4:1', w: 4000, h: 1000 },
                            { label: '16:9', w: 1600, h: 900 },
                        ].map((p, i) => (
                            <button key={i} onClick={() => {
                                setBannerRealW(p.w);
                                setBannerRealH(p.h);
                                setBannerInputW((p.w / bannerFactor).toFixed(bannerUnit === 'mm' ? 0 : bannerUnit === 'cm' ? 1 : 2));
                                setBannerInputH((p.h / bannerFactor).toFixed(bannerUnit === 'mm' ? 0 : bannerUnit === 'cm' ? 1 : 2));
                            }}
                                className={\`py-2 rounded border \${bannerRealW / bannerRealH === p.w / p.h ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}\`}>
                                <div className="text-[13px] font-bold">{p.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Custom Size</label>
                        <select value={bannerUnit} onChange={e => handleBannerUnitChange(e.target.value)} className="text-[11px] font-bold bg-white border border-gray-200 rounded px-2 py-1 outline-none">
                            <option value="mm">mm</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="in">inch</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input type="number" value={bannerInputW} onChange={e => handleBannerWChange(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-semibold text-gray-800 outline-none focus:border-gray-400" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold uppercase">{bannerUnit}</span>
                        </div>
                        <span className="text-gray-300 font-bold">×</span>
                        <div className="flex-1 relative">
                            <input type="number" value={bannerInputH} onChange={e => handleBannerHChange(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-semibold text-gray-800 outline-none focus:border-gray-400" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold uppercase">{bannerUnit}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 block">Resolution (DPI)</label>
                    <div className="flex gap-2">
                        {[72, 150, 300].map(d => (
                            <button key={d} onClick={() => setBannerDpi(d)} className={\`flex-1 py-2 rounded text-[13px] font-bold border \${bannerDpi === d ? 'border-gray-900 bg-white shadow-sm text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}\`}>{d}</button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <h3 className="font-bold text-[15px] text-gray-800">Variants and layers</h3>
            </div>
            <div className="p-5 flex-1 min-h-0 bg-white overflow-y-auto">
                <h4 className="font-bold text-[13px] text-gray-800 mb-4">Variants</h4>
                <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600 text-[13px]">Colors</span>
                    <button className="border border-gray-300 px-3 py-1.5 rounded text-[12px] text-gray-700 hover:bg-gray-50 font-bold">Select variants</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(supplierColors?.length ? supplierColors : selectedProduct.variants).map((c: any) => {
                        const hex = c.hex || c.colorHex;
                        const name = c.name || c.colorName;
                        return (
                            <button
                                key={hex}
                                title={name}
                                className={\`w-7 h-7 rounded-full border-2 transition-all \${selectedColor === hex ? 'border-gray-400 shadow-sm' : 'border-gray-200 hover:border-gray-300'}\`}
                                style={{ backgroundColor: hex }}
                                onClick={() => setSelectedColor(hex)}
                            />
                        );
                    })}
                </div>
            </div>
            {selectedProduct.id === 'ceramic-mug' && (
                <div id="mug-3d-preview-portal" className="flex-shrink-0" />
            )}
        </>
    )}
</div>
{/* ═══════════ MOBILE BOTTOM TAB BAR ═══════════ */}`;

if (code.match(rightPanelRegex) && !code.includes("selectedProduct.id === 'banner' ? (")) {
    code = code.replace(rightPanelRegex, rightPanelReplacement);
}

fs.writeFileSync('components/editor/EditorUI.tsx', code);
console.log('Successfully injected banner logic into EditorUI.tsx');
