import { Homepage } from '@/components/homepage';

export const metadata = {
  title: 'Elite Taekwondo Dojang - Championship Excellence & Registration',
  description: 'Professional Taekwondo training and championship registration. Join our elite dojang for kyorugi (sparring) and poomsae (forms) competitions with certified black belt instructors.',
  keywords: 'taekwondo, championship, kyorugi, poomsae, martial arts, competition, registration, dojang',
  authors: [{ name: 'Elite Taekwondo Dojang' }],
  openGraph: {
    title: 'Elite Taekwondo Dojang - Championship Excellence',
    description: 'Professional Taekwondo training and championship registration platform',
    type: 'website',
    url: 'https://elitetaekwondo.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elite Taekwondo Dojang - Championship Excellence',
    description: 'Register for championship competitions and train with experts',
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

  return <Homepage championships={championships} />;
}
