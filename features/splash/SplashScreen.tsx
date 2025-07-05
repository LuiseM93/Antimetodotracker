import React, { useState, useEffect } from 'react';

const SPLASH_DURATION = 1500; // Total duration for the splash screen in ms
const FADE_DURATION = 500;   // Duration of fade-in/out animation in ms

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start fade-in
    setIsVisible(true);

    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false); // Start fade-out
    }, SPLASH_DURATION - FADE_DURATION);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center p-8 text-center text-white transition-opacity ease-in-out
                  bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${FADE_DURATION}ms`,
      }}
    >
      <img 
        src="./assets/logo.png"
        alt="Logo El Antimétodo"
        className="w-32 h-32 sm:w-40 sm:h-40 mb-4 object-contain"
      />
      <p className="font-poppins font-semibold text-3xl sm:text-4xl mt-6">
        El Antimétodo
      </p>
    </div>
  );
};