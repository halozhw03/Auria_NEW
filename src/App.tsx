import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import './App.css';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  useEffect(() => {
    // Prevent horizontal scrolling/swiping
    const preventHorizontalScroll = (e: TouchEvent | WheelEvent) => {
      // For touch events
      if ('touches' in e && e.touches.length > 0) {
        const touch = e.touches[0];
        const startX = touch.clientX;
        
        const handleTouchMove = (moveEvent: TouchEvent) => {
          const currentX = moveEvent.touches[0].clientX;
          const deltaX = Math.abs(currentX - startX);
          const deltaY = Math.abs(moveEvent.touches[0].clientY - touch.clientY);
          
          // If horizontal movement is greater than vertical, prevent it
          if (deltaX > deltaY) {
            moveEvent.preventDefault();
          }
        };
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        const handleTouchEnd = () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
        
        document.addEventListener('touchend', handleTouchEnd);
      }
      
      // For wheel events (mouse wheel horizontal scrolling)
      if ('deltaX' in e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
      }
    };

    // Prevent horizontal scroll with wheel
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    };

    // Prevent horizontal scroll with touch
    const handleTouchStart = (e: TouchEvent) => {
      preventHorizontalScroll(e);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <motion.div
      className="app-container"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <LeftPanel onAvatarClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
      <RightPanel isNavOpen={isNavOpen} onCloseNav={() => setIsNavOpen(false)} />
    </motion.div>
  );
}

export default App;
