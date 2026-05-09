import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { ProductView, PrintArea } from '@/types/editor';

interface MugMockupProps {
    selectedView: ProductView;
    selectedColor: string;
    printArea: PrintArea;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function MugMockup({ selectedView, selectedColor, printArea, canvasRef }: MugMockupProps) {
    const threeCanvasRef = useRef<HTMLCanvasElement>(null);
    const [targetAz, setTargetAz] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Setup THREE.js scene
    useEffect(() => {
        if (!threeCanvasRef.current || !canvasRef.current) return;
        
        const W = 288;
        const H = 288;
        const renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(W, H);
        renderer.setClearColor(0xd6d3ce, 1);
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
        camera.position.set(0, 0.4, 4.8);
        camera.lookAt(0, 0, 0);
        
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(3, 5, 5);
        scene.add(key);
        
        const fill = new THREE.DirectionalLight(0xccddff, 0.3);
        fill.position.set(-3, 0, -3);
        scene.add(fill);
        
        // Setup materials and texture
        const colorVal = parseInt(selectedColor.replace('#', '0x')) || 0xffffff;
        const mugMat = new THREE.MeshStandardMaterial({ color: colorVal, roughness: 0.25, metalness: 0.05 });
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.35, metalness: 0.02 });
        
        // Note: The fabric canvas is used directly as the texture
        const wrapTex = new THREE.CanvasTexture(canvasRef.current);
        wrapTex.wrapS = THREE.RepeatWrapping;
        wrapTex.offset.x = -0.5;
        // Tell texture to update on render
        
        const wrapMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: wrapTex, roughness: 0.28, metalness: 0.04 });
        
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
        mugGroup.add(bodyMesh, bm1, bm2, bm3, bcap, rrm, iwm, ibm, itm, rim, hm, pt, pb);
        mugGroup.rotation.y = 0;
        scene.add(mugGroup);
        
        // Interactive dragging
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let currentAz = targetAz;
        let currentEl = 0.18;
        
        const onMouseDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            currentAz += (e.clientX - lastX) * 0.012;
            currentEl = Math.max(-0.6, Math.min(0.8, currentEl + (e.clientY - lastY) * 0.008));
            lastX = e.clientX;
            lastY = e.clientY;
            setTargetAz(currentAz);
        };
        const onMouseUp = () => { isDragging = false; };
        
        threeCanvasRef.current.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            wrapTex.needsUpdate = true; // Constantly update from fabric canvas
            mugGroup.rotation.y += (targetAz - mugGroup.rotation.y) * 0.1;
            mugGroup.rotation.x += (currentEl - mugGroup.rotation.x) * 0.1;
            renderer.render(scene, camera);
        };
        animate();
        
        return () => {
            cancelAnimationFrame(frameId);
            threeCanvasRef.current?.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            renderer.dispose();
        };
    }, [selectedColor]); // Note: targetAz should not be in dependency array so dragging doesn't reset it.

    // Using zoom to scale down the 1024x512 canvas so it fits well on screen.
    // Standard css transform: scale works but can cause bounding box issues in fabric if we aren't careful.
    // CSS zoom is generally safer for fabric.js pointer events.
    const canvasWidth = 1024;
    const canvasHeight = 512;
    const displayWidth = 560;
    const displayScale = displayWidth / canvasWidth;

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
                        {/* 
                          Important: The useEditorCanvas hook attaches to this canvas element and sets its size 
                          to printArea.width and printArea.height (1024x512). 
                          We use CSS transform scale to fit it in our UI without breaking Fabric coordinates. 
                        */}
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
                    
                    <div className="absolute pointer-events-none z-[6] bg-green-500/10 border border-dashed border-green-500/40" style={{ left: '35%', width: '30%', top: '22px', bottom: '22px' }} />
                    <div className="absolute pointer-events-none z-[6] bg-red-500/10 border border-dashed border-red-500/40" style={{ left: '0', width: '10%', top: '22px', bottom: '22px' }} />
                    <div className="absolute pointer-events-none z-[6] bg-red-500/10 border border-dashed border-red-500/40" style={{ right: '0', width: '10%', top: '22px', bottom: '22px' }} />
                    
                    <span className="absolute bottom-[28px] text-[9px] font-bold tracking-wide uppercase -translate-x-1/2 pointer-events-none z-[7] text-green-700/80" style={{ left: '50%' }}>center zone</span>
                </div>
            </div>

            {/* 3D Preview Section (Rendered in right sidebar via portal) */}
            {mounted && typeof window !== 'undefined' && document.getElementById('mug-3d-preview-portal') ? createPortal(
                <div className="flex flex-col w-full items-center gap-4 bg-gray-50/50 p-4 border-t border-gray-100 mt-auto">
                    <div className="bg-[#d6d3ce] border-[1.5px] border-[#b0ada8] rounded-xl overflow-hidden flex-shrink-0 shadow-sm w-[288px]">
                        <div className="flex items-center justify-between px-3 py-2 border-b-[1.5px] border-[#b0ada8] text-[12px] font-semibold text-gray-800 bg-black/5">
                            3D Preview
                            <span className="text-[9px] text-gray-500 font-normal uppercase tracking-wider ml-4">drag to rotate</span>
                        </div>
                        <canvas ref={threeCanvasRef} className="block cursor-grab active:cursor-grabbing w-[288px] h-[288px]" />
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <ViewIcon label="Left side view" az={0} targetAz={targetAz} setTargetAz={setTargetAz} d="M42 24 Q52 24 52 30 Q52 36 42 36" />
                        <ViewIcon label="Front view" az={1.5708} targetAz={targetAz} setTargetAz={setTargetAz} d="M42 24 Q54 24 54 30 Q54 36 42 36" hasDot />
                        <ViewIcon label="Right side view" az={3.1416} targetAz={targetAz} setTargetAz={setTargetAz} cx={34} d="M18 24 Q8 24 8 30 Q8 36 18 36" />
                    </div>
                </div>,
                document.getElementById('mug-3d-preview-portal')!
            ) : null}
        </div>
    );
}

function ViewIcon({ label, az, targetAz, setTargetAz, d, cx = 26, hasDot = false }: { label: string, az: number, targetAz: number, setTargetAz: (v: number) => void, d: string, cx?: number, hasDot?: boolean }) {
    const isActive = Math.abs(targetAz - az) < 0.1;
    return (
        <div 
            className={`flex flex-col items-center gap-2 cursor-pointer transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            title={label}
            onClick={() => setTargetAz(az)}
        >
            <svg viewBox="0 0 60 60" fill="none" className="w-[48px] h-[48px]">
                <circle cx={cx} cy="30" r="16" stroke="#1f2937" strokeWidth="2" />
                <path d={d} stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                {hasDot && <circle cx="50" cy="30" r="3" fill="#1f2937" />}
            </svg>
            <div className={`w-[8px] h-[8px] rounded-full transition-colors ${isActive ? 'bg-[#16a34a]' : 'bg-transparent'}`} />
        </div>
    );
}
