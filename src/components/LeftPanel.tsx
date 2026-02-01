import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
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

const LeftPanel = ({ onAvatarClick, isNavOpen }: { onAvatarClick: () => void; isNavOpen?: boolean }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredTextRef, setHoveredTextRef] = useState<HTMLDivElement | null>(null);
  const [scrambledTexts, setScrambledTexts] = useState<string[]>(textItems.map(item => item.text));
  const avatarRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth cursor tracking
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring animation for smooth following effect
  const springConfig = { stiffness: 300, damping: 28, restDelta: 0.00001 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  // GSAP animations for avatar interactivity
  useEffect(() => {
    if (!avatarRef.current || isNavOpen) return;

    const avatar = avatarRef.current;
    
    // Main continuous pulse animation with rotation
    const pulseTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    pulseTimeline
      .to(avatar, {
        scale: 1.1,
        rotate: 3,
        duration: 0.8,
        ease: 'power1.inOut'
      })
      .to(avatar, {
        scale: 1,
        rotate: -3,
        duration: 0.8,
        ease: 'power1.inOut'
      })
      .to(avatar, {
        scale: 1.05,
        rotate: 0,
        duration: 0.8,
        ease: 'power1.inOut'
      })
      .to(avatar, {
        scale: 1,
        rotate: 0,
        duration: 0.8,
        ease: 'power1.inOut'
      });

    // Floating animation (subtle up and down movement)
    gsap.to(avatar, {
      y: -8,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // Hover animations
    const handleMouseEnter = () => {
      pulseTimeline.pause();
      gsap.to(avatar, {
        scale: 1.15,
        rotate: 8,
        duration: 0.4,
        ease: 'back.out(2)'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(avatar, {
        scale: 1,
        rotate: 0,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          pulseTimeline.play();
          // Restart floating animation
          gsap.to(avatar, {
            y: -8,
            duration: 2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });
        }
      });
    };

    // Click animation
    const handleMouseDown = () => {
      gsap.to(avatar, {
        scale: 0.9,
        duration: 0.15,
        ease: 'power2.in'
      });
    };

    const handleMouseUp = () => {
      gsap.to(avatar, {
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(4)'
      });
    };

    avatar.addEventListener('mouseenter', handleMouseEnter);
    avatar.addEventListener('mouseleave', handleMouseLeave);
    avatar.addEventListener('mousedown', handleMouseDown);
    avatar.addEventListener('mouseup', handleMouseUp);

    return () => {
      pulseTimeline.kill();
      gsap.killTweensOf(avatar);
      avatar.removeEventListener('mouseenter', handleMouseEnter);
      avatar.removeEventListener('mouseleave', handleMouseLeave);
      avatar.removeEventListener('mousedown', handleMouseDown);
      avatar.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isNavOpen]);

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
      {/* Avatar fixed in bottom left corner - hide when nav is open */}
      <AnimatePresence>
        {!isNavOpen && (
          <motion.div 
            ref={avatarRef}
            className="avatar-container" 
            onClick={onAvatarClick} 
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="/images/head.png" 
              alt="Auria Zhang" 
              className="avatar-image"
            />
          </motion.div>
        )}
      </AnimatePresence>

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
