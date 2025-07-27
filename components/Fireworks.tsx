import React, { useEffect, useState } from 'react';

// Allow custom properties for CSS variables
interface CustomCSSProperties extends React.CSSProperties {
  '--x'?: string;
  '--y'?: string;
}

const Firework: React.FC<{ id: number }> = ({ id }) => {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [particles, setParticles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const colors = ['#FFC700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'];
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.7; // only top 70%
    const particleCount = 30;

    const particleElements = Array.from({ length: particleCount }).map((_, i) => {
      const duration = Math.random() * 1.5 + 1;
      const delay = Math.random() * 0.2; // smaller delay for faster burst
      const angle = (i / particleCount) * 360;
      const radius = Math.random() * 100 + 50;
      const particleX = Math.cos(angle * (Math.PI / 180)) * radius;
      const particleY = Math.sin(angle * (Math.PI / 180)) * radius;
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const particleStyle: CustomCSSProperties = {
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        // CSS custom properties for animation
        '--x': `${particleX}px`,
        '--y': `${particleY}px`,
        animation: `burst ${duration}s ease-out ${delay}s forwards`,
      };
      
      return (
        <div
          key={i}
          className="absolute rounded-full"
          style={particleStyle}
        />
      );
    });

    setStyle({
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
    });

    setParticles(particleElements);
  }, [id]);

  return <div style={style}>{particles}</div>;
};

const Fireworks: React.FC = () => {
    const [fireworks, setFireworks] = useState<number[]>([]);

    useEffect(() => {
        const fireworkCount = 15;
        const ids = Array.from({length: fireworkCount}, (_, i) => i);
        setFireworks(ids);

        // Cleanup fireworks from the DOM after they are done
        const timer = setTimeout(() => {
            setFireworks([]);
        }, 3000); // Animation duration is max ~2.5s, so 3s is safe

        return () => clearTimeout(timer);
    }, []);

    // Don't render if there are no fireworks to show
    if (fireworks.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-50">
           {/* Define keyframes once for all fireworks */}
           <style>{`
              @keyframes burst {
                0% {
                  transform: translate(0, 0);
                  opacity: 1;
                }
                100% {
                  transform: translate(var(--x), var(--y));
                  opacity: 0;
                }
              }
           `}</style>
           {fireworks.map(id => <Firework key={id} id={id} />)}
        </div>
    );
};

export default Fireworks;