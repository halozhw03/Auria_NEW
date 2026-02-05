import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  // Ensure page starts at home page on load/refresh
  useEffect(() => {
    // Scroll to top on mount to show home page
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });
  }, []);
  
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

    // Prevent horizontal scroll with wheel (only prevent pure horizontal scrolling)
    const handleWheel = (e: WheelEvent) => {
      // Only prevent if it's purely horizontal scrolling (no vertical component)
      // This won't interfere with vertical scrolling which RightPanel handles
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 3 && Math.abs(e.deltaY) < 10) {
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

  // Handle scroll to hide home page and show main content
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      if (scrollY > windowHeight * 0.5) {
        setShowMainContent(true);
      } else {
        setShowMainContent(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 页面加载时就开始预加载作品集长图，并触发解码，点开弹窗时不再卡顿
  useEffect(() => {
    const portfolioImages = [
      '/images/X-Heal_Hero.png',
      '/images/Prelo_hero.png',
      '/images/mushroomate_hero.png',
      '/images/X1.png',
      '/images/X1.2.png',
      '/images/X1.3.png',
      '/images/M2.png',
      '/images/M2.1.png',
      '/images/p1.png',
    ];
    portfolioImages.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        img.decode().catch(() => {});
      };
      img.src = src;
    });
  }, []);

  return (
    <div className="app-wrapper">
      {/* Full-screen Home Page */}
      <div className="home-page-container">
        <HomePage />
      </div>
      
      {/* Main Content (Left + Right Panels) */}
      <div className="main-content-container">
        <motion.div
          className={`app-container ${showMainContent ? 'visible' : 'hidden'}`}
          layout
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Dog with ball - left side, tail wag + speech bubble，滚动后带出现动效 */}
          <AnimatePresence>
            {showMainContent && (
              <div className="dog-ball-wrapper">
                <motion.div
                  className="dog-ball-inner"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                >
                  <motion.div
                    className="dog-bubble"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.55, ease: 'easeOut' }}
                  >
                    <span className="dog-bubble-text">Scroll to see what I fetch</span>
                  </motion.div>
                  <div className="dog-and-links-row">
                    <div className="dog-ball-container">
                      <img src="/images/dogball.png" alt="" className="dog-ball" />
                      <img src="/images/dog1tail.png" alt="" className="dog-ball-tail" />
                    </div>
                    <div className="dog-bubble-links" aria-label="Links">
                      <motion.a
                        href="https://www.linkedin.com/in/linjun-zhang/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dog-link-icon"
                        aria-label="LinkedIn"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.65, ease: 'easeOut' }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span className="dog-link-label">LinkedIn</span>
                      </motion.a>
                      <motion.a
                        href="#resume"
                        className="dog-link-icon"
                        aria-label="Resume"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.82, ease: 'easeOut' }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span className="dog-link-label">Resume</span>
                      </motion.a>
                      <motion.a
                        href="mailto:zlinjun1@gmail.com"
                        className="dog-link-icon"
                        aria-label="Contact"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.99, ease: 'easeOut' }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span className="dog-link-label">Contact</span>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <LeftPanel onAvatarClick={() => setIsNavOpen(!isNavOpen)} isNavOpen={isNavOpen} />
          <RightPanel 
            isNavOpen={isNavOpen} 
            onCloseNav={() => setIsNavOpen(false)}
            isMainContentVisible={showMainContent}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default App;
