'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exportToCSV, exportToXLSX } from '@/lib/export-utils';

const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwyIH06rsQuNvUJINSiIEnDaJbxZUXzZIar5vL_L8AAakjIjxyDzo2EfOFzWziOYkL1/exec';
const PER_PAGE = 10;

interface Athlete {
    rowIndex: number; timestamp: string; registrationId: string; idKejuaraan: string;
    nama: string; gender: string; sabuk: string; tempatTanggalLahir: string;
    dojang: string; berat: string; tinggi: string; kategori: string; kelas: string;
}
interface Competition { id: string; nama: string; }

export default function ChampionshipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const champId = params.id as string;

    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [allComps, setAllComps] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMigrateModal, setShowMigrateModal] = useState(false);
    const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
    const [migrateTarget, setMigrateTarget] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Search, filter, pagination
    const [search, setSearch] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [filterKelas, setFilterKelas] = useState('');
    const [page, setPage] = useState(1);

    const [form, setForm] = useState({
        nama: '', gender: '', sabuk: '', tempatTanggalLahir: '', dojang: '',
        berat: '', tinggi: '', kategori: '', kelas: '',
    });

    const fetchAthletes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${SCRIPT_URL}?action=getAthletes&competitionId=${champId}&search=${encodeURIComponent(search)}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (Array.isArray(data)) setAthletes(data);
        } catch (err: any) {
            console.error('Failed to fetch athletes:', err);
        } finally {
            setLoading(false);
        }
    };
    const fetchComps = async () => {
        try { const res = await fetch(SCRIPT_URL); const data = await res.json(); if (Array.isArray(data)) setAllComps(data); } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchAthletes(); }, 300);
        return () => clearTimeout(timer);
    }, [champId, search]);

    useEffect(() => { fetchComps(); }, []); // Fetch competitions only once

    // Filtered + searched athletes (now only for client-side filtering of already fetched data)
    const filtered = useMemo(() => {
        let f = athletes;
        if (search) {
            const s = search.toLowerCase();
            f = f.filter(a => a.nama.toLowerCase().includes(s) || a.dojang?.toLowerCase().includes(s) || a.registrationId?.toLowerCase().includes(s));
        }
        if (filterGender) f = f.filter(a => a.gender === filterGender);
        if (filterKategori) f = f.filter(a => a.kategori === filterKategori);
        if (filterKelas) f = f.filter(a => a.kelas === filterKelas);
        return f;
    }, [athletes, search, filterGender, filterKategori, filterKelas]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Summary stats
    const summaryStats = useMemo(() => {
        const g: Record<string, number> = {};
        const k: Record<string, number> = {};
        const kl: Record<string, number> = {};
        athletes.forEach(a => {
            g[a.gender] = (g[a.gender] || 0) + 1;
            k[a.kategori] = (k[a.kategori] || 0) + 1;
            kl[a.kelas] = (kl[a.kelas] || 0) + 1;
        });
        return { gender: g, kategori: k, kelas: kl };
    }, [athletes]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [search, filterGender, filterKategori, filterKelas]);

    const openAdd = () => { setEditingAthlete(null); setForm({ nama: '', gender: '', sabuk: '', tempatTanggalLahir: '', dojang: '', berat: '', tinggi: '', kategori: '', kelas: '' }); setShowEditModal(true); };
    const openEdit = (a: Athlete) => { setEditingAthlete(a); setForm({ nama: a.nama, gender: a.gender, sabuk: a.sabuk, tempatTanggalLahir: a.tempatTanggalLahir, dojang: a.dojang, berat: a.berat, tinggi: a.tinggi, kategori: a.kategori, kelas: a.kelas }); setShowEditModal(true); };

    const handleSave = async () => {
        if (!form.nama || !form.gender || !form.sabuk) { alert('Nama, Gender, dan Sabuk wajib diisi!'); return; }
        setSubmitting(true);
        try {
            let res;
            if (editingAthlete) {
                res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'update', rowIndex: editingAthlete.rowIndex, registrationId: editingAthlete.registrationId, ...form }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            } else {
                res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'create', idKejuaraan: champId, ...form }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            }
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowEditModal(false); setLoading(true); await fetchAthletes();
        } catch (err: any) { alert('Gagal: ' + (err.message || err)); } finally { setSubmitting(false); }
    };

    const handleDelete = async (a: Athlete) => {
        if (!confirm(`Hapus atlet "${a.nama}"?`)) return;
        setLoading(true);
        try {
            const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', rowIndex: a.rowIndex }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await fetchAthletes();
        }
        catch (err: any) { alert('Gagal menghapus: ' + (err.message || err)); setLoading(false); }
    };

    const toggleSelect = (ri: number) => setSelected(p => { const n = new Set(p); n.has(ri) ? n.delete(ri) : n.add(ri); return n; });
    const selectAll = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(a => a.rowIndex))); };

    const handleMigrate = async () => {
        if (!migrateTarget || selected.size === 0) return;
        if (!confirm(`Migrasi ${selected.size} atlet?`)) return;
        setSubmitting(true);
        try {
            const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'migrateAthletes', rowIndices: JSON.stringify(Array.from(selected)), targetCompetitionId: migrateTarget }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setShowMigrateModal(false); setSelected(new Set()); setLoading(true); await fetchAthletes();
        } catch (err: any) { alert('Gagal: ' + (err.message || err)); } finally { setSubmitting(false); }
    };

    const handleDeleteSelected = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Hapus ${selected.size} atlet?`)) return;
        setLoading(true);
        try {
            const sorted = Array.from(selected).sort((a, b) => b - a);
            for (const ri of sorted) {
                const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', rowIndex: ri }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
            }
            setSelected(new Set()); await fetchAthletes();
        } catch (err: any) { alert('Gagal: ' + (err.message || err)); setLoading(false); }
    };

    const doExport = (fmt: 'csv' | 'xlsx') => {
        const data = athletes.map(a => ({ 'Reg ID': a.registrationId, Name: a.nama, Gender: a.gender, Belt: a.sabuk, 'DOB/Place': a.tempatTanggalLahir, Dojang: a.dojang, 'Weight': a.berat, 'Height': a.tinggi, Category: a.kategori, Class: a.kelas, Registered: a.timestamp }));
        fmt === 'csv' ? exportToCSV(data, `athletes-${champId}`) : exportToXLSX(data, `athletes-${champId}`);
    };

    const compName = allComps.find(c => c.id === champId)?.nama || champId;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/rz-x9k7m/dashboard/championships')} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{compName}</h1>
                        <p className="text-xs text-zinc-500">{athletes.length} atlet terdaftar</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <button onClick={openAdd} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:bg-primary/90">+ Add</button>
                    {selected.size > 0 && (
                        <>
                            <button onClick={() => { setMigrateTarget(''); setShowMigrateModal(true); }} className="px-3 py-1.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-[10px] font-bold hover:bg-violet-500/30">Migrate ({selected.size})</button>
                            <button onClick={handleDeleteSelected} className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold hover:bg-red-500/30">Delete ({selected.size})</button>
                        </>
                    )}
                    <button onClick={() => doExport('csv')} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-semibold hover:bg-zinc-700">CSV</button>
                    <button onClick={() => doExport('xlsx')} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-semibold hover:bg-zinc-700">XLSX</button>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4 mt-2">
                <MiniStat label="Total Atlet" value={athletes.length} color="text-white" />
                <MiniStat label="Laki-laki" value={summaryStats.gender['Laki-laki'] || 0} color="text-blue-400" />
                <MiniStat label="Perempuan" value={summaryStats.gender['Perempuan'] || 0} color="text-pink-400" />
                <MiniStat label="Kyorugi" value={summaryStats.kategori['Kyorugi'] || 0} color="text-amber-400" />
                <MiniStat label="Poomsae" value={summaryStats.kategori['Poomsae'] || 0} color="text-indigo-400" />
                <MiniStat label="Prestasi" value={summaryStats.kelas['Prestasi'] || 0} color="text-rose-400" />
                <MiniStat label="Pemula" value={summaryStats.kelas['Pemula'] || 0} color="text-emerald-400" />
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-2">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cari nama, dojang, atau ID..." className="flex-1 min-w-[200px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary" />
                <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300">
                    <option value="">Semua Gender</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
                <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300">
                    <option value="">Semua Kategori</option>
                    <option value="Kyorugi">Kyorugi</option>
                    <option value="Poomsae">Poomsae</option>
                </select>
                <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300">
                    <option value="">Semua Kelas</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Pemula">Pemula</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left">
                                <th className="p-3"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">No</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Nama</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Gender</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Sabuk</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Kategori</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Kelas</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">T/B</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Dojang</th>
                                <th className="p-3 text-[10px] font-semibold text-zinc-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={10} className="p-6 text-center text-zinc-600 text-xs">Tidak ada data ditemukan.</td></tr>
                            ) : paginated.map((a, i) => (
                                <tr key={a.rowIndex} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-3"><input type="checkbox" checked={selected.has(a.rowIndex)} onChange={() => toggleSelect(a.rowIndex)} /></td>
                                    <td className="p-3 text-zinc-600 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                                    <td className="p-3 font-semibold text-white text-xs">{a.nama}</td>
                                    <td className="p-3 text-zinc-400 text-xs">{a.gender}</td>
                                    <td className="p-3"><span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-medium">{a.sabuk}</span></td>
                                    <td className="p-3 text-zinc-400 text-xs">{a.kategori}</td>
                                    <td className="p-3 text-zinc-400 text-xs">{a.kelas}</td>
                                    <td className="p-3 text-zinc-400 text-xs">{a.tinggi}/{a.berat}</td>
                                    <td className="p-3 text-zinc-500 text-[10px]">{a.dojang}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(a)} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-[10px] hover:bg-zinc-700">Edit</button>
                                            <button onClick={() => handleDelete(a)} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-[10px] hover:bg-red-500/20">Del</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500">Menampilkan {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} atlet</p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded text-[10px] hover:bg-zinc-700 disabled:opacity-30">← Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 rounded text-[10px] font-semibold ${p === page ? 'bg-primary text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 rounded text-[10px] hover:bg-zinc-700 disabled:opacity-30">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit/Add Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold">{editingAthlete ? 'Edit Atlet' : 'Tambah Atlet'}</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2"><label className="block text-xs font-semibold text-zinc-400 mb-1">Nama</label><input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Gender</label><select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"><option value="">Select</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Sabuk</label><input value={form.sabuk} onChange={e => setForm(p => ({ ...p, sabuk: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                            <div className="col-span-2"><label className="block text-xs font-semibold text-zinc-400 mb-1">Tempat, Tanggal Lahir</label><input value={form.tempatTanggalLahir} onChange={e => setForm(p => ({ ...p, tempatTanggalLahir: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Dojang</label><input value={form.dojang} onChange={e => setForm(p => ({ ...p, dojang: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Kategori</label><select value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"><option value="">Select</option><option value="Kyorugi">Kyorugi</option><option value="Poomsae">Poomsae</option></select></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Kelas</label><select value={form.kelas} onChange={e => setForm(p => ({ ...p, kelas: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm"><option value="">Select</option><option value="Prestasi">Prestasi</option><option value="Pemula">Pemula</option></select></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Berat (kg)</label><input value={form.berat} onChange={e => setForm(p => ({ ...p, berat: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                            <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Tinggi (cm)</label><input value={form.tinggi} onChange={e => setForm(p => ({ ...p, tinggi: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" /></div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700">Batal</button>
                            <button onClick={handleSave} disabled={submitting} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50">{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Migrate Modal */}
            {showMigrateModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowMigrateModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold">Migrasi {selected.size} Atlet</h2>
                        <p className="text-sm text-zinc-400">Pilih kejuaraan tujuan:</p>
                        <select value={migrateTarget} onChange={e => setMigrateTarget(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm">
                            <option value="">-- Pilih Kejuaraan --</option>
                            {allComps.filter(c => c.id !== champId).map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                        </select>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowMigrateModal(false)} className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700">Batal</button>
                            <button onClick={handleMigrate} disabled={submitting || !migrateTarget} className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50">{submitting ? 'Memindahkan...' : 'Migrasi'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
    const isPrimary = color.includes('primary') || color.includes('white');
    const isBlue = color.includes('blue');
    const isPink = color.includes('pink');
    const isEmerald = color.includes('emerald');
    const isAmber = color.includes('amber');
    const isIndigo = color.includes('indigo');
    const isRose = color.includes('rose');

    let borderColor = "border-zinc-800";
    let bgHover = "hover:border-zinc-600";

    if (isPrimary) { borderColor = "border-zinc-700/50"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] hover:border-zinc-500/80"; }
    else if (isBlue) { borderColor = "border-blue-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] hover:border-blue-500/50"; }
    else if (isPink) { borderColor = "border-pink-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)] hover:border-pink-500/50"; }
    else if (isEmerald) { borderColor = "border-emerald-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:border-emerald-500/50"; }
    else if (isAmber) { borderColor = "border-amber-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] hover:border-amber-500/50"; }
    else if (isIndigo) { borderColor = "border-indigo-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] hover:border-indigo-500/50"; }
    else if (isRose) { borderColor = "border-rose-500/20"; bgHover = "hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)] hover:border-rose-500/50"; }

    return (
        <div className={`relative overflow-hidden rounded-2xl px-4 py-4 border bg-zinc-900/60 backdrop-blur-xl ${borderColor} ${bgHover} transition-all duration-500 group flex flex-col justify-between min-h-[90px] cursor-default`}>
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 ${color.replace('text-', 'bg-')}`} />
            <p className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase relative z-10">{label}</p>
            <p className={`text-4xl sm:text-5xl mt-1 font-black tracking-tighter ${color} drop-shadow-md relative z-10 group-hover:scale-105 origin-left transition-transform duration-500`}>{value}</p>
        </div>
    );
}
