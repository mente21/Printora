"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      if (
        signInError.message === 'Invalid login credentials' ||
        signInError.message.toLowerCase().includes('invalid')
      ) {
        // Check profiles table to distinguish "wrong password" from "Google-only account"
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (profile) {
          setError('Invalid email or password. If you signed up via Google, please use "Continue with Google".');
        } else {
          setError('No account found with this email. Please sign up first.');
        }
      } else if (
        signInError.message.toLowerCase().includes('confirmed') ||
        signInError.message.toLowerCase().includes('not confirmed')
      ) {
        setError('Your account is not confirmed yet. Please ask the admin to disable email confirmation in Supabase Dashboard.');
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    // Login successful — look up role from profiles table and redirect
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const role = profile?.role ?? 'CUSTOMER';

      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'SUPPLIER') {
        window.location.href = '/supplier';
      } else {
        window.location.href = '/';
      }
      // keep loading spinner during navigation
    } else {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f5f3e7] font-sans">

      {/* Left Column - Image & Marketing */}
      <div className="hidden lg:flex flex-col relative w-[48%] xl:w-[45%] bg-zinc-900 flex-shrink-0 min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#111111] overflow-hidden">
          <img src="/pointer-guy-new.png" alt="Background" className="w-[120%] lg:w-[125%] max-w-none h-full object-cover object-center absolute -left-4 z-0 scale-x-[-1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent z-10 w-full h-[50%] top-auto bottom-0"></div>
          <div className="absolute inset-y-0 right-0 w-32 md:w-48 bg-gradient-to-r from-transparent to-[#f5f3e7] z-20 pointer-events-none"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-between pt-16 pb-12 px-10 xl:px-14 text-white h-full w-full">
          <div></div>
          <div className="mt-auto max-w-[360px] xl:max-w-[400px]">
            <div className="w-12 h-1.5 bg-[#A1FF4C] mb-8 rounded-full shadow-[0_0_15px_rgba(161,255,76,0.5)]"></div>
            <h1 className="text-[42px] xl:text-[50px] font-black leading-[1.05] uppercase tracking-widest mb-8 drop-shadow-2xl" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
              <span className="block text-white mb-2">SMALL PRODUCT,</span>
              <span className="bg-[#2DC1DB] text-white px-3 py-1.5 -ml-1 inline-block shadow-lg leading-none transform -skew-x-6">
                <span className="block transform skew-x-6">BIG PROFIT</span>
              </span>
              <span className="block text-white mt-3">POTENTIAL</span>
            </h1>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#2DC1DB] to-[#A1FF4C]"></div>
              <p className="text-[14.5px] font-medium leading-[1.7] text-gray-100 mb-4">
                Phone cases are year-round profit-makers that smartphone users can't get enough of.
              </p>
              <p className="text-[14.5px] font-medium leading-[1.7] text-gray-100">
                Add your designs to popular cases, like the new{' '}
                <span className="text-white font-bold bg-white/20 px-1.5 py-0.5 rounded ml-0.5">Samsung Galaxy S24</span>{' '}
                options, and plug them as the perfect add-on to any order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-6 lg:px-12 relative overflow-y-auto">

        <Link href="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-[#2B3118] shadow-sm transition-colors z-20 hover-vibrate">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
        </Link>

        <div className="w-full max-w-[440px] flex flex-col my-auto">

          <h2 className="text-[44px] md:text-[54px] font-black uppercase text-[#2B3118] tracking-widest text-center mb-10" style={{ fontFamily: 'Impact, sans-serif', wordSpacing: '0.15em' }}>
            WELCOME BACK.
          </h2>

          <div className="flex flex-col gap-3">
            <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 shadow-sm rounded-md py-3.5 px-4 hover:bg-gray-50 transition-colors font-bold text-[14.5px] text-gray-800">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px] h-[18px]" />
              Continue with Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 shadow-sm rounded-md py-3.5 px-4 hover:bg-gray-50 transition-colors font-bold text-[14.5px] text-gray-800">
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-93.1 22.7-18.9 0-51-22.9-80-22.9-42.3 0-82.6 24.2-104.9 63.8-45 80.3-15.1 199.1 28.8 261.3 21.6 30.7 47 62.4 80.7 61.2 32.3-1.2 44.8-21 82.2-21 37.4 0 48.6 21.1 82.7 20.4 35.1-.7 57.6-29.3 79-59.8 24.7-35.5 35.1-70 35.7-71.8-1.1-.4-66.9-25.2-67-104.5zM227.6 112.9c18.5-22.5 31.1-53.9 27.6-84.9-26.5 1.1-58.8 17.5-78 40.1-17.1 19.8-31.5 52.3-27.4 82.2 29.8 2.3 59.3-14.8 77.8-37.4z" /></svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-[11px] font-bold text-gray-500 tracking-wider">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm font-medium leading-relaxed">
              {error}
            </div>
          )}

          {resetSent && !error && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm font-medium">
              ✓ Password reset link sent! Check your email.
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-bold text-gray-800">Email</label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); setResetSent(false); }} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900" required />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-gray-800">Password</label>
                <button type="button" onClick={handleForgotPassword} disabled={resetLoading} className="text-[13px] font-bold text-gray-500 hover:text-[#2B3118] hover:underline underline-offset-4 transition-colors disabled:opacity-50">
                  {resetLoading ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full bg-white border border-gray-300 shadow-sm rounded-md px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#A1FF4C] focus:border-transparent text-gray-900 pr-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#B2FF66] md:bg-[#A1FF4C] hover:bg-[#8ee53f] transition-colors text-black font-bold text-[16px] py-4 rounded-md shadow-sm mt-5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 flex justify-center border-t border-gray-200 pt-8">
            <p className="text-[15px] text-gray-600 font-medium flex items-center gap-1">
              New to Stenvo?
              <Link href="/signup" className="relative group inline-block font-black text-[#2B3118] hover:text-[#454c30] transition-colors ml-1">
                Sign Up
                <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#A1FF4C] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
