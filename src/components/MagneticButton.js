import { useEffect, useRef } from 'react';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function MagneticButton({
  children,
  className,
  type = 'button',
  disabled = false,
  onClick,
}) {
  const buttonRef = useRef(null);
  const frameRef = useRef(null);

  function setOffset(x, y) {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      if (!buttonRef.current) {
        return;
      }

      buttonRef.current.style.setProperty('--mx', `${x}px`);
      buttonRef.current.style.setProperty('--my', `${y}px`);
    });
  }

  function handleMouseMove(event) {
    if (disabled) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    setOffset(clamp(offsetX / 5, -6, 6), clamp(offsetY / 5, -6, 6));
  }

  function handleMouseLeave() {
    setOffset(0, 0);
  }

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`${className} magnetic-button`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
