"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LifeBuoy, Package, CreditCard, Activity, AlertTriangle, ArrowRight } from "lucide-react";

const helpTopics = [
  { id: "tracking", label: "Order Tracking", icon: Package },
  { id: "payment", label: "Payment Help", icon: CreditCard },
  { id: "status", label: "Status Meaning", icon: Activity },
  { id: "issues", label: "Common Issues", icon: AlertTriangle },
];

export default function HelpPage() {
  const [activeTopic, setActiveTopic] = useState("tracking");

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#9DF542] selection:text-[#111] pb-20">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-24">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16 md:mb-24 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center justify-center px-5 py-1.5 rounded-full border border-green-100 bg-green-50/50 text-green-600 text-xs font-bold tracking-widest uppercase mb-8">
            / HELP CENTER
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-medium text-[#111] tracking-tight mb-6 leading-[1.1]">
            How can we help?
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
            Quick guidance for using the platform, from tracking your orders to understanding payments and resolving common issues.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-32">
          
          {/* Left Sidebar - Navigation */}
          <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {helpTopics.map((topic) => {
              const isActive = activeTopic === topic.id;
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic.id)}
                  className={`group flex items-center gap-3 text-left px-6 py-4 rounded-2xl whitespace-nowrap transition-all duration-300 ease-out font-medium text-[15px]
                    ${isActive 
                      ? 'bg-green-50 border border-green-100 text-green-700 shadow-sm' 
                      : 'text-gray-500 hover:text-[#111] hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  <Icon 
                    size={18} 
                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                  />
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Right Side - Content Area */}
          <div className="flex-1 max-w-3xl relative min-h-[400px]">
            
            {/* Order Tracking Content */}
            <div className={`transition-all duration-500 ease-out absolute inset-0 ${activeTopic === 'tracking' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 pointer-events-none -z-10'}`}>
              <div className="bg-[#f8f9fa] rounded-[2rem] p-8 md:p-12 border border-gray-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-[0.03] transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 ease-out pointer-events-none">
                  <Package size={240} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-medium text-[#111] mb-6">Track your order</h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8">
                    Once your order is placed, keeping an eye on its journey is simple. You have two main ways to check your status:
                  </p>
                  
                  <div className="grid gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4 items-start group/card cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover/card:bg-[#111] transition-colors duration-300">
                        <span className="font-bold text-gray-500 group-hover/card:text-white">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#111] text-[17px] mb-2">Account Dashboard</h4>
                        <p className="text-gray-500 text-[15px] leading-relaxed">Navigate to your profile and click on the <span className="text-[#111] font-medium">Orders</span> tab to see a real-time timeline of your item's progress.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4 items-start group/card cursor-default">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover/card:bg-[#111] transition-colors duration-300">
                        <span className="font-bold text-gray-500 group-hover/card:text-white">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-[#111] text-[17px] mb-2">Contact Support</h4>
                        <p className="text-gray-500 text-[15px] leading-relaxed">Reach out to our team via Telegram or WhatsApp with your unique <span className="text-[#111] font-medium">Order ID</span> for an immediate update.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Help Content */}
            <div className={`transition-all duration-500 ease-out absolute inset-0 ${activeTopic === 'payment' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 pointer-events-none -z-10'}`}>
              <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-2xl md:text-3xl font-medium text-[#111] mb-6">Completing your payment</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-10">
                  To ensure a smooth transaction, we support the most reliable local payment methods.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {['CBE', 'Telebirr', 'BOA'].map((bank, i) => (
                    <div key={bank} className="group flex flex-col items-center justify-center p-6 bg-[#f8f9fa] rounded-2xl border border-gray-100 hover:border-[#111] hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                      <span className="block font-bold text-[#111] text-lg mb-2 group-hover:-translate-y-1 transition-transform duration-300">{bank}</span>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{i === 1 ? 'Mobile Money' : 'Bank Transfer'}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#f0f4ea] text-[#2d3a1e] p-6 rounded-2xl border border-[#9DF542]/30 flex items-start gap-4 transform transition-transform hover:-translate-y-1 duration-300 shadow-sm">
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <LifeBuoy size={18} className="text-[#5b7a3a]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] mb-1">Important Step</h4>
                    <p className="text-[14px] leading-relaxed opacity-90">After transferring funds, upload or send a screenshot of the payment proof. Your order begins processing immediately upon verification.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Meaning Content */}
            <div className={`transition-all duration-500 ease-out absolute inset-0 ${activeTopic === 'status' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 pointer-events-none -z-10'}`}>
              <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-2xl md:text-3xl font-medium text-[#111] mb-8">Understanding your status</h2>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-200 before:to-transparent">
                  
                  {[
                    { title: "Pending", color: "bg-yellow-400", desc: "We have received your order request, but payment verification is still required before we can proceed." },
                    { title: "Verified", color: "bg-blue-400", desc: "Your payment has been successfully confirmed. The order is now queued for the print house." },
                    { title: "In Production", color: "bg-purple-500", desc: "Your custom product is currently being printed, quality-checked, and prepared." },
                    { title: "Shipped", color: "bg-[#9DF542]", desc: "Your order is complete and is on its way to your delivery address!" }
                  ].map((status, i) => (
                    <div key={status.title} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#f8f9fa] p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <h4 className="font-bold text-[#111] mb-1">{status.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{status.desc}</p>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* Common Issues Content */}
            <div className={`transition-all duration-500 ease-out absolute inset-0 ${activeTopic === 'issues' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 pointer-events-none -z-10'}`}>
              <div className="bg-[#fff5f5] rounded-[2rem] p-8 md:p-12 border border-red-100 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 ease-out pointer-events-none text-red-500">
                  <AlertTriangle size={240} />
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-medium text-[#111] mb-6">Troubleshooting common issues</h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-10">
                    Run into a snag? Here's how to resolve the most frequent hiccups smoothly.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default hover:-translate-y-1 transform">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
                        <AlertTriangle size={14} />
                      </div>
                      <h4 className="font-bold text-[#111] text-[16px] mb-2">Payment Not Confirmed</h4>
                      <p className="text-[14px] text-gray-500 leading-relaxed">Ensure your payment screenshot is clear and includes the transaction reference number so our team can verify it.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default hover:-translate-y-1 transform">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
                        <AlertTriangle size={14} />
                      </div>
                      <h4 className="font-bold text-[#111] text-[16px] mb-2">Delay in Production</h4>
                      <p className="text-[14px] text-gray-500 leading-relaxed">Delays usually occur during peak holiday seasons or due to temporary material shortages at specific print houses.</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-red-50 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default hover:-translate-y-1 transform sm:col-span-2">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500">
                          <AlertTriangle size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#111] text-[16px] mb-1">Incorrect Design Format</h4>
                          <p className="text-[14px] text-gray-500 leading-relaxed">Always check your file formats and resolution. Low-quality or incorrectly sized images may be flagged by our prepress team to ensure your final product looks perfect.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
        </div>
        
        {/* Support CTA at bottom */}
        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
          <p className="text-gray-500 text-[15px] mb-4">Still need assistance?</p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111] text-white rounded-full font-bold hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Contact our support team
            <ArrowRight size={16} />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
