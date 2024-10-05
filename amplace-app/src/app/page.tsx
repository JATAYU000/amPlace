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
const initialPixelSize = 8;
const zoomFactor = 1.2;

const pixels = Array.from({ length: gridSize }, (_, y) =>
  Array.from({ length: gridSize }, (_, x) => ({
    x,
    y,
    rgb: 'gray',
    user: 'JATAYU000'
  }))
);

export default function Home() {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [pixelSize, setPixelSize] = useState(initialPixelSize);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);

  const handleClick = (pixel: Pixel, event: React.MouseEvent) => {
    setTooltip(`X: ${pixel.x}, Y: ${pixel.y}, User: ${pixel.user}`);
    setSelectedPixel(pixel);

    const rect = event.currentTarget.getBoundingClientRect();
    let newX = rect.left + (pixelSize / 2);
    let newY = rect.top + pixelSize;

    const tooltipWidth = 100;
    const tooltipHeight = 50;

    if (newX + tooltipWidth / 2 > window.innerWidth) {
      newX = window.innerWidth - tooltipWidth / 2 - 10;
    } 
    if (newX - tooltipWidth / 2 < 0) {
      newX = tooltipWidth / 2 + 10;
    }

    if (newY + tooltipHeight > window.innerHeight) {
      newY = rect.top - tooltipHeight - 10;
    }

    setTooltipPosition({ x: newX, y: newY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {};

  const handleScroll = (event: WheelEvent) => {
    event.preventDefault();
    let newSize = event.deltaY < 0 ? pixelSize * zoomFactor : pixelSize / zoomFactor;
    newSize = Math.max(1, Math.min(20, newSize));
    setPixelSize(newSize);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.pixel-grid')) {
      setSelectedPixel(null);
      setTooltip(null);
    }
  };

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
        className="pixel-grid"
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
                ? '2px solid black'
                : pixelSize > 1.5 ? '1px solid #ccc' : 'none',
            }}
            onClick={(event) => handleClick(pixel, event)}
          />
        ))}
      </div>
      {tooltip && tooltipPosition && (
        <div
          style={{
            position: 'absolute',
            top: tooltipPosition.y,
            left: tooltipPosition.x,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'black',
            padding: '5px',
            borderRadius: '3px',
            zIndex: 1000,
            transform: 'translate(-50%, 0)'
          }}
        >
          <div className="text-xl">{tooltip}</div>
        </div>
      )}
    </div>
  );
}
