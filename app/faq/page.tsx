"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Minus } from "lucide-react";

// FAQ Data
const faqs = [
  {
    category: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Simply browse our catalog, select your product, use the online designer to add your artwork, and proceed to checkout. It's that easy!"
      },
      {
        q: "How long does production take?",
        a: "Production usually takes between 2-4 business days depending on the print house you selected and the complexity of the item."
      }
    ]
  },
  {
    category: "Payments",
    items: [
      {
        q: "How do I pay?",
        a: "We accept multiple payment methods including CBE, Telebirr, and Bank of Abyssinia (BOA) for your convenience."
      },
      {
        q: "How do I submit payment proof?",
        a: "After completing your transfer, simply upload a screenshot of your receipt on the order confirmation page or via your account dashboard."
      }
    ]
  },
  {
    category: "Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery typically takes 2-5 business days after production is complete, depending on your location."
      },
      {
        q: "Can delivery be delayed?",
        a: "While rare, weather conditions or logistical issues can cause slight delays. You can always track your order status in your account."
      }
    ]
  },
  {
    category: "Customization",
    items: [
      {
        q: "Can I upload my own design?",
        a: "Yes! You can upload your own custom artwork or photos using our built-in designer tool."
      },
      {
        q: "What file formats are supported?",
        a: "We recommend uploading high-resolution PNG or JPEG files. For the best print quality, ensure your images are at least 300 DPI."
      }
    ]
  },
  {
    category: "Policies",
    items: [
      {
        q: "Can I get a refund?",
        a: "Refunds are evaluated on a case-by-case basis. Because items are custom printed, we generally only offer refunds for defective or damaged products."
      },
      {
        q: "Can I cancel my order?",
        a: "You can cancel your order within 2 hours of placement. Once production begins, orders cannot be canceled."
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const activeQuestions = faqs.find(f => f.category === activeCategory)?.items || [];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#9DF542] selection:text-[#111] pb-20">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-24">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16 md:mb-24 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 text-blue-500 text-xs font-bold tracking-widest uppercase mb-8">
            / FAQS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-[#111] tracking-tight mb-6 leading-[1.1]">
            Frequently asked question
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            here's everything you need to know to get started, manage your account, and troubleshoot the most frequent issues.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-32">
          
          {/* Left Sidebar - Categories */}
          <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {faqs.map((section) => {
              const isActive = activeCategory === section.category;
              return (
                <button
                  key={section.category}
                  onClick={() => {
                    setActiveCategory(section.category);
                    setOpenIndex(0); // Reset accordion when switching category
                  }}
                  className={`text-left px-6 py-3.5 rounded-full whitespace-nowrap transition-all duration-300 ease-out font-medium text-[15px]
                    ${isActive 
                      ? 'bg-blue-50 border border-blue-100 text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-[#111] hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  {section.category}
                </button>
              );
            })}
          </div>

          {/* Right Side - Accordion */}
          <div className="flex-1 max-w-3xl">
            <div className="space-y-4">
              {activeQuestions.map((item, index) => {
                const isOpen = openIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className={`group rounded-2xl overflow-hidden transition-all duration-500 ease-out
                      ${isOpen ? 'bg-[#f8f9fa]' : 'bg-transparent hover:bg-gray-50'}
                    `}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                    >
                      <span className={`font-medium text-[17px] pr-4 transition-all duration-300 ${isOpen ? 'text-[#111]' : 'text-gray-700 group-hover:text-[#111] group-hover:translate-x-1'}`}>
                        {item.q}
                      </span>
                      
                      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                        {/* Unique Animation: The plus rotates into a minus beautifully */}
                        <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-180 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100 text-gray-400 group-hover:text-[#111]'}`}>
                          <Plus size={20} strokeWidth={2} />
                        </div>
                        <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-0 opacity-100 scale-100 text-[#111]' : '-rotate-180 opacity-0 scale-50 text-gray-400'}`}>
                          <Minus size={20} strokeWidth={2} />
                        </div>
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-6 pb-6 pt-1">
                        <p className="text-gray-500 text-[15px] leading-[1.8] transform transition-transform duration-500 delay-75 origin-top">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
