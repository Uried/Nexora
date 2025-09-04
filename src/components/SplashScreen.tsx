'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import KaSiLogo15 from '../assets/images/KaSiLogo-15.png';
import KaSiLogo17 from '../assets/images/KaSiLogo-17.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [KaSiLogo15, KaSiLogo17];

  useEffect(() => {
    // Alternate images every 1.5 seconds (2 times in 3 seconds)
    const imageInterval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 1500);

    // Complete splash screen after 3 seconds
    const splashTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(imageInterval);
      clearTimeout(splashTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <Image
          src={images[currentImage]}
          alt="KaSi Logo"
          width={192}
          height={192}
          className="object-contain transition-opacity duration-300"
          priority
        />
      </div>
    </div>
  );
}
