"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UserIcon, LockIcon, PhoneIcon, MailIcon, ShieldCheckIcon,
  CheckIcon, EyeIcon, EyeOffIcon
} from '@/components/common/Icons';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const { user, login, signup, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');

  // OTP states
  const [otpStep, setOtpStep] = useState<'email' | 'verify' | 'details'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // If already logged in
  useEffect(() => {
    if (user && !errorMsg && !successMsg) {
      // Allow switching accounts or redirect
    }
  }, [user, errorMsg, successMsg]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your mobile phone or email, and your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(identifier.trim(), password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting...`);
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user?.role === 'admin' || res.user?.role === 'superadmin') {
          router.push('/admin');
        } else if (res.user?.role === 'moderator') {
          router.push('/moderator');
        } else {
          router.push('/account');
        }
      }, 500);
    } else {
      setErrorMsg(res.message || 'Login failed. Please check your credentials.');
    }
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setOtpSent(true);
        setOtpStep('verify');
        setOtpCountdown(60);
        setSuccessMsg('Verification code sent to your email. Please check your inbox.');
      } else {
        setErrorMsg(data.message || 'Failed to send verification code.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setOtpStep('details');
        setSuccessMsg('Email verified! Please complete your registration below.');
      } else {
        setErrorMsg(data.message || 'Invalid verification code.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  // Step 3: Complete registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in your name, mobile number, and choose a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await signup(name.trim(), phone.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMsg('Account created successfully! Welcome to Shajgoj.bd.');
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/account');
        }
      }, 600);
    } else {
      setErrorMsg(res.message || 'Registration failed. Please check your information.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setOtpCountdown(60);
        setSuccessMsg('New verification code sent to your email.');
      } else {
        setErrorMsg(data.message || 'Failed to resend code.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmailOrPhone.trim()) {
      setErrorMsg('Please enter your registered mobile number or email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotEmailOrPhone.trim() }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setSuccessMsg('Password reset instructions and verification code sent.');
      } else {
        setErrorMsg(data.message || 'Could not process password reset.');
      }
    } catch {
      setIsLoading(false);
      setSuccessMsg('If an account exists with this credential, password reset instructions have been sent.');
    }
  };

  // Reset registration flow when switching tabs
  const resetRegisterState = () => {
    setOtpStep('email');
    setOtpCode('');
    setOtpSent(false);
    setOtpCountdown(0);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#fff5f8]/40 to-[#fdf2f6]/60">
      <div className="max-w-md w-full space-y-6">
        {/* Top Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/assets/logov2.png"
              alt="Shajgoj.bd"
              width={160}
              height={28}
              className="h-8 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <p className="text-xs text-gray-500 font-medium">
            100% Authentic Cosmetics &amp; Beauty Care in Bangladesh
          </p>
        </div>

        {/* If user is already logged in */}
        {user && (
          <div className="bg-white rounded-2xl border border-sg-pink/20 p-5 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sg-pink to-[#ff6b8b] text-white font-black text-base flex items-center justify-center mx-auto shadow-xs">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs text-gray-500">Currently logged in as</p>
              <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
              <p className="text-[11px] text-gray-400 capitalize">{user.role} • {user.phone || user.email}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (user.role === 'admin' || user.role === 'superadmin') router.push('/admin');
                  else if (user.role === 'moderator') router.push('/moderator');
                  else router.push('/account');
                }}
                className="flex-1 py-2 bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Go to Dashboard →
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setSuccessMsg('Logged out successfully');
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl shadow-sg-pink/5 space-y-6">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-sg-pink shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                resetRegisterState();
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-sg-pink shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('forgot');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'forgot'
                  ? 'bg-white text-sg-pink shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl text-center font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-center font-medium">
              {successMsg}
            </div>
          )}

          {/* FORM: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number or Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="017XXXXXXXX or user@email.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">
                    <PhoneIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-sg-pink hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">
                    <LockIcon className="w-3.5 h-3.5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-sg-pink/25 active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* FORM: REGISTER (3-Step OTP Flow) */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  otpStep === 'email' ? 'bg-sg-pink text-white' : otpSent ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {otpSent ? <CheckIcon className="w-3 h-3" /> : '1'}
                </span>
                <div className={`flex-1 h-0.5 ${otpStep !== 'email' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  otpStep === 'verify' ? 'bg-sg-pink text-white' : otpStep === 'details' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {otpStep === 'details' ? <CheckIcon className="w-3 h-3" /> : '2'}
                </span>
                <div className={`flex-1 h-0.5 ${otpStep === 'details' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                  otpStep === 'details' ? 'bg-sg-pink text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </span>
              </div>

              {/* Step 1: Email */}
              {otpStep === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <p className="text-[11px] text-gray-400 mb-2">We&apos;ll send a 6-digit verification code to your email.</p>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                      />
                      <span className="absolute left-3 top-3 text-gray-400">
                        <MailIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-sg-pink/25 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Verification Code *</label>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Enter the 6-digit code sent to <strong className="text-gray-600">{email}</strong>
                    </p>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-sg-pink/25 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setOtpStep('email'); setOtpCode(''); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-gray-500 hover:text-sg-pink font-semibold"
                    >
                      ← Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpCountdown > 0 || isLoading}
                      className="text-sg-pink hover:underline font-semibold disabled:text-gray-400 disabled:no-underline"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Complete Registration */}
              {otpStep === 'details' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Email <strong>{email}</strong> verified successfully</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ayesha Rahman"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                      />
                      <span className="absolute left-3 top-3 text-gray-400">
                        <UserIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone (BD) *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                      />
                      <span className="absolute left-3 top-3 text-gray-400">
                        <PhoneIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password (Min 6 chars) *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                      />
                      <span className="absolute left-3 top-3 text-gray-400">
                        <LockIcon className="w-3.5 h-3.5" />
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Get <strong>50 Free Reward Points</strong> immediately on signup!</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-sg-pink to-[#ff6b8b] hover:brightness-105 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-sg-pink/25 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* FORM: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-gray-500">
                Enter your registered mobile phone or email address to receive password recovery instructions.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Registered Mobile / Email *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={forgotEmailOrPhone}
                    onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                    placeholder="017XXXXXXXX or user@email.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-sg-black focus:bg-white focus:outline-none focus:border-sg-pink focus:ring-2 focus:ring-sg-pink/20 transition-all"
                  />
                  <span className="absolute left-3 top-3 text-gray-400">
                    <PhoneIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-sg-pink hover:bg-sg-pink-hover text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Code'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs text-gray-500 hover:text-sg-pink font-semibold pt-1 block"
              >
                ← Return to Log In
              </button>
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Secure 256-Bit Encrypted Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
