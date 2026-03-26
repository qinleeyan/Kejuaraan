import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Command Center — Rizzon TKD',
    robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    return children;
}
