import { Homepage } from '@/components/homepage';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Rizzon Taekwondo Dojang - Pendaftaran Kejuaraan & Pelatihan Elit',
  description: 'Pelatihan Taekwondo profesional dan pendaftaran kejuaraan. Bergabunglah dengan dojang elit kami untuk kompetisi kyorugi (tanding) dan poomsae (jurus) bersama instruktur sabuk hitam bersertifikat.',
  keywords: 'taekwondo, kejuaraan, kyorugi, poomsae, bela diri, kompetisi, pendaftaran, dojang',
  authors: [{ name: 'Rizzon Taekwondo Dojang' }],
  openGraph: {
    title: 'Rizzon Taekwondo Dojang - Keunggulan Kejuaraan',
    description: 'Platform pendaftaran kejuaraan dan pelatihan Taekwondo profesional',
    type: 'website',
    url: 'https://rizzonchampion.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizzon Taekwondo Dojang - Keunggulan Kejuaraan',
    description: 'Daftar kompetisi kejuaraan dan berlatih bersama para ahli',
  },
};

export const revalidate = 60; // ISR cache lifetime in seconds

export default async function Home() {
  let championships = [];

  try {
    const SCRIPT_URL = process.env.NEXT_PUBLIC_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwyIH06rsQuNvUJINSiIEnDaJbxZUXzZIar5vL_L8AAakjIjxyDzo2EfOFzWziOYkL1/exec';
    const res = await fetch(SCRIPT_URL, { next: { revalidate: 60 } });
    const data = await res.json();

    if (Array.isArray(data)) {
      championships = data
        .filter((item: any) => item.status === 1)
        .map((item: any) => ({
          id: item.id,
          name: item.nama,
          description: item.deskripsi,
          poster: item.poster || '',
          status: item.status
        }));
    }
  } catch (error) {
    console.error('Failed to fetch championships server-side:', error);
  }

  // Auto-scan gallery images from public/gambar_juara
  let galleryImages = [];
  try {
    const galleryPath = path.join(process.cwd(), 'public', 'gambar_juara');
    if (fs.existsSync(galleryPath)) {
      const files = fs.readdirSync(galleryPath);
      galleryImages = files
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map((file, index) => ({
          src: `/gambar_juara/${file}`,
          alt: `Gallery Image ${index + 1}`,
          title: `Moment ${index + 1}`,
        }));
    }
  } catch (error) {
    console.error('Failed to scan gallery images:', error);
  }

  return <Homepage championships={championships} galleryImages={galleryImages} />;
}
