"use client";

import { useState } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    location: '',
    company_name: '',
    role: 'CUSTOMER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { full_name, email, password, phone_number, location, company_name, role } = formData;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    // 1. Attempt Sign Up
    console.log('Attempting signup for:', email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
          phone_number,
          location,
          company_name: role === 'SUPPLIER' ? company_name : null,
        },
      },
    });

    console.log('Signup result:', { authData, authError });

    let session = authData.session;
    let user = authData.user;

    // 2. Handle Errors
    if (authError) {
      const isAlreadyRegistered = authError.message.toLowerCase().includes('already registered') || 
                                 authError.message.toLowerCase().includes('already been registered');
      
      if (isAlreadyRegistered) {
        setError('This email is already registered. Please go to the Log In page to access your account.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // 3. Handle Missing Session (Success but no session)
    if (!session && user) {
      console.log('Signup succeeded but no session returned. Attempting manual login...');
      // Try logging in (sometimes needed if Supabase behaves unexpectedly)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError && signInData.session) {
        session = signInData.session;
        user = signInData.user;
      } else if (signInError) {
        if (signInError.message.toLowerCase().includes('confirm')) {
          setError('Account created! However, email confirmation is required by the server. Please verify your email.');
        } else if (signInError.message.toLowerCase().includes('invalid')) {
          setError('This email is already registered. Please go to the Log In page.');
        } else {
          setError(`Account created, but could not log in automatically: ${signInError.message}`);
        }
        setLoading(false);
        return;
      }
    }

    if (!session || !user) {
      setError('Signup successful, but session could not be started. Please go to the Log In page.');
      setLoading(false);
      return;
    }

    // 3. Session is active — profile was created by the DB trigger.
    //    As a safety net, try an upsert (no-op if trigger already ran).
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email,
        full_name,
        phone_number,
        location,
        company_name: role === 'SUPPLIER' ? company_name : null,
        role,
      },
      { onConflict: 'id' }
    );

    // 4. Redirect to the correct dashboard
    if (role === 'SUPPLIER') {
      window.location.href = '/supplier';
    } else {
      window.location.href = '/';
    }
    // keep loading spinner while navigating
  };

  return (
    <div className="min-h-screen w-full flex flex-row-reverse bg-[#f5f3e7] font-sans">

      {/* Right Column - Image & Marketing */}
      <div className="hidden lg:flex flex-col relative w-[48%] xl:w-[45%] bg-zinc-900 flex-shrink-0 min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 bg-white overflow-hidden">
          <img src="/pointer-guy-new.png" alt="Background" className="w-[120%] lg:w-[125%] max-w-none h-full object-cover object-center absolute -left-4 z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80 z-10"></div>
          <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-l from-transparent to-[#f5f3e7] z-20 pointer-events-none"></div>
        </div>
        <div className="relative z-10 flex flex-col pt-16 px-12 xl:px-16 text-white h-full">
          <h1 className="text-[52px] xl:text-[62px] font-black leading-none uppercase tracking-widest" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
            <span className="block mb-1 drop-shadow-md">SMALL PRODUCT,</span>
            <span className="bg-[#2DC1DB] text-white px-3 py-1 -ml-3 inline-block shadow-md">BIG PROFIT</span>
            <span className="block mt-1 drop-shadow-md">POTENTIAL</span>
          </h1>
          <p className="mt-8 text-[15.5px] xl:text-[17px] font-medium leading-[1.6] opacity-95 max-w-md drop-shadow-lg">
            Phone cases are year-round profit-makers that smartphone users can't get enough of.
          </p>
          <p className="mt-4 text-[15.5px] xl:text-[17px] font-medium leading-[1.6] opacity-95 max-w-md drop-shadow-lg">
            Add your designs to popular cases, like the new Samsung Galaxy S24 options, and plug them as the perfect add-on to any order.
          </p>
        </div>
      </div>

      {/* Left Column - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 lg:px-12 relative overflow-y-auto">

        <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-[#2B3118] shadow-sm transition-colors z-20 hover-vibrate">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
        </Link>

        <div className="w-full max-w-[440px] flex flex-col my-auto mt-4 md:mt-auto">

          <h2 className="text-[44px] md:text-[54px] font-black uppercase text-[#2B3118] tracking-widest text-center mb-8" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
            JOIN STENVO.
          </h2>

          <div className="flex flex-col gap-3">
            <button type="button" onClick={handleGoogleSignUp} className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 shadow-sm rounded-md py-3.5 px-4 hover:bg-gray-50 transition-colors font-bold text-[14.5px] text-gray-800">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
              Sign up with Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 shadow-sm rounded-md py-3.5 px-4 hover:bg-gray-50 transition-colors font-bold text-[14.5px] text-gray-800">
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-93.1 22.7-18.9 0-51-22.9-80-22.9-42.3 0-82.6 24.2-104.9 63.8-45 80.3-15.1 199.1 28.8 261.3 21.6 30.7 47 62.4 80.7 61.2 32.3-1.2 44.8-21 82.2-21 37.4 0 48.6 21.1 82.7 20.4 35.1-.7 57.6-29.3 79-59.8 24.7-35.5 35.1-70 35.7-71.8-1.1-.4-66.9-25.2-67-104.5zM227.6 112.9c18.5-22.5 31.1-53.9 27.6-84.9-26.5 1.1-58.8 17.5-78 40.1-17.1 19.8-31.5 52.3-27.4 82.2 29.8 2.3 59.3-14.8 77.8-37.4z" /></svg>
              Sign up with Apple
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-[11px] font-bold text-gray-500 tracking-wider">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-bold text-gray-800">Full Name</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Jane Doe" className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-bold text-gray-800">Email</label>
              <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[14px] font-bold text-gray-800">Phone number</label>
                <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[14px] font-bold text-gray-800">Location (City, Country)</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required />
              </div>
            </div>

            {formData.role === 'SUPPLIER' && (
              <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[14px] font-bold text-gray-800">Company Name</label>
                <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="e.g. Acme Printing Co." className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required={formData.role === 'SUPPLIER'} />
              </div>
            )}

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[14px] font-bold text-gray-800">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900 pr-12" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-[12px] text-gray-400 font-medium">Minimum 6 characters</p>
            </div>
                            
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-bold text-gray-800">I want to:</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer group">
                  <input type="radio" name="role" value="CUSTOMER" checked={formData.role === 'CUSTOMER'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="peer sr-only" />
                  <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl peer-checked:border-[#A1FF4C] peer-checked:bg-[#A1FF4C]/5 transition-all text-center group-hover:bg-gray-50">
                    <User size={20} className="text-gray-400 peer-checked:text-[#1B2412]" />
                    <span className="text-[13px] font-bold text-gray-700">Buy Products</span>
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input type="radio" name="role" value="SUPPLIER" checked={formData.role === 'SUPPLIER'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="peer sr-only" />
                  <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-300 rounded-xl peer-checked:border-[#A1FF4C] peer-checked:bg-[#A1FF4C]/5 transition-all text-center group-hover:bg-gray-50">
                    <ShoppingBag size={20} className="text-gray-400 peer-checked:text-[#1B2412]" />
                    <span className="text-[13px] font-bold text-gray-700">Sell Products</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#B2FF66] md:bg-[#A1FF4C] hover:bg-[#8ee53f] transition-colors text-black font-bold text-[16px] py-4 rounded-md shadow-sm mt-5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 flex justify-center border-t border-gray-200 pt-8">
            <p className="text-[15px] text-gray-600 font-medium flex items-center gap-1">
              Already have an account?
              <Link href="/login" className="relative group inline-block font-black text-[#2B3118] hover:text-[#454c30] transition-colors ml-1">
                Log In
                <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#A1FF4C] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
