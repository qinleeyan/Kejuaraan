import Link from 'next/link';
import { RegistrationForm } from '@/components/registration-form';

export const metadata = {
  title: 'Pendaftaran Kejuaraan | Rizzon Taekwondo Dojang',
  description: 'Daftar kejuaraan Taekwondo. Isi informasi Anda dan berkompetisilah bersama para juara.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl py-8 md:py-16">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-xs font-semibold text-primary">Formulir Pendaftaran</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Pendaftaran <span className="text-primary">Kejuaraan</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Bergabunglah dalam Kejuaraan Taekwondo Rizzon 2024. Lengkapi formulir di bawah ini dengan informasi akurat untuk mengamankan slot Anda.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border-2 border-border rounded-xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8">
          <RegistrationForm />
        </div>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1h2v2H7V4zm2 4H7v2h2V8zm2-4h2v2h-2V4zm2 4h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tips Pengisian</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Semua kolom wajib diisi</li>
                  <li>✓ Data tersimpan otomatis</li>
                  <li>✓ Bisa kembali kapan saja</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/5 border-2 border-secondary/20 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z" />
              </svg>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Persyaratan</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Tinggi/berat bilangan bulat</li>
                  <li>✓ Tanggal lahir yang valid</li>
                  <li>✓ Aman & rahasia</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Rizzon Taekwondo Dojang</h3>
              <p className="text-primary-foreground/70 text-sm">Developing champions through excellence, discipline, and dedication.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Kembali ke Beranda</Link></li>

              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Info Kontak</h4>
              <p className="text-primary-foreground/70 text-sm">
                Email: info@rizzon.com<br />
                Telepon: +62 813-1533-6286
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/70">
            <p>&copy; 2024 Rizzon Taekwondo Dojang. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
