"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: (string | SelectOption)[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ value, options, onChange, placeholder, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to normalize options into SelectOption format
  const normalizedOptions: SelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search when opening
  useEffect(() => {
    if (isOpen) setSearchTerm("");
  }, [isOpen]);

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-left outline-none flex items-center justify-between hover:border-[#A1FF4D] focus:ring-4 focus:ring-[#A1FF4D]/10 transition-all active:scale-[0.99]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : (placeholder || "Select...")}</span>
        <ChevronDown className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#1B2412]' : ''}`} size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] z-[500] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ring-1 ring-black/5">
          
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#A1FF4D] outline-none"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto scrollbar-hide p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-3.5 text-left text-[13px] font-black rounded-2xl transition-all mb-1 last:mb-0 ${
                    value === option.value 
                      ? 'bg-[#A1FF4D] text-[#1B2412] shadow-lg shadow-[#A1FF4D]/20' 
                      : 'hover:bg-[#A1FF4D]/10 text-gray-600 hover:text-[#1B2412]'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs font-bold italic">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
