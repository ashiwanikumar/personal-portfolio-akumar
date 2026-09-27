"use client";

import { useState, useEffect } from 'react';

// Purely visual. The text changes every few milliseconds, so it is hidden from
// screen readers; the parent heading should carry a stable, readable label.
const TypeWriterLoop = ({
  phrases = [],
  typeSpeed = 80,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = "",
  textClassName = ""
}) => {
  const [currentText, setCurrentText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (reduceMotion || phrases.length === 0) return undefined;
    const currentPhrase = phrases[phraseIndex % phrases.length];
    const isFull = !isDeleting && currentText.length === currentPhrase.length;

    // One timer per step, always cleared on cleanup, so a re-render or unmount
    // never leaves a stray "start deleting" timer running.
    const timeout = setTimeout(() => {
      if (isFull) {
        setIsDeleting(true);
      } else if (!isDeleting) {
        setCurrentText(currentPhrase.slice(0, currentText.length + 1));
      } else if (currentText.length > 0) {
        setCurrentText(currentText.slice(0, -1));
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }, isFull ? pauseTime : isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pauseTime, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, [reduceMotion]);

  // With reduced motion, show the first phrase as plain static text.
  const displayText = reduceMotion ? (phrases[0] || '') : currentText;
  const cursorOn = !reduceMotion && showCursor;

  // The longest phrase is rendered invisibly underneath to reserve its width
  // and height, so the heading doesn't jump when a phrase wraps on mobile.
  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), '');

  const cursor = (visible) => (
    <span
      className={`inline-block w-[4px] ml-2 bg-[#10b981] transition-opacity duration-100 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        height: '0.9em',
        verticalAlign: 'middle',
        boxShadow: visible ? '0 0 10px rgba(16,185,129,0.8), 0 0 20px rgba(16,185,129,0.4)' : 'none'
      }}
    />
  );

  return (
    <span className={`inline-grid items-center ${className}`} aria-hidden="true">
      <span className="invisible col-start-1 row-start-1">
        {longest}
        {cursor(false)}
      </span>
      <span className={`col-start-1 row-start-1 ${textClassName}`}>
        {displayText}
        {!reduceMotion && cursor(cursorOn)}
      </span>
    </span>
  );
};

export default TypeWriterLoop;
