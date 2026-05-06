"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Mail, 
  Save, 
  Building,
  Globe,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    location: "",
    company_name: "",
    country: "",
  });
  
  const [profileId, setProfileId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("CUSTOMER");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, email, full_name, role, phone_number, location, company_name, country")
          .eq("id", session.user.id)
          .single();

        if (error) {
           setError("We couldn't load your profile. Please try refreshing.");
           throw error;
        }

        if (profile) {
          setProfileId(profile.id);
          setRole(profile.role || "CUSTOMER");
          setAvatarUrl(session.user.user_metadata?.avatar_url || null);
          setInitials((profile.full_name || session.user.email || 'U')[0].toUpperCase());
          setFormData({
            full_name: profile.full_name || "",
            email: profile.email || session.user.email || "",
            phone_number: profile.phone_number || "",
            location: profile.location || "",
            company_name: profile.company_name || "",
            country: profile.country || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      // Validate Ethiopian Phone Format
      if (formData.phone_number) {
        const phoneClean = formData.phone_number.replace(/\s/g, '');
        const phoneRegex = /^(09|07)\d{8}$/;
        if (!phoneRegex.test(phoneClean)) {
          throw new Error("Invalid phone format. Must start with 09 (Ethio Telecom) or 07 (Safaricom) and be 10 digits long.");
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          location: formData.location,
          company_name: formData.company_name,
          country: formData.country,
        })
        .eq("id", profileId);

      if (error) throw error;
      
      setSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile updates.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1FF4D]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center md:text-left">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#1B2412] transition-colors mb-4 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Go Back
          </button>
          <h1 className="text-4xl font-black text-[#1B2412] tracking-tight uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>Account Settings</h1>
          <p className="text-gray-500 mt-2 font-bold">Manage your personal information and contact details.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Banner area */}
        <div className="h-40 bg-[#1B2412] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#A1FF4D]/10 rounded-full blur-3xl -mr-32 -mt-32" />
        </div>
        
        {/* Profile Avatar - Moved outside overflow-hidden header and pushed up */}
        <div className="absolute top-20 left-10 w-28 h-28 bg-white rounded-3xl flex items-center justify-center border-8 border-white shadow-lg overflow-hidden z-10">
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[#1B2412]">
            {(avatarUrl && !imgError) ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-3xl font-black uppercase">{initials}</span>
            )}
          </div>
        </div>
        
        <div className="px-8 pt-16 pb-8">
           <form onSubmit={handleSaveProfile} className="space-y-8">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#A1FF4D] transition-colors">
                      <UserIcon size={20} />
                    </div>
                    <input 
                      type="text" 
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm text-[#111] font-black focus:outline-none focus:border-[#A1FF4D] focus:bg-white transition-all shadow-sm"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail size={20} />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-12 pr-5 py-4 bg-gray-100/50 border-2 border-transparent rounded-2xl text-sm text-gray-400 font-bold cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 ml-1">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#A1FF4D] transition-colors">
                      <Phone size={20} />
                    </div>
                    <input 
                      type="tel" 
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm text-[#111] font-black focus:outline-none focus:border-[#A1FF4D] focus:bg-white transition-all shadow-sm"
                      placeholder="09... or 07..."
                    />
                  </div>
                  <div className="flex justify-between px-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ethio Telecom (09) / Safaricom (07)</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">10 Digits</p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    {role === "SUPPLIER" ? "Facility Location" : "Shipping Address"}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#A1FF4D] transition-colors">
                      <MapPin size={20} />
                    </div>
                    <input 
                      type="text" 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm text-[#111] font-black focus:outline-none focus:border-[#A1FF4D] focus:bg-white transition-all shadow-sm"
                      placeholder="Addis Ababa, Ethiopia"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                    <Globe size={13} />
                    {role === "SUPPLIER" ? "Country of Origin" : "Your Country"}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#A1FF4D] transition-colors">
                      <Globe size={20} />
                    </div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm text-[#111] font-black focus:outline-none focus:border-[#A1FF4D] focus:bg-white transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select a country…</option>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  {role === "SUPPLIER" && (
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider ml-1">This auto-populates on all your product listings.</p>
                  )}
                </div>

                {/* Supplier Fields */}
                {role === "SUPPLIER" && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Company Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#A1FF4D] transition-colors">
                        <Building size={20} />
                      </div>
                      <input 
                        type="text" 
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-sm text-[#111] font-black focus:outline-none focus:border-[#A1FF4D] focus:bg-white transition-all shadow-sm"
                        placeholder="My Print Shop LLC"
                      />
                    </div>
                  </div>
                )}
             </div>

             {error && (
               <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-sm font-medium border border-red-100">
                 <AlertCircle size={16} />
                 {error}
               </div>
             )}

             <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  {success && (
                    <span className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-[0.1em] animate-in slide-in-from-left-4 duration-500">
                      <CheckCircle2 size={18} className="text-[#A1FF4D]" />
                      Profile Updated Successfully
                    </span>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all
                    ${saving 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#A1FF4D] text-[#1B2412] hover:scale-105 shadow-lg shadow-[#A1FF4D]/20 active:scale-95'}`
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save My Profile
                    </>
                  )}
                </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
