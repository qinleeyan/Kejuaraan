'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Championship {
  id: string;
  name: string;
  description: string;
  poster?: string;
  status: number;
}

// Transform Google Drive uc?id= URL to thumbnail endpoint to bypass image blocking
const getDriveImageSrc = (url?: string) => {
  if (!url) return '';
  const match = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
};

export const ChampionshipsSection = ({ initialChampionships = [] }: { initialChampionships?: Championship[] }) => {
  const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);

  const openModal = (championship: Championship) => {
    setSelectedChampionship(championship);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedChampionship(null);
    document.body.style.overflow = 'unset';
  };
  return (
    <section id="championships" className="py-16 md:py-24" data-section="championships">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Kejuaraan Mendatang</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Daftar <span className="text-primary">Kejuaraan</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih dari daftar agenda kejuaraan kami yang seru dan daftar untuk bertanding dengan atlet taekwondo elit lainnya.
          </p>
        </div>

        {/* Championships Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {initialChampionships.length > 0 ? (
            initialChampionships.map((championship) => (
              <div
                key={championship.id}
                className="group bg-card border-2 border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Poster Image */}
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={getDriveImageSrc(championship.poster) || '/placeholder.svg'}
                    alt={`${championship.name} poster`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4 flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {championship.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {championship.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <button
                      onClick={() => openModal(championship)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-primary/20 bg-primary/5 text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all duration-200"
                    >
                      Detail
                    </button>
                    <Link
                      href={`/${championship.id}/register`}
                      className="flex-[2] inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 group-hover:shadow-md"
                    >
                      <span>Daftar</span>
                      <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-muted/50 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-bold text-foreground mb-2">Tidak Ada Kejuaraan Aktif</h3>
              <p className="text-muted-foreground">Silakan cek kembali nanti untuk agenda turnamen mendatang.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedChampionship && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-card border-2 border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] md:h-[600px] overflow-hidden flex flex-col animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-2xl font-semibold text-foreground pr-4 line-clamp-1">{selectedChampionship.name}</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Side-by-Side) */}
            <div className="flex-1 overflow-hidden">
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Side: Poster */}
                <div className="md:w-2/5 bg-muted/50 flex items-center justify-center border-b md:border-b-0 md:border-r border-border overflow-hidden md:p-6">
                  <img
                    src={getDriveImageSrc(selectedChampionship.poster) || '/placeholder.svg'}
                    alt={selectedChampionship.name}
                    className="w-full h-full object-contain drop-shadow-md rounded-lg bg-background"
                  />
                </div>

                {/* Right Side: Content */}
                <div className="md:w-3/5 flex flex-col h-full bg-card">
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Deskripsi Acara
                    </h4>
                    <div className="prose prose-invert max-w-none pb-4">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">
                        {selectedChampionship.description}
                      </p>
                    </div>
                  </div>

                  {/* Register Button in Column */}
                  <div className="p-6 md:px-8 pt-4 border-t border-border bg-card/95 shrink-0 space-y-3">
                    <Link
                      href={`/${selectedChampionship.id}/register`}
                      onClick={closeModal}
                      className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 text-lg group"
                    >
                      <span>Daftar Sekarang</span>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>

                    <button
                      onClick={closeModal}
                      className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium text-center"
                    >
                      Tutup Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop Overlay to close */}
          <div className="absolute inset-0 -z-10" onClick={closeModal} />
        </div>
      )}
    </section>
  );
};
