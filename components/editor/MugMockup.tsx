import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { ProductView, PrintArea } from '@/types/editor';

interface MugMockupProps {
    selectedView: ProductView;
    selectedColor: string;
    printArea: PrintArea;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    hasContent?: boolean;
}

export default function MugMockup({ selectedView, selectedColor, printArea, canvasRef, hasContent = false }: MugMockupProps) {
    const threeCanvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);

    // Rotation state — stored in refs so animate loop reads latest without re-renders
    const azRef = useRef(0);       // horizontal (Y axis)
    const elRef = useRef(-0.35);   // vertical   (X axis) — negative = looking slightly from above
    const [azDisplay, setAzDisplay] = useState(0); // only for ViewIcon highlight

    useEffect(() => {
        setMounted(true);
    }, []);

    // Setup THREE.js scene
    useEffect(() => {
        if (!threeCanvasRef.current || !canvasRef.current) return;

        const W = 288;
        const H = 220;
        const renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(W, H);
        renderer.setClearColor(0xd6d3ce, 1);

        const scene = new THREE.Scene();
        // Camera positioned slightly above and in front for a top-angled view
        const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
        camera.position.set(0, 1.8, 4.5);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(3, 5, 5);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xccddff, 0.35);
        fill.position.set(-3, 2, -3);
        scene.add(fill);

        // Top light for the angled top-down look
        const top = new THREE.DirectionalLight(0xffffff, 0.5);
        top.position.set(0, 8, 0);
        scene.add(top);

        // Setup materials and texture
        const colorVal = parseInt(selectedColor.replace('#', ''), 16) || 0xffffff;
        const mugMat = new THREE.MeshStandardMaterial({ color: colorVal, roughness: 0.25, metalness: 0.05 });
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.35, metalness: 0.02, side: THREE.DoubleSide });

        const wrapTex = new THREE.CanvasTexture(canvasRef.current);
        wrapTex.wrapS = THREE.RepeatWrapping;
        // No offset needed; UV 0.5 is the front face when handle is at back
        wrapTex.offset.x = 0;

        const wrapMat = new THREE.MeshStandardMaterial({ color: colorVal, map: wrapTex, roughness: 0.28, metalness: 0.04 });

        const SEGS = 80, R_TOP = 0.90, R_BOT = 0.78, HEIGHT = 2.0, HALF = HEIGHT / 2, INNER_R = R_TOP - 0.08;

        const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(R_TOP, R_BOT, HEIGHT, SEGS, 1, true), wrapMat);
        const bm1 = new THREE.Mesh(new THREE.CircleGeometry(R_BOT, SEGS), mugMat); bm1.rotation.x = -Math.PI / 2; bm1.position.y = -HALF + 0.001;
        const bm2 = new THREE.Mesh(new THREE.CircleGeometry(R_BOT + 0.04, SEGS), mugMat); bm2.rotation.x = -Math.PI / 2; bm2.position.y = -HALF - 0.001;
        const bm3 = new THREE.Mesh(new THREE.CircleGeometry(R_BOT + 0.08, SEGS), mugMat); bm3.rotation.x = -Math.PI / 2; bm3.position.y = -HALF - 0.003;
        const bcap = new THREE.Mesh(new THREE.CylinderGeometry(R_BOT + 0.04, R_BOT + 0.04, 0.05, SEGS), mugMat); bcap.position.y = -HALF - 0.025;
        const rrm = new THREE.Mesh(new THREE.RingGeometry(INNER_R, R_TOP + 0.01, SEGS), mugMat); rrm.rotation.x = -Math.PI / 2; rrm.position.y = HALF;
        const iwm = new THREE.Mesh(new THREE.CylinderGeometry(INNER_R, INNER_R * 0.96, HEIGHT * 0.94, SEGS, 1, true), innerMat); iwm.position.y = -HALF * 0.03;
        const ibm = new THREE.Mesh(new THREE.CircleGeometry(INNER_R * 0.96, SEGS), innerMat); ibm.rotation.x = -Math.PI / 2; ibm.position.y = -HALF + 0.06;
        const itm = new THREE.Mesh(new THREE.CircleGeometry(INNER_R, SEGS), innerMat); itm.rotation.x = -Math.PI / 2; itm.position.y = HALF - 0.002;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(R_TOP, 0.04, 14, SEGS), mugMat); rim.position.y = HALF; rim.rotation.x = Math.PI / 2;

        const hc = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(R_TOP - 0.05, 0.52, 0),
            new THREE.Vector3(R_TOP + 0.85, 0, 0),
            new THREE.Vector3(R_TOP - 0.05, -0.52, 0)
        );
        const hm = new THREE.Mesh(new THREE.TubeGeometry(hc, 40, 0.10, 12, false), mugMat);
        const pg = new THREE.SphereGeometry(0.115, 16, 16);
        const pt = new THREE.Mesh(pg, mugMat); pt.position.set(R_TOP - 0.05, 0.52, 0);
        const pb = new THREE.Mesh(pg, mugMat); pb.position.set(R_TOP - 0.05, -0.52, 0);

        const mugGroup = new THREE.Group();
        mugGroup.add(bodyMesh, bm1, bm2, bm3, bcap, rrm, iwm, ibm, rim, hm, pt, pb);
        mugGroup.rotation.y = azRef.current;
        mugGroup.rotation.x = elRef.current;
        scene.add(mugGroup);

        // ── Drag to rotate (mouse + touch, full 360° in both axes) ──
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        const onPointerDown = (e: PointerEvent) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            threeCanvasRef.current?.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            azRef.current += dx * 0.012;
            // Full vertical: clamp to [-π/2, π/2] so mug doesn't flip upside down weirdly
            elRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, elRef.current + dy * 0.010));
            lastX = e.clientX;
            lastY = e.clientY;
            setAzDisplay(azRef.current);
        };
        const onPointerUp = () => { isDragging = false; };

        const canvas3d = threeCanvasRef.current;
        canvas3d.addEventListener('pointerdown', onPointerDown);
        canvas3d.addEventListener('pointermove', onPointerMove);
        canvas3d.addEventListener('pointerup', onPointerUp);
        canvas3d.addEventListener('pointercancel', onPointerUp);

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            wrapTex.needsUpdate = true;
            // Smooth interpolation toward target angles
            mugGroup.rotation.y += (azRef.current - mugGroup.rotation.y) * 0.12;
            mugGroup.rotation.x += (elRef.current - mugGroup.rotation.x) * 0.12;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frameId);
            canvas3d.removeEventListener('pointerdown', onPointerDown);
            canvas3d.removeEventListener('pointermove', onPointerMove);
            canvas3d.removeEventListener('pointerup', onPointerUp);
            canvas3d.removeEventListener('pointercancel', onPointerUp);
            renderer.dispose();
        };
    }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

    // Wrap canvas display dimensions
    const canvasWidth = 1024;
    const canvasHeight = 512;
    const displayWidth = 560;
    const displayScale = displayWidth / canvasWidth;

    const handleViewClick = (az: number) => {
        azRef.current = az;
        setAzDisplay(az);
    };

    return (
        <div className="flex flex-col gap-6 items-center flex-shrink-0" style={{ width: '100%', maxWidth: 800 }}>
            {/* Wrap editor section */}
            <div className="w-full flex flex-col items-center gap-2">
                <div className="text-[12px] font-semibold text-gray-500 w-full max-w-[560px] text-center">
                    Wrap Preview — green zone = printable center (30%) · red zones = no-print margin
                </div>

                <div className="relative border-2 border-gray-800 bg-white overflow-hidden shadow-sm rounded-sm" style={{ width: displayWidth, height: canvasHeight * displayScale }}>
                    {/* The fabric canvas container */}
                    <div className="absolute top-0 left-0 outline-none focus:outline-none origin-top-left" style={{ transform: `scale(${displayScale})` }}>
                        <canvas ref={canvasRef} className="outline-none" />
                    </div>

                    {/* Overlays on top of canvas for guides */}
                    <div className="absolute left-0 right-0 top-0 h-[22px] bg-[#d8d4cf] pointer-events-none z-[2] opacity-80">
                        <div className="absolute left-[10px] right-[10px] top-1/2 -translate-y-1/2 border-b-2 border-dashed border-[#aaa]" />
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 h-[22px] bg-[#d8d4cf] pointer-events-none z-[2] opacity-80">
                        <div className="absolute left-[10px] right-[10px] top-1/2 -translate-y-1/2 border-b-2 border-dashed border-[#aaa]" />
                    </div>

                    <div className="absolute top-0 bottom-0 w-[1px] border-l-[1.5px] border-dotted border-gray-800/30 z-[3] pointer-events-none" style={{ left: '33.33%' }} />
                    <div className="absolute top-0 bottom-0 w-[1px] border-l-[1.5px] border-dotted border-gray-800/30 z-[3] pointer-events-none" style={{ left: '66.66%' }} />

                    <div className="absolute w-[8px] h-[8px] rounded-full bg-gray-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[4]" style={{ left: '33.33%', top: 0 }} />
                    <div className="absolute w-[8px] h-[8px] rounded-full bg-gray-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[4]" style={{ left: '66.66%', top: 0 }} />
                    <div className="absolute w-[8px] h-[8px] rounded-full bg-gray-500 -translate-x-1/2 translate-y-1/2 pointer-events-none z-[4]" style={{ left: '33.33%', bottom: 0 }} />
                    <div className="absolute w-[8px] h-[8px] rounded-full bg-gray-500 -translate-x-1/2 translate-y-1/2 pointer-events-none z-[4]" style={{ left: '66.66%', bottom: 0 }} />

                    <span className="absolute top-[28px] text-[10px] text-gray-400 font-bold uppercase tracking-wide -translate-x-1/2 pointer-events-none z-[5]" style={{ left: '16.66%' }}>Left</span>
                    <span className="absolute top-[28px] text-[10px] text-gray-400 font-bold uppercase tracking-wide -translate-x-1/2 pointer-events-none z-[5]" style={{ left: '50%' }}>Front</span>
                    <span className="absolute top-[28px] text-[10px] text-gray-400 font-bold uppercase tracking-wide -translate-x-1/2 pointer-events-none z-[5]" style={{ left: '83.33%' }}>Right</span>

                    {!hasContent && (
                        <>
                            <div className="absolute pointer-events-none z-[6] bg-green-500/10 border border-dashed border-green-500/40" style={{ left: '35%', width: '30%', top: '22px', bottom: '22px' }} />
                            <div className="absolute pointer-events-none z-[6] bg-red-500/10 border border-dashed border-red-500/40" style={{ left: '0', width: '10%', top: '22px', bottom: '22px' }} />
                            <div className="absolute pointer-events-none z-[6] bg-red-500/10 border border-dashed border-red-500/40" style={{ right: '0', width: '10%', top: '22px', bottom: '22px' }} />
                            <span className="absolute bottom-[28px] text-[9px] font-bold tracking-wide uppercase -translate-x-1/2 pointer-events-none z-[7] text-green-700/80" style={{ left: '50%' }}>center zone</span>
                        </>
                    )}
                </div>
            </div>

            {/* 3D Preview Section — portalled into bottom of right sidebar */}
            {mounted && typeof window !== 'undefined' && document.getElementById('mug-3d-preview-portal') ? createPortal(
                <div className="border-t border-gray-100 bg-[#f7f7f5] p-3 mt-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">3D Preview</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Drag to Rotate</span>
                    </div>

                    {/* 3D Canvas */}
                    <div className="relative rounded-xl overflow-hidden bg-[#d6d3ce] shadow-inner border border-[#c8c5c0]" style={{ width: '100%' }}>
                        <canvas
                            ref={threeCanvasRef}
                            className="block cursor-grab active:cursor-grabbing"
                            style={{ width: '100%', height: 220, touchAction: 'none' }}
                        />
                        {/* Drag hint overlay on hover */}
                        <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-2 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[9px] bg-black/40 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">↔ ↕ Drag to rotate</span>
                        </div>
                    </div>

                    {/* View preset buttons */}
                    <div className="flex justify-center gap-3 mt-3">
                        <ViewIcon label="Left view"  az={0}       azDisplay={azDisplay} onSelect={handleViewClick} d="M42 24 Q52 24 52 30 Q52 36 42 36" />
                        <ViewIcon label="Front view" az={1.5708}  azDisplay={azDisplay} onSelect={handleViewClick} handleTop />
                        <ViewIcon label="Right view" az={3.1416}  azDisplay={azDisplay} onSelect={handleViewClick} cx={34} d="M18 24 Q8 24 8 30 Q8 36 18 36" />
                    </div>
                </div>,
                document.getElementById('mug-3d-preview-portal')!
            ) : null}
        </div>
    );
}

function ViewIcon({
    label, az, azDisplay, onSelect, d, cx = 26, hasDot = false, handleTop = false
}: {
    label: string;
    az: number;
    azDisplay: number;
    onSelect: (az: number) => void;
    d?: string;
    cx?: number;
    hasDot?: boolean;
    handleTop?: boolean;
}) {
    const isActive = Math.abs(((azDisplay % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - ((az % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) < 0.25;
    return (
        <div
            className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            title={label}
            onClick={() => onSelect(az)}
        >
            <svg viewBox="0 0 60 60" fill="none" className="w-[40px] h-[40px]">
                {/* Mug body circle */}
                <circle cx={cx} cy="30" r="16" stroke="#1f2937" strokeWidth="2" />
                {/* Handle on top (front view) */}
                {handleTop && (
                    <path d={`M${cx - 10} 16 Q${cx - 10} 6 ${cx} 6 Q${cx + 10} 6 ${cx + 10} 16`} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}
                {/* Handle on side (left/right views) */}
                {!handleTop && d && (
                    <path d={d} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}
                {hasDot && <circle cx={cx} cy="6" r="3" fill="#1f2937" />}
            </svg>
            <div className={`w-[6px] h-[6px] rounded-full transition-colors ${isActive ? 'bg-[#16a34a]' : 'bg-transparent'}`} />
        </div>
    );
}
