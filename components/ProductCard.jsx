'use client';

import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

/* ── Printora-style tiled "CUSTOMIZE ME" overlay ── */
const DesignOverlay = () => {
  const COLS = 4;
  const ROWS = 5;
  const tiles = Array.from({ length: COLS * ROWS });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[#1c211f]/30 backdrop-blur-[2px]" />

      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {tiles.map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center border border-white/10"
          >
            <div className="flex flex-col items-center leading-none rotate-[-12deg] select-none opacity-40">
              <span className="font-black text-white text-[6px] tracking-widest">PRINTORA</span>
              <span className="font-black text-white text-[6px] tracking-widest mt-0.5">STUDIO</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex flex-col items-center justify-center bg-white rounded-xl px-5 py-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500"
          style={{ minWidth: 120 }}
        >
          <Zap className="w-5 h-5 text-[#f1c40f] mb-1.5 animate-pulse" fill="#f1c40f" />
          <span className="font-black text-[#1c211f] text-[11px] leading-tight tracking-[0.2em]">CUSTOMIZE</span>
          <span className="font-bold text-[#8a8670] text-[13px] leading-tight tracking-wide">YOUR OWN</span>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const templateId = product.editorTemplateId || 'classic-tshirt';
  const productSlug = encodeURIComponent(product.slug || String(product.id));

  const safeImage = hasImageError
    ? (product.fallbackImage || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&auto=format&fit=crop&q=80')
    : product.image;

  return (
    <Link href={`/editor?template=${templateId}&product=${productSlug}`} className="block group">
      <div
        className="relative flex flex-col bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(28,33,31,0.12)] border border-transparent hover:border-[#e5e3d7]/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Image Container ── */}
        <div className="relative aspect-[1/1] sm:aspect-[4/5] w-full overflow-hidden bg-[#f0f0eb] rounded-t-2xl">
          <img
            src={safeImage}
            alt={product.title}
            className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-110"
            onError={() => setHasImageError(true)}
          />

          {/* Design overlay */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <DesignOverlay />
          </div>
        </div>

        {/* ── Product Details ── */}
        <div className="flex flex-col p-5">
          <h3 className="font-black text-[#1c211f] text-[16px] leading-tight mb-3 min-h-[2.5rem] line-clamp-2 group-hover:text-[#2d2b1f] transition-colors tracking-tight">
            {product.title}
          </h3>

          {/* New Supplier Technical Details (Visible on hover or just below title) */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {product.supplierSpecs?.material && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#f0f0eb] px-2 py-0.5 rounded text-[#8a8670]">
                  {product.supplierSpecs.material}
                </span>
              )}
              {product.supplierSpecs?.printArea && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#f0f0eb] px-2 py-0.5 rounded text-[#8a8670]">
                  {product.supplierSpecs.printArea}" Area
                </span>
              )}
            </div>
            {isHovered && product.supplierSpecs?.technique && (
              <p className="text-[10px] text-[#bc9368] font-bold uppercase tracking-widest mt-1 animate-in fade-in duration-300">
                Method: {product.supplierSpecs.technique}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto mb-1">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bc9368]">Start Design</span>
             <div className="w-1.5 h-1.5 rounded-full bg-[#bc9368]" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f0eb]">
            {product.supplier_country ? (
              <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                <Globe size={9} className="text-gray-300" />
                Ships from: {product.supplier_country}
              </span>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
