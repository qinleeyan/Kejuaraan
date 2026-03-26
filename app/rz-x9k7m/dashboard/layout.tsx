'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

const NAV_ITEMS = [
    { label: 'Overview', href: '/rz-x9k7m/dashboard', icon: 'chart' },
    { label: 'Championships', href: '/rz-x9k7m/dashboard/championships', icon: 'trophy' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/rz-x9k7m?k=rizzon2026');
    };

    const isActive = (href: string) => {
        if (href === '/rz-x9k7m/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${collapsed ? 'w-16' : 'w-56'} bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Brand */}
                <div className={`p-4 border-b border-zinc-800 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <Image src="/logo.png" alt="Rizzon" width={36} height={36} className="rounded-xl shrink-0" />
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="font-bold text-sm truncate">Rizzon TKD</p>
                            <p className="text-[10px] text-zinc-500">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                            title={collapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href)
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            {item.icon === 'chart' && (
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            )}
                            {item.icon === 'trophy' && (
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            )}
                            {!collapsed && item.label}
                        </button>
                    ))}
                </nav>

                {/* Collapse + Logout */}
                <div className="p-2 border-t border-zinc-800 space-y-1">
                    <button onClick={() => setCollapsed(!collapsed)} className={`w-full flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all`}>
                        <svg className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        {!collapsed && 'Collapse'}
                    </button>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {!collapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Top Bar — minimal, no duplicate navbar */}
                <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-zinc-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                            <span className="text-[10px] font-bold text-primary">A</span>
                        </div>
                        <span className="text-xs text-zinc-500 hidden sm:inline">Admin</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
