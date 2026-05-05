"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  Shirt, 
  Watch, 
  ShoppingBag,
  Grid,
  Smartphone,
  HardHat,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#3da85b]" size={48} />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  const carouselItems = useMemo(() => [
    {
      title: "YOUR STYLE. YOUR PRINT.",
      subtitle: "Premium custom T-shirts — bold designs printed on superior fabric, wash after wash.",
      buttonText: "Shop T-Shirts",
      href: "/products?category=T-shirts",
      bg: "linear-gradient(135deg, #1b2412 0%, #2d3f1a 50%, #1a2a10 100%)",
      accent: "#9DF542",
      image: "/hustle-tee.jpg",
      imagePos: "object-top"
    },
    {
      title: "WEAR THE HOODIE LIFE.",
      subtitle: "Men's custom hoodies — thick fleece, vivid chest prints, designed exactly the way you want.",
      buttonText: "Shop Hoodies",
      href: "/products?category=Hoodies",
      bg: "linear-gradient(135deg, #1a1030 0%, #2d1b5e 50%, #3b2080 100%)",
      accent: "#A78BFA",
      image: "/orange-hoodie.jpg",
      imagePos: "object-top"
    },
    {
      title: "SHE WEARS HER BRAND.",
      subtitle: "Women's custom apparel — fitted tees & hoodies that carry your design with style and precision.",
      buttonText: "Shop Women's",
      href: "/products?category=T-shirts",
      bg: "linear-gradient(135deg, #2a0a18 0%, #5c1430 50%, #7d1a42 100%)",
      accent: "#FB7185",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&fit=crop",
      imagePos: "object-[center_20%]"
    },
    {
      title: "MERCH THAT MOVES PEOPLE.",
      subtitle: "From tote bags and mugs to phone cases — every product is a canvas for your design.",
      buttonText: "Browse All",
      href: "/products",
      bg: "linear-gradient(135deg, #0a1f30 0%, #0e3a5c 50%, #0f4878 100%)",
      accent: "#38BDF8",
      image: "/bag1.jpg",
      imagePos: "object-center"
    },
  ], []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  useEffect(() => {
    supabase
      .from("supplier_products")
      .select("*, supplier:profiles(full_name)")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSupplierProducts(data || []);
        setLoading(false);
      });
  }, []);

  // Auto-scroll logic — slow crossfade every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const categories = [
    { name: "T-shirts", icon: Shirt },
    { name: "Hoodies", icon: Shirt },
    { name: "Sweaters", icon: Shirt },
    { name: "Mugs", icon: Coffee },
    { name: "Hats", icon: HardHat },
    { name: "Accessories", icon: Watch },
    { name: "Phone Cases", icon: Smartphone },
    { name: "Tote Bags", icon: ShoppingBag },
    { name: "Posters", icon: Grid },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  const filteredProducts = useMemo(() => {
    let result = [...supplierProducts];

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name || "").toLowerCase().includes(q) || 
        (p.description || "").toLowerCase().includes(q) ||
        (p.product_type || "").toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (selectedCategories.length > 0) {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedSelected = selectedCategories.map(cat => {
          const norm = normalize(cat);
          return {
              name: cat,
              norm,
              singular: norm.endsWith('s') ? norm.slice(0, -1) : norm
          };
      });

      result = result.filter(p => {
        if (!p.product_type) return false;
        const typeNorm = normalize(p.product_type);
        const nameNorm = normalize(p.name || "");
        
        return normalizedSelected.some(cat => {
          // Check if product type matches category
          const isMatch = typeNorm.includes(cat.norm) || 
                         typeNorm.includes(cat.singular) || 
                         cat.norm.includes(typeNorm) || 
                         cat.singular.includes(typeNorm);
          
          if (isMatch) return true;

          // Special case: Sweaters often named "Crewneck" or "Pullover"
          if (cat.name === "Sweaters") {
            const isSweaterKeyword = typeNorm.includes("crewneck") || 
                                     typeNorm.includes("pullover") ||
                                     nameNorm.includes("crewneck") ||
                                     nameNorm.includes("pullover") ||
                                     nameNorm.includes("sweater");
            
            // Avoid matching T-shirts that happen to mention "crewneck"
            const isExplicitTShirt = nameNorm.includes("tshirt") || 
                                     nameNorm.includes("tee") || 
                                     typeNorm.includes("tshirt");
            
            return isSweaterKeyword && !isExplicitTShirt;
          }
          
          if (cat.name === "Hoodies") {
            return nameNorm.includes("hoodie");
          }
          
          return false;
        });
      });
    }

    // Filter by Price
    result = result.filter(p => (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice);

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [supplierProducts, selectedCategories, searchQuery, minPrice, maxPrice, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#3da85b]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfa] font-sans text-[#1c211f]">
      
      {/* Hero Carousel — crossfade, no images */}
      <div className="relative overflow-hidden w-full h-[220px] md:h-[280px]">

        {/* Slides — stacked, fading in/out */}
        {carouselItems.map((item, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
            style={{ opacity: currentSlide === idx ? 1 : 0, zIndex: currentSlide === idx ? 1 : 0, background: item.bg }}
          >
            {/* Bottom fade into page */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#fafbfa] to-transparent pointer-events-none" />

            {/* Promotional image in the absolute right remaining space */}
            <div className="absolute right-0 top-0 h-full w-1/2 md:w-[60%] lg:w-[65%] hidden md:block" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)', maskImage: 'linear-gradient(to right, transparent, black 15%)' }}>
                <img src={item.image} alt={item.title} className={`w-full h-full object-cover opacity-90 transition-transform duration-[10000ms] hover:scale-105 ${item.imagePos || 'object-center'}`} />
            </div>

            {/* Text content */}
            <div className="relative z-10 h-full flex items-center px-10 md:px-20 lg:px-28 md:w-1/2 lg:w-[45%]">
              <div className="max-w-xl space-y-4">

                {/* ONE unified bold Impact heading across all slides */}
                <h2
                  className="text-4xl md:text-5xl lg:text-[58px] text-white leading-[1.0] drop-shadow-lg"
                  style={{ fontFamily: 'Impact, "Arial Black", "Segoe UI Black", sans-serif', letterSpacing: '0.01em' }}
                >
                  {item.title}
                </h2>
                <p className="text-white/90 text-[15px] md:text-[17px] font-medium leading-relaxed max-w-md drop-shadow-sm">
                  {item.subtitle}
                </p>

              </div>
            </div>
          </div>
        ))}

        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-40 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/40 transition-all shadow-lg"
          title="Back to Home"
        >
          <ChevronLeft size={20} />
        </Link>



        {/* Dot indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {carouselItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="h-1.5 rounded-full transition-all duration-500 cursor-pointer focus:outline-none"
              style={{
                width: currentSlide === idx ? 32 : 8,
                backgroundColor: currentSlide === idx ? item.accent : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>


      </div>

      {/* Main Layout with Sidebar */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-8">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-[#1c211f]">
              <Filter size={20} className="text-[#3da85b]" />
              <h2 className="text-lg font-black tracking-tight">Filters</h2>
            </div>

            {/* Categories in Sidebar */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Type</h3>
              <div className="space-y-1">
                <label className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-[#3da85b] focus:ring-[#3da85b] cursor-pointer" 
                      checked={selectedCategories.length === 0}
                      onChange={() => setSelectedCategories([])}
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#1c211f]">All Products</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{supplierProducts.length}</span>
                </label>
                {categories.map((cat, idx) => {
                  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const catNorm = normalize(cat.name);
                  const catSingular = catNorm.endsWith('s') ? catNorm.slice(0, -1) : catNorm;
                  
                  const count = supplierProducts.filter(p => {
                    if (!p.product_type) return false;
                    const typeNorm = normalize(p.product_type);
                    const nameNorm = normalize(p.name || "");
                    const isMatch = typeNorm.includes(catNorm) || typeNorm.includes(catSingular) || catNorm.includes(typeNorm) || catSingular.includes(typeNorm);
                    if (isMatch) return true;
                    if (cat.name === "Sweaters") {
                        const isSweaterKeyword = typeNorm.includes("crewneck") || typeNorm.includes("pullover") || nameNorm.includes("crewneck") || nameNorm.includes("pullover") || nameNorm.includes("sweater");
                        const isExplicitTShirt = nameNorm.includes("tshirt") || nameNorm.includes("tee") || typeNorm.includes("tshirt");
                        return isSweaterKeyword && !isExplicitTShirt;
                    }
                    if (cat.name === "Hoodies") {
                        return nameNorm.includes("hoodie");
                    }
                    return false;
                  }).length;
                  return (
                    <label key={idx} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-[#3da85b] focus:ring-[#3da85b] cursor-pointer" 
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => {
                            setSelectedCategories(prev => 
                                prev.includes(cat.name) 
                                    ? prev.filter(c => c !== cat.name) 
                                    : [...prev, cat.name]
                            );
                          }}
                        />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#1c211f]">{cat.name}</span>
                      </div>
                      {count > 0 && <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{count}</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range (ETB)</h3>
              <div className="px-2 space-y-4">
                <input 
                  type="range" 
                  className="w-full accent-[#3da85b]" 
                  min="0" 
                  max="5000" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center gap-1">
                    <span className="text-gray-400 text-[10px] font-bold">MIN</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={minPrice === 0 ? "" : minPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMinPrice(0);
                        } else {
                          // Convert to number which naturally removes leading zeros
                          setMinPrice(Number(val));
                        }
                      }}
                      className="bg-transparent w-full text-sm font-bold text-gray-700 outline-none" 
                    />
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center gap-1">
                    <span className="text-gray-400 text-[10px] font-bold">MAX</span>
                    <input 
                      type="number" 
                      placeholder="5000" 
                      value={maxPrice === 0 ? "" : maxPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMaxPrice(0);
                        } else {
                          setMaxPrice(Number(val));
                        }
                      }}
                      className="bg-transparent w-full text-sm font-bold text-gray-700 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>


            
          </div>
          
          <div className="bg-[#3f566a] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10 space-y-3">
               <h3 className="font-black text-xl leading-tight">Supplier<br/>Discounts</h3>
               <p className="text-white/70 text-sm">Get up to 20% off on bulk orders.</p>
               <button className="bg-white text-[#3f566a] px-4 py-2 rounded-xl text-xs font-bold mt-2 shadow-lg w-full hover:bg-gray-50 transition-colors">
                 Learn More
               </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </aside>

        {/* Main Product Area */}
        <div className="flex-1 min-w-0 space-y-10">
          
          {/* Top Bar above categories */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm px-2">
              Showing <span className="text-[#1c211f] font-black">{filteredProducts.length}</span> results
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3da85b]/20 focus:border-[#3da85b] transition-all"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-[170px] appearance-none bg-gray-50 border border-gray-100 rounded-xl py-2 pl-4 pr-10 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#3da85b]/20 text-left relative"
                >
                  {sortBy === 'newest' ? 'Sort: Newest' : sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                  <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortOpen && (
                  <>
                    {/* Invisible backdrop to dismiss dropdown */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute right-0 sm:left-0 mt-2 w-[170px] bg-white border border-gray-100 rounded-[14px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] z-50 overflow-hidden text-sm font-bold py-1.5 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                       <button 
                          onClick={() => { setSortBy('newest'); setIsSortOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 transition-colors ${sortBy === 'newest' ? 'text-[#3da85b] bg-[#3da85b]/[0.04]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                       >
                          Sort: Newest
                       </button>
                       <button 
                          onClick={() => { setSortBy('price-low'); setIsSortOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 transition-colors ${sortBy === 'price-low' ? 'text-[#3da85b] bg-[#3da85b]/[0.04]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                       >
                          Price: Low to High
                       </button>
                       <button 
                          onClick={() => { setSortBy('price-high'); setIsSortOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 transition-colors ${sortBy === 'price-high' ? 'text-[#3da85b] bg-[#3da85b]/[0.04]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                       >
                          Price: High to Low
                       </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>



          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex flex-col group hover:-translate-y-2 transition-transform duration-500">
                <div className="relative aspect-[4/5] rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-5 p-[2px]">
                  <Link href={`/products/${product.id}`} className="block w-full h-full relative rounded-[calc(2rem-4px)] overflow-hidden bg-[#f8f9fa] group/img cursor-pointer">
                    {product.image_url ? (
                      <>
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className={`w-full h-full object-cover transition-all duration-700 ${product.hover_image_url ? 'group-hover/img:opacity-0' : 'group-hover/img:scale-105'}`} 
                        />
                        {product.hover_image_url && (
                          <img 
                            src={product.hover_image_url} 
                            alt={`${product.name} alternate view`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/img:opacity-100 transition-all duration-700 group-hover/img:scale-105" 
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Shirt size={64} strokeWidth={0.5} />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Status Badge for Suppliers */}
                    {product.status !== "APPROVED" && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                          product.status === "PENDING" ? "bg-orange-500 text-white" : "bg-red-500 text-white"
                        }`}>
                          {product.status === "PENDING" ? "Pending Approval" : "Rejected"}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
                
                <div className="flex-1 space-y-2 px-1">
                  <h3 className="font-black text-[16px] text-[#1c211f] line-clamp-1">
                    <Link href={`/products/${product.id}`} className="hover:text-[#3da85b] transition-colors">{product.name}</Link>
                  </h3>
                  <p className="text-[13px] text-gray-400 font-medium leading-relaxed line-clamp-2 min-h-[40px]">
                    {product.description || "Customized premium quality product, perfect for your unique designs."}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[20px] font-black text-[#3da85b] tracking-tight">ETB {product.price}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#1c211f] border-2 border-white"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-800 border-2 border-white"></div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-bold ml-1">{product.colors?.length || 3} colors</span>
                    </div>
                  </div>
                </div>

                  <div className="mt-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto h-0 group-hover:h-auto overflow-hidden">
                    <Link 
                      href={`/editor?template=${product.product_type?.toLowerCase() || 'classic-tshirt'}&supplier_product_id=${product.id}`}
                      className="w-full bg-[#1c211f] text-white py-3 rounded-xl text-[13px] font-bold text-center hover:bg-black transition-all shadow-md active:scale-95"
                    >
                      Customize
                    </Link>
                    <Link 
                      href={`/products/${product.id}`}
                      className="w-full flex items-center justify-center border-2 border-gray-100 text-gray-500 py-2.5 rounded-xl text-[13px] font-bold hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </main>

      <footer className="py-16 border-t border-gray-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3 text-gray-400">
            <ShoppingBag className="w-6 h-6" />
            <span className="font-black text-[16px] tracking-tight uppercase">Printora Demo</span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-gray-400 hover:text-[#3da85b] text-[13px] font-bold transition-colors">Twitter</Link>
            <Link href="#" className="text-gray-400 hover:text-[#3da85b] text-[13px] font-bold transition-colors">Instagram</Link>
            <Link href="#" className="text-gray-400 hover:text-[#3da85b] text-[13px] font-bold transition-colors">LinkedIn</Link>
          </div>
          <p className="text-gray-300 text-[11px] font-bold uppercase tracking-[0.2em]">© 2026 PRINTORA ARCHIVE</p>
        </div>
      </footer>
    </div>
  );
}
