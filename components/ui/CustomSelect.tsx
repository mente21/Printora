"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-left outline-none flex items-center justify-between hover:border-[#A1FF4D] focus:ring-4 focus:ring-[#A1FF4D]/10 transition-all active:scale-[0.99]"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#1B2412]' : ''}`} size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[500] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
          <div className="max-h-60 overflow-y-auto scrollbar-hide p-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-3.5 text-left text-[13px] font-black rounded-2xl transition-all ${
                  value === option 
                    ? 'bg-[#A1FF4D] text-[#1B2412] shadow-lg shadow-[#A1FF4D]/20 scale-[1.02]' 
                    : 'hover:bg-[#A1FF4D]/10 text-gray-600 hover:text-[#1B2412]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
