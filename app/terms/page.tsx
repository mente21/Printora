"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Info, CheckCircle, PenTool, CreditCard, Package, RotateCcw, AlertTriangle, User, RefreshCcw, Mail } from "lucide-react";

const SECTIONS = [
  { id: "introduction", label: "Introduction", icon: Info },
  { id: "use-of-service", label: "Use of Service", icon: CheckCircle },
  { id: "design-responsibility", label: "Design Responsibility", icon: PenTool },
  { id: "orders-payments", label: "Orders & Payments", icon: CreditCard },
  { id: "production-delivery", label: "Production & Delivery", icon: Package },
  { id: "refunds", label: "Refunds", icon: RotateCcw },
  { id: "limitations", label: "Limitations", icon: AlertTriangle },
  { id: "account-responsibility", label: "Account Responsibility", icon: User },
  { id: "updates", label: "Updates", icon: RefreshCcw },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function TermsOfUse() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -80% 0px",
      }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans selection:bg-[#9DF542] selection:text-[#111] pb-20">
      {/* Header */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto mt-12 px-4 md:px-8">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
          
          {/* Hero Banner */}
          <div className="relative h-[240px] md:h-[300px] w-full bg-slate-900 overflow-hidden mx-auto">
            {/* Abstract Background Image/Pattern */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Terms of Use</h1>
              <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl">
                The ground rules for using our platform to bring your ideas to life
              </p>
            </div>
          </div>

          {/* Content Wrapper */}
          <div className="flex flex-col md:flex-row gap-8 sm:gap-12 lg:gap-20 p-5 sm:p-8 md:p-12 lg:p-16">
            
            {/* Left: Sticky TOC */}
            <aside className="w-full md:w-[260px] shrink-0">
              <div className="sticky top-32 space-y-6 hidden md:block">
                <h3 className="font-bold text-gray-900 px-4 text-sm tracking-widest uppercase opacity-60">Table of contents</h3>
                <nav className="flex flex-col gap-1.5">
                  {SECTIONS.map(({ id, label, icon: Icon }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => scrollToSection(e, id)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200 ${
                        activeSection === id
                          ? "bg-[#111] text-white shadow-md"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} className={activeSection === id ? "text-[#9DF542]" : "opacity-60"} />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Mobile TOC */}
              <div className="block md:hidden mb-8">
                <h3 className="font-bold text-gray-900 mb-4 text-sm tracking-widest uppercase opacity-60">Table of contents</h3>
                <div className="flex flex-wrap gap-2">
                  {SECTIONS.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => scrollToSection(e, id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                        activeSection === id
                          ? "bg-[#111] text-white border-[#111]"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right: Main Content Area */}
            <div className="flex-1 space-y-16">
              
              <section id="introduction" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Introduction</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Welcome to Stenvo! We're thrilled to have you here. By using our platform, you agree to these terms.
                  </p>
                  <p>
                    We've written these terms to be clear and human—no complicated legal jargon. Please read them carefully, as they ensure a safe and smooth experience for everyone in our community.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="use-of-service" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Use of Service</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Our platform allows you to create, design, and order beautiful custom products. We give you the tools, and you provide the creativity.
                  </p>
                  <p>
                    We ask that you use our services responsibly. This means not using our platform for anything illegal, malicious, or harmful to others. We want to maintain a positive space for all creators.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="design-responsibility" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Design Responsibility</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Your ideas are yours! When you upload a design, you must own the rights to it or have explicit permission to use it.
                  </p>
                  <p>
                    We have a strict policy against copyrighted, illegal, or offensive content. If we find that a design violates these rules, we may cancel the order to protect the original creators and our community standards.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="orders-payments" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Orders & Payments</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Once you place an order, we get to work! Orders are officially processed only after payment confirmation.
                  </p>
                  <p>
                    In some cases, we might ask for proof of payment (like an uploaded receipt or a valid coupon code) to keep things secure and verify your purchase manually.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="production-delivery" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Production & Delivery</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Quality takes a little time. Production usually takes a few business days depending on the complexity of your custom product.
                  </p>
                  <p>
                    Once your item is perfectly crafted, we hand it over to our delivery partners. Delivery times will vary based on your location, but we always strive to get your creation to you as quickly as possible.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="refunds" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Refunds</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Because your product is custom-made just for you, we generally cannot accept returns or offer refunds once production has started.
                  </p>
                  <p>
                    However, we stand by our quality. If your item arrives defective, damaged, or entirely incorrect due to our mistake, please reach out! We make exceptions for these issues and will work to make it right.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="limitations" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Limitations</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Monitors and screens show colors differently. While we use high-end printing technology, the final physical colors may vary slightly from what you see on your digital screen.
                  </p>
                  <p>
                    The final print quality also heavily depends on the resolution and quality of the design you upload. Better inputs equal better outputs!
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="account-responsibility" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Account Responsibility</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Your account is your creative hub. You are responsible for any activity that happens under your account and for keeping your login details secure.
                  </p>
                  <p>
                    To keep the platform safe for everyone, we reserve the right to restrict or terminate accounts that repeatedly violate these terms or misuse the service.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="updates" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Updates</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    As we grow and add new features, these terms may occasionally be updated.
                  </p>
                  <p>
                    We'll do our best to notify you of major changes, but continuing to use the platform means you accept the updated rules.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="contact" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Contact Us</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    Have questions about these terms or anything else? We're here to help.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
