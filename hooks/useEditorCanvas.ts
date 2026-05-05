"use client";

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { PrintArea, CanvasDesignState } from '@/types/editor';

interface UseEditorCanvasProps {
    printArea: PrintArea | undefined;
    canvasSize?: { width: number, height: number };
    onSelectionChange?: (activeObject: fabric.Object | null) => void;
    initialState?: CanvasDesignState;
    viewId?: string;
}

export function useEditorCanvas({ printArea, canvasSize, onSelectionChange, initialState, viewId }: UseEditorCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [canvasRevision, setCanvasRevision] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    // liveProps: plain state mirroring active object's editable properties so toolbar re-renders live
    const [liveProps, setLiveProps] = useState<Record<string, any>>({});
    const [isPanning, setIsPanning] = useState(false);

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const onSelectionChangeRef = useRef(onSelectionChange);
    useEffect(() => {
        onSelectionChangeRef.current = onSelectionChange;
    }, [onSelectionChange]);

    // Save history function
    const saveHistory = () => {
        if (!canvas || isInitialLoad.current) return;
        let json: string;
        try {
            json = JSON.stringify(canvas.toJSON());
        } catch (err) {
            console.warn('canvas.toJSON() failed, skipping history save:', err);
            return;
        }
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            if (newHistory.length > 0 && newHistory[newHistory.length - 1] === json) {
                return prev;
            }
            newHistory.push(json);
            if (newHistory.length > 50) {
                newHistory.shift();
                return newHistory;
            }
            return newHistory;
        });
        setHistoryIndex(prev => {
            const newIdx = prev + 1;
            return newIdx > 49 ? 49 : newIdx;
        });
        setCanvasRevision(r => r + 1);
    };

    // Fabric v5 + Turbopack: enlivenObjects does NOT always reconstruct nested
    // fabric.Path instances on IText (the `path` prop for text-on-a-path).
    // This leaves a plain object without `isNotVisible`, crashing renderAll.
    // Strip broken path refs before adding to canvas.
    const patchEnlivedObject = (obj: fabric.Object) => {
        const o = obj as any;
        if (o.path && typeof o.path.isNotVisible !== 'function') {
            o.path = null;
        }
    };

    // Undo/Redo: use enlivenObjects (loadFromJSON crashes with Turbopack)
    const applyHistoryState = (stateJson: string) => {
        if (!canvas) return;
        isInitialLoad.current = true;
        const state = JSON.parse(stateJson);
        canvas.clear();
        canvas.setBackgroundColor('transparent', () => {});
        fabric.util.enlivenObjects(
            state.objects || [],
            (objects: fabric.Object[]) => {
                objects.forEach(obj => {
                    patchEnlivedObject(obj);
                    canvas.add(obj);
                });
                if (printArea && canvasSize) {
                    canvas.clipPath = new fabric.Rect({
                        left: printArea.left, top: printArea.top,
                        width: printArea.width, height: printArea.height,
                        absolutePositioned: true,
                    });
                }
                canvas.requestRenderAll();
                setTimeout(() => { isInitialLoad.current = false; }, 50);
            },
            'fabric'
        );
    };

    const undo = () => {
        if (historyIndex > 0 && canvas) {
            const prevIndex = historyIndex - 1;
            applyHistoryState(history[prevIndex]);
            setHistoryIndex(prevIndex);
            setCanvasRevision(r => r + 1);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1 && canvas) {
            const nextIndex = historyIndex + 1;
            applyHistoryState(history[nextIndex]);
            setHistoryIndex(nextIndex);
            setCanvasRevision(r => r + 1);
        }
    };

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        // Create Fabric canvas
        const newCanvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: true,
            backgroundColor: 'transparent',
        });

        // Default settings for objects
        fabric.Object.prototype.transparentCorners = false;
        fabric.Object.prototype.cornerColor = '#16a34a';
        fabric.Object.prototype.cornerStyle = 'circle';
        fabric.Object.prototype.borderColor = '#16a34a';
        fabric.Object.prototype.cornerSize = 10;
        fabric.Object.prototype.padding = 5;

        // Custom Delete Control
        const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23ef4444;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.245' height='262.187'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.244' height='262.187'/%3E%3C/g%3E%3C/svg%3E";
        const img = document.createElement('img');
        img.src = deleteIcon;

        fabric.Object.prototype.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: -16,
            offsetX: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData: any, transform: any) => {
                const target = transform.target;
                const canvas = target.canvas;
                if (canvas) {
                    canvas.remove(target);
                    canvas.requestRenderAll();
                    saveHistory();
                }
                return true;
            },
            render: (ctx: any, left: any, top: any, styleOverride: any, fabricObject: any) => {
                const size = 20;
                ctx.save();
                ctx.translate(left, top);
                ctx.drawImage(img, -size/2, -size/2, size, size);
                ctx.restore();
            },
            cornerSize: 20
        } as any);

        // Sync liveProps from a fabric object
        const syncLive = (obj: fabric.Object | null) => {
            if (!obj) { setLiveProps({}); return; }
            setLiveProps({
                type: obj.type,
                fill: (obj as any).fill ?? '#000000',
                stroke: (obj as any).stroke ?? 'transparent',
                strokeWidth: (obj as any).strokeWidth ?? 0,
                opacity: obj.opacity ?? 1,
                fontSize: (obj as any).fontSize ?? 32,
                fontWeight: (obj as any).fontWeight ?? 'normal',
                fontStyle: (obj as any).fontStyle ?? 'normal',
                underline: (obj as any).underline ?? false,
            });
        };
        // Event listeners for selection
        newCanvas.on('selection:created', () => { const o = newCanvas.getActiveObject(); onSelectionChangeRef.current?.(o || null); syncLive(o || null); });
        newCanvas.on('selection:updated', () => { const o = newCanvas.getActiveObject(); onSelectionChangeRef.current?.(o || null); syncLive(o || null); });
        newCanvas.on('selection:cleared', () => { onSelectionChangeRef.current?.(null); syncLive(null); });
        
        // History events
        newCanvas.on('object:added', () => saveHistory());
        newCanvas.on('object:modified', () => saveHistory());
        newCanvas.on('object:removed', () => saveHistory());

        setCanvas(newCanvas);

        return () => {
            newCanvas.dispose();
            setCanvas(null);
        };
    }, []);

    // Initial history save
    useEffect(() => {
        if (canvas && history.length === 0) {
            const json = JSON.stringify(canvas.toJSON());
            setHistory([json]);
            setHistoryIndex(0);
        }
    }, [canvas]);

    // Resize canvas when print area changes
    useEffect(() => {
        if (canvas && printArea) {
            const useFullCanvas = !!canvasSize;
            canvas.setWidth(useFullCanvas ? canvasSize.width : printArea.width);
            canvas.setHeight(useFullCanvas ? canvasSize.height : printArea.height);

            if (useFullCanvas) {
                const clipPath = new fabric.Rect({
                    left: printArea.left,
                    top: printArea.top,
                    width: printArea.width,
                    height: printArea.height,
                    absolutePositioned: true
                });
                canvas.clipPath = clipPath;
            }

            canvas.renderAll();
        }
    }, [canvas, printArea, canvasSize]);

    const isInitialLoad = useRef(false);
    // Track which viewId we last loaded, so we don't re-run restore on every viewStates sync
    const lastRestoredViewId = useRef<string | undefined>('__none__');

    const doRestore = (objects: any[]) => {
        if (!canvas) return;
        isInitialLoad.current = true;
        canvas.clear();
        canvas.setBackgroundColor('transparent', () => {});
        if (objects.length === 0) {
            if (printArea && canvasSize) {
                canvas.clipPath = new fabric.Rect({
                    left: printArea.left, top: printArea.top,
                    width: printArea.width, height: printArea.height,
                    absolutePositioned: true,
                });
            }
            canvas.renderAll();
            const json = JSON.stringify(canvas.toJSON());
            setHistory([json]);
            setHistoryIndex(0);
            isInitialLoad.current = false;
            return;
        }
        fabric.util.enlivenObjects(objects, (enlived: fabric.Object[]) => {
            enlived.forEach(obj => {
                patchEnlivedObject(obj);
                // Skip invisible path helpers that still crash renderAll
                if (obj.type === 'path' && obj.visible === false) return;
                canvas.add(obj);
            });
            if (printArea && canvasSize) {
                canvas.clipPath = new fabric.Rect({
                    left: printArea.left, top: printArea.top,
                    width: printArea.width, height: printArea.height,
                    absolutePositioned: true,
                });
            }
            canvas.requestRenderAll();
            let json: string;
            try {
                json = JSON.stringify(canvas.toJSON());
            } catch (err) {
                console.warn('canvas.toJSON() failed after restore:', err);
                setTimeout(() => { isInitialLoad.current = false; }, 100);
                return;
            }
            setHistory([json]);
            setHistoryIndex(0);
            setTimeout(() => { isInitialLoad.current = false; }, 100);
        }, 'fabric');
    };

    // Handle restoring state when view changes or on initial load.
    // Guard: only restore when the view actually switches OR the canvas is empty but
    // initialState has objects (handles async editOrderId loading).
    // Do NOT restore just because viewStates was synced during normal editing.
    useEffect(() => {
        if (!canvas) return;
        const viewChanged = lastRestoredViewId.current !== viewId;
        const hasState   = !!(initialState?.objects?.length);
        const isEmpty    = canvas.getObjects().length === 0;

        if (!viewChanged && !isEmpty) return; // Canvas already showing this view's content
        if (!viewChanged && isEmpty && !hasState) return; // Nothing to load

        lastRestoredViewId.current = viewId;
        doRestore(initialState?.objects ?? []);
    }, [canvas, initialState, viewId]);

    
    // Handle Zoom
    const setZoom = (value: number) => {
        if (!canvas) return;
        const newZoom = Math.min(Math.max(0.05, value), 5);
        setZoomLevel(newZoom);
        const center = canvas.getCenter();
        canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
        canvas.renderAll();
    };

    // Handle Panning (Hand Tool)
    useEffect(() => {
        if (!canvas) return;

        if (isPanning) {
            canvas.defaultCursor = 'grab';
            canvas.selection = false;
            canvas.forEachObject(obj => {
                obj.selectable = false;
                obj.hoverCursor = 'grab';
            });
        } else {
            canvas.defaultCursor = 'default';
            canvas.selection = true;
            canvas.forEachObject(obj => {
                obj.selectable = true;
                obj.hoverCursor = 'move';
            });
        }
        canvas.renderAll();

        const handleMouseDown = (opt: any) => {
            if (!isPanning) return;
            const evt = opt.e;
            (canvas as any).isDragging = true;
            canvas.selection = false;
            (canvas as any).lastPosX = evt.clientX || evt.touches?.[0]?.clientX;
            (canvas as any).lastPosY = evt.clientY || evt.touches?.[0]?.clientY;
        };

        const handleMouseMove = (opt: any) => {
            if (!(canvas as any).isDragging) return;
            const e = opt.e;
            const vpt = canvas.viewportTransform!;
            vpt[4] += (e.clientX || e.touches?.[0]?.clientX) - (canvas as any).lastPosX;
            vpt[5] += (e.clientY || e.touches?.[0]?.clientY) - (canvas as any).lastPosY;
            canvas.requestRenderAll();
            (canvas as any).lastPosX = e.clientX || e.touches?.[0]?.clientX;
            (canvas as any).lastPosY = e.clientY || e.touches?.[0]?.clientY;
        };

        const handleMouseUp = () => {
            (canvas as any).isDragging = false;
            canvas.selection = isPanning ? false : true;
        };

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);

        return () => {
            canvas.off('mouse:down', handleMouseDown);
            canvas.off('mouse:move', handleMouseMove);
            canvas.off('mouse:up', handleMouseUp);
        };
    }, [canvas, isPanning]);

    const addText = (textStr = 'Double click to edit', options: fabric.ITextOptions = {}) => {
        if (!canvas || !printArea) return;

        const centerX = canvasSize ? printArea.left + printArea.width / 2 : printArea.width / 2;
        const centerY = canvasSize ? printArea.top + printArea.height / 2 : printArea.height / 2;

        const text = new fabric.IText(textStr, {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'sans-serif',
            fontSize: 32,
            fill: '#000000',
            fontWeight: 'bold',
            textAlign: 'center',
            ...options
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addCurvedText = () => {
        if (!canvas || !printArea) return;
        const centerX = canvasSize ? printArea.left + printArea.width / 2 : printArea.width / 2;
        const centerY = canvasSize ? printArea.top + printArea.height / 2 : printArea.height / 2;

        // Note: Fabric v5 cannot safely serialize IText with a `path` property (toObject crash).
        // Use a regular IText styled as curved text instead.
        const text = new fabric.IText('CURVED TEXT', {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'sans-serif',
            fontSize: 30,
            fill: '#000000',
            fontWeight: 'bold',
            textAlign: 'center',
            charSpacing: 200, // wide spacing gives a curved-arc feel
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
    };

    const addShape = (type: string) => {
        if (!canvas || !printArea) return;

        const centerX = canvasSize ? printArea.left + printArea.width / 2 : printArea.width / 2;
        const centerY = canvasSize ? printArea.top + printArea.height / 2 : printArea.height / 2;

        const commonProps = {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fill: '#000000',
        };

        let shape: fabric.Object | null = null;

        switch (type) {
            case 'square':
                shape = new fabric.Rect({ ...commonProps, width: 100, height: 100 });
                break;
            case 'circle':
                shape = new fabric.Circle({ ...commonProps, radius: 50 });
                break;
            case 'triangle':
                shape = new fabric.Triangle({ ...commonProps, width: 100, height: 100 });
                break;
            case 'line':
                shape = new fabric.Line([-50, 0, 50, 0], { ...commonProps, stroke: '#000000', strokeWidth: 5, fill: '' });
                break;
            case 'star':
                shape = new fabric.Path('M 50 5 L 61 37 L 95 37 L 67 57 L 78 89 L 50 69 L 22 89 L 33 57 L 5 37 L 39 37 Z', commonProps);
                break;
            case 'heart':
                shape = new fabric.Path('M 50 85 C 20 55 5 35 5 20 C 5 5 25 5 35 15 C 45 25 50 30 50 30 C 50 30 55 25 65 15 C 75 5 95 5 95 20 C 95 35 80 55 50 85 Z', commonProps);
                break;
            case 'hexagon':
                shape = new fabric.Polygon([{x: 50, y: 0}, {x: 100, y: 25}, {x: 100, y: 75}, {x: 50, y: 100}, {x: 0, y: 75}, {x: 0, y: 25}], commonProps);
                break;
            case 'pentagon':
                shape = new fabric.Polygon([{x: 50, y: 0}, {x: 100, y: 38}, {x: 82, y: 100}, {x: 18, y: 100}, {x: 0, y: 38}], commonProps);
                break;
            case 'diamond':
                shape = new fabric.Polygon([{x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}], commonProps);
                break;
            case 'arrow':
                shape = new fabric.Path('M 0 40 L 60 40 L 60 20 L 100 50 L 60 80 L 60 60 L 0 60 Z', commonProps);
                break;
            case 'cross':
                shape = new fabric.Path('M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z', commonProps);
                break;
            case 'badge':
                shape = new fabric.Path('M 50 0 L 80 10 L 100 40 L 90 70 L 50 100 L 10 70 L 0 40 L 20 10 Z', commonProps);
                break;
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    const addImage = (url: string) => {
        if (!canvas || !printArea) return;

        fabric.Image.fromURL(url, (img) => {
            const maxWidth = printArea.width * 0.8;
            const maxHeight = printArea.height * 0.8;

            if (img.width! > maxWidth || img.height! > maxHeight) {
                const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
                img.scale(scale);
            }

            const centerX = canvasSize ? printArea.left + printArea.width / 2 : printArea.width / 2;
            const centerY = canvasSize ? printArea.top + printArea.height / 2 : printArea.height / 2;

            img.set({
                left: centerX,
                top: centerY,
                originX: 'center',
                originY: 'center',
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
    };

    const deleteSelected = () => {
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach((object) => {
                canvas.remove(object);
            });
            canvas.renderAll();
            saveHistory();
        }
    };

    const bringForward = () => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.bringForward(activeObject);
            canvas.renderAll();
            saveHistory();
        }
    };

    const sendBackward = () => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.sendBackwards(activeObject);
            canvas.renderAll();
            saveHistory();
        }
    };

    const updateActiveObject = (updates: Record<string, any>, saveToHistory = true) => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set(updates);
            canvas.requestRenderAll();
            // Update liveProps so toolbar re-renders with fresh values immediately
            setLiveProps(prev => ({ ...prev, ...updates }));
            if (saveToHistory) {
                // saveHistory() internally calls setCanvasRevision → triggers viewStates sync.
                // Do NOT call setCanvasRevision separately: during slider drag (saveToHistory=false)
                // we must NOT trigger the sync or initialState changes and clears the canvas.
                saveHistory();
            }
            // No setCanvasRevision here — only saveHistory() should bump revision
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!canvas) return;
            const activeObject = canvas.getActiveObject();
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }

            if (!activeObject) return;
            if (activeObject instanceof fabric.IText && activeObject.isEditing) {
                return;
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvas, history, historyIndex]);

    return {
        canvasRef,
        canvas,
        addText,
        addCurvedText,
        addShape,
        addImage,
        deleteSelected,
        bringForward,
        sendBackward,
        updateActiveObject,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        canvasRevision,
        liveProps,
        zoomLevel,
        setZoom,
        isPanning,
        setIsPanning
    };
}
