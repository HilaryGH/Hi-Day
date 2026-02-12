import React from 'react';

interface BackgroundImagesProps {
  className?: string;
  opacity?: number;
  imagesPerRow?: 2 | 3;
}

const BackgroundImages: React.FC<BackgroundImagesProps> = ({ 
  className = '', 
  opacity = 0.2,
  imagesPerRow = 3 
}) => {
  // Generate image paths from image 1.svg to image 17.svg
  const imagePaths = Array.from({ length: 17 }, (_, i) => `/image ${i + 1}.svg`);

  const handleImageError = (path: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`✗ Failed to load: ${path}`);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  return (
    <div 
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ 
        width: '100vw', 
        height: '100%',
        minHeight: '100vh',
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'visible',
      }}
    >
      <div 
        className="absolute inset-0 flex flex-row flex-wrap"
        style={{
          width: '100%',
          minHeight: '100vh',
          height: 'auto',
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
              minHeight: '250px',
              padding: '12px',
              flexShrink: 0,
            }}
          >
            <img
              src={imagePath}
              alt=""
              className="w-full h-full object-contain"
              style={{
                opacity: opacity,
                filter: 'grayscale(100%) brightness(0.75) blur(0.4px)',
                mixBlendMode: 'multiply',
                display: 'block',
              }}
              onError={(e) => handleImageError(imagePath, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundImages;
