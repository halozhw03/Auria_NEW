import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import './HomePage.css';

// Pupil position in px for eye tracking
type PupilPos = { x: number; y: number };
const initialPupil: PupilPos = { x: 0, y: 0 };

const descriptions = [
  "I design complex systems into clear, operable end-to-end workflows.",
  "I translate technical constraints and pipeline complexity into product decisions and UI states.",
  "I integrate AI as a probabilistic subsystem—confidence signals, human override, and safe fallback.",
  "I make uncertainty explicit so teams can act quickly with accountability.",
  "I design for reliability: edge cases, handoffs, traceability, and recovery."
];

const descriptionVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: "easeInOut" as const }
};

const HomePage = () => {
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [leftPupil, setLeftPupil] = useState<PupilPos>(initialPupil);
  const [rightPupil, setRightPupil] = useState<PupilPos>(initialPupil);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [characterBubblePos, setCharacterBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [isCharacterZoneHovered, setIsCharacterZoneHovered] = useState(false);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);

  const handleDogMouseMove = (e: React.MouseEvent) => {
    setBubblePos({ x: e.clientX, y: e.clientY });
  };
  const handleDogMouseLeave = () => setBubblePos(null);

  const handleCharacterMouseMove = (e: React.MouseEvent) => {
    setCharacterBubblePos({ x: e.clientX, y: e.clientY });
  };
  const handleCharacterMouseLeave = () => {
    setCharacterBubblePos(null);
    setIsCharacterZoneHovered(false);
  };

  // Eye tracking: move pupils toward mouse (same as Auria-Portfolio loading-screen dog)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const leftEl = leftEyeRef.current;
      const rightEl = rightEyeRef.current;
      if (!leftEl || !rightEl) return;
      const updatePupil = (el: HTMLDivElement, setPupil: (p: PupilPos) => void) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        let angle = Math.atan2(dy, dx);
        const minAngle = (-150 * Math.PI) / 180;
        const maxAngle = (150 * Math.PI) / 180;
        angle = Math.max(minAngle, Math.min(maxAngle, angle));
        const radius = rect.width * 0.15;
        setPupil({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        });
      };
      updatePupil(leftEl, setLeftPupil);
      updatePupil(rightEl, setRightPupil);
    };
    const onLeave = () => {
      setLeftPupil(initialPupil);
      setRightPupil(initialPupil);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prevIndex) => (prevIndex + 1) % descriptions.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentVariant = descriptionVariant;

  return (
    <motion.div className={`home-section${isCharacterZoneHovered ? ' character-zone-hovered' : ''}`}>
      <div className="home-main-wrapper">
        <div className="glass-container">
          <motion.div 
            className="home-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="home-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Auria Zhang
            </motion.h1>
            <div className="home-description-wrapper">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentDescriptionIndex}
                  className="home-description"
                  initial={currentVariant.initial}
                  animate={currentVariant.animate}
                  exit={currentVariant.exit}
                  transition={currentVariant.transition}
                >
                  {descriptions[currentDescriptionIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      {/* 透明悬停层：盖在背景里的人物（豆袋椅+电脑）上，hover 显示提示 */}
      <div
        className="home-character-zone"
        aria-hidden
        onMouseEnter={() => setIsCharacterZoneHovered(true)}
        onMouseMove={handleCharacterMouseMove}
        onMouseLeave={handleCharacterMouseLeave}
      >
        {characterBubblePos && (
          <div
            className="home-hero-bubble"
            style={{
              left: characterBubblePos.x,
              top: characterBubblePos.y,
            }}
          >
            Designing in progress…
            <br />
            Feel free to play with my dog.
          </div>
        )}
      </div>
      <div
        className="home-dog"
        aria-hidden
        onMouseMove={handleDogMouseMove}
        onMouseLeave={handleDogMouseLeave}
      >
        {bubblePos && (
          <div
            className="home-dog-bubble"
            style={{
              left: bubblePos.x,
              top: bubblePos.y,
            }}
          >
            This is my dog Pepsi
          </div>
        )}
        <img src="/images/dog1.png" alt="" className="home-dog-image" />
        <img src="/images/dog1tail.png" alt="" className="home-dog-tail" />
        <div ref={leftEyeRef} className="home-dog-eye left-eye">
          <div
            className="home-dog-pupil"
            style={{ transform: `translate(calc(-50% + ${leftPupil.x}px), calc(-50% + ${leftPupil.y}px))` }}
          />
        </div>
        <div ref={rightEyeRef} className="home-dog-eye right-eye">
          <div
            className="home-dog-pupil"
            style={{ transform: `translate(calc(-50% + ${rightPupil.x}px), calc(-50% + ${rightPupil.y}px))` }}
          />
        </div>
      </div>
      <motion.div 
        className="home-scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ 
          duration: 1.8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.9"/>
          <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="1"/>
          <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
