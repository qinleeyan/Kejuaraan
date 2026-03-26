'use client';

import React, { useState, useEffect } from 'react';

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

export const ImageCarousel = ({ images, autoPlay = true, interval = 5000 }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlay || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, images.length, interval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative bg-card rounded-xl overflow-hidden border-2 border-border group shadow-lg">
        {/* Main Image */}
        <div className="relative w-full aspect-[3/4] max-h-[500px] mx-auto overflow-hidden bg-muted flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-full object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 transition-colors duration-300" />
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-primary-foreground p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-primary-foreground p-2 sm:p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}


        </div>
      </div>
    </div>
  );
};
