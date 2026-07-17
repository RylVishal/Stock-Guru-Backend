import { useState, useEffect } from "react";
import { apiClient } from '../services/auth';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Eye, EyeOff, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';


// ─────────────────────────── Masking helpers ────────────────────────────────
const maskEmail = (email) => {
  if (!email) return '—';
  const [u, d] = email.split('@');
  if (u.length <= 2) return `${u[0]}*@${d}`;
  return `${u.slice(0, 2)}${'*'.repeat(Math.max(u.length - 3, 1))}${u[u.length - 1]}@${d}`;
};
const maskAadhaar = (a) => (!a ? 'Not Submitted' : `XXXX XXXX ${a.slice(-4)}`);
const maskPan     = (p) => (!p ? 'Not Submitted' : `${p.slice(0, 3)}XXXXX${p.slice(8)}`);
const maskId      = (id) => (!id ? '—' : `${id.slice(0, 4)}••••••••${id.slice(-4)}`);
const fmtDob      = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

// ─────────────────────────── Reusable field row ─────────────────────────────
const InfoRow = ({ label, value, masked, show, onToggle, mono = false }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-500">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-bold text-slate-800 ${mono ? 'font-mono' : ''}`}>
        {show ? value : masked}
      </span>
      {onToggle && (
        <button onClick={onToggle} className="bg-transparent border-none p-0 cursor-pointer text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      )}
    </div>
  </div>
);

// ────────────────────────────── Shimmer UI ──────────────────────────────────
const Shimmer = () => (
  <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 space-y-4">
        <div className="mx-auto w-24 h-24 bg-slate-200 rounded-full" />
        <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-3 bg-slate-100 rounded w-full" />)}
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 h-36" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 h-64" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 h-48" />
      </div>
    </div>
  </div>
);

// ══════════════════════════════ MAIN COMPONENT ══════════════════════════════
export default function Profile() {
  const [isLoading, setIsLoading]   = useState(true);
  const [profileData, setProfileData] = useState({
    id: '', name: '', email: '', role: 'user', panNumber: '', createdAt: ''
  });
  const [kycData, setKycData]       = useState(null); // null = not submitted
  const [portfolio, setPortfolio]   = useState({ cashBalance: 0, totalInvested: 0, totalProfitLoss: 0, holdingsCount: 0 });

  // ── Visibility toggles ────────────────────────────────────────────────────
  const [vis, setVis] = useState({ email: false, aadhaar: false, pan: false, id: false, dob: false });
  const toggle = (k) => setVis(p => ({ ...p, [k]: !p[k] }));

  // ── Account settings form ─────────────────────────────────────────────────
  const [accForm, setAccForm]       = useState({ name: '', panNumber: '', phone: '' });
  const [accTouched, setAccTouched] = useState({});
  const [accSaving, setAccSaving]   = useState(false);

  // ── KYC edit form (name, aadhaar, address only) ───────────────────────────
  const [kycEdit, setKycEdit]       = useState({ fullName: '', aadhaarNumber: '', address: '' });
  const [kycTouched, setKycTouched] = useState({});
  const [kycSaving, setKycSaving]   = useState(false);


  // ── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, summaryRes, kycRes] = await Promise.allSettled([
          apiClient.get('/user/profile'),
          api.get('/portfolio/summary'),
          apiClient.get('/kyc/details')
        ]);

        if (profileRes.status === 'fulfilled') {
          const u = profileRes.value?.data?.data || profileRes.value?.data || {};
          setProfileData({ id: u.id || '', name: u.name || '', email: u.email || '', role: u.role || 'user', panNumber: u.panNumber || '', createdAt: u.createdAt || '' });
          setAccForm({ name: u.name || '', panNumber: u.panNumber || '', phone: '' });
        }

        if (summaryRes.status === 'fulfilled') {
          const s = summaryRes.value?.data?.data || summaryRes.value?.data || {};
          setPortfolio({
            cashBalance:     Number(s.cashBalance     ?? 0),
            totalInvested:   Number(s.totalInvested   ?? 0),
            totalProfitLoss: Number(s.totalProfitLoss ?? 0),
            holdingsCount:   Number(s.holdingsCount   ?? 0),
          });
        }

        if (kycRes.status === 'fulfilled') {
          const k = kycRes.value?.data?.data || kycRes.value?.data || null;
          if (k) {
            setKycData(k);
            setKycEdit({ fullName: k.fullName || '', aadhaarNumber: k.aadhaarNumber || '', address: k.address || '' });
          }
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Validation helpers ────────────────────────────────────────────────────
  const accErrors = (() => {
    const e = {};
    if (!accForm.name.trim()) e.name = 'Name cannot be empty.';
    else if (/\d/.test(accForm.name)) e.name = 'Name cannot contain numbers.';
    if (accForm.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(accForm.panNumber)) e.panNumber = 'Invalid PAN (e.g. ABCDE1234F).';
    if (accForm.phone && !/^[6-9]\d{9}$/.test(accForm.phone)) e.phone = 'Enter valid 10-digit mobile.';
    return e;
  })();

  const kycErrors = (() => {
    const e = {};
    if (kycEdit.fullName !== undefined) {
      if (!kycEdit.fullName.trim()) e.fullName = 'Name cannot be empty.';
      else if (/\d/.test(kycEdit.fullName)) e.fullName = 'Name cannot contain numbers.';
    }
    if (kycEdit.aadhaarNumber && !/^\d{12}$/.test(kycEdit.aadhaarNumber.trim()))
      e.aadhaarNumber = 'Aadhaar must be exactly 12 digits.';
    if (kycEdit.address !== undefined && !kycEdit.address.trim()) e.address = 'Address cannot be empty.';
    return e;
  })();

  const inputCls = (form, field, touched) => {
    const base = 'w-full border p-3 rounded-xl focus:outline-none transition duration-200 mt-1 text-slate-800 text-sm font-medium ';
    if (!touched[field]) return base + 'border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white';
    const err = form === 'acc' ? accErrors[field] : kycErrors[field];
    return err
      ? base + 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-500'
      : base + 'border-emerald-400 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500';
  };

  // ── Save handlers ─────────────────────────────────────────────────────────
  const handleAccSave = async (e) => {
    e.preventDefault();
    setAccTouched({ name: true, panNumber: true, phone: true });
    if (Object.keys(accErrors).length) return;
    setAccSaving(true);
    try {
      const payload = {};
      if (accForm.name.trim()) payload.name = accForm.name.trim();
      if (accForm.panNumber.trim()) payload.panNumber = accForm.panNumber.trim().toUpperCase();
      const res = await apiClient.put('/user/profile', payload);
      const u = res?.data?.data || res?.data || {};
      setProfileData(p => ({ ...p, name: u.name || p.name, panNumber: u.panNumber || p.panNumber }));
      toast.success('Account settings saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save account settings.');
    } finally {
      setAccSaving(false);
    }
  };

  const handleKycSave = async (e) => {
    e.preventDefault();
    setKycTouched({ fullName: true, aadhaarNumber: true, address: true });
    if (Object.keys(kycErrors).length) return;
    setKycSaving(true);
    try {
      const payload = {};
      if (kycEdit.fullName.trim()) payload.fullName = kycEdit.fullName.trim();
      if (kycEdit.aadhaarNumber.trim()) payload.aadhaarNumber = kycEdit.aadhaarNumber.trim();
      if (kycEdit.address.trim()) payload.address = kycEdit.address.trim();
      const res = await apiClient.patch('/kyc/update', payload);
      const k = res?.data?.data || res?.data || {};
      setKycData(p => ({ ...p, fullName: k.fullName || p.fullName, aadhaarNumber: k.aadhaarNumber || p.aadhaarNumber, address: k.address || p.address }));
      toast.success('KYC details updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update KYC details.');
    } finally {
      setKycSaving(false);
    }
  };


  // ── Derived values ────────────────────────────────────────────────────────
  const pnl       = portfolio.totalProfitLoss;
  const invested  = portfolio.totalInvested;
  const nav       = portfolio.cashBalance + invested + pnl;
  const pnlPct    = invested > 0 ? ((pnl / invested) * 100).toFixed(1) : '0.0';
  const isPnlPos  = pnl >= 0;
  const fmt       = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const isKycOk   = kycData && String(kycData.status).toLowerCase() === 'approved';
  const initials  = profileData.name ? profileData.name.trim().charAt(0).toUpperCase() : 'S';
  const joinDate  = profileData.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  if (isLoading) return <Shimmer />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-sans">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


        {/* ══ LEFT — Avatar Card ══ */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 h-fit hover:shadow-2xl hover:shadow-slate-200/60 transition-shadow duration-300">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4 select-none">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profileData.name || '—'}</h2>
            <span className={`mt-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border font-mono ${
              isKycOk
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {isKycOk
                ? <><ShieldCheck className="inline w-3 h-3 mr-1" />Verified KYC</>
                : <><ShieldAlert className="inline w-3 h-3 mr-1" />{kycData ? kycData.status.toUpperCase() : 'KYC PENDING'}</>
              }
            </span>
            <p className="text-slate-400 text-xs mt-3 font-medium">Trader since {joinDate}</p>
          </div>

          <div className="border-t border-slate-100 mt-5 pt-5 space-y-1">
            <InfoRow label="Holdings" value={String(portfolio.holdingsCount)} masked={String(portfolio.holdingsCount)} show />
            <InfoRow label="Role" value={profileData.role.toUpperCase()} masked={profileData.role.toUpperCase()} show mono />
            <InfoRow
              label="Account ID"
              value={profileData.id}
              masked={maskId(profileData.id)}
              show={vis.id}
              onToggle={() => toggle('id')}
              mono
            />
            <InfoRow
              label="Email"
              value={profileData.email}
              masked={maskEmail(profileData.email)}
              show={vis.email}
              onToggle={() => toggle('email')}
            />
          </div>

          {!isKycOk && (
            <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed m-0">
                Trading is locked until KYC is <strong>APPROVED</strong> by an admin.
              </p>
            </div>
          )}
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Portfolio Performance */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-slate-200/60 transition-shadow duration-300">
            <h3 className="text-base font-bold text-slate-800 mb-4">Portfolio Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Net Worth</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{fmt(nav)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider font-mono">Cash Available</p>
                <p className="text-xl font-extrabold text-blue-800 mt-1">{fmt(portfolio.cashBalance)}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isPnlPos ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isPnlPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Unrealized P&amp;L
                </p>
                <p className={`text-xl font-extrabold mt-1 ${isPnlPos ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isPnlPos ? '+' : ''}{fmt(pnl)}{' '}
                  <span className="text-sm font-bold">({isPnlPos ? '+' : ''}{pnlPct}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* KYC Details Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 hover:shadow-2xl hover:shadow-indigo-100/40 transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">KYC Details</h3>
              {kycData && (
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border font-mono ${
                  isKycOk
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {kycData.status}
                </span>
              )}
            </div>

            {!kycData ? (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">KYC Not Submitted</p>
                  <p className="text-xs text-amber-600 mt-0.5">Submit your KYC documents to unlock full trading access.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Read-only info: PAN & DOB */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Read-only (cannot be changed)
                  </p>
                  <InfoRow
                    label="PAN Number"
                    value={kycData.panNumber}
                    masked={maskPan(kycData.panNumber)}
                    show={vis.pan}
                    onToggle={() => toggle('pan')}
                    mono
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={fmtDob(kycData.dob)}
                    masked={kycData.dob ? '••/••/••••' : '—'}
                    show={vis.dob}
                    onToggle={() => toggle('dob')}
                    mono
                  />
                </div>

                {/* Editable fields: name, aadhaar, address */}
                <form onSubmit={handleKycSave} className="space-y-5" noValidate>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editable Fields</p>

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name (as per Aadhaar)</label>
                    <input
                      type="text"
                      value={kycEdit.fullName}
                      onChange={e => { setKycEdit(p => ({ ...p, fullName: e.target.value })); setKycTouched(p => ({ ...p, fullName: true })); }}
                      className={inputCls('kyc', 'fullName', kycTouched)}
                      placeholder="Full name as per Aadhaar"
                    />
                    {kycTouched.fullName && kycErrors.fullName && <p className="text-rose-500 text-[11px] mt-1 font-medium">{kycErrors.fullName}</p>}
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Aadhaar Number</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={kycEdit.aadhaarNumber}
                      onChange={e => { setKycEdit(p => ({ ...p, aadhaarNumber: e.target.value.replace(/\D/g, '') })); setKycTouched(p => ({ ...p, aadhaarNumber: true })); }}
                      className={`${inputCls('kyc', 'aadhaarNumber', kycTouched)} font-mono tracking-widest`}
                      placeholder="12-digit Aadhaar number"
                    />
                    {kycTouched.aadhaarNumber && kycErrors.aadhaarNumber && <p className="text-rose-500 text-[11px] mt-1 font-medium">{kycErrors.aadhaarNumber}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Address</label>
                    <textarea
                      rows={3}
                      value={kycEdit.address}
                      onChange={e => { setKycEdit(p => ({ ...p, address: e.target.value })); setKycTouched(p => ({ ...p, address: true })); }}
                      className={`${inputCls('kyc', 'address', kycTouched)} resize-none`}
                      placeholder="Your full residential address"
                    />
                    {kycTouched.address && kycErrors.address && <p className="text-rose-500 text-[11px] mt-1 font-medium">{kycErrors.address}</p>}
                  </div>

                  <div className="flex items-center gap-4">
                    <button type="submit" disabled={kycSaving} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition active:scale-95 shadow-md shadow-indigo-600/20 text-sm cursor-pointer border-none">
                      {kycSaving ? 'Updating…' : 'Update KYC Details'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
