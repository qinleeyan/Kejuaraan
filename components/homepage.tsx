import Link from 'next/link';
import { ImageCarousel } from './image-carousel';
import { ChampionshipsSection } from './championships-section';

export const Homepage = ({ championships = [] }: { championships?: any[] }) => {
  return (
    <div className="w-full">


      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted py-8 lg:py-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInUp">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-8 backdrop-blur-md shadow-sm">
                <span className="w-2.5 h-2.5 bg-primary animate-pulse rounded-full" />
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">Championship Ready</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight text-balance leading-tight">
                Rizzon Taekwondo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Excellence</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg text-pretty font-medium leading-relaxed">
                Train with champions. Compete with honor. Master the martial art of Taekwondo in
                our world-class dojang with certified instructors.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/#championships"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_hsl(var(--primary))] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 group"
                >
                  <span>Register for Championship</span>
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>

              </div>

            </div>

            {/* Hero Carousel */}
            <div className="relative animate-slideInDown hidden md:block">
              <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-black/5 dark:ring-white/10">
                <ImageCarousel
                  images={[
                    {
                      src: '/gambar_juara/gambar1.jpeg',
                      alt: 'Championship Image 1',
                      title: 'Championship Moment 1',
                    },
                    {
                      src: '/gambar_juara/gambar2.jpeg',
                      alt: 'Championship Image 2',
                      title: 'Championship Moment 2',
                    },
                    {
                      src: '/gambar_juara/gambar3.jpeg',
                      alt: 'Championship Image 3',
                      title: 'Championship Moment 3',
                    },
                    {
                      src: '/gambar_juara/gambar4.jpeg',
                      alt: 'Championship Image 4',
                      title: 'Championship Moment 4',
                    },
                    {
                      src: '/gambar_juara/gambar5.jpeg',
                      alt: 'Championship Image 5',
                      title: 'Championship Moment 5',
                    },
                    {
                      src: '/gambar_juara/gambar6.jpeg',
                      alt: 'Championship Image 6',
                      title: 'Championship Moment 6',
                    },
                    {
                      src: '/gambar_juara/gambar7.jpeg',
                      alt: 'Championship Image 7',
                      title: 'Championship Moment 7',
                    },
                  ]}
                  autoPlay={true}
                  interval={5000}
                />
              </div>

              {/* Decorative Blur Elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-[3rem] -z-10 animate-pulse" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/20 rounded-full blur-[3rem] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>



      {/* Programs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Programs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the competition format that matches your style and skill level
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Kyorugi (Sparring)',
                colorClass: 'primary',
                bgClass: 'bg-primary/5',
                borderClass: 'border-primary/20',
                textClass: 'text-primary',
                description:
                  'High-energy combat sparring competition featuring dynamic foot and fist techniques',
                highlights: [
                  'Full contact sparring',
                  'Olympic style competition',
                  'Multiple weight categories',
                  'Fast-paced action',
                ],
              },
              {
                title: 'Poomsae (Forms)',
                colorClass: 'secondary',
                bgClass: 'bg-secondary/5',
                borderClass: 'border-secondary/20',
                textClass: 'text-secondary',
                description:
                  'Demonstrate technical perfection through choreographed movement patterns and forms',
                highlights: [
                  'Technical precision',
                  'Artistic expression',
                  'Traditional patterns',
                  'Individual and team categories',
                ],
              },
            ].map((program, index) => (
              <div
                key={index}
                className={`p-8 ${program.bgClass} border-2 ${program.borderClass} rounded-xl hover:shadow-md transition-all duration-300`}
              >
                <h3 className={`text-2xl font-bold ${program.textClass} mb-3`}>{program.title}</h3>
                <p className="text-muted-foreground mb-6">{program.description}</p>
                <ul className="space-y-3">
                  {program.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground">
                      <span className={`w-2.5 h-2.5 ${program.textClass} rounded-full flex-shrink-0`} />
                      <span className="text-sm font-medium">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Championships Section */}
      <ChampionshipsSection initialChampionships={championships} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Join the Championship?
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Register now for the upcoming championship and compete at the highest level. Limited
            spots available.
          </p>

          <Link
            href="#championships"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Complete Your Registration
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Rizzon Taekwondo Dojang</h3>
              <p className="text-primary-foreground/70">
                Developing champions through excellence, discipline, and dedication.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">

                <li>
                  <a href="#programs" className="hover:text-primary-foreground transition-colors">
                    Programs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-primary-foreground/70">
                Email: info@elitetaekwondo.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/70">
            <p>&copy; 2024 Rizzon Taekwondo Dojang. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
