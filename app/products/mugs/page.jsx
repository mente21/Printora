import React from "react";
import Link from 'next/link';
import ProductCard from "@/components/ProductCard";
import CategoryHero from "@/components/CategoryHero";
import SupplierInfoSection from "@/components/SupplierInfoSection";
import { ArrowLeft } from "lucide-react";

const mugsData = [
  {
    id: 1,
    slug: 'product-mugs-1',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 1',
    brand: 'Local Craft • 2000',
    price: 800,
    premiumPrice: 600,
    sizes: 4,
    colors: 10,
    providers: 5,
    isBestseller: true,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/1 x 325 ml gepersonaliseerde koffiemok met naam en….jpg").default?.src || require("../../Images/mugs/1 x 325 ml gepersonaliseerde koffiemok met naam en….jpg").default || require("../../Images/mugs/1 x 325 ml gepersonaliseerde koffiemok met naam en….jpg")),
  },
  {
    id: 2,
    slug: 'product-mugs-2',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 2',
    brand: 'Local Craft • 2001',
    price: 950,
    premiumPrice: 700,
    sizes: 5,
    colors: 15,
    providers: 6,
    isBestseller: false,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/24 Gifts For The Person Who's Obsessed With Their….jpg").default?.src || require("../../Images/mugs/24 Gifts For The Person Who's Obsessed With Their….jpg").default || require("../../Images/mugs/24 Gifts For The Person Who's Obsessed With Their….jpg")),
  },
  {
    id: 3,
    slug: 'product-mugs-3',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 3',
    brand: 'Local Craft • 2002',
    price: 1100,
    premiumPrice: 800,
    sizes: 6,
    colors: 20,
    providers: 7,
    isBestseller: false,
    supplierSpecs: { material: "Ceramic", printArea: '8" x 3"', technique: "Sublimation" },
    image: (require("../../Images/mugs/Good Morning Mug.jpg").default?.src || require("../../Images/mugs/Good Morning Mug.jpg").default || require("../../Images/mugs/Good Morning Mug.jpg")),
  },
  {
    id: 4,
    slug: 'product-mugs-4',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 4',
    brand: 'Local Craft • 2003',
    price: 1250,
    premiumPrice: 900,
    sizes: 4,
    colors: 25,
    providers: 8,
    isBestseller: true,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/Graphic Designer Mug by CafePress CafePress….jpg").default?.src || require("../../Images/mugs/Graphic Designer Mug by CafePress CafePress….jpg").default || require("../../Images/mugs/Graphic Designer Mug by CafePress CafePress….jpg")),
  },
  {
    id: 5,
    slug: 'product-mugs-5',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 5',
    brand: 'Local Craft • 2004',
    price: 1400,
    premiumPrice: 1000,
    sizes: 5,
    colors: 30,
    providers: 9,
    isBestseller: false,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/Item Type_ Mugs Material_ Ceramic Features….jpg").default?.src || require("../../Images/mugs/Item Type_ Mugs Material_ Ceramic Features….jpg").default || require("../../Images/mugs/Item Type_ Mugs Material_ Ceramic Features….jpg")),
  },
  {
    id: 6,
    slug: 'product-mugs-6',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 6',
    brand: 'Local Craft • 2005',
    price: 1550,
    premiumPrice: 1100,
    sizes: 6,
    colors: 35,
    providers: 10,
    isBestseller: false,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/Motivational mug for slow mornings___.jpg").default?.src || require("../../Images/mugs/Motivational mug for slow mornings___.jpg").default || require("../../Images/mugs/Motivational mug for slow mornings___.jpg")),
  },
  {
    id: 7,
    slug: 'product-mugs-7',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 7',
    brand: 'Local Craft • 2006',
    price: 1700,
    premiumPrice: 1200,
    sizes: 4,
    colors: 40,
    providers: 11,
    isBestseller: true,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/mug.jpg").default?.src || require("../../Images/mugs/mug.jpg").default || require("../../Images/mugs/mug.jpg")),
  },
  {
    id: 8,
    slug: 'product-mugs-8',
    editorTemplateId: 'ceramic-mug',
    title: 'Custom mugs 8',
    brand: 'Local Craft • 2007',
    price: 1850,
    premiumPrice: 1300,
    sizes: 5,
    colors: 45,
    providers: 12,
    isBestseller: false,
    supplierSpecs: { material: "Ceramic", printArea: '9.5" x 3.2"', technique: "Sublimation" },
    image: (require("../../Images/mugs/_i_Friends__i_ Central Perk Mug.jpg").default?.src || require("../../Images/mugs/_i_Friends__i_ Central Perk Mug.jpg").default || require("../../Images/mugs/_i_Friends__i_ Central Perk Mug.jpg")),
  }
];

const mugSupplierSpecs = {
  printAreaDescription: "Full wrap around the mug cylinder. Ideal for panoramas.",
  printArea: '9.5" x 3.2"',
  fileRequirements: [
    "300 DPI High Resolution",
    "PNG / PDF / JPG",
    "RGB Color Profile",
    "No transparent backgrounds"
  ],
  materialDescription: "Grade-A Ceramic. Diswasher and Microwave safe.",
  techniques: ["Dye Sublimation", "Direct Transfer", "Screen Printing"]
};

const MugsPage = () => {
  return (
    <>
      <CategoryHero title="Mugs" description="High-quality custom mugs for your home or office, crafted by Stenvio." images={mugsData.map(d => d.image)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {mugsData.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <SupplierInfoSection category="Mugs" specs={mugSupplierSpecs} />
    </>
  );
};

export default MugsPage;
