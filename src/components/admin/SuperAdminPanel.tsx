'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_SECTIONS, type AdminSectionId } from '@/lib/adminSections';
import { EyeIcon, EyeOffIcon, KeyIcon, ShieldIcon, LogOutIcon, ExternalLinkIcon } from '@/components/common/Icons';

const groups = [...new Set(ADMIN_SECTIONS.map((section) => section.group))];
const buttonStyle = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sg-pink disabled:cursor-not-allowed disabled:opacity-50';

export default function SuperAdminPanel({ initialDisabled, initialAllowAdminAuditDelete = false, initialUpdatedAt }: { initialDisabled: AdminSectionId[]; initialAllowAdminAuditDelete?: boolean; initialUpdatedAt: string | null }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [disabled, setDisabled] = useState<AdminSectionId[]>(initialDisabled);
  const [saved, setSaved] = useState<AdminSectionId[]>(initialDisabled);
  const [allowAuditDelete, setAllowAuditDelete] = useState(initialAllowAdminAuditDelete);
  const [savedAllowAuditDelete, setSavedAllowAuditDelete] = useState(initialAllowAdminAuditDelete);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const changed = disabled.length !== saved.length || disabled.some((id) => !saved.includes(id)) || allowAuditDelete !== savedAllowAuditDelete;
  const visibleCount = ADMIN_SECTIONS.length - disabled.length;

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/super-admin/settings', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load dashboard settings.');
      setDisabled(data.disabledSections);
      setSaved(data.disabledSections);
      setAllowAuditDelete(data.allowAdminAuditDelete === true);
      setSavedAllowAuditDelete(data.allowAdminAuditDelete === true);
      setUpdatedAt(data.updatedAt);
      setReady(true);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load dashboard settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!changed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);

  const toggle = (id: AdminSectionId) => {
    setDisabled((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setMessage('');
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/super-admin/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disabledSections: disabled, allowAdminAuditDelete: allowAuditDelete }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to save settings.');
      setDisabled(data.disabledSections);
      setSaved(data.disabledSections);
      setAllowAuditDelete(data.allowAdminAuditDelete === true);
      setSavedAllowAuditDelete(data.allowAdminAuditDelete === true);
      setUpdatedAt(data.updatedAt);
      setMessage('Dashboard settings saved for all regular admins.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sg-pink"><KeyIcon className="h-6 w-6" /></div>
            <div><p className="text-lg font-bold tracking-tight">Shajgoj <span className="text-pink-300">Super Admin</span></p><p className="text-xs text-slate-400">Store access control</p></div>
          </div>
          <nav aria-label="Super admin navigation" className="flex flex-wrap items-center gap-2">
            <Link href="/admin" className={`${buttonStyle} bg-slate-800 hover:bg-slate-700`}>Admin dashboard <ExternalLinkIcon className="h-4 w-4" /></Link>
            <Link href="/" className={`${buttonStyle} text-slate-300 hover:bg-slate-800`}>Storefront</Link>
            <button type="button" aria-label="Sign out" onClick={async () => { await logout(); router.push('/login'); }} className={`${buttonStyle} text-slate-300 hover:bg-slate-800`}><LogOutIcon className="h-4 w-4" /></button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sg-pink">Dashboard visibility</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose what your admins can access</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Show or hide dashboard sections for all regular admins. Your super admin account always has full access.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600"><ShieldIcon className="h-4 w-4 text-sg-pink" />{user?.name || 'Super Admin'}</div>
        </div>

        {loading ? <div role="status" className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading dashboard settings...</div> : (
          <>
            {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{error}</span><button type="button" onClick={() => { setLoading(true); setReady(false); setError(''); void loadSettings(); }} className={`${buttonStyle} bg-white`}>Reload settings</button></div>}
            {message && <p role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}

            <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
              {[{ label: 'Total sections', count: ADMIN_SECTIONS.length }, { label: 'Visible to admins', count: visibleCount }, { label: 'Hidden from admins', count: disabled.length }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><p className="text-xs font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-bold sm:text-3xl">{stat.count}</p></div>
              ))}
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section aria-label="Dashboard section settings" className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                  <div><h2 className="font-bold">Admin dashboard sections</h2><p className="mt-1 text-xs text-slate-500">Changes take effect after you save.</p></div>
                  <div className="flex gap-2">
                    <button type="button" disabled={saving || !ready} onClick={() => { setDisabled([]); setMessage(''); }} className={`${buttonStyle} bg-slate-100 text-slate-700 hover:bg-slate-200`}>Show all</button>
                    <button type="button" disabled={saving || !ready} onClick={() => { setDisabled(ADMIN_SECTIONS.map((section) => section.id)); setMessage(''); }} className={`${buttonStyle} bg-slate-100 text-slate-700 hover:bg-slate-200`}>Hide all</button>
                  </div>
                </div>
                <fieldset disabled={saving || !ready} className="min-w-0 disabled:opacity-60">
                  <legend className="sr-only">Visible dashboard sections for all admins</legend>
                  {groups.map((group) => (
                    <div key={group} className="border-b border-slate-100 last:border-0">
                      <h3 className="bg-slate-50/70 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-6">{group}</h3>
                      {ADMIN_SECTIONS.filter((section) => section.group === group).map((section) => {
                        const visible = !disabled.includes(section.id);
                        return <div key={section.id} className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                          <div className="min-w-0"><label htmlFor={`section-${section.id}`} className="cursor-pointer text-sm font-semibold">{section.name}</label><p id={`description-${section.id}`} className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p></div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className={`hidden text-xs font-semibold sm:inline ${visible ? 'text-emerald-700' : 'text-slate-500'}`}>{visible ? 'Visible' : 'Hidden'}</span>
                            <button id={`section-${section.id}`} type="button" role="switch" aria-checked={visible} aria-label={`Show ${section.name} to admins`} aria-describedby={`description-${section.id}`} onClick={() => toggle(section.id)} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sg-pink disabled:cursor-not-allowed">
                              <span aria-hidden="true" className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${visible ? 'bg-sg-pink' : 'bg-slate-300'}`}><span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${visible ? 'translate-x-5' : 'translate-x-0'}`} /></span>
                            </button>
                          </div>
                        </div>;
                      })}
                    </div>
                  ))}
                </fieldset>
              </section>

              <aside className="space-y-4 lg:sticky lg:top-6">
                <div className="overflow-hidden rounded-2xl bg-slate-900 text-white">
                  <div className="border-b border-slate-700 p-5"><div className="flex items-center gap-2"><EyeIcon className="h-5 w-5 text-pink-300" /><h2 className="text-sm font-bold">Admin menu preview</h2></div><p className="mt-2 text-xs leading-5 text-slate-400">The sections regular admins will see.</p></div>
                  <div className="space-y-5 p-5">
                    {groups.map((group) => {
                      const items = ADMIN_SECTIONS.filter((section) => section.group === group && !disabled.includes(section.id));
                      return items.length > 0 && <div key={group}><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{group}</h3><ul className="space-y-2">{items.map((item) => <li key={item.id} className="text-sm text-slate-200">{item.name}</li>)}</ul></div>;
                    })}
                    {visibleCount === 0 && <div className="py-6 text-center"><EyeOffIcon className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-3 text-sm text-slate-300">All sections are hidden.</p><p className="mt-2 text-xs leading-5 text-slate-400">Admins will see an access unavailable message.</p></div>}
                  </div>
                </div>
                <div className="rounded-2xl border border-pink-100 bg-pink-50 p-5 text-sm leading-6 text-slate-700"><ShieldIcon className="mb-2 h-5 w-5 text-sg-pink" /><p>Hidden sections disappear from the admin menu and shortcuts. Their management actions are blocked too.</p><p className="mt-2 text-xs text-slate-500">Settings apply to all regular admins. Moderator permissions are managed separately.</p></div>
              </aside>
            </div>

            <section aria-labelledby="audit-delete-heading" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div>
                <h2 id="audit-delete-heading" className="font-bold"><label htmlFor="allow-audit-delete" className="cursor-pointer">Allow admins to delete audit trail logs</label></h2>
                <p id="audit-delete-description" className="mt-2 text-sm leading-6 text-slate-600">Show delete controls to regular admins. Turning this off blocks their delete requests immediately.</p>
                {disabled.includes('audit-log') && <p className="mt-2 text-xs text-amber-700">The Audit Trail section must also be visible for admins to use this permission.</p>}
              </div>
              <button id="allow-audit-delete" type="button" role="switch" aria-checked={allowAuditDelete} aria-label="Allow admins to delete audit trail logs" aria-describedby="audit-delete-description" disabled={saving || !ready} onClick={() => { setAllowAuditDelete((current) => !current); setMessage(''); }} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sg-pink disabled:cursor-not-allowed disabled:opacity-50">
                <span aria-hidden="true" className={`flex h-6 w-11 items-center rounded-full px-1 transition-colors ${allowAuditDelete ? 'bg-sg-pink' : 'bg-slate-300'}`}><span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${allowAuditDelete ? 'translate-x-5' : 'translate-x-0'}`} /></span>
              </button>
            </section>

            <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-5">
              <div><p className="text-sm font-semibold">{!ready ? 'Settings could not be loaded' : changed ? 'You have unsaved changes' : 'All changes saved'}</p><p className="mt-1 text-xs text-slate-500">{updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })} (Dhaka)` : ready ? 'All sections are visible by default.' : 'Reload settings to continue.'}</p></div>
              <div className="flex gap-2"><button type="button" disabled={!changed || saving} onClick={() => { setDisabled([...saved]); setAllowAuditDelete(savedAllowAuditDelete); setMessage(''); }} className={`${buttonStyle} text-slate-600 hover:bg-slate-100`}>Discard</button><button type="button" disabled={!changed || saving || !ready} onClick={save} className={`${buttonStyle} bg-sg-pink text-white hover:bg-pink-700`}>{saving ? 'Saving...' : 'Save changes'}</button></div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
