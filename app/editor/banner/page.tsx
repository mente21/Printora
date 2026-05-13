"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const BannerEditorUI = dynamic(() => import('@/components/editor/BannerEditorUI'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F2F1EE]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#6DCC5A] border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-gray-500 font-medium tracking-wide">Loading Banner Editor…</span>
            </div>
        </div>
    ),
});

export default function BannerEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#F2F1EE]">
                <div className="w-10 h-10 border-2 border-[#6DCC5A] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <BannerEditorUI />
        </Suspense>
    );
}
