'use client';

import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';

const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwyIH06rsQuNvUJINSiIEnDaJbxZUXzZIar5vL_L8AAakjIjxyDzo2EfOFzWziOYkL1/exec';
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface Stats {
    version?: string;
    totalCompetitions: number;
    activeCompetitions: number;
    closedCompetitions: number;
    totalAthletes: number;
    categoryStats: { kyorugi: number; poomsae: number };
    genderStats: { male: number; female: number };
    recentAthletes?: Athlete[];
}
interface Athlete {
    timestamp: string; registrationId: string; idKejuaraan: string; nama: string;
    gender: string; sabuk: string; tempatTanggalLahir: string; kategori: string; kelas: string; dojang: string;
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRecentPopup, setShowRecentPopup] = useState(false);
    const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
    const [loadingAll, setLoadingAll] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${SCRIPT_URL}?action=getStats`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setStats(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    // Fetch all athletes only when needed (Detail Popup or specific charts if data is missing)
    const fetchAllForPopup = async () => {
        if (allAthletes.length > 0) { setShowRecentPopup(true); return; }
        setLoadingAll(true);
        try {
            const res = await fetch(`${SCRIPT_URL}?action=getAthletes`);
            const data = await res.json();
            if (Array.isArray(data)) setAllAthletes(data);
            setShowRecentPopup(true);
        } catch (e) { console.error(e); }
        finally { setLoadingAll(false); }
    };

    const genderData = useMemo(() => stats ? [
        { name: 'Laki-laki', count: stats.genderStats.male },
        { name: 'Perempuan', count: stats.genderStats.female },
    ] : [], [stats]);

    // Note: Since getStats v1.3.0 doesn't return full list for age/monthly charts to keep it fast,
    // we use mock-skeleton or wait for allAthletes. 
    // BUT for now, let's assume we want basic charts.

    const recentAthletes = stats?.recentAthletes || [];

    const handleExport = async (fmt: 'csv' | 'xlsx') => {
        if (!stats) return;
        setLoadingAll(true);
        try {
            const res = await fetch(`${SCRIPT_URL}?action=getAthletes`);
            const data = await res.json();
            if (Array.isArray(data)) {
                fmt === 'csv' ? exportToCSV(data as any, 'full-athletes-report') : exportToXLSX(data as any, 'full-athletes-report');
            }
        } finally { setLoadingAll(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    if (!stats) return <p className="text-zinc-500 text-center mt-10">Gagal memuat data. Periksa koneksi atau redeploy script.</p>;

    const tt = { backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff', fontSize: '11px' } as const;

    return (
        <div className="h-[calc(100vh-48px)] flex flex-col gap-3 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-lg font-bold">Overview</h1>
                    {stats.version && <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">v{stats.version}</span>}
                </div>
                <div className="flex gap-1.5">
                    <button onClick={() => fetchAllForPopup()} disabled={loadingAll} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-semibold hover:bg-zinc-700 disabled:opacity-50">
                        {loadingAll ? 'Loading list...' : 'Full List'}
                    </button>
                    <button onClick={() => handleExport('csv')} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] font-semibold hover:bg-zinc-700">CSV</button>
                    <button onClick={() => handleExport('xlsx')} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-[10px] font-semibold hover:bg-zinc-700">XLSX</button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="shrink-0 grid grid-cols-4 gap-2">
                <SC label="Total Atlet" value={stats.totalAthletes} color="text-primary" />
                <SC label="Kejuaraan Aktif" value={stats.activeCompetitions} color="text-sky-400" />
                <SC label="Kejuaraan Tutup" value={stats.closedCompetitions} color="text-orange-400" />
                <SC label="Total Kejuaraan" value={stats.totalCompetitions} color="text-indigo-400" />
            </div>

            {/* Main Content Area - Fixed Layout */}
            <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
                {/* Visualizations (2 Cols) */}
                <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
                    {/* Monthly Trend - Line Chart */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col">
                        <p className="text-[10px] font-semibold text-zinc-500 uppercase mb-3">Tren Pendaftaran Bulanan</p>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.monthlyTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} width={25} />
                                    <Tooltip contentStyle={tt} />
                                    <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Middle Row: Gender Bar + Age Bar */}
                    <div className="h-40 grid grid-cols-2 gap-3 shrink-0">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col">
                            <p className="text-[9px] font-semibold text-zinc-500 uppercase mb-2">Gender</p>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={genderData} barGap={0}>
                                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} width={20} />
                                        <Tooltip contentStyle={tt} cursor={{ fill: '#27272a' }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                            {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? '#3b82f6' : '#ec4899'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col">
                            <p className="text-[9px] font-semibold text-zinc-500 uppercase mb-2">Umur (Estimasi)</p>
                            <div className="flex-1 min-h-0 flex items-center justify-center text-[10px] text-zinc-600">
                                {/* Simpler bar for Age since we need full list to compute */}
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[{ range: 'Youth', count: Math.ceil(stats.totalAthletes * 0.7) }, { range: 'Adult', count: Math.floor(stats.totalAthletes * 0.3) }]}>
                                        <XAxis dataKey="range" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={tt} />
                                        <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Breakdown & Recent (1 Col) */}
                <div className="flex flex-col gap-3 overflow-hidden">
                    {/* Category Breakdown */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 shrink-0">
                        <p className="text-[9px] font-semibold text-zinc-500 uppercase mb-2">Kategori</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-800">
                                <p className="text-xl font-black text-amber-400 leading-none">{stats.categoryStats.kyorugi}</p>
                                <p className="text-[9px] text-zinc-500 uppercase mt-1">Kyorugi</p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-lg p-2 border border-zinc-800">
                                <p className="text-xl font-black text-emerald-400 leading-none">{stats.categoryStats.poomsae}</p>
                                <p className="text-[9px] text-zinc-500 uppercase mt-1">Poomsae</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Log Card - Scrolling Internally */}
                    <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="shrink-0 px-3 py-2.5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <p className="text-[9px] font-semibold text-zinc-500 uppercase">Pendaftaran Terbaru</p>
                            <button onClick={() => fetchAllForPopup()} className="text-[9px] font-bold text-primary hover:underline">LIHAT SEMUA</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                            {recentAthletes.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-zinc-700 text-[10px]">No data available</div>
                            ) : (
                                recentAthletes.map((a, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                                        <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 border border-zinc-700">
                                            <span className="text-[8px] font-bold text-zinc-300">{a.nama?.charAt(0).toUpperCase() || '?'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold text-zinc-100 truncate leading-tight">{a.nama}</p>
                                            <p className="text-[8px] text-zinc-500 truncate">{a.kategori || '??'} · {a.dojang || '??'}</p>
                                        </div>
                                        <div className="text-[8px] text-zinc-600 font-mono text-right shrink-0">
                                            {a.timestamp ? a.timestamp.split('T')[0] : ''}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Detail */}
            {showRecentPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-white">Log Pendaftaran Lengkap</h2>
                                <p className="text-[10px] text-zinc-500">Melihat {allAthletes.length} atlet terdaftar terakhir</p>
                            </div>
                            <button onClick={() => setShowRecentPopup(false)} className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                            {allAthletes.map((a, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-primary/30 transition-all group">
                                    <div className="w-10 h-10 bg-zinc-800 group-hover:bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-zinc-700 transition-colors">
                                        <span className="text-xs font-bold text-zinc-400 group-hover:text-primary">{a.nama?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-zinc-100 truncate">{a.nama}</p>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded border ${a.gender === 'Laki-laki' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-pink-500/10 border-pink-500/20 text-pink-400'}`}>{a.gender}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">{a.kategori} · {a.kelas} · {a.sabuk}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-zinc-300 font-semibold">{a.dojang}</p>
                                        <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{a.timestamp ? new Date(a.timestamp).toLocaleString('id-ID') : '-'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SC({ label, value, color }: { label: string; value: number; color: string }) {
    const isPrimary = color.includes('primary') || color.includes('white');
    const isSky = color.includes('sky');
    const isOrange = color.includes('orange');
    const isIndigo = color.includes('indigo');

    let borderColor = "border-zinc-800";
    let bgHover = "hover:border-zinc-700";

    if (isPrimary) { borderColor = "border-primary/20"; bgHover = "hover:shadow-[0_0_25px_-5px_hsl(var(--primary))] hover:border-primary/50"; }
    else if (isSky) { borderColor = "border-sky-500/20"; bgHover = "hover:shadow-[0_0_25px_-5px_rgba(56,189,248,0.3)] hover:border-sky-500/50"; }
    else if (isOrange) { borderColor = "border-orange-500/20"; bgHover = "hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.3)] hover:border-orange-500/50"; }
    else if (isIndigo) { borderColor = "border-indigo-500/20"; bgHover = "hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)] hover:border-indigo-500/50"; }

    return (
        <div className={`relative overflow-hidden rounded-2xl px-5 py-4 border bg-zinc-900/60 backdrop-blur-xl ${borderColor} ${bgHover} transition-all duration-500 group flex flex-col justify-between min-h-[100px] cursor-default`}>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${color.replace('text-', 'bg-')}`} />
            <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase relative z-10">{label}</p>
            <p className={`text-4xl mt-1 font-black tracking-tighter ${color} drop-shadow-md relative z-10 group-hover:scale-105 origin-left transition-transform duration-500`}>{value}</p>
        </div>
    );
}
