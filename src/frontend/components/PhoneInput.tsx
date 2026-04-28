"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

interface Country {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

const countries: Country[] = [
  { name: "India", code: "+91", flag: "https://flagcdn.com/w40/in.png", iso: "in" },
  { name: "USA", code: "+1", flag: "https://flagcdn.com/w40/us.png", iso: "us" },
  { name: "UK", code: "+44", flag: "https://flagcdn.com/w40/gb.png", iso: "gb" },
  { name: "Australia", code: "+61", flag: "https://flagcdn.com/w40/au.png", iso: "au" },
  { name: "Canada", code: "+1", flag: "https://flagcdn.com/w40/ca.png", iso: "ca" },
  { name: "UAE", code: "+971", flag: "https://flagcdn.com/w40/ae.png", iso: "ae" },
  { name: "Germany", code: "+49", flag: "https://flagcdn.com/w40/de.png", iso: "de" },
  { name: "France", code: "+33", flag: "https://flagcdn.com/w40/fr.png", iso: "fr" },
  { name: "Singapore", code: "+65", flag: "https://flagcdn.com/w40/sg.png", iso: "sg" },
  { name: "Japan", code: "+81", flag: "https://flagcdn.com/w40/jp.png", iso: "jp" },
  { name: "China", code: "+86", flag: "https://flagcdn.com/w40/cn.png", iso: "cn" },
  { name: "Brazil", code: "+55", flag: "https://flagcdn.com/w40/br.png", iso: "br" },
  { name: "Russia", code: "+7", flag: "https://flagcdn.com/w40/ru.png", iso: "ru" },
  { name: "South Africa", code: "+27", flag: "https://flagcdn.com/w40/za.png", iso: "za" },
  { name: "Mexico", code: "+52", flag: "https://flagcdn.com/w40/mx.png", iso: "mx" },
  { name: "Italy", code: "+39", flag: "https://flagcdn.com/w40/it.png", iso: "it" },
  { name: "Spain", code: "+34", flag: "https://flagcdn.com/w40/es.png", iso: "es" },
  { name: "Netherlands", code: "+31", flag: "https://flagcdn.com/w40/nl.png", iso: "nl" },
  { name: "Switzerland", code: "+41", flag: "https://flagcdn.com/w40/ch.png", iso: "ch" },
  { name: "Sweden", code: "+46", flag: "https://flagcdn.com/w40/se.png", iso: "se" },
  { name: "Norway", code: "+47", flag: "https://flagcdn.com/w40/no.png", iso: "no" },
  { name: "Denmark", code: "+45", flag: "https://flagcdn.com/w40/dk.png", iso: "dk" },
  { name: "Finland", code: "+358", flag: "https://flagcdn.com/w40/fi.png", iso: "fi" },
  { name: "New Zealand", code: "+64", flag: "https://flagcdn.com/w40/nz.png", iso: "nz" },
  { name: "Ireland", code: "+353", flag: "https://flagcdn.com/w40/ie.png", iso: "ie" },
  { name: "Saudi Arabia", code: "+966", flag: "https://flagcdn.com/w40/sa.png", iso: "sa" },
  { name: "Israel", code: "+972", flag: "https://flagcdn.com/w40/il.png", iso: "il" },
  { name: "Turkey", code: "+90", flag: "https://flagcdn.com/w40/tr.png", iso: "tr" },
  { name: "Indonesia", code: "+62", flag: "https://flagcdn.com/w40/id.png", iso: "id" },
  { name: "Malaysia", code: "+60", flag: "https://flagcdn.com/w40/my.png", iso: "my" },
  { name: "Thailand", code: "+66", flag: "https://flagcdn.com/w40/th.png", iso: "th" },
  { name: "Philippines", code: "+63", flag: "https://flagcdn.com/w40/ph.png", iso: "ph" },
  { name: "Vietnam", code: "+84", flag: "https://flagcdn.com/w40/vn.png", iso: "vn" },
  { name: "South Korea", code: "+82", flag: "https://flagcdn.com/w40/kr.png", iso: "kr" },
  { name: "Portugal", code: "+351", flag: "https://flagcdn.com/w40/pt.png", iso: "pt" },
  { name: "Greece", code: "+30", flag: "https://flagcdn.com/w40/gr.png", iso: "gr" },
  { name: "Poland", code: "+48", flag: "https://flagcdn.com/w40/pl.png", iso: "pl" },
  { name: "Belgium", code: "+32", flag: "https://flagcdn.com/w40/be.png", iso: "be" },
  { name: "Austria", code: "+43", flag: "https://flagcdn.com/w40/at.png", iso: "at" },
  { name: "Argentina", code: "+54", flag: "https://flagcdn.com/w40/ar.png", iso: "ar" },
  { name: "Chile", code: "+56", flag: "https://flagcdn.com/w40/cl.png", iso: "cl" },
  { name: "Colombia", code: "+57", flag: "https://flagcdn.com/w40/co.png", iso: "co" },
  { name: "Peru", code: "+51", flag: "https://flagcdn.com/w40/pe.png", iso: "pe" },
  { name: "Egypt", code: "+20", flag: "https://flagcdn.com/w40/eg.png", iso: "eg" },
  { name: "Nigeria", code: "+234", flag: "https://flagcdn.com/w40/ng.png", iso: "ng" },
  { name: "Qatar", code: "+974", flag: "https://flagcdn.com/w40/qa.png", iso: "qa" },
  { name: "Kuwait", code: "+965", flag: "https://flagcdn.com/w40/kw.png", iso: "kw" },
  { name: "Oman", code: "+968", flag: "https://flagcdn.com/w40/om.png", iso: "om" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  name: string;
  error?: string;
  touched?: boolean;
}

const PhoneInput = ({ value, onChange, onBlur, name, error, touched }: PhoneInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtered country list
  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search on close
  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  const hasError = touched && error;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        `}</style>

        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 bg-white/10 border rounded-lg h-[48px] px-3 transition-all duration-300 min-w-[105px] group ${
              isOpen ? 'border-[#A52FFF] shadow-[0_0_15px_rgba(165,47,255,0.25)] bg-white/15' : 'border-white/20 hover:bg-white/20'
            }`}
          >
            <img 
              src={selectedCountry.flag} 
              alt={selectedCountry.name} 
              className="w-5 h-auto rounded-sm object-cover"
            />
            <span className="text-white text-[15px] font-medium">{selectedCountry.code}</span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 top-[56px] w-[260px] bg-[#121212] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden backdrop-blur-2xl"
              >
                {/* Sticky Search Bar */}
                <div className="sticky top-0 p-3 bg-[#121212]/80 backdrop-blur-md border-b border-white/5">
                  <div className="relative flex items-center bg-white/[0.07] border border-white/10 rounded-lg px-3 py-1.5 group focus-within:border-[#7C4DFF]/50 transition-all">
                    <Search className="w-3.5 h-3.5 text-white/30 group-focus-within:text-[#7C4DFF]" />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white text-[13px] ml-2 placeholder:text-white/20"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Scrollable List */}
                <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.iso}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                          selectedCountry.iso === country.iso 
                            ? 'bg-[#7C4DFF]/20 text-white shadow-inner' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <img src={country.flag} alt="" className="w-5 h-auto rounded-sm shadow-sm" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[14px] font-medium truncate">{country.name}</p>
                          <p className="text-[11px] opacity-40 uppercase tracking-tighter">{country.iso} ({country.code})</p>
                        </div>
                        {selectedCountry.iso === country.iso && (
                          <div className="w-1.5 h-1.5 bg-[#A52FFF] rounded-full shadow-[0_0_8px_#A52FFF]" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-10 text-center flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-white/10" />
                      <p className="text-white/40 text-xs">No countries found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Number Input */}
        <div className={`flex-1 bg-white/[0.05] border rounded-lg h-[48px] px-4 flex items-center group transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(165,47,255,0.25)] focus-within:bg-white/[0.08] ${
          hasError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/20 focus-within:border-[#A52FFF]'
        }`}>
          <input
            type="tel"
            name={name}
            placeholder="Phone Number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className="w-full bg-transparent border-none outline-none text-white text-[15px] placeholder:text-white/40"
          />
        </div>
      </div>
      {hasError && (
        <p className="text-red-500 text-[12px] mt-1 ml-1">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
