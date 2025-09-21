"use client";

import { useState, useEffect } from 'react';

const TypeWriter = ({ text, delay = 100, className = "" }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Typewriter effect
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Split text to highlight name
  const highlightName = (text) => {
    if (text.includes('Ashiwani Kumar')) {
      const parts = text.split('Ashiwani Kumar');
      return (
        <>
          {parts[0]}
          <span className="text-primary-color dark:text-white-color">
            Ashiwani Kumar
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <span className={className}>
      {highlightName(currentText)}
      <span 
        className={`inline-block w-0.5 ml-1 transition-opacity duration-100 bg-primary-color dark:bg-white-color ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: '1.2em',
          verticalAlign: 'text-bottom'
        }}
      />
    </span>
  );
};

export default TypeWriter;