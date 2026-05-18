import React from 'react';
import { ProductView, PrintArea } from '@/types/editor';
import { isDarkColor } from '@/lib/utils';

interface HatMockupProps {
    selectedView: ProductView;
    selectedColor: string;
    printArea: PrintArea;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    hasContent?: boolean;
}

const SW = '1.2';

// --- FRONT (from Figma SVG: hat front.svg) ---
function FrontHat({ color, strokeColor }: { color: string, strokeColor: string }) {
    return (
        <svg viewBox="0 0 686 763" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible" style={{ display: 'block' }}>
            {/* Color fill — covers the full hat body + brim */}
            <path
                d={`
                    M 341.5,0.5
                    C 309.1,1.4 287.2,39.9 313.5,28.5
                    C 2.4,36.8 0.5,275.7 0.5,471.5
                    L 0.5,473.5
                    C 6.2,476.1 23.2,504.0 28.9,507.5
                    C 25.1,544.4 -25.9,742.2 40.2,756.0
                    C 438.4,675.6 315.7,723.7 654.5,762.5
                    C 697.1,732.9 671.5,575.9 653.5,519.5
                    C 677.0,505.6 676.1,500.1 685.5,481.6
                    C 672.3,344.0 706.3,67.1 369.5,26.5
                    C 389.1,31.9 376.0,2.3 341.5,0.5
                    Z
                `}
                fill={color}
                stroke="none"
            />

            <g fill="none" stroke={strokeColor} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
                {/* Main crown bottom line */}
                <path d="M33.5 753.721C384.478 652.826 386.358 712.715 660.5 756.5" />
                {/* Left eyelets */}
                <path d="M610.631 148.828C606.869 158.013 620.036 178.22 628.5 176.383M470.5 149.746C477.083 145.154 502.476 153.42 489.31 171.79" />
                <path d="M489.5 171.155C478.21 185.592 448.105 160.328 470.684 149.5" />
                {/* Brim */}
                <path d="M654.5 762.5C315.732 723.684 438.406 675.626 40.1879 756.031C-25.8672 742.168 25.0896 544.392 27.9205 506.5" />
                <path d="M653.5 762.5C697.051 732.933 671.488 575.861 653.5 519.5" />
                <path d="M28.5 506.643C388.318 490.858 635.456 515.929 652.5 521.5" />
                {/* Center panel seam */}
                <path d="M342.5 36.4999C343.78 103.05 345.7 373.87 346.5 500.5" />
                {/* Crown right outline */}
                <path d="M369.5 26.4999C706.252 67.1153 672.294 344.038 685.5 482.5" />
                <path d="M638.294 519.5C638.294 349.413 670.394 117.392 364.5 30.4999M653.4 519.5C677.003 505.634 676.059 500.088 685.5 481.6" />
                {/* Panel seams */}
                <path d="M363.5 501.5L363.5 31.5" />
                <path d="M329.5 501.5L329.5 36.4999" />
                {/* Sweatband line */}
                <path d="M54.5 484.155C213.913 461.492 565.754 490.5 636.5 490.5" />
                {/* Crown left outline */}
                <path d="M313.5 28.4999C2.3856 36.7717 0.500014 275.734 0.5 471.5" />
                <path d="M54.1257 483.5C16.358 154.437 102.28 99.9008 318.5 31.4999" />
                {/* Left eyelet bottom */}
                <path d="M52.5 155.689C52.5 179.616 89.6281 120.719 62.7102 139.124" />
                {/* Brim underside */}
                <path d="M28.8527 507.5C23.1778 504.04 6.17487 476.095 0.5 473.5M53.0569 504.743C48.3278 484.851 55.357 484.743 54.4112 483.013" />
                {/* Right eyelet */}
                <path d="M199.885 173.5C189.519 166.145 215.904 141.322 222.5 150.515" />
                <path d="M199.5 173.006C209.066 180.209 236.808 159.503 222.459 150.5" />
                {/* Top button */}
                <path d="M341.5 36.4999C389.112 31.8846 376.042 2.34609 341.5 0.499939" />
                <path d="M341.5 36.2538C309.123 39.9208 287.22 1.4167 341.5 0.499939" />
            </g>
        </svg>
    );
}

export default function HatMockup({ selectedView, selectedColor, printArea, canvasRef, hasContent = false }: HatMockupProps) {
    const strokeColor = isDarkColor(selectedColor) ? 'rgba(255,255,255,0.45)' : '#222222';

    return (
        <div className="relative w-full" style={{ maxWidth: 500, aspectRatio: '500/540' }}>
            <div className="absolute inset-0 pointer-events-none flex items-start justify-center pt-8" style={{ zIndex: 0 }}>
                <div className="w-[78%] h-[78%]">
                    <FrontHat color={selectedColor} strokeColor={strokeColor} />
                </div>
            </div>

            <div className="absolute inset-0 z-20 outline-none focus:outline-none">
                <canvas ref={canvasRef} className="outline-none" />
            </div>

            {!hasContent && (
                <div
                    className="print-area-placeholder absolute border border-dashed border-gray-400/40 pointer-events-none z-30 flex items-center justify-center text-[10px] text-black/15 uppercase tracking-widest font-medium"
                    style={{
                        left: `${((printArea?.left ?? 100) / 500) * 100}%`,
                        top: `${((printArea?.top ?? 165) / 540) * 100}%`,
                        width: `${((printArea?.width ?? 300) / 500) * 100}%`,
                        height: `${((printArea?.height ?? 150) / 540) * 100}%`,
                    }}
                >
                    PRINT AREA
                </div>
            )}
        </div>
    );
}
