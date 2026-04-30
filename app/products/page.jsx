import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Layers,
  Star,
  Zap,
  Layout,
  Plus,
} from "lucide-react";

import imgHat1 from "../Images/hats/Beige ralph lauren cap.jpg";
import imgTshirt1 from "../Images/t shirts/Basic Bae Round Neck Dropped Shoulder Short Sleeve….jpg";
import imgLongSleeve1 from "../Images/long sleeves/Product information_ Color_ Black, camel, light….jpg";
import imgHoodie1 from "../Images/hoodies/Introducing our premium hoodie, featuring a….jpg";
import imgBag1 from "../Images/bags/DIY City Market Bag _ Oleander + Palm.jpg";
import imgBag2 from "../Images/bags/New photo of me wearing my Scandinavian Bird Tote….jpg";
import imgMug1 from "../Images/mugs/Good Morning Mug.jpg";
import imgPhoneCase1 from "../Images/phone cases/Our signature Tough Phone Case delivers unmatched….jpg";

import imgNewTee from "../Images/t shirts/Effortlessly stylish, consciously crafted — your….jpg";
import imgNewHoodie from "../Images/hoodies/Introducing our premium fleece hoodie, crafted for….jpg";
import imgNewSweatshirt from "../Images/long sleeves/Discover the essence of elegance and authenticity….jpg";
import imgNewCap from "../Images/hats/La Casquette Avec Filet, une casquette respirante….jpg";

import imgStarterMug from "../Images/mugs/_i_Friends__i_ Central Perk Mug.jpg";
import imgStarterTee from "../Images/t shirts/Dieses Herren-T-Shirt verleiht Ihrem Outfit eine….jpg";

import imgBanner from "../Images/hoodies/How To Start A Capsule Wardrobe_ 5 Step Visual….jpg";

import ProductCard from "@/components/ProductCard";

const resolveImg = (img) =>
  img?.src || img?.default?.src || img?.default || img;

const categories = [
  {
    name: "Embroidery",
    path: "/products/hats",
    image: resolveImg(imgHat1),
    size: "large",
  },
  {
    name: "T-shirts",
    path: "/products/t-shirts",
    image: resolveImg(imgTshirt1),
    size: "medium",
  },
  {
    name: "Sweatshirts",
    path: "/products/long-sleeves",
    image: resolveImg(imgLongSleeve1),
    size: "small",
  },
  {
    name: "Hoodies",
    path: "/products/hoodies",
    image: resolveImg(imgHoodie1),
    size: "medium",
  },
  {
    name: "Bags",
    path: "/products/bags",
    image: resolveImg(imgBag1),
    size: "large",
  },
  {
    name: "Phones",
    path: "/products/phone-cases",
    image: resolveImg(imgPhoneCase1),
    size: "small",
  },
  {
    name: "Mugs",
    path: "/products/mugs",
    image: resolveImg(imgMug1),
    size: "medium",
  },
];

const PRODUCT_TYPE_ALIASES = {
  tshirt: "t-shirts",
  "t-shirt": "t-shirts",
  tshirts: "t-shirts",
  hoodie: "hoodies",
  cap: "hats",
  phone: "phone-cases",
  poster: "posters",
};

const starterEssentials = [
  { title: "White Ceramic Mug", image: resolveImg(imgStarterMug) },
  { title: "Unisex Jersey Tee", image: resolveImg(imgStarterTee) },
  { title: "Eco Tote Bag", image: resolveImg(imgBag1) },
];

const newCollectionItems = [
  {
    id: 101,
    slug: "classic-blank-tee",
    editorTemplateId: "classic-tshirt",
    title: "Classic Blank Tee",
    brand: "Stenvio • Essentials",
    price: 1550,
    premiumPrice: 1100,
    image: resolveImg(imgNewTee),
    isBestseller: false,
    isNew: true,
  },
  {
    id: 102,
    slug: "premium-hoodie-collection",
    editorTemplateId: "premium-hoodie",
    title: "Premium Hoodie",
    brand: "Stenvio • Premium",
    price: 3200,
    premiumPrice: 2450,
    image: resolveImg(imgNewHoodie),
    isBestseller: true,
    isNew: true,
  },
  {
    id: 103,
    slug: "crewneck-sweatshirt",
    editorTemplateId: "classic-tshirt",
    title: "Crewneck Sweatshirt",
    brand: "Stenvio • Comfort",
    price: 2400,
    premiumPrice: 1800,
    image: resolveImg(imgNewSweatshirt),
    isBestseller: false,
    isNew: true,
  },
  {
    id: 104,
    slug: "panel-cap-v2",
    editorTemplateId: "classic-tshirt",
    title: "Panel Cap",
    brand: "Stenvio • Headwear",
    price: 1850,
    premiumPrice: 1350,
    image: resolveImg(imgNewCap),
    isBestseller: true,
    isNew: true,
  },
];

const ProductsPage = async ({ searchParams }) => {
  const resolvedSearchParams = await searchParams;
  const selectedTypeRaw = resolvedSearchParams?.type || null;
  const selectedType = selectedTypeRaw
    ? PRODUCT_TYPE_ALIASES[selectedTypeRaw] || selectedTypeRaw
    : null;
  const filteredCategories = selectedType
    ? categories.filter((c) => c.path?.split("/").pop() === selectedType)
    : categories;
  return (
    <div className="relative bg-[#fbfaf6] min-h-screen overflow-x-hidden font-sans">
      {/* ── Enhanced Background ── */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] bg-[#bc9368]/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-[#A1FF4D]/5 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-12 lg:px-20 py-10">
        {/* ── Premium Split Hero ── */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-40 pt-10">
          <div className="w-full lg:w-3/5 space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e5e3d7] rounded-full shadow-sm hover:translate-x-2 transition-transform">
              <Sparkles className="w-4 h-4 text-[#bc9368]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6b6440]">
                2026 Collection — Drop 01
              </span>
            </div>

            <h1
              className="text-7xl sm:text-8xl lg:text-9xl font-black text-[#1f1d12] leading-[0.85] tracking-tighter"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Design. <br />
              Print. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bc9368] to-[#8c6239] italic">
                Perfect.
              </span>
            </h1>

            <p className="max-w-xl text-xl text-[#6b6440] font-medium leading-relaxed opacity-80">
              Stenvio Studio is your ultimate destination for premium custom
              apparel. We provide highest-quality blanks and professional print
              services to turn your ideas into reality.
            </p>

            <div className="flex flex-wrap gap-6 pt-2">
              <Link href="/editor">
                <button className="px-12 py-6 bg-[#1f1d12] text-white font-black uppercase text-[13px] tracking-widest hover:bg-[#bc9368] transition-all transform hover:-translate-y-2 rounded-3xl flex items-center gap-4 shadow-2xl">
                  START DESIGNING <ArrowRight size={20} />
                </button>
              </Link>
              <Link
                href="#printing-network"
                className="flex items-center gap-4 pl-4 group cursor-pointer hover:translate-x-1 transition-transform"
              >
                <div className="w-14 h-14 rounded-full border border-[#e5e3d7] flex items-center justify-center bg-white group-hover:bg-[#fbfaf6]">
                  <Zap className="text-[#bc9368]" size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1f1d12]">
                  Express Fulfillment
                </span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-2/5 relative h-[500px] lg:h-[700px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-white rounded-[4rem] shadow-2xl overflow-hidden transform rotate-6 border-[12px] border-white z-20 group hover:rotate-3 transition-transform duration-700">
                <img
                  src={resolveImg(imgBanner)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[5s]"
                  alt="Main Product"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-3/5 h-3/5 bg-white rounded-[3.5rem] shadow-2xl overflow-hidden transform -rotate-12 border-[12px] border-white z-30 group hover:rotate-0 transition-transform duration-700 flex items-center justify-center p-8">
                <div className="text-center group-hover:scale-105 transition-transform duration-500">
                  <ShoppingBag className="w-16 h-16 text-[#bc9368] mx-auto mb-6" />
                  <span className="text-[#1f1d12] font-black uppercase tracking-widest text-sm block mb-2">
                    Premium Cotton
                  </span>
                  <div className="flex gap-1 justify-center opacity-40">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="black" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute top-[20%] -left-16 z-40 bg-[#bc9368] w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transform animate-bounce">
                <span className="text-white font-black text-xs">NEW</span>
                <span className="text-white/80 font-bold text-[10px] tracking-widest">
                  SEASON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trending Grid / Selected Category Products ── */}
        <div className="mb-40">
          {selectedType ? (
            (() => {
              const productsByType = {
                "t-shirts": [
                  {
                    id: 101,
                    slug: "classic-blank-tee",
                    title: "Classic Blank Tee",
                    brand: "Stenvio • Essentials",
                    price: 1550,
                    premiumPrice: 1100,
                    image: resolveImg(imgNewTee),
                  },
                ],
                hoodies: [
                  {
                    id: 102,
                    slug: "premium-hoodie-collection",
                    title: "Premium Hoodie",
                    brand: "Stenvio • Premium",
                    price: 3200,
                    premiumPrice: 2450,
                    image: resolveImg(imgNewHoodie),
                  },
                ],
                "long-sleeves": [
                  {
                    id: 103,
                    slug: "crewneck-sweatshirt",
                    title: "Crewneck Sweatshirt",
                    brand: "Stenvio • Comfort",
                    price: 2400,
                    premiumPrice: 1800,
                    image: resolveImg(imgNewSweatshirt),
                  },
                ],
                bags: [
                  {
                    id: 201,
                    slug: "eco-tote-bag",
                    title: "Eco Tote Bag",
                    brand: "Stenvio • Goods",
                    price: 1200,
                    premiumPrice: 900,
                    image: resolveImg(imgBag1),
                  },
                  {
                    id: 202,
                    slug: "city-market-bag",
                    title: "City Market Bag",
                    brand: "Stenvio • Goods",
                    price: 1400,
                    premiumPrice: 1000,
                    image: resolveImg(imgBag2),
                  },
                ],
                mugs: [
                  {
                    id: 301,
                    slug: "white-ceramic-mug",
                    title: "White Ceramic Mug",
                    brand: "Stenvio • Kitchen",
                    price: 800,
                    premiumPrice: 600,
                    image: resolveImg(imgStarterMug),
                  },
                ],
                posters: [
                  {
                    id: 601,
                    slug: "wall-poster-print",
                    title: "Wall Poster Print",
                    brand: "Stenvio • Stationery",
                    price: 1300,
                    premiumPrice: 950,
                    image: resolveImg(imgMug1),
                  },
                ],
                hats: [
                  {
                    id: 501,
                    slug: "panel-cap-v2",
                    title: "Panel Cap",
                    brand: "Stenvio • Headwear",
                    price: 1850,
                    premiumPrice: 1350,
                    image: resolveImg(imgNewCap),
                  },
                ],
                "phone-cases": [
                  {
                    id: 401,
                    slug: "tough-phone-case",
                    title: "Tough Phone Case",
                    brand: "Stenvio • Protection",
                    price: 2000,
                    premiumPrice: 1500,
                    image: resolveImg(imgPhoneCase1),
                  },
                ],
              };

              const productsToShow = productsByType[selectedType] || [];

              return (
                <div>
                  <div className="mb-8 text-center">
                    <h2 className="text-4xl font-black">
                      {(selectedType || "").replace(/-/g, " ")}
                    </h2>
                    <p className="text-gray-500">
                      Showing products for this category.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {productsToShow.map((product) => (
                      <div
                        key={product.id}
                        className="relative group hover:-translate-y-2 transition-all duration-500"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {newCollectionItems.map((product) => (
                <div
                  key={product.id}
                  className="relative group hover:-translate-y-2 transition-all duration-500"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bento Category Grid ── */}
        <div className="mb-40">
          <div className="flex items-center gap-6 mb-16 justify-center">
            <div className="h-px bg-[#e5e3d7] flex-1" />
            <h2 className="text-5xl font-black text-[#1f1d12] tracking-tighter text-center">
              Department <span className="italic">Lounge</span>
            </h2>
            <div className="h-px bg-[#e5e3d7] flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-[280px] gap-8">
            {filteredCategories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/products?type=${cat.path?.split("/").pop()}`}
                className={`group relative rounded-[3rem] overflow-hidden bg-white shadow-sm border border-[#e5e3d7] transition-all hover:shadow-2xl hover:border-[#bc9368]/40 
                            ${cat.size === "large" ? "md:col-span-2 md:row-span-2" : ""} 
                            ${cat.size === "medium" ? "md:col-span-2 md:row-span-1" : ""}
                            ${cat.size === "small" ? "md:col-span-1 md:row-span-1" : ""}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
                <img
                  src={cat.image}
                  className="absolute inset-0 w-full h-full object-contain p-12 group-hover:scale-110 transition-transform duration-700"
                  alt={cat.name}
                />
                <div className="absolute bottom-10 left-10 z-20 flex items-center gap-4">
                  <h3 className="text-white font-black text-2xl tracking-tight leading-none group-hover:translate-x-2 transition-transform duration-500">
                    {cat.name}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                    <ArrowRight size={14} className="text-[#1f1d12]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Starter Essentials: Enhanced Polaroid ── */}
        <div className="mb-40 px-6 sm:px-16 lg:px-24 py-32 bg-[#1f1d12] rounded-[5rem] relative overflow-hidden shadow-[0_40px_80px_-15px_rgba(31,29,18,0.4)]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none skew-x-12 translate-x-1/4" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#bc9368]/10 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
            <div className="w-full lg:w-5/12">
              <div className="w-14 h-14 bg-[#A1FF4C]/20 border border-[#A1FF4C]/30 rounded-2xl flex items-center justify-center mb-8">
                <Layout className="text-[#A1FF4C]" size={32} />
              </div>
              <h2 className="text-6xl font-black text-white leading-tight tracking-tighter mb-8">
                The Master <br />{" "}
                <span className="text-[#bc9368] italic">Print Blanks</span>
              </h2>
              <p className="text-white/60 text-xl mb-12 leading-relaxed font-medium">
                Heaviest weights, softest cottons, and the perfect canvas for
                your next design. Our studio-grade prints start with the world's
                best blanks.
              </p>
              <div className="inline-flex gap-8 items-center">
                <button className="px-10 py-5 bg-[#bc9368] text-white font-black uppercase text-[12px] tracking-widest rounded-2xl hover:bg-white hover:text-[#1f1d12] transition-all transform hover:-translate-y-1">
                  Browse Blanks
                </button>
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-[#1f1d12] bg-[#fbfaf6] flex items-center justify-center text-[10px] font-black text-[#1f1d12]"
                    >
                      S {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-3 gap-10 ">
              {starterEssentials.map((item, i) => (
                <div
                  key={i}
                  className={`group bg-white p-5 pb-16 rounded-3xl shadow-2xl transition-all duration-700 hover:scale-105 odd:rotate-2 even:-rotate-2 hover:rotate-0`}
                >
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#fbfaf6] mb-8 border border-[#e5e3d7]">
                    <img
                      src={item.image}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-1000"
                      alt={item.title}
                    />
                  </div>
                  <div className="px-2 text-center">
                    <h4 className="font-black text-[#1f1d12] text-md leading-none mb-3 truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-center gap-3 text-orange-600">
                      <Sparkles
                        className="text-[#bc9368] w-3 h-3"
                        fill="currentColor"
                      />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bc9368]">
                        Studio Series Blanks
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Studio Badge Bridge ── */}
        <div
          id="printing-network"
          className="flex flex-col items-center py-20 text-center relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-black text-[#1f1d12]/5 pointer-events-none select-none tracking-tighter uppercase">
            STUDIO
          </div>
          <div className="w-24 h-24 rounded-full border border-[#e5e3d7] flex items-center justify-center mb-10 bg-white shadow-inner relative z-10">
            <Sparkles className="text-[#bc9368] w-10 h-10 animate-pulse" />
          </div>
          <h3 className="text-[#1f1d12] font-black text-3xl tracking-tight mb-4 relative z-10">
            Stenvio Printing Network.
          </h3>
          <p className="text-[#6b6850] max-w-sm font-medium mb-12 relative z-10 leading-relaxed">
            Professional screen printing, high-fidelity DTG, and bespoke
            embroidery for creators.
          </p>
          <Link href="/supplier">
            <button className="px-10 py-5 bg-[#1f1d12] text-white font-black uppercase text-[11px] tracking-widest rounded-full hover:bg-[#bc9368] transition-all shadow-xl relative z-10">
              Register as Supplier
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
