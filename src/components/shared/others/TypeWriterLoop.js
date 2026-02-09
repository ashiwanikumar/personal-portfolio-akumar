"use client";

import { useState, useEffect } from 'react';

const TypeWriterLoop = ({
  phrases = [],
  typeSpeed = 80,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = ""
}) => {
  const [currentText, setCurrentText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseTime]);

  useEffect(() => {
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {currentText}
      <span
        className={`inline-block w-[4px] ml-2 bg-[#00ff41] transition-opacity duration-100 ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: '0.9em',
          verticalAlign: 'middle',
          boxShadow: showCursor ? '0 0 10px rgba(0,255,65,0.8), 0 0 20px rgba(0,255,65,0.4)' : 'none'
        }}
      />
    </span>
  );
};

export default TypeWriterLoop;
