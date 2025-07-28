import React from 'react';

const Fireworks: React.FC = () => {
  // Increased particle count for a fuller effect
  const fireworks = Array.from({ length: 150 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    // Increased explosion radius for bigger fireworks
    const radius = Math.random() * 200 + 80;
    const style = {
      // Position explosions across the top 70% of the screen
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 60 + 10}%`,
      // Increased particle size
      '--particle-size': `${Math.random() * 3 + 2}px`,
      '--hue': `${Math.random() * 360}`,
      '--x-end': `${Math.cos(angle) * radius}px`,
      '--y-end': `${Math.sin(angle) * radius}px`,
      // Staggered animation delay for a continuous show, matching the animation duration
      animationDelay: `${Math.random() * 1.8}s`,
    } as React.CSSProperties;
    return <div key={i} className="firework-particle" style={style}></div>;
  });

  return <div className="fireworks-container" aria-hidden="true">{fireworks}</div>;
};

export default Fireworks;
