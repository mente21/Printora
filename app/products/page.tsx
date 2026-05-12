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
  Search,
  Package,
  Menu
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import { ETHIOPIAN_REGIONS } from "@/lib/countries";

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
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [userCountry, setUserCountry] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();

  const carouselItems = useMemo(() => [
    {
      buttonText: "Shop T-Shirts",
      href: "/products?category=T-shirts",
      bg: "linear-gradient(135deg, #1b2412 0%, #2d3f1a 50%, #1a2a10 100%)",
      accent: "#9DF542",
      image: "/car11.png",
      imagePos: "object-top"
    },
    {
      title: "WEAR THE HOODIE LIFE.",
      subtitle: "Men's custom hoodies — thick fleece, vivid chest prints, designed exactly the way you want.",
      buttonText: "Shop Hoodies",
      href: "/products?category=Hoodies",
      bg: "linear-gradient(135deg, #1a1030 0%, #2d1b5e 50%, #3b2080 100%)",
      accent: "#A78BFA",
      image: "/car2.png",
      imagePos: "object-top"
    },
    {
      title: "WEAR YOUR BRAND.",
      subtitle: "Custom apparel fitted tees & hoodies crafted to carry your design with style and precision.",
      buttonText: "Shop Women's",
      href: "/products?category=T-shirts",
      bg: "linear-gradient(135deg, #2a0a18 0%, #5c1430 50%, #7d1a42 100%)",
      accent: "#FB7185",
      textColor: "#000000",
      image: "/car3.jpg",
      imagePos: "object-[center_20%]"
    },
    {
      title: "MERCH THAT MOVES PEOPLE.",
      subtitle: "From tote bags and mugs to phone cases — every product is a canvas for your design.",
      buttonText: "Browse All",
      href: "/products",
      bg: "linear-gradient(135deg, #0a1f30 0%, #0e3a5c 50%, #0f4878 100%)",
      accent: "#38BDF8",
      image: "/car4.jpg",
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
    const fetchProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;

      const { data: approvedData } = await supabase
        .from("supplier_products")
        .select("*, supplier:profiles(full_name, country)")
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      let allProducts: any[] = approvedData || [];

      if (userId) {
        const { data: ownData, error: ownError } = await supabase
          .from("supplier_products")
          .select("*, supplier:profiles(full_name, country)")
          .eq("supplier_id", userId)
          .neq("status", "APPROVED")
          .order("created_at", { ascending: false });

        if (ownError) console.warn("Own products fetch warning:", ownError);
        if (ownData && ownData.length > 0) {
          allProducts = [...allProducts, ...ownData];
        }
      }

      setSupplierProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Detect Region: logged-in profile first, then fallback to Addis Ababa
  useEffect(() => {
    const detectRegion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", user.id)
          .single();
        if (prof?.country) { setUserCountry(prof.country); return; }
      }
      // Fallback for Ethiopian market
      setUserCountry("Addis Ababa");
    };
    detectRegion();
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
    { name: "Sweaters", icon: Shirt },
    { name: "Hoodies", icon: Shirt },
    { name: "Mugs", icon: Coffee },
    { name: "Hats", icon: HardHat },
    { name: "Accessories", icon: Watch },
    { name: "Phone Cases", icon: Smartphone },
    { name: "Banners", icon: Grid },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  const activeCountry = selectedCountry || userCountry;

  const filteredProducts = useMemo(() => {
    let result = [...supplierProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.product_type || "").toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedSelected = selectedCategories.map(cat => {
        const norm = normalize(cat);
        return { norm, singular: norm.endsWith('s') ? norm.slice(0, -1) : norm };
      });
      result = result.filter(p => {
        if (!p.product_type) return false;
        const typeNorm = normalize(p.product_type);
        return normalizedSelected.some(cat =>
          typeNorm.includes(cat.norm) || typeNorm.includes(cat.singular) || cat.norm.includes(typeNorm) || cat.singular.includes(typeNorm)
        );
      });
    }
    result = result.filter(p => (p.price || 0) >= minPrice && (p.price || 0) <= maxPrice);
    if (sortBy === "price-low") result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-high") result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    return result;
  }, [supplierProducts, selectedCategories, searchQuery, minPrice, maxPrice, sortBy]);

  // Geo-filtered view: local-first, fallback to all
  const localProducts = useMemo(() => {
    if (!activeCountry) return filteredProducts;
    return filteredProducts.filter(p =>
      (p.supplier_country || p.supplier?.country || "").toLowerCase() === activeCountry.toLowerCase()
    );
  }, [filteredProducts, activeCountry]);

  const showingLocal = activeCountry && localProducts.length > 0;
  const displayedProducts = (activeCountry && !selectedCountry)
    ? (localProducts.length > 0 ? localProducts : filteredProducts)
    : (selectedCountry
      ? filteredProducts.filter(p => (p.supplier_country || p.supplier?.country || "").toLowerCase() === selectedCountry.toLowerCase())
      : filteredProducts);
  const showFallbackMsg = activeCountry && !selectedCountry && localProducts.length === 0 && filteredProducts.length > 0;

  // Use the full set of Ethiopian regions for the filter list
  const availableCountries = useMemo(() => 
    ETHIOPIAN_REGIONS.map(r => r.name).sort()
  , []);

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

            {/* Full background image - object-cover to fit width/height */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Mobile image - right aligned to preserve subjects */}
              <img src={item.image} alt={item.title} className="w-full h-full object-cover object-right md:hidden opacity-100" />
              {/* Desktop image - uses original positioning */}
              <img src={item.image} alt={item.title} className={`hidden md:block w-full h-full object-cover opacity-100 ${item.imagePos || 'object-center'}`} />
            </div>

            {/* Text content overlay */}
            <div className="relative z-10 h-full flex items-center px-5 sm:px-10 md:px-20 lg:px-28 w-full md:w-2/3 lg:w-1/2">
              <div 
                className="max-w-[85%] sm:max-w-xl space-y-2 sm:space-y-4 p-4 md:p-0 rounded-2xl md:rounded-none backdrop-blur-md md:!backdrop-blur-none border border-white/20 md:!border-none shadow-2xl md:!shadow-none md:!bg-transparent transition-all"
                style={{ 
                  backgroundColor: item.textColor === '#000000' 
                    ? 'rgba(255,255,255,0.65)' 
                    : 'rgba(0,0,0,0.45)' 
                }}
              >

                {/* ONE unified bold Impact heading across all slides */}
                <h2
                  className={`text-[22px] sm:text-4xl md:text-5xl lg:text-[58px] leading-[1.05] md:leading-[1.0] ${item.textColor ? "" : "text-white drop-shadow-lg"}`}
                  style={{
                    fontFamily: 'Impact, "Arial Black", "Segoe UI Black", sans-serif',
                    letterSpacing: '0.01em',
                    color: item.textColor || 'white'
                  }}
                >
                  {item.title}
                </h2>
                <p
                  className={`text-[12px] sm:text-[15px] md:text-[17px] font-medium leading-snug md:leading-relaxed max-w-[180px] sm:max-w-md ${item.textColor ? "" : "text-white/90 drop-shadow-sm"}`}
                  style={{ color: item.textColor ? `${item.textColor}e6` : undefined }}
                >
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

        {/* Mobile Filter Overlay */}
        {isMobileFiltersOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-[70] w-[300px] sm:w-[320px] bg-white overflow-y-auto transition-transform duration-300 ease-out 
          lg:relative lg:translate-x-0 lg:z-auto lg:w-[280px] lg:flex-shrink-0 lg:bg-transparent lg:overflow-visible
          ${isMobileFiltersOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
          flex flex-col h-full lg:h-auto space-y-0 lg:space-y-8
        `}>
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2 text-[#1c211f]">
              <Package size={20} className="text-[#3da85b]" />
              <h2 className="text-lg font-black tracking-tight">Products & Filters</h2>
            </div>
            <button 
              onClick={() => setIsMobileFiltersOpen(false)} 
              className="p-2 -mr-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="p-6 lg:p-6 bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-gray-100 flex-1 overflow-y-auto lg:overflow-visible">
            <div className="hidden lg:flex items-center gap-2 mb-6 text-[#1c211f]">
              <Filter size={20} className="text-[#3da85b]" />
              <h2 className="text-lg font-black tracking-tight">Filters</h2>
            </div>

            {/* Quick Actions (Mobile Only) */}
            <div className="space-y-4 mb-6 lg:hidden">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#1c211f] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-sm"
              >
                <ShoppingBag size={16} />
                My Orders
              </Link>
            </div>

            <hr className="my-6 border-gray-100 lg:hidden" />

            {/* Sort Options (Mobile Only) */}
            <div className="space-y-4 mb-6 lg:hidden">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By</h3>
              <CustomSelect
                value={sortBy === "newest" ? "Sort: Newest" : sortBy === "price-low" ? "Price: Low to High" : "Price: High to Low"}
                options={["Sort: Newest", "Price: Low to High", "Price: High to Low"]}
                onChange={(val) => {
                  if (val === "Sort: Newest") setSortBy("newest");
                  else if (val === "Price: Low to High") setSortBy("price-low");
                  else setSortBy("price-high");
                }}
                className="w-full"
              />
            </div>

            <hr className="my-6 border-gray-100 lg:hidden" />

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
                      onChange={() => {
                        setSelectedCategories([]);
                        if (window.innerWidth < 1024) {
                          setTimeout(() => setIsMobileFiltersOpen(false), 200);
                        }
                      }}
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
                    return typeNorm.includes(catNorm) || typeNorm.includes(catSingular) || catNorm.includes(typeNorm) || catSingular.includes(typeNorm);
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
                            if (window.innerWidth < 1024) {
                              setTimeout(() => setIsMobileFiltersOpen(false), 200);
                            }
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
                  max="10000"
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
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="bg-transparent w-full text-sm font-bold text-gray-700 outline-none"
                    />
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-2 flex items-center gap-1">
                    <span className="text-gray-400 text-[10px] font-bold">MAX</span>
                    <input
                      type="number"
                      placeholder="10000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="bg-transparent w-full text-sm font-bold text-gray-700 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Region Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Operating Region</h3>
                {selectedCountry && (
                  <button onClick={() => setSelectedCountry('')} className="text-[10px] font-black text-[#3da85b] uppercase tracking-wider hover:underline">Clear</button>
                )}
              </div>
              
              {userCountry && !selectedCountry && (
                <button 
                  onClick={() => setSelectedCountry(userCountry)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#3da85b]/5 border border-[#3da85b]/20 rounded-xl mb-2 hover:bg-[#3da85b]/10 transition-all group"
                  title={`Click to filter strictly by ${userCountry}`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#3da85b] animate-pulse flex-shrink-0" />
                  <span className="text-[11px] font-bold text-[#3da85b] flex-1 text-left">Near you: {userCountry}</span>
                  <span className="text-[9px] font-black text-[#3da85b] opacity-0 group-hover:opacity-100 transition-opacity uppercase">Filter</span>
                </button>
              )}

              <CustomSelect
                options={[
                  { value: '', label: 'All Regions' },
                  ...availableCountries.map(country => ({
                    value: country,
                    label: country === userCountry ? `📍 ${country} (Local)` : country
                  }))
                ]}
                value={selectedCountry}
                onChange={(val) => setSelectedCountry(val)}
                placeholder="Filter by region..."
                className="w-full"
              />
            </div>

          </div>

          <div className="p-6 lg:p-0 mt-auto">
            <div className="bg-[#3f566a] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <h3 className="font-black text-xl leading-tight">Supplier<br />Discounts</h3>
                <p className="text-white/70 text-sm">Get up to 20% off on bulk orders.</p>
                <button className="bg-white text-[#3f566a] px-4 py-2 rounded-xl text-xs font-bold mt-2 shadow-lg w-full hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </aside>

        {/* Main Product Area */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* Top Bar above categories */}
          <div className="flex flex-col gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            
            {/* Desktop View */}
            <div className="hidden lg:flex items-center justify-between w-full px-2">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                Showing <span className="text-[#1c211f] font-black">{displayedProducts.length}</span> results
                {showingLocal && !selectedCountry && <span className="text-[10px] font-black text-[#3da85b] bg-[#3da85b]/10 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">Near You</span>}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1c211f] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-[0_4px_12px_rgba(28,33,31,0.1)] shrink-0"
                  title="View My Orders"
                >
                  <ShoppingBag size={16} />
                  <span>My Orders</span>
                </Link>
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3da85b]/20 focus:border-[#3da85b] transition-all"
                  />
                </div>
                <CustomSelect
                  value={sortBy === "newest" ? "Sort: Newest" : sortBy === "price-low" ? "Price: Low to High" : "Price: High to Low"}
                  options={["Sort: Newest", "Price: Low to High", "Price: High to Low"]}
                  onChange={(val) => {
                    if (val === "Sort: Newest") setSortBy("newest");
                    else if (val === "Price: Low to High") setSortBy("price-low");
                    else setSortBy("price-high");
                  }}
                  className="w-[180px]"
                />
              </div>
            </div>

            {/* Mobile View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full px-2 gap-4 lg:hidden">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3da85b]/20 focus:border-[#3da85b] transition-all"
                  />
                </div>
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="flex items-center justify-center p-2 text-[#1c211f] bg-transparent hover:bg-gray-100 rounded-xl transition-all active:scale-95 shrink-0"
                  aria-label="Open Menu"
                >
                  <Menu size={28} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                Showing <span className="text-[#1c211f] font-black">{displayedProducts.length}</span> results
                {showingLocal && !selectedCountry && <span className="text-[10px] font-black text-[#3da85b] bg-[#3da85b]/10 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">Near You</span>}
              </div>
            </div>
          </div>



          {/* Fallback message */}
          {showFallbackMsg && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <span className="text-xl">📍</span>
              <p className="font-bold text-amber-800">
                No suppliers found in {activeCountry}. Showing high-quality options from other regions in Ethiopia.
              </p>
            </div>
          )}

          {/* Empty State */}
          {displayedProducts.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-[#1c211f] mb-2">No products found</h3>
              <p className="text-gray-500 font-medium text-sm max-w-md">
                We couldn't find any products matching your current filters. Try adjusting your search or clearing some filters to see more results.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setSelectedCountry("");
                  setMinPrice(0);
                  setMaxPrice(5000);
                }}
                className="mt-6 px-6 py-2.5 bg-[#3da85b] text-white rounded-xl font-bold text-sm hover:bg-[#32904d] transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {displayedProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">

            {/* ── Featured Banner Editor Card ── */}
            {(selectedCategories.length === 0 || selectedCategories.includes('Banners')) && (
              <div className="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-4 group">
                <Link href="/editor?template=banner" className="block">
                  <div className="relative rounded-3xl overflow-hidden h-[140px] md:h-[170px] flex items-center px-8 md:px-14 gap-6"
                    style={{ background: 'linear-gradient(135deg, #1C1C1C 0%, #2d2d2d 60%, #1B4DFF22 100%)' }}>
                    {/* Dashed print-area overlay */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '10px 10px' }} />
                    {/* Left text */}
                    <div className="relative z-10 flex-1 min-w-0">
                      <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-[#6DCC5A] bg-[#6DCC5A]/10 px-3 py-1 rounded-full mb-3">New — Banner Studio</span>
                      <h3 className="text-white font-black text-xl md:text-2xl leading-tight mb-1">Design Your Custom Banner</h3>
                      <p className="text-white/50 text-[12px] md:text-[13px] font-medium max-w-sm">Set exact dimensions, choose aspect ratio, preview print area & order high-res prints.</p>
                    </div>
                    {/* Mini canvas preview */}
                    <div className="relative flex-shrink-0 hidden sm:flex items-center justify-center">
                      <div className="w-[180px] md:w-[240px] h-[90px] md:h-[120px] bg-white rounded-xl shadow-2xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg,rgba(100,100,100,0.07) 0,rgba(100,100,100,0.07) 1px,transparent 0,transparent 50%)', backgroundSize: '6px 6px' }} />
                        <div className="absolute inset-[8%] border border-dashed border-gray-300/50 rounded" />
                        <span className="text-[10px] font-black tracking-[0.15em] text-gray-300 uppercase">Print Area</span>
                      </div>
                      <div className="absolute -bottom-1 right-2 bg-white/90 border border-gray-200 rounded-md px-2 py-0.5 text-[9px] font-bold text-gray-500">Scale 1:5</div>
                    </div>
                    {/* CTA */}
                    <div className="flex-shrink-0 relative z-10">
                      <span className="inline-flex items-center gap-2 bg-[#6DCC5A] hover:bg-[#5ab84a] text-[#1C1C1C] font-black text-[12px] md:text-[13px] px-5 py-3 rounded-xl shadow-lg transition-all group-hover:scale-105 active:scale-95">
                        Open Editor
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {displayedProducts.map((product) => (
              <div key={product.id} className="flex flex-col group hover:-translate-y-1 transition-transform duration-500">
                <div className="relative aspect-square rounded-2xl sm:rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4 p-[2px] overflow-hidden">
                  <Link href={`/products/${product.id}`} className="block w-full h-full relative rounded-[calc(1.5rem-4px)] sm:rounded-[calc(2rem-4px)] overflow-hidden bg-[#f8f9fa] group/img cursor-pointer">
                    {/* Promotion Tags */}
                    {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 pointer-events-none">
                        {product.tags.map((tag: string) => (
                          <span key={tag} className="bg-[#1c211f] text-[#A1FF4D] text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg border border-[#A1FF4D]/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
                  </Link>
                </div>

                <div className="flex-1 space-y-2 px-1">
                  <h3 className="font-black text-[14px] sm:text-[16px] text-[#1c211f] line-clamp-1">
                    <Link href={`/products/${product.id}`} className="hover:text-[#3da85b] transition-colors">{product.name}</Link>
                  </h3>
                  <p className="text-[11px] sm:text-[13px] text-gray-400 font-medium leading-relaxed line-clamp-2 min-h-[34px] sm:min-h-[40px]">
                    {product.description || "Customized premium quality product, perfect for your unique designs."}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[16px] sm:text-[20px] font-black text-[#3da85b] tracking-tight">ETB {product.price}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#1c211f] border-2 border-white"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-800 border-2 border-white"></div>
                      </div>
                      <span className="text-[9px] sm:text-[11px] text-gray-400 font-bold ml-1">{product.colors?.length || 3} colors</span>
                    </div>
                  </div>
                  {(product.supplier_country || product.supplier?.country) && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">📍 Ships from:</span>
                      <span className="text-[9px] sm:text-[10px] font-black text-gray-500">{product.supplier_country || product.supplier?.country}</span>
                      {(product.supplier_country || product.supplier?.country) === userCountry && (
                        <span className="text-[8px] font-black text-[#3da85b] bg-[#3da85b]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Local</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto h-0 group-hover:h-auto overflow-hidden">
                  <Link
                    href={
                      (product.product_type || '').toLowerCase().includes('banner')
                        ? `/editor?template=banner&supplier_product_id=${product.id}`
                        : `/editor?template=${product.product_type?.toLowerCase() || 'classic-tshirt'}&supplier_product_id=${product.id}`
                    }
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
          )}

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