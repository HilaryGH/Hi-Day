import React, { useMemo } from 'react';

interface SectionBackgroundProps {
  opacity?: number;
  imagesPerRow?: 2 | 3;
  className?: string;
  shuffleSeed?: number; // Optional seed for shuffling images to get different arrangements
}

const SectionBackground: React.FC<SectionBackgroundProps> = ({ 
  opacity = 0.12,
  imagesPerRow = 3,
  className = '',
  shuffleSeed
}) => {
  // Generate image paths from image 1.svg to image 17.svg
  const imagePaths = useMemo(() => {
    const paths = Array.from({ length: 17 }, (_, i) => `/image ${i + 1}.svg`);
    
    // If shuffleSeed is provided, shuffle the array using a seeded random function
    if (shuffleSeed !== undefined) {
      // Simple seeded shuffle function
      const seededRandom = (seed: number) => {
        let value = seed;
        return () => {
          value = (value * 9301 + 49297) % 233280;
          return value / 233280;
        };
      };
      
      const random = seededRandom(shuffleSeed);
      const shuffled = [...paths];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    
    return paths;
  }, [shuffleSeed]);

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ 
        zIndex: 0,
      }}
    >
      <div 
        className="absolute inset-0 flex flex-row flex-wrap"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {imagePaths.map((imagePath, index) => (
          <div
            key={index}
            className={`${
              imagesPerRow === 3 
                ? 'w-1/3' 
                : 'w-1/2'
            } aspect-square flex items-center justify-center`}
            style={{ 
              minHeight: '200px',
              padding: '10px',
              flexShrink: 0,
            }}
          >
            <img
              src={imagePath}
              alt=""
              className="w-full h-full object-contain"
              style={{
                opacity: opacity,
                filter: 'grayscale(100%) brightness(0.7) blur(0.4px)',
                mixBlendMode: 'multiply',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionBackground;
