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
import CustomSelect from "@/components/ui/CustomSelect";

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
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();

  const carouselItems = useMemo(() => [
    {
      title: "Design Your Identity",
      subtitle: "Transform your ideas into premium custom apparel with our expert printing service.",
      buttonText: "Start Designing",
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Precision Printing",
      subtitle: "State-of-the-art technology for vivid, long-lasting prints on every product.",
      buttonText: "Browse Collection",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Global Customization",
      subtitle: "Personalize every detail and ship your brand to customers worldwide.",
      buttonText: "Get Started",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    }
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
        .select("*, supplier:profiles(full_name)")
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      let allProducts: any[] = approvedData || [];

      if (userId) {
        const { data: ownData, error: ownError } = await supabase
          .from("supplier_products")
          .select("*")
          .eq("supplier_id", userId)
          .neq("status", "APPROVED")
          .order("created_at", { ascending: false });

        if (ownError) console.error("Own products fetch error:", ownError);
        if (ownData && ownData.length > 0) {
          allProducts = [...allProducts, ...ownData];
        }
      }

      setSupplierProducts(allProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const categories = [
    { name: "T-shirts", icon: Shirt },
    { name: "Mugs", icon: Coffee },
    { name: "Hoodies", icon: Shirt },
    { name: "Hats", icon: HardHat },
    { name: "Accessories", icon: Watch },
    { name: "Phone Cases", icon: Smartphone },
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
              norm,
              singular: norm.endsWith('s') ? norm.slice(0, -1) : norm
          };
      });

      result = result.filter(p => {
        if (!p.product_type) return false;
        const typeNorm = normalize(p.product_type);
        return normalizedSelected.some(cat => 
          typeNorm.includes(cat.norm) || typeNorm.includes(cat.singular) || cat.norm.includes(typeNorm) || cat.singular.includes(typeNorm)
        );
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
      
      {/* Expanded Carousel Section - Full Width */}
      <div className="relative group overflow-hidden w-full">
        {/* Back to Home Button (Arrow only) */}
        <Link 
          href="/" 
          className="absolute top-6 left-6 z-40 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/40 transition-all shadow-lg group-hover:scale-110"
          title="Back to Home"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* My Orders Button */}
        <Link 
          href="/orders" 
          className="absolute top-6 right-6 z-40 px-5 h-10 flex items-center justify-center bg-white border border-gray-200 text-[#1c211f] rounded-full hover:bg-gray-50 transition-all shadow-lg font-black text-xs uppercase tracking-widest group-hover:scale-105"
        >
          <ShoppingBag size={16} className="mr-2 text-[#3da85b]" />
          My Orders
        </Link>

        <div 
          className="flex h-[250px] md:h-[450px] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselItems.map((item, idx) => (
              <div key={idx} className="min-w-full h-full relative flex items-center px-8 md:px-24">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="absolute inset-0 w-full h-full object-cover z-0" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
                
                <div className="relative z-20 max-w-xl space-y-5">
                  <h2 className="text-2xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-md">
                    {item.title}
                  </h2>
                  <p className="text-white/90 text-base md:text-lg font-medium drop-shadow-sm max-w-md">
                    {item.subtitle}
                  </p>
                  <div className="pt-2">
                    <button className="bg-[#3da85b] text-white px-8 py-3.5 rounded-full text-[14px] font-bold hover:bg-[#34944d] transition-all active:scale-95 shadow-lg border border-[#3da85b]/50">
                      {item.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Fade Gradient to blend into the page */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fafbfa] to-transparent pointer-events-none z-20"></div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {carouselItems.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`cursor-pointer h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-[#3da85b] w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
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
                      placeholder="5000" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
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



          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex flex-col group hover:-translate-y-1 transition-transform duration-500">
                <div className="relative aspect-square rounded-2xl sm:rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-4 p-[2px] overflow-hidden">
                  <Link href={`/products/${product.id}`} className="block w-full h-full relative rounded-[calc(1.5rem-4px)] sm:rounded-[calc(2rem-4px)] overflow-hidden bg-[#f8f9fa] group/img cursor-pointer">
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
