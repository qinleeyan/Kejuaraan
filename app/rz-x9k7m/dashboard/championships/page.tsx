'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwyIH06rsQuNvUJINSiIEnDaJbxZUXzZIar5vL_L8AAakjIjxyDzo2EfOFzWziOYkL1/exec';

interface Competition {
    id: string;
    nama: string;
    deskripsi: string;
    poster: string;
    status: number;
}

const getDriveImageSrc = (url?: string) => {
    if (!url) return '';
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return url;
};

export default function ChampionshipsPage() {
    const router = useRouter();
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingComp, setEditingComp] = useState<Competition | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ id: '', nama: '', deskripsi: '', poster: '', status: 1 });
    const [posterPreview, setPosterPreview] = useState<string>('');
    const [posterBase64, setPosterBase64] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCompetitions = async () => {
        try {
            const res = await fetch(SCRIPT_URL);
            const data = await res.json();
            if (Array.isArray(data)) setCompetitions(data);
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCompetitions(); }, []);

    const openCreate = () => {
        setEditingComp(null);
        setForm({ id: '', nama: '', deskripsi: '', poster: '', status: 1 });
        setPosterPreview('');
        setPosterBase64('');
        setShowModal(true);
    };

    const openEdit = (comp: Competition) => {
        setEditingComp(comp);
        setForm({ id: comp.id, nama: comp.nama, deskripsi: comp.deskripsi, poster: comp.poster, status: comp.status });
        setPosterPreview(comp.poster || '');
        setPosterBase64('');
        setShowModal(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setPosterPreview(result);
            setPosterBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!form.id || !form.nama || !form.deskripsi) {
            alert('ID, Nama, dan Deskripsi wajib diisi!');
            return;
        }
        setSubmitting(true);
        try {
            const action = editingComp ? 'updateCompetition' : 'createCompetition';
            const payload: Record<string, unknown> = { action, ...form };

            if (posterBase64) {
                payload.posterBase64 = posterBase64;
                payload.posterFileName = `POSTER_${form.id}.jpg`;
            }

            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setShowModal(false);
            setLoading(true);
            await fetchCompetitions();
        } catch (err: any) {
            alert('Gagal menyimpan: ' + (err.message || err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (comp: Competition) => {
        if (!confirm(`Hapus kejuaraan "${comp.nama}"?\n\nSEMUA ATLET yang terdaftar juga akan DIHAPUS!`)) return;
        setLoading(true);
        try {
            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteCompetition', id: comp.id }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            await fetchCompetitions();
        } catch (err: any) {
            alert('Gagal menghapus: ' + (err.message || err));
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">Championships</h1>
                    <p className="text-xs text-zinc-500">{competitions.length} total</p>
                </div>
                <button onClick={openCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add
                </button>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {competitions.map(comp => (
                    <div key={comp.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
                        {/* Poster */}
                        <div className="h-32 bg-zinc-800 relative overflow-hidden">
                            {comp.poster ? (
                                <img src={getDriveImageSrc(comp.poster)} alt={comp.nama} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                            )}
                            <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${comp.status === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'}`}>
                                {comp.status === 1 ? 'Active' : 'Hidden'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-bold text-sm text-white truncate">{comp.nama}</h3>
                            <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{comp.deskripsi}</p>

                            {/* Actions — clean, no toggle button here */}
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => router.push(`/rz-x9k7m/dashboard/championships/${comp.id}`)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors">
                                    Athletes
                                </button>
                                <button onClick={() => openEdit(comp)} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-colors">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(comp)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors">
                                    Del
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold">{editingComp ? 'Edit Championship' : 'Add Championship'}</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase">ID (slug)</label>
                                <input value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value }))} disabled={!!editingComp} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm disabled:opacity-50" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase">Name</label>
                                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase">Description</label>
                                <textarea value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm resize-none" />
                            </div>

                            {/* Poster Upload */}
                            <div>
                                <label className="block text-[10px] font-semibold text-zinc-400 mb-1 uppercase">Poster</label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 border-dashed rounded-xl text-zinc-400 text-xs hover:bg-zinc-750 transition-colors">
                                    {posterPreview ? 'Change Image' : '📁 Upload Poster Image'}
                                </button>
                                {posterPreview && (
                                    <div className="mt-2 rounded-lg overflow-hidden h-28">
                                        <img src={getDriveImageSrc(posterPreview)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Status Toggle — inside modal */}
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Status</label>
                                <button type="button" onClick={() => setForm(p => ({ ...p, status: p.status === 1 ? 0 : 1 }))} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${form.status === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-700 text-zinc-400 border border-zinc-600'}`}>
                                    {form.status === 1 ? '✓ Active' : '✗ Hidden'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700">Cancel</button>
                            <button onClick={handleSave} disabled={submitting} className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                                {submitting ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
