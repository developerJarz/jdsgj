"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon,
  CrownIcon
} from '@/components/common/Icons';

const AVATAR_PRESETS = [
  { id: 'glow', label: 'Golden Glow', emoji: '✨', bg: 'from-amber-400 to-orange-500' },
  { id: 'rose', label: 'Velvet Rose', emoji: '🌹', bg: 'from-rose-400 to-pink-600' },
  { id: 'chic', label: 'Modern Chic', emoji: '💄', bg: 'from-fuchsia-500 to-pink-500' },
  { id: 'natural', label: 'Pure Botanics', emoji: '🌿', bg: 'from-emerald-400 to-teal-600' },
  { id: 'dewy', label: 'Dewy Hydration', emoji: '💧', bg: 'from-sky-400 to-blue-600' },
  { id: 'glam', label: 'Royal Glam', emoji: '👑', bg: 'from-purple-500 to-indigo-600' },
  { id: 'sunset', label: 'Sunset Coral', emoji: '🌅', bg: 'from-orange-400 to-rose-500' },
  { id: 'berry', label: 'Wild Berry', emoji: '🫐', bg: 'from-violet-500 to-purple-800' },
];

const SKIN_TYPES = [
  { id: 'oily', label: 'Oily Skin', desc: 'Excess shine, visible pores' },
  { id: 'dry', label: 'Dry Skin', desc: 'Tight, flaking, needs deep hydration' },
  { id: 'combination', label: 'Combination', desc: 'Oily T-zone, normal/dry cheeks' },
  { id: 'sensitive', label: 'Sensitive Skin', desc: 'Easily irritated, redness-prone' },
  { id: 'acne_prone', label: 'Acne-Prone', desc: 'Frequent breakouts & blemishes' },
  { id: 'normal', label: 'Normal Skin', desc: 'Balanced, minimal concerns' },
];

const SKIN_CONCERNS = [
  'Acne & Breakouts',
  'Dark Spots & Hyperpigmentation',
  'Anti-Aging & Fine Lines',
  'Dullness & Uneven Tone',
  'Large & Clogged Pores',
  'Dryness & Dehydration',
  'Sun Damage & Tan',
  'Redness & Irritation',
  'Dark Circles / Puffy Eyes',
];

const HAIR_TYPES = [
  { id: 'straight', label: 'Straight' },
  { id: 'wavy', label: 'Wavy' },
  { id: 'curly', label: 'Curly' },
  { id: 'coily', label: 'Coily / Textured' },
];

const HAIR_CONCERNS = [
  'Hair Fall & Thinning',
  'Dandruff & Scalp Itch',
  'Frizz & Dry Ends',
  'Color / Heat Damaged',
  'Greasy Scalp',
  'Lack of Volume',
];

const POPULAR_BRANDS = [
  'COSRX',
  'The Ordinary',
  '3W Clinic',
  'Skin Cafe',
  'Cerave',
  'Cetaphil',
  'Innisfree',
  'Neutrogena',
  'Some By Mi',
  'Beauty of Joseon',
  'L\'Oreal Paris',
  'Simple Skincare',
];

export default function CustomerProfilePage() {
  const { user, refreshUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'beauty' | 'security' | 'notifications'>('details');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: 'rose',
    birthday: '',
    gender: 'prefer_not_to_say',
    skinType: 'combination',
    skinConcerns: [] as string[],
    hairType: 'straight',
    hairConcerns: [] as string[],
    preferredBrands: [] as string[],
    beautyGoal: 'Achieve radiant, glowing glass skin with gentle hydration',
    newPassword: '',
    confirmPassword: '',
    emailNotif: true,
    smsNotif: true,
    whatsappNotif: true,
    promotionsNotif: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/account/profile');
        const json = await res.json();
        if (json.success && json.profile) {
          const p = json.profile;
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            email: p.email || '',
            avatar: p.avatar || 'rose',
            birthday: p.birthday ? new Date(p.birthday).toISOString().slice(0, 10) : '',
            gender: p.gender || 'prefer_not_to_say',
            skinType: p.skinType || 'combination',
            skinConcerns: p.skinConcerns || ['Dullness & Uneven Tone', 'Dark Spots & Hyperpigmentation'],
            hairType: p.hairType || 'straight',
            hairConcerns: p.hairConcerns || ['Frizz & Dry Ends'],
            preferredBrands: p.preferredBrands || ['COSRX', 'The Ordinary', 'Skin Cafe'],
            beautyGoal: p.beautyGoal || 'Achieve radiant, glowing glass skin with gentle hydration',
            newPassword: '',
            confirmPassword: '',
            emailNotif: p.notificationPrefs?.email !== false,
            smsNotif: p.notificationPrefs?.sms !== false,
            whatsappNotif: p.notificationPrefs?.whatsapp !== false,
            promotionsNotif: p.notificationPrefs?.promotions !== false,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const toggleSkinConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }));
  };

  const toggleHairConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      hairConcerns: prev.hairConcerns.includes(concern)
        ? prev.hairConcerns.filter(c => c !== concern)
        : [...prev.hairConcerns, concern]
    }));
  };

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      preferredBrands: prev.preferredBrands.includes(brand)
        ? prev.preferredBrands.filter(b => b !== brand)
        : [...prev.preferredBrands, brand]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
          birthday: formData.birthday || undefined,
          gender: formData.gender,
          skinType: formData.skinType,
          skinConcerns: formData.skinConcerns,
          hairType: formData.hairType,
          hairConcerns: formData.hairConcerns,
          preferredBrands: formData.preferredBrands,
          beautyGoal: formData.beautyGoal,
          ...(formData.newPassword ? { newPassword: formData.newPassword } : {}),
          notificationPrefs: {
            email: formData.emailNotif,
            sms: formData.smsNotif,
            whatsapp: formData.whatsappNotif,
            promotions: formData.promotionsNotif,
            push: true,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: 'success', text: 'Your profile and beauty customization have been saved!' });
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        if (updateUser) {
          updateUser({ name: formData.name, email: formData.email, avatar: formData.avatar });
        }
        await refreshUser();
      } else {
        setStatusMsg({ type: 'error', text: json.message || 'Failed to update profile' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const selectedPreset = AVATAR_PRESETS.find(p => p.id === formData.avatar) || AVATAR_PRESETS[1];

  // Calculate profile completion percentage
  const completionScore = [
    formData.name,
    formData.email,
    formData.birthday,
    formData.skinType,
    formData.skinConcerns.length > 0,
    formData.preferredBrands.length > 0,
  ].filter(Boolean).length;
  const completionPercentage = Math.round((completionScore / 6) * 100);

  if (loading) {
    return <div className="py-20 text-center text-xs text-gray-400">Loading beauty profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Profile & Beauty Customization</span>
            <span className="text-xs bg-sg-pink/10 text-sg-pink font-bold px-2.5 py-0.5 rounded-full">
              Personalized Experience
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure your beauty profile, custom avatars, skin concerns, and communication preferences
          </p>
        </div>

        {/* Profile Completion Badge */}
        <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xs flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-sg-pink transition-all duration-1000"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-gray-800">{completionPercentage}%</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Profile Strength
            </span>
            <span className="text-xs font-bold text-sg-pink">
              {completionPercentage === 100 ? 'All Set! VIP Ready' : 'Complete for +50 Points'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'details'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          👤 Identity & Avatars
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('beauty')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'beauty'
              ? 'bg-sg-pink text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>✨ My Skin & Beauty Profile</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔒 Security & Password
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔔 Alerts & Notifications
        </button>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMsg.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{statusMsg.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMsg(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: IDENTITY & AVATAR */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                1. Beauty Avatar & Style
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Choose a personalized beauty aesthetic avatar that appears on your reviews and account header
              </p>

              {/* Avatar Preset Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: preset.id })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      formData.avatar === preset.id
                        ? 'border-sg-pink bg-pink-50/50 shadow-sm ring-2 ring-sg-pink/30'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${preset.bg} text-white text-xl flex items-center justify-center shadow-xs`}>
                      {preset.emoji}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{preset.label}</span>
                    {formData.avatar === preset.id && (
                      <span className="text-[10px] font-bold text-sg-pink flex items-center gap-0.5">
                        <CheckIcon className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Details */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
                2. Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone (Primary Key)</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={formData.phone}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-mono text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Birthday (For VIP Birthday Gift)</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Non-Binary / Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEAUTY & SKIN PROFILE */}
        {activeTab === 'beauty' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6 text-xs">
            {/* Skin Type */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  1. Your Skin Type
                </h3>
                <span className="text-[11px] text-sg-pink font-semibold">Powers personalized skincare filters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {SKIN_TYPES.map((st) => (
                  <label
                    key={st.id}
                    onClick={() => setFormData({ ...formData, skinType: st.id })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all block ${
                      formData.skinType === st.id
                        ? 'border-sg-pink bg-pink-50/50 shadow-xs ring-2 ring-sg-pink/30'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xs">{st.label}</span>
                      <input
                        type="radio"
                        name="skinType"
                        checked={formData.skinType === st.id}
                        onChange={() => {}}
                        className="accent-sg-pink"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">{st.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Skin Concerns */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 mb-3">
                2. Key Skin Concerns (Select all that apply)
              </h3>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map((concern) => {
                  const isSelected = formData.skinConcerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleSkinConcern(concern)}
                      className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sg-pink text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{concern}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair Profile */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 mb-3">
                3. Hair Type & Primary Needs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {HAIR_TYPES.map((ht) => (
                  <button
                    key={ht.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, hairType: ht.id })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all text-xs ${
                      formData.hairType === ht.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {ht.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {HAIR_CONCERNS.map((concern) => {
                  const isSelected = formData.hairConcerns.includes(concern);
                  return (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => toggleHairConcern(concern)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-slate-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{concern}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Brands */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 mb-3">
                4. Favorite Beauty Brands
              </h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_BRANDS.map((brand) => {
                  const isSelected = formData.preferredBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-pink-100 border-sg-pink text-sg-pink'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {isSelected ? '★ ' : ''}{brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Beauty Goal */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block font-bold text-gray-700 mb-1">
                5. Your Ultimate Beauty Goal
              </label>
              <input
                type="text"
                value={formData.beautyGoal}
                onChange={(e) => setFormData({ ...formData, beautyGoal: e.target.value })}
                placeholder="e.g. Glowing glass skin, acne prevention, hyperpigmentation fading..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              Password & Account Security
            </h3>

            <div>
              <label className="block font-bold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Leave blank to keep your current password"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {formData.newPassword && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sg-pink/30 focus:border-sg-pink outline-none"
                />
              </div>
            )}

            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 space-y-1">
              <span className="font-bold block">🔒 Security Tip:</span>
              <p className="text-[11px] text-blue-800">
                Use a minimum of 6 characters with a combination of letters and numbers to protect your account and reward points balance.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS & PRIVACY */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              Communication & Delivery Alerts
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailNotif}
                  onChange={(e) => setFormData({ ...formData, emailNotif: e.target.checked })}
                  className="accent-sg-pink mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-900 block">Email Invoices & Shipping Status</span>
                  <span className="text-[11px] text-gray-500">
                    Receive detailed invoice breakdown and tracking URL when parcel dispatches.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsNotif}
                  onChange={(e) => setFormData({ ...formData, smsNotif: e.target.checked })}
                  className="accent-sg-pink mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-900 block">SMS Courier Rider Notifications</span>
                  <span className="text-[11px] text-gray-500">
                    Receive OTP confirmations and rider out-for-delivery SMS updates.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.whatsappNotif}
                  onChange={(e) => setFormData({ ...formData, whatsappNotif: e.target.checked })}
                  className="accent-sg-pink mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-900 block">WhatsApp Instant Updates</span>
                  <span className="text-[11px] text-gray-500">
                    Receive live tracking links and customer care updates straight to WhatsApp.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.promotionsNotif}
                  onChange={(e) => setFormData({ ...formData, promotionsNotif: e.target.checked })}
                  className="accent-sg-pink mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-900 block">VIP Flash Sales & Discount Drops</span>
                  <span className="text-[11px] text-gray-500">
                    Be the first to know about buy-1-get-1 sales and brand clearance events.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Global Save Button Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Changes are synced securely with your Shajgoj.bd account</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-sg-pink hover:bg-sg-pink-hover text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Profile & Beauty Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
