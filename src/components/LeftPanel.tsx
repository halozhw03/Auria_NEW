import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import './LeftPanel.css';

interface TextItem {
  number: string;
  text: string;
  description: string;
  numberColor: string;
}

const textItems: TextItem[] = [
  { number: "01", text: "Who I am", description: "I am Auria Zhang,\na UX designer who\nturns system complexity\ninto experiences people\ncan understand.", numberColor: "#999999" },
  { number: "02", text: "What do I do", description: "Translate research\nand strategy into\nusable, human-centered\nexperiences", numberColor: "#999999" },
  { number: "03", text: "What skills do I have", description: "Research\nSystems Thinking\nPrototyping", numberColor: "#999999" },
];

// Characters used for scramble effect
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

const LeftPanel = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredTextRef, setHoveredTextRef] = useState<HTMLDivElement | null>(null);
  const [scrambledTexts, setScrambledTexts] = useState<string[]>(textItems.map(item => item.text));

  // Motion values for smooth cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring animation for smooth following effect
  const springConfig = { stiffness: 300, damping: 28, restDelta: 0.00001 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!hoveredTextRef) return;

    const rect = hoveredTextRef.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = (index: number, ref: HTMLDivElement) => {
    setHoveredIndex(index);
    setHoveredTextRef(ref);
    
    // Start scramble effect
    const originalText = textItems[index].text;
    let iteration = 0;
    
    const interval = setInterval(() => {
      setScrambledTexts(prev => {
        const newTexts = [...prev];
        newTexts[index] = originalText
          .split('')
          .map((char, charIndex) => {
            if (char === ' ') return ' ';
            // Reveal characters progressively
            if (charIndex < iteration) {
              return originalText[charIndex];
            }
            // Only scramble a few characters ahead
            if (charIndex < iteration + 2) {
              return chars[Math.floor(Math.random() * chars.length)];
            }
            // Keep original for characters far ahead
            return originalText[charIndex];
          })
          .join('');
        return newTexts;
      });
      
      iteration += 0.5;
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
        setScrambledTexts(prev => {
          const newTexts = [...prev];
          newTexts[index] = originalText;
          return newTexts;
        });
      }
    }, 50);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoveredTextRef(null);
  };

  return (
    <motion.div
      className="left-panel"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="text-list-container">
        {textItems.map((item, index) => (
          <div
            key={index}
            className="text-item-wrapper"
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseEnter={(e) => handleMouseEnter(index, e.currentTarget as HTMLDivElement)}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="text-item"
            >
              <span className="text-number" style={{ color: item.numberColor }}>{item.number}</span>
              <span className="text-content">{scrambledTexts[index]}</span>
            </motion.div>

            {/* Tooltip that follows cursor */}
            {hoveredIndex === index && (
              <motion.div
                className="cursor-tooltip"
                style={{
                  x,
                  y,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {item.description}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LeftPanel;
