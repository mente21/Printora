import React from 'react';
import { ProductView, PrintArea } from '@/types/editor';
import { isDarkColor } from '@/lib/utils';

interface TshirtMockupProps {
    selectedView: ProductView;
    selectedColor: string;
    printArea: PrintArea;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    hasContent?: boolean;
}

const SW = '1.2';

// --- FRONT VIEW (from Figma SVG: t-shirt front.svg) ---
function FrontShirt({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 295 325" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ display: 'block' }}>
            {/* Filled silhouette */}
            <path d={`
                M108.394,0.443 L47.394,32.443
                C29.104,53.463 2.467,139.694 0.627,144.713
                C25.016,156.256 30.127,154.886 57.127,164.886
                L57.127,316.298
                C142.127,331.298 214.127,319.798 235.627,316.298
                L235.627,162.799
                C240.627,162.799 293.627,146.299 293.627,146.299
                C268.127,67.299 256.127,40.299 248.127,35.799
                L184.127,1.298
                C151.627,5.886 136.627,6.386 108.127,0.886
                Z
            `} fill={color} stroke="none" />

            <g fill="none" stroke={strokeColor} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
                {/* Bottom hem */}
                <path d="M57.1267 316.298C142.127 331.298 214.127 319.798 235.627 316.298" />
                {/* Right body */}
                <path d="M247.627 35.7985C223.627 103.798 243.127 232.298 235.627 316.298" />
                {/* Right sleeve */}
                <path d="M248.127 35.7989C256.127 40.2985 268.127 67.2985 293.627 146.299C293.627 146.299 240.627 162.799 236.127 162.799" />
                {/* Right cuff lines */}
                <line x1="235.971" y1="157.323" x2="290.971" y2="139.323" />
                <line x1="235.969" y1="153.324" x2="289.969" y2="135.324" />
                {/* Right shoulder */}
                <path d="M184.127 1.29848L247.627 35.2985" />
                {/* Left shoulder */}
                <line x1="47.3944" y1="32.4428" x2="108.394" y2="0.442772" />
                {/* Left body + sleeve */}
                <path d="M52.6267 162.781C52.5817 163.516 57.3355 162.878 57.1267 164.886M57.1267 164.886C30.1267 154.886 25.0161 156.256 0.626678 144.713C2.46739 139.694 29.1038 53.4629 47.0507 32.8855C60.6267 60.8855 63.1267 107.983 57.1267 164.886Z" />
                {/* Left cuff lines */}
                <path d="M3.77725 138.409L57.6267 155.386" />
                <line x1="3.77433" y1="134.408" x2="58.7743" y2="151.408" />
                {/* Left body line */}
                <line x1="58.1267" y1="164.886" x2="58.1267" y2="315.886" />
                {/* Bottom stitch lines */}
                <path d="M58.6267 305.886C143.127 318.386 153.127 315.386 235.627 305.886" />
                <path d="M58.6267 302.886C152.127 319.386 216.127 302.886 234.627 302.886" />
                {/* Collar top */}
                <path d="M108.127 0.885529C136.627 6.38554 151.627 5.88554 184.127 0.885529" />
                {/* Outer collar */}
                <path d="M100.627 5.38554C107.627 49.8855 185.127 45.8855 192.627 6.88554" />
                {/* Inner collar */}
                <path d="M107.627 0.885544C116.627 33.3855 178.127 37.8855 184.627 0.885544" />
                {/* Collar stitching */}
                <path d="M118.627 17.3856L175.636 17.3856" />
                <path d="M114.627 13.3855H179.627" />
            </g>
        </svg>
    );
}

// --- BACK VIEW (from Figma SVG: t-shirt back.svg) ---
function BackShirt({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 295 323" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ display: 'block' }}>
            <path d={`
                M109.127,0.489 L47.409,30.539
                C29.104,51.566 2.467,137.797 0.627,142.816
                C25.016,154.359 30.127,152.989 57.127,162.989
                L57.127,314.402
                C142.127,329.402 214.127,317.902 235.627,314.402
                L235.627,160.902
                C240.627,160.902 293.627,144.402 293.627,144.402
                C268.127,65.402 256.127,38.402 248.127,33.902
                L183.627,0.989
                C177.627,3.489 147.627,8.989 108.127,0.489
                Z
            `} fill={color} stroke="none" />

            <g fill="none" stroke={strokeColor} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
                <path d="M57.1267 314.402C142.127 329.402 214.127 317.902 235.627 314.402" />
                <path d="M247.627 33.9018C223.627 101.902 243.127 230.402 235.627 314.402" />
                <path d="M248.127 33.9022C256.127 38.4018 268.127 65.4018 293.627 144.402C293.627 144.402 240.627 160.902 236.127 160.902" />
                <line x1="235.971" y1="155.427" x2="290.971" y2="137.427" />
                <line x1="235.969" y1="151.427" x2="289.969" y2="133.427" />
                <path d="M183.627 0.988815L247.627 33.9888" />
                <path d="M47.4091 30.5386L109.127 0.488814" />
                <path d="M52.6267 160.884C52.5817 161.619 57.3355 160.981 57.1267 162.989M57.1267 162.989C30.1267 152.989 25.0161 154.359 0.626669 142.816C2.46738 137.797 29.1038 51.5662 47.0507 30.9888C60.6267 58.9888 63.1267 106.086 57.1267 162.989Z" />
                <path d="M3.77724 136.512L57.6267 153.489" />
                <line x1="3.77432" y1="132.511" x2="58.7743" y2="149.511" />
                <line x1="58.1267" y1="162.989" x2="58.1267" y2="313.989" />
                <path d="M58.6267 303.989C143.127 316.489 153.127 313.489 235.627 303.989" />
                <path d="M58.6267 300.989C152.127 317.489 216.127 300.989 234.627 300.989" />
                {/* Back collar */}
                <path d="M108.127 0.488815C147.627 8.98882 177.627 3.48882 183.627 0.488815" />
                <path d="M98.6267 6.48882C124.627 18.4888 177.127 17.9888 192.627 6.48882" />
            </g>
        </svg>
    );
}

// --- LEFT SIDE ---
function LeftSideShirt({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 94 127" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ display: 'block' }}>
            {/* Color fill */}
            <path d="M8.6056 120.5C-32.6155 -3.01139 97.0314 -72.2823 92.3774 120.5Z" fill={color} stroke="none" />
            <g fill="none" stroke={strokeColor} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.6056 120.5C-32.6155 -3.01139 97.0314 -72.2823 92.3774 120.5" />
                <path d="M8.60862 120.388C18.6086 132.888 89.6086 120.888 93.1086 120.888M6.60862 113.388C26.1086 129.388 85.6086 115.888 92.1086 114.888" />
            </g>
        </svg>
    );
}

// --- RIGHT SIDE ---
function RightSideShirt({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 93 127" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ display: 'block' }}>
            {/* Color fill */}
            <path d="M84.3944 120.5C125.615 -3.01139 -4.0314 -72.2823 0.622598 120.5Z" fill={color} stroke="none" />
            <g fill="none" stroke={strokeColor} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
                <path d="M84.3944 120.5C125.615 -3.01139 -4.0314 -72.2823 0.622598 120.5" />
                <path d="M84.5116 120.672C74.5694 133.479 3.97977 121.184 0.499999 121.184M86.5 113.5C67.1127 129.893 7.95665 116.061 1.49422 115.037" />
            </g>
        </svg>
    );
}

// --- NECK LABEL VIEW ---
function NeckLabelView({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 500 540" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ display: 'block' }}>
            <path d="M 0,54 Q 250,135 500,54 L 500,540 L 0,540 Z" fill={color} />
            <path d="M 0,54 Q 250,135 500,54" fill="none" stroke={strokeColor} strokeWidth={SW} />
            <path d="M 0,64 Q 250,145 500,64" fill="none" stroke="#444" strokeWidth="0.8" />
            <path d="M 0,69 Q 250,150 500,69" fill="none" stroke="#444" strokeWidth="0.8" strokeDasharray="3,3" />
            <path d="M 0,74 Q 250,155 500,74" fill="none" stroke="#444" strokeWidth="0.8" />
            <rect x="166" y="186" width="168" height="148" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" />
            <g fill={strokeColor}>
                <text x="250" y="240" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="bold">L</text>
                <text x="250" y="255" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold">100% Cotton</text>
                <text x="250" y="265" textAnchor="middle" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Made in Bangladesh</text>
                <g transform="translate(198, 275) scale(0.65)">
                    <path d="M 0,0 L 4,12 L 12,12 L 16,0" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M 3,5 Q 8,9 13,5" fill="none" stroke={strokeColor} strokeWidth="1" />
                    <path d="M 32,12 L 40,0 L 48,12 Z" fill={strokeColor} />
                    <rect x="64" y="0" width="14" height="14" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                    <circle cx="71" cy="7" r="4.5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                    <path d="M 64,0 L 78,14 M 78,0 L 64,14" stroke={strokeColor} strokeWidth="1.2" />
                    <path d="M 96,12 L 96,8 C 96,4 102,2 106,6 L 110,6 C 112,6 112,12 112,12 Z" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M 96,0 L 112,12 M 112,0 L 96,12" stroke={strokeColor} strokeWidth="1.2" />
                    <circle cx="136" cy="7" r="6" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                    <path d="M 130,1 L 142,13 M 142,1 L 130,13" stroke={strokeColor} strokeWidth="1.2" />
                </g>
            </g>
        </svg>
    );
}

export default function TshirtMockup({
    selectedView,
    selectedColor,
    printArea,
    canvasRef,
    hasContent = false,
}: TshirtMockupProps) {
    const strokeColor = isDarkColor(selectedColor) ? 'rgba(255,255,255,0.45)' : '#222222';

    const getViewComponent = () => {
        switch (selectedView.id) {
            case 'neck-label': return <NeckLabelView color={selectedColor} strokeColor={strokeColor} />;
            case 'back-side': return <BackShirt color={selectedColor} strokeColor={strokeColor} />;
            case 'left-side': return <LeftSideShirt color={selectedColor} strokeColor={strokeColor} />;
            case 'right-side': return <RightSideShirt color={selectedColor} strokeColor={strokeColor} />;
            default: return <FrontShirt color={selectedColor} strokeColor={strokeColor} />;
        }
    };

    return (
        <div className="relative w-full" style={{ maxWidth: 500, aspectRatio: '500/540' }}>
            <div className="absolute inset-0 pointer-events-none flex items-start justify-center pt-8" style={{ zIndex: 0 }}>
                <div className="w-[88%] h-[88%]">
                    {getViewComponent()}
                </div>
            </div>

            <div className="absolute inset-0 z-20 outline-none focus:outline-none">
                <canvas ref={canvasRef} className="outline-none" />
            </div>

            {!hasContent && (
                <div 
                    className="print-area-placeholder absolute border border-dashed border-gray-400/40 pointer-events-none z-30 flex items-center justify-center text-[10px] text-black/15 uppercase tracking-widest font-medium"
                    style={{
                        left:   `${((printArea?.left   ?? 145) / 500) * 100}%`,
                        top:    `${((printArea?.top    ?? 140) / 540) * 100}%`,
                        width:  `${((printArea?.width  ?? 210) / 500) * 100}%`,
                        height: `${((printArea?.height ?? 300) / 540) * 100}%`,
                    }}
                >
                    PRINT AREA
                </div>
            )}
        </div>
    );
}
