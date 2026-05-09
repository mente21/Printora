"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Info, Database, Activity, CreditCard, Share2, Shield, UserCheck, RefreshCcw, Mail } from "lucide-react";

const SECTIONS = [
  { id: "introduction", label: "Introduction", icon: Info },
  { id: "data-collection", label: "Data Collection", icon: Database },
  { id: "how-data-is-used", label: "How Data is Used", icon: Activity },
  { id: "payment-information", label: "Payment Information", icon: CreditCard },
  { id: "data-sharing", label: "Data Sharing", icon: Share2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "user-rights", label: "User Rights", icon: UserCheck },
  { id: "changes", label: "Changes", icon: RefreshCcw },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // If multiple are visible, pick the first one
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -80% 0px", // Trigger when section is near top
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
      const offset = 100; // Account for sticky header
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
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
              <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl">
                How we collect, use, and manage your information
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
                    At Stenvo, we are deeply committed to protecting your privacy. We believe your personal data belongs to you, and we only ask for what we genuinely need to make our platform work smoothly for you.
                  </p>
                  <p>
                    This policy explains what information we collect, how we use it, and how we keep it safe. No sneaky stuff, just a friendly promise to treat your data with respect.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="data-collection" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Data Collection</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    When you use our service, we collect basic information needed to serve you.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#9DF542]">
                    <li><strong className="text-gray-800 font-semibold">Information you provide:</strong> Name, contact details (email and phone number), and delivery addresses.</li>
                    <li><strong className="text-gray-800 font-semibold">Uploaded content:</strong> The designs you want to print and any files required to process your orders.</li>
                    <li><strong className="text-gray-800 font-semibold">Basic system data:</strong> Device type, browser information, and standard web logs to help us improve the platform.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="how-data-is-used" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">How Data is Used</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    We primarily use your information to get the job done—specifically, to process your custom orders and ensure they arrive exactly where they need to be.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-[#9DF542]">
                    <li><strong className="text-gray-800 font-semibold">Order processing:</strong> Fulfilling your print requests accurately and quickly.</li>
                    <li><strong className="text-gray-800 font-semibold">Communication:</strong> Sending order updates, tracking information, or reaching out if there is an issue.</li>
                    <li><strong className="text-gray-800 font-semibold">Service improvement:</strong> Analyzing usage patterns so we can make the platform even better for everyone.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="payment-information" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Payment Information</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    We take financial security seriously. We do not store sensitive banking data (like full credit card numbers) on our own servers.
                  </p>
                  <p>
                    If you upload payment proof (like a screenshot of a transfer), it is kept strictly confidential and is only reviewed manually by our team to verify and approve your specific order.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="data-sharing" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Data Sharing</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    We only share your information when it is absolutely necessary to fulfill your order. For example, we must share your name and address with our delivery service partners so your package reaches you.
                  </p>
                  <div className="bg-[#f0f9eb] border border-[#9DF542]/30 rounded-xl p-6 mt-6">
                    <p className="font-semibold text-[#111] m-0">
                      We will never sell, rent, or trade your personal information to third parties. Ever.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="security" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Security</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    We implement reasonable, modern security measures to protect your personal data and uploaded designs from unauthorized access, loss, or alteration.
                  </p>
                  <p>
                    While no system on the internet is 100% foolproof, we work hard to keep your digital space secure and private using standard encryption and secure infrastructure.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="user-rights" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">User Rights</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    You remain in control of your data. You have the right to request access to the information we hold about you, ask us to correct it if it's wrong, or request that we delete it entirely.
                  </p>
                  <p>
                    To exercise these rights, simply reach out to our support team. We will process your request promptly and transparently.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="changes" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Changes to Policy</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    As privacy laws change or as our platform evolves, we may occasionally update this Privacy Policy.
                  </p>
                  <p>
                    Any significant changes will be communicated clearly, so you'll always know exactly how your data is being handled. We encourage you to review this page periodically.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section id="contact" className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-[#111] mb-6">Contact Us</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg space-y-6">
                  <p>
                    If you have any questions or concerns about how we handle your privacy, please don't hesitate to reach out. We value your peace of mind.
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

