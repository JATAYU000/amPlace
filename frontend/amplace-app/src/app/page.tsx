'use client';
import React, { useState, useEffect } from 'react';
import './globals.css';

export type Pixel = {
  x: number;
  y: number;
  rgb: string;
  user: string;
};

const gridSize = 100;
const initialPixelSize = 8; // Initial pixel size
const zoomFactor = 1.2; // Zoom factor

// Create a 100x100 grid of pixels, initialized with gray color and a user
const pixels = Array.from({ length: gridSize }, (_, y) =>
  Array.from({ length: gridSize }, (_, x) => ({
    x,
    y,
    rgb: 'gray', // Default color is gray
    user: 'JATAYU000'
  }))
);

export default function Home() {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [pixelSize, setPixelSize] = useState(initialPixelSize);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);

  const handleClick = (pixel: Pixel, event: React.MouseEvent) => {
    // Set tooltip and selected pixel on click
    setTooltip(`X: ${pixel.x}, Y: ${pixel.y}, User: ${pixel.user}`);
    setSelectedPixel(pixel);
    
    // Calculate tooltip position based on the clicked pixel's position
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + (pixel.x * pixelSize) + (pixelSize / 2), // Centered below the pixel
      y: rect.top + (pixel.y * pixelSize) + pixelSize // Below the pixel
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // No need to set mouse position for the tooltip anymore
  };

  const handleScroll = (event: WheelEvent) => {
    event.preventDefault();
    let newSize = event.deltaY < 0 ? pixelSize * zoomFactor : pixelSize / zoomFactor;
    newSize = Math.max(1, Math.min(20, newSize)); // Limit zoom between 1 and 20
    setPixelSize(newSize);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.pixel-grid')) {
      setSelectedPixel(null);
      setTooltip(null);
    }
  };

  // Set up mouse wheel event listener
  useEffect(() => {
    window.addEventListener('wheel', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('wheel', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [pixelSize]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      position: 'relative' 
    }}>
      <div 
        className="pixel-grid" // Add class for outside click detection
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)` 
        }} 
        onMouseMove={handleMouseMove}
      >
        {pixels.flat().map((pixel) => (
          <div
            key={`${pixel.x}-${pixel.y}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: pixel.rgb,
              border: selectedPixel?.x === pixel.x && selectedPixel?.y === pixel.y
                ? '2px solid black' // Highlight border on click
                : pixelSize > 1.5 ? '1px solid #ccc' : 'none',
            }}
            onClick={(event) => handleClick(pixel, event)} // Trigger click event
          />
        ))}
      </div>
      {tooltip && tooltipPosition && (
        <div
          style={{
            position: 'absolute',
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent gray background
            color: 'black', // Black text
            padding: '5px',
            borderRadius: '3px',
            zIndex: 1000,
            transform: 'translate(-50%, 0)' // Center the tooltip horizontally
          }}
        >
          <div className="text-xl">{tooltip}</div>
        </div>
      )}
    </div>
  );
}
