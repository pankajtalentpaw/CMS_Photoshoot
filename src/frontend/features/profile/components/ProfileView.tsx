"use client";

import React, { useState, useRef } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";
import BottomNav from "@/frontend/components/BottomNav";
import ProtectedRoute from "@/frontend/components/ProtectedRoute";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  Map,
  FileText,
  Edit2,
  Wallet,
  LogOut,
  FolderKanban,
  Check,
  Disc,
  X,
  Download,
  Ticket,
  ShieldCheck,
  RefreshCw,
  ArrowDown,
  ArrowUp
} from "lucide-react";

function ProfilePageContent() {
  const router = useRouter();
  const { user, userProfile, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const creditPacks = [
    { title: "3000 Credits", tier: "TIER 1", price: 405, oldPrice: null, tag: null },
    { title: "6000 Credits", tier: "TIER 2", price: 770, oldPrice: 810, tag: "5% OFF" },
    { title: "10000 Credits", tier: "TIER 3", price: 1215, oldPrice: 1350, tag: "10% OFF" }
  ];

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "OFF10") {
      setDiscountAmount(10);
    } else {
      setDiscountAmount(0);
    }
  };

  const selectedPack = creditPacks[selectedPackIndex];
  const finalPrice = selectedPack.price - discountAmount;

  // null means no custom image — show initials instead
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Real user data — fetched from MongoDB profile via AuthContext
  const userData = {
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    email: userProfile?.email || user?.email || "",
    phone: userProfile?.phoneNumber || "",
    workingStatus: userProfile?.workStatus || "",
    companyName: userProfile?.organizationName || "",
    state: userProfile?.state || "",
    city: userProfile?.city || "",
  };

  // Editable form state — synced from userData whenever userProfile loads
  const [editData, setEditData] = React.useState(userData);
  
  // Derive initials from first + last name (from current form state)
  const initials = [
    (editData.firstName?.[0] ?? "").toUpperCase(),
    (editData.lastName?.[0] ?? "").toUpperCase(),
  ]
    .filter(Boolean)
    .join("") || "?";

  React.useEffect(() => {
    setEditData({
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: userProfile?.email || user?.email || "",
      phone: userProfile?.phoneNumber || "",
      workingStatus: userProfile?.workStatus || "",
      companyName: userProfile?.organizationName || "",
      state: userProfile?.state || "",
      city: userProfile?.city || "",
    });
  }, [userProfile, user]);

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    const result = await updateProfile({
      firstName: editData.firstName,
      lastName: editData.lastName,
      email: editData.email,
      phoneNumber: editData.phone,
      workStatus: editData.workingStatus,
      organizationName: editData.companyName,
      state: editData.state,
      city: editData.city,
    });
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      setSaveError(result.error ?? "Failed to save. Try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white selection:bg-[#7C4DFF]/30 flex flex-col lg:flex-row pb-20 lg:pb-0 font-inter overflow-hidden">
      
      {/* Ambient Dashboard Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7C4DFF]/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-[#A52FFF]/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* MOBILE HEADER */}
      <div className="lg:hidden relative z-20">
        <FlowHeader title="Dashboard" />
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-[280px] flex-col border-r border-white/5 bg-[#0D0D0E]/60 backdrop-blur-2xl p-6 gap-8 relative z-10 shrink-0">
        
        {/* Logos/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C4DFF] to-[#A52FFF] flex items-center justify-center shadow-[0_0_15px_rgba(124,77,255,0.4)]">
             <Disc className="w-5 h-5 text-white" />
          </div>
          <span className="font-manrope font-bold text-lg tracking-tight">Digital Atelier</span>
        </div>

        {/* Credits Widget */}
        <div className="w-full bg-[#121212]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white/50" />
              <span className="text-white/80 font-semibold text-sm">Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#34A853] shadow-[0_0_8px_#34A853]" />
              <span className="text-[#34A853] text-[10px] font-bold tracking-widest uppercase">Active</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end pt-2">
            <div className="flex flex-col text-center border-r border-white/10 pr-4">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Gifted</span>
              <span className="text-white font-ubuntu font-bold text-lg leading-none">0</span>
            </div>
            <div className="flex flex-col text-center border-r border-white/10 px-4">
               <span className="text-[#A52FFF] text-[10px] font-bold uppercase tracking-wider mb-1">Paid</span>
               <span className="text-[#A52FFF] font-ubuntu font-bold text-lg leading-none">250</span>
            </div>
            <div className="flex flex-col text-center pl-4">
               <span className="text-white text-[10px] font-bold uppercase tracking-wider mb-1">Total</span>
               <span className="text-white font-ubuntu font-bold text-lg leading-none">250</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-3">
          <div 
            onClick={() => setActiveTab('profile')}
            className={`h-[48px] w-full rounded-[14px] flex items-center px-5 gap-3 cursor-pointer transition-transform active:scale-[0.98] ${
              activeTab === 'profile' 
                ? 'bg-[#CB87FF] text-black shadow-[0_0_20px_rgba(203,135,255,0.2)] font-semibold' 
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}>
            <User className="w-5 h-5" />
            <span>Profile</span>
          </div>
           <div className="h-[48px] w-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 rounded-[14px] flex items-center px-5 gap-3 cursor-pointer transition-all active:scale-[0.98]">
            <FolderKanban className="w-5 h-5" />
            <span>AI Labs</span>
          </div>
          <div 
            onClick={() => setActiveTab('wallet')}
            className={`h-[48px] w-full rounded-[14px] flex items-center px-5 gap-3 cursor-pointer transition-transform active:scale-[0.98] ${
              activeTab === 'wallet' 
                ? 'bg-[#CB87FF] text-black shadow-[0_0_20px_rgba(203,135,255,0.2)] font-semibold' 
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}>
            <Wallet className="w-5 h-5" />
            <span>Wallet</span>
          </div>
        </nav>

        {/* Logout */}
        <div className="mt-auto">
           <div onClick={handleLogout} className="h-[48px] w-full bg-[#CF4141]/20 border border-[#CF4141]/30 text-[#CF4141] hover:bg-[#CF4141]/30 rounded-[14px] flex items-center px-5 gap-3 cursor-pointer transition-all active:scale-[0.98]">
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative z-10 lg:h-screen lg:overflow-y-auto custom-scrollbar">
        {activeTab === 'profile' && (
          <div className="p-6 pt-[120px] lg:pt-12 lg:px-12 xl:px-16 w-full max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* Header & Edit Button */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-ubuntu font-bold text-white mb-2 tracking-tight">Profile</h1>
              <p className="text-white/50 text-sm">Your enrollment details and personal info</p>
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {isEditing && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    onClick={() => { setIsEditing(false); setEditData({ firstName: userProfile?.firstName || "", lastName: userProfile?.lastName || "", email: userProfile?.email || user?.email || "", phone: userProfile?.phoneNumber || "", workingStatus: userProfile?.workStatus || "", companyName: userProfile?.organizationName || "", state: userProfile?.state || "", city: userProfile?.city || "" }); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border bg-white/5 border-white/20 text-white hover:bg-[#CF4141]/20 hover:border-[#CF4141]/50 hover:text-[#CF4141] transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span className="font-semibold text-sm">Cancel</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-[#34A853]/20 border-[#34A853]/50 text-[#34A853] hover:bg-[#34A853]/30'
                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-[#34A853] border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : isEditing ? (
                  <><Check className="w-4 h-4" /><span className="font-semibold text-sm">Save</span></>
                ) : (
                  <><Edit2 className="w-4 h-4" /><span className="font-semibold text-sm">Edit</span></>
                )}
              </button>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-4">
            
            {/* Avatar Column */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center lg:justify-start lg:w-[250px] shrink-0"
            >
              <div className="relative w-[180px] h-[180px] lg:w-[220px] lg:h-[220px] rounded-full border-4 border-[#CB87FF]/50 p-1.5 shadow-[0_0_30px_rgba(203,135,255,0.2)]">

                {/* Avatar: custom image OR initials */}
                <div className="w-full h-full rounded-full relative overflow-hidden bg-gradient-to-br from-[#7C4DFF] to-[#A52FFF] flex items-center justify-center">
                  {avatar ? (
                    <Image src={avatar} alt="User Avatar" fill className="object-cover" />
                  ) : (
                    <span className="text-white font-ubuntu font-bold text-5xl select-none">{initials}</span>
                  )}
                </div>

                {/* Upload / Remove — only visible when editing */}
                {isEditing && (
                  <>
                    {/* Camera button to upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-[#A52FFF] rounded-full border-4 border-[#0A0A0B] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                      title="Upload photo"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </div>
                    {/* Remove button — only show if custom image is set */}
                    {avatar && (
                      <div
                        onClick={handleRemoveAvatar}
                        className="absolute top-2 right-2 w-8 h-8 bg-[#CF4141] rounded-full border-4 border-[#0A0A0B] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </motion.div>

            {/* Information Cards Column */}
            <div className="flex-1 flex flex-col gap-6">
              
              {saveError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm font-medium">
                  {saveError}
                </div>
              )}

              {/* Personal Information */}
              <motion.section
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-[#121212]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-4 h-4 text-[#A52FFF]" />
                  <h3 className="text-[#A52FFF] font-bold text-[13px] tracking-wider uppercase">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="First Name" icon={User} value={editData.firstName} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, firstName: v}))} />
                  <InputField label="Last Name" icon={User} value={editData.lastName} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, lastName: v}))} />
                  <InputField label="Email Address" icon={Mail} value={editData.email} isEditing={isEditing} type="email" onChange={(v: string) => setEditData(p => ({...p, email: v}))} />
                  <InputField label="Phone Number" icon={Phone} value={editData.phone} isEditing={isEditing} type="tel" onChange={(v: string) => setEditData(p => ({...p, phone: v}))} />
                </div>
              </motion.section>

              {/* Career & Status */}
              <motion.section
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-[#121212]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-4 h-4 text-[#23A1FF]" />
                  <h3 className="text-[#23A1FF] font-bold text-[13px] tracking-wider uppercase">Career & Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Working Status" icon={Briefcase} value={editData.workingStatus} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, workingStatus: v}))} />
                  <InputField label="Company Name" icon={Building2} value={editData.companyName} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, companyName: v}))} />
                </div>
              </motion.section>

              {/* Location Details */}
              <motion.section
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="bg-[#121212]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-4 h-4 text-[#34A853]" />
                  <h3 className="text-[#34A853] font-bold text-[13px] tracking-wider uppercase">Location Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="State / Region" icon={Map} value={editData.state} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, state: v}))} />
                  <InputField label="City" icon={MapPin} value={editData.city} isEditing={isEditing} onChange={(v: string) => setEditData(p => ({...p, city: v}))} />
                </div>
              </motion.section>

              {/* View Receipt Button */}
              <motion.button 
                onClick={() => setIsReceiptOpen(true)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="w-full h-14 bg-white/5 border border-white/10 hover:border-[#A52FFF]/50 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer group shadow-lg"
              >
                <span className="font-semibold text-white group-hover:text-[#CB87FF] transition-colors">View Receipt</span>
                <FileText className="w-5 h-5 text-[#CB87FF]" />
              </motion.button>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'wallet' && (
          <WalletView setIsBuyCreditsOpen={setIsBuyCreditsOpen} />
        )}
      </main>

      {/* RECEIPT MODAL */}
      <AnimatePresence>
        {isReceiptOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-0"
            onClick={() => setIsReceiptOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[500px] bg-[#121212] border border-white/10 rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Glowing Right Border Indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#A52FFF] rounded-r-[20px] shadow-[-5px_0_20px_rgba(165,47,255,0.4)]" />
              
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white font-ubuntu">Payment Receipt</h2>
                  <p className="text-white/40 text-sm mt-1 font-medium">Transaction ID: TXN-ab7237</p>
                </div>
                <button 
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 pt-2 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-8">
                
                {/* User Details */}
                <ReceiptRow label="Name" value="GADU SAIHARSHA" bold />
                <ReceiptRow label="Email" value="saiharshagadu@gmail.com" bold />
                <ReceiptRow label="Phone" value="8374939447" bold />
                <ReceiptRow label="Organization" value="Aditya" bold />
                <ReceiptRow label="Working Status" value="Student" bold />
                <ReceiptRow label="City" value="Mandapeta" bold />
                <ReceiptRow label="State" value="Andhra Pradesh" bold />
                <ReceiptRow label="Company" value="-" bold />

                <div className="h-px w-full bg-white/10 my-3" />

                {/* Financial Details */}
                <ReceiptRow label="Base Platform Fee" value="₹5898.82" bold />
                <ReceiptRow label="Coupon Applied" value="AIFORALL25" bold />
                <ReceiptRow label="Discount" value="₹2499" bold />
                <ReceiptRow label="Discounted Fee" value="₹4999" bold />
                <ReceiptRow label="Tax" value="₹899.82" bold />

                <div className="h-px w-full bg-white/10 my-3" />

                {/* Total */}
                <div className="flex justify-between items-center py-2 mb-2">
                  <span className="text-white text-[19px] font-ubuntu font-bold">Total Paid</span>
                  <span className="text-[#34A853] text-[19px] font-ubuntu font-bold">₹5898.82</span>
                </div>

                <div className="h-px w-full bg-white/10 mb-3" />

                {/* Meta */}
                <ReceiptRow label="Status" value="PAYMENT_SUCCESS" bold />
                <ReceiptRow label="Updated At" value="13/11/2025, 10:52:39" bold />

              </div>

              {/* Actions Footer */}
              <div className="p-4 px-6 pr-8 bg-[#0A0A0B]/50 flex justify-end gap-3 mt-auto border-t border-white/5">
                <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                  <span>Download PDF</span>
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsReceiptOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#A52FFF] text-white font-semibold text-sm hover:bg-[#A52FFF]/80 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BUY CREDITS MODAL */}
      <AnimatePresence>
        {isBuyCreditsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 lg:p-0"
            onClick={() => setIsBuyCreditsOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[850px] bg-[#1A1A1A] border border-white/5 rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold font-ubuntu text-[#CB87FF]">Buy Credits</h2>
                  <p className="text-white/60 text-sm mt-1">Choose a credit pack to continue generating content.</p>
                </div>
                <button 
                  onClick={() => setIsBuyCreditsOpen(false)}
                  className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Layout Content */}
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Left Col: Packages */}
                <div className="flex-1 flex flex-col gap-4">
                  {creditPacks.map((pack, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedPackIndex(index)}
                      className={`relative flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${
                        selectedPackIndex === index 
                          ? 'border-[#CB87FF] bg-[#CB87FF]/5 shadow-[0_0_20px_rgba(203,135,255,0.15)]' 
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {/* Left: Radio & Title */}
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedPackIndex === index ? 'border-[#34A853]' : 'border-white/30'
                        }`}>
                          {selectedPackIndex === index && <div className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold font-ubuntu text-[17px] text-white">{pack.title}</span>
                          <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase">{pack.tier}</span>
                        </div>
                      </div>

                      {/* Right: Price & Tags */}
                      <div className="flex flex-col items-end gap-1">
                         <div className="flex items-center gap-2">
                           {pack.tag && (
                             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CF4141]/20 text-[#CF4141]">{pack.tag}</span>
                           )}
                           {pack.oldPrice && (
                             <span className="text-[13px] text-white/40 line-through">₹{pack.oldPrice}</span>
                           )}
                         </div>
                         <span className="font-ubuntu font-bold text-[22px] text-[#34A853]">₹{pack.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Col: Summary & Payment */}
                <div className="w-full md:w-[380px] flex flex-col gap-6">
                  
                  {/* Coupon Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-white" />
                      <span className="font-bold text-[15px] text-white">Apply Coupon</span>
                    </div>
                    <div className="flex h-12">
                      <input 
                        type="text"
                        placeholder="HAVE A COUPON?"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-full flex-1 bg-black/50 border border-white/5 border-r-0 rounded-l-lg px-4 text-sm outline-none text-white focus:border-[#CB87FF]/50"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="h-full px-6 bg-white/5 border border-white/5 rounded-r-lg text-white/50 text-[11px] font-bold tracking-wider hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        APPLY
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                    <Wallet className="absolute -right-5 -top-5 w-32 h-32 text-white/[0.02] rotate-12 pointer-events-none" />
                    
                    <span className="text-[10px] font-bold text-white/50 tracking-wider uppercase mb-4 block">Payment Summary</span>
                    
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[14px] text-white/80">Pack Price</span>
                      <span className="text-[15px] font-bold font-ubuntu text-white">₹{selectedPack.price}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                       <div className="flex justify-between items-center mb-3">
                         <span className="text-[14px] text-[#34A853]">Discount</span>
                         <span className="text-[15px] font-bold font-ubuntu text-[#34A853]">-₹{discountAmount}</span>
                       </div>
                    )}

                    <div className="h-px w-full bg-white/10 mb-4" />

                    <div className="flex justify-between items-center">
                      <span className="text-[18px] font-bold text-white">Total</span>
                      <span className="text-[26px] font-bold font-ubuntu text-[#34A853]">₹{finalPrice}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex flex-col gap-3">
                    <button className="w-full h-14 bg-[#05A660] hover:bg-[#049154] text-white rounded-lg font-bold text-[16px] transition-colors shadow-[0_0_20px_rgba(5,166,96,0.3)] cursor-pointer">
                      Proceed to Secure Payment
                    </button>
                    <div className="flex items-center justify-center gap-2 opacity-40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[9px] uppercase tracking-wider font-bold">Secure 256-BIT SSL ENCRYPTED PAYMENT</span>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

// Helper Component for Receipt Rows
const ReceiptRow = ({ label, value, bold = false }: { label: string, value: string, bold?: boolean }) => (
  <div className="flex justify-between items-center py-[7px]">
    <span className="text-white/50 text-[13.5px] font-medium">{label}</span>
    <span className={`text-white text-[13.5px] ${bold ? 'font-bold' : 'font-medium'}`}>{value}</span>
  </div>
);

// Reusable Controlled Input Component
const InputField = ({ label, icon: Icon, value, isEditing, type = "text", onChange }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-extrabold text-white/50 uppercase tracking-[0.08em] pl-1">{label}</label>
      <div className={`flex items-center gap-3 bg-white/[0.05] border rounded-[5px] p-[12px_14px] transition-all duration-300 ${
        isEditing
          ? 'border-[#A52FFF] shadow-[0_0_15px_rgba(165,47,255,0.25)]'
          : 'border-white/10'
      }`}>
        <Icon className={`w-4 h-4 ${isEditing ? 'text-[#A52FFF]' : 'text-white/30'}`} />
        <input
          type={type}
          value={value}
          readOnly={!isEditing}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={isEditing ? `Enter ${label}` : ""}
          className={`w-full bg-transparent border-none outline-none text-[15px] font-ubuntu ${
            isEditing ? 'text-white' : 'text-white/80'
          }`}
        />
      </div>
    </div>
  );
};

// Wallet Ledger View Component
const WalletView = ({ setIsBuyCreditsOpen }: { setIsBuyCreditsOpen: any }) => {
  const ledgerData = [
    { date: "Today", time: "12:00 AM", type: "DEBIT", source: "Weekly", amount: "0", note: "Weekly Reset (Fresh Allowance)" },
    { date: "Feb 10, 2024", time: "12:00 AM", type: "DEBIT", source: "Weekly", amount: "-8500", note: "Weekly Unused Expiry" },
    { date: "Dec 15, 2023", time: "05:25 AM", type: "CREDIT", source: "Weekly", amount: "+8500", note: "Weekly credits credited" },
    { date: "Dec 11, 2023", time: "09:56 AM", type: "DEBIT", source: "Weekly", amount: "-17000", note: "Unused Weekly credits returned" },
    { date: "Dec 11, 2023", time: "09:56 AM", type: "CREDIT", source: "Weekly", amount: "+8500", note: "Weekly credits credited" },
    { date: "Dec 11, 2023", time: "02:18 AM", type: "CREDIT", source: "Weekly", amount: "+8000", note: "Weekly reset (overwrite)" },
    { date: "Dec 8, 2023", time: "07:44 AM", type: "DEBIT", source: "Spend", amount: "-500", note: "Auto deduction on submit" },
    { date: "Dec 5, 2023", time: "05:32 AM", type: "DEBIT", source: "ADMIN", amount: "-5000", note: "using a lot of credits" },
    { date: "Dec 4, 2023", time: "01:28 PM", type: "CREDIT", source: "Purchase", amount: "+1000", note: "Purchase First Time" },
    { date: "Dec 3, 2023", time: "05:00 PM", type: "CREDIT", source: "ADMIN", amount: "+100", note: "-" },
  ];

  return (
    <div className="p-6 pt-[120px] lg:pt-12 lg:px-12 xl:px-16 w-full max-w-6xl mx-auto flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl lg:text-4xl font-ubuntu font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#CB87FF]" />
            Wallet
          </h1>
          <div className="flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 bg-[#1A1A1A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] shadow-[0_0_8px_#34A853]" />
            <span className="text-[#34A853] text-[9.5px] font-bold uppercase tracking-widest">Active</span>
          </div>
          <RefreshCw className="w-5 h-5 text-white/40 cursor-pointer hover:text-white transition-colors" />
        </div>
        <button 
          onClick={() => setIsBuyCreditsOpen(true)}
          className="bg-[#05A660] hover:bg-[#049154] text-white font-bold px-5 py-2.5 rounded-lg text-[15px] flex items-center gap-2 shadow-[0_0_15px_rgba(5,166,96,0.3)] transition-colors w-fit tracking-wide cursor-pointer"
        >
          + Buy Credits
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#2A1B38]/60 border border-[#CB87FF]/20 rounded-xl p-5 shadow-lg">
          <span className="text-[#CB87FF] text-[11px] font-bold uppercase tracking-wider block mb-2">Gifted Credits</span>
          <span className="text-white text-3xl font-ubuntu font-bold">0</span>
        </div>
        <div className="bg-[#1A3022]/80 border border-[#34A853]/20 rounded-xl p-5 shadow-lg">
          <span className="text-[#34A853] text-[11px] font-bold uppercase tracking-wider block mb-2">Paid Credits</span>
          <span className="text-[#34A853] text-3xl font-ubuntu font-bold">250</span>
        </div>
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-5 shadow-lg">
          <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider block mb-2">Total Balance</span>
          <span className="text-white text-3xl font-ubuntu font-bold">250</span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {['ALL', 'PURCHASE', 'SPEND', 'ADMIN', 'WEEKLY'].map((filter, i) => (
          <div 
            key={filter} 
            className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider cursor-pointer transition-colors ${
              i === 0 
                ? 'bg-[#CB87FF] text-black shadow-[0_0_10px_rgba(203,135,255,0.3)]' 
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            {filter}
          </div>
        ))}
      </div>

      {/* Transaction Ledger Table */}
      <div className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
           <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
               <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 font-bold bg-white/5">
                 <th className="p-5 font-bold">Date</th>
                 <th className="p-5 font-bold">Type</th>
                 <th className="p-5 font-bold">Source</th>
                 <th className="p-5 font-bold">Amount</th>
                 <th className="p-5 font-bold">Note</th>
               </tr>
             </thead>
             <tbody>
               {ledgerData.map((row, i) => {
                  const isCredit = row.type === "CREDIT";
                  const isZero = row.amount === "0";
                  const amountColor = isCredit ? 'text-[#34A853]' : isZero ? 'text-[#CF4141]' : 'text-[#CF4141]';

                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-[14px] text-white">{row.date}</span>
                          <span className="text-[11px] text-white/40">{row.time}</span>
                        </div>
                      </td>
                      <td className="p-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCredit ? 'bg-[#34A853]/20' : 'bg-[#CF4141]/20'}`}>
                            {isCredit ? <ArrowUp className="w-3 h-3 text-[#34A853]" /> : <ArrowDown className="w-3 h-3 text-[#CF4141]" />}
                          </div>
                          <span className={`text-[12px] font-bold ${isCredit ? 'text-[#34A853]' : 'text-[#CF4141]'}`}>{row.type}</span>
                        </div>
                      </td>
                      <td className="p-4 px-5">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-bold ${
                          row.source === 'ADMIN' ? 'bg-[#CB87FF]/20 text-[#CB87FF]' : 'text-white/60 bg-white/5'
                        }`}>
                          {row.source}
                        </span>
                      </td>
                      <td className="p-4 px-5">
                        <span className={`font-ubuntu font-bold text-[16px] ${amountColor}`}>
                          {row.amount}
                        </span>
                      </td>
                      <td className="p-4 px-5">
                        <span className="text-[13px] text-white/50">{row.note}</span>
                      </td>
                    </tr>
                  );
               })}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};
