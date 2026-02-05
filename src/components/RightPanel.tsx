import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import gsap from 'gsap';
import { GlassSurface } from './GlassSurface';
import './RightPanel.css';

// Global scroll handler component
const GlobalScrollHandler = ({ rightPanelRef, modalProject }: { rightPanelRef: React.RefObject<HTMLDivElement>; modalProject: string | null }) => {
  useEffect(() => {
    if (!rightPanelRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical scrolling
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      // If modal is open, completely disable all scroll handling
      // This prevents any scroll events from affecting the background
      if (modalProject) {
        return;
      }
      
      const rightPanel = rightPanelRef.current;
      if (!rightPanel) return;
      
      // Check if mouse is over right panel
      const rect = rightPanel.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const isOverRightPanel = mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;
      
      const currentScroll = rightPanel.scrollTop;
      const maxScroll = rightPanel.scrollHeight - rightPanel.clientHeight;
      
      // If scrolling up and at top, scroll window back to home (only when modal is closed)
      if (e.deltaY < 0 && currentScroll <= 0 && !modalProject) {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        return;
      }
      
      // If mouse is over right panel, let it scroll naturally
      if (isOverRightPanel) {
        return;
      }
      
      // Mouse is not over right panel, control it from anywhere else
      e.preventDefault();
      e.stopPropagation();
      
      const scrollDelta = e.deltaY * 2.5;
      const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollDelta));
      rightPanel.scrollTop = newScroll;
    };

    // Only add listener when modal is closed
    if (!modalProject) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [rightPanelRef, modalProject]);

  return null;
};

// Project card component with spotlight effect
const ProjectCard = ({ project, selectedProject, onProjectClick }: {
  project: { id: string; name: string; description: string; image: string };
  selectedProject: string | null;
  onProjectClick: (id: string) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const background = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.25),
      rgba(255, 255, 255, 0.08) 40%,
      transparent 80%
    )
  `;

  const borderGlow = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.3),
      transparent 60%
    )
  `;

  const cardVariants = {
    initial: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      borderColor: "rgba(0, 0, 0, 0)",
      scale: 1,
    },
    hover: {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      borderColor: "rgba(0, 0, 0, 0.1)",
      scale: 1.01,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      className={`project-image-container ${selectedProject === project.id ? 'selected' : ''}`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onProjectClick(project.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* Main spotlight effect */}
      <motion.div
        className="project-spotlight"
        style={{
          background,
          position: 'absolute',
          inset: 0,
          borderRadius: '12px',
          pointerEvents: 'none',
          zIndex: 1,
          mixBlendMode: 'overlay',
        }}
      />
      {/* Border glow effect */}
      <motion.div
        className="project-spotlight-border"
        style={{
          background: borderGlow,
          position: 'absolute',
          inset: '-1px',
          borderRadius: '12px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.5,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <img
          src={project.image}
          alt={project.name}
          className="project-hero-image"
          decoding="async"
        />
        <h3 className="project-name">{project.name}</h3>
        <p className="project-description">{project.description}</p>
      </div>
    </motion.div>
  );
};

const RightPanel = ({ isNavOpen, onCloseNav, isMainContentVisible }: { isNavOpen: boolean; onCloseNav: () => void; isMainContentVisible: boolean }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [modalProject, setModalProject] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [progressBarStyle, setProgressBarStyle] = useState<{ top: string; height: string; right: string } | null>(null);
  const [showPlayground, setShowPlayground] = useState(false); // Toggle for playground
  const [rightPanelScrollBeforeModal, setRightPanelScrollBeforeModal] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Save and restore right panel scroll position when modal opens/closes
  useEffect(() => {
    if (modalProject && rightPanelRef.current) {
      // Save scroll position when modal opens
      setRightPanelScrollBeforeModal(rightPanelRef.current.scrollTop);
    } else if (!modalProject && rightPanelRef.current && rightPanelScrollBeforeModal > 0) {
      // Restore scroll position when modal closes
      rightPanelRef.current.scrollTop = rightPanelScrollBeforeModal;
    }
  }, [modalProject, rightPanelScrollBeforeModal]);

  const navigationItems = [
    { id: 'about', label: 'About Me' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];

  // GSAP animation for compact navigation bar
  useEffect(() => {
    if (navRef.current) {
      if (isNavOpen) {
        // Elastic slide-in from left with scale
        gsap.fromTo(
          navRef.current,
          { 
            x: -100,
            opacity: 0,
            scale: 0.9
          },
          { 
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'back.out(1.4)'
          }
        );

        // Stagger animation for navigation items
        gsap.fromTo(
          navRef.current.querySelectorAll('.compact-nav-item'),
          { x: -30, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            duration: 0.4,
            stagger: 0.08,
            delay: 0.2,
            ease: 'power2.out'
          }
        );
      } else if (navRef.current) {
        // Slide out to left with scale when closing
        gsap.to(navRef.current, { 
          x: -100,
          opacity: 0,
          scale: 0.9,
          duration: 0.4,
          ease: 'power2.in'
        });
      }
    }
  }, [isNavOpen]);

  const handleNavItemClick = (itemId: string) => {
    console.log(`Navigating to: ${itemId}`);
    // Keep the nav open, just handle the click
  };

  const projects = [
    {
      id: 'x-heal',
      name: 'X-Heal',
      description: 'Dual-sensor loT platform for accurate at-home recovery and remote clinician monitoring.',
      image: '/images/X-Heal_Hero.png',
    },
    {
      id: 'prelo',
      name: 'Prelo',
      description: 'Know what you\'re ordering. When menus don\'t explain enough.',
      image: '/images/Prelo_hero.png',
    },
    {
      id: 'mushroommate',
      name: 'MushRoommate',
      description: 'Sustainable home cultivation for affordable, year-round urban mushroom growing.',
      image: '/images/mushroomate_hero.png',
    },
  ];

  // Update progress bar position and height to match modal container
  useEffect(() => {
    const updateProgressBarPosition = () => {
      if (modalRef.current && modalProject) {
        const modalRect = modalRef.current.getBoundingClientRect();
        setProgressBarStyle({
          top: `${modalRect.top}px`,
          height: `${modalRect.height}px`,
          right: `${window.innerWidth - modalRect.right - 12}px`,
        });
      } else {
        setProgressBarStyle(null);
      }
    };

    if (modalProject) {
      // Use requestAnimationFrame for smooth updates during animations
      let animationFrameId: number;
      const updateLoop = () => {
        updateProgressBarPosition();
        animationFrameId = requestAnimationFrame(updateLoop);
      };
      
      // Start the update loop
      animationFrameId = requestAnimationFrame(updateLoop);
      
      // Multiple immediate updates to catch initial positioning
      const timeouts: NodeJS.Timeout[] = [];
      timeouts.push(setTimeout(updateProgressBarPosition, 50));
      timeouts.push(setTimeout(updateProgressBarPosition, 100));
      timeouts.push(setTimeout(updateProgressBarPosition, 200));
      timeouts.push(setTimeout(updateProgressBarPosition, 400));
      
      window.addEventListener('resize', updateProgressBarPosition);
      window.addEventListener('scroll', updateProgressBarPosition);
      
      // Use ResizeObserver to watch for size changes
      let resizeObserver: ResizeObserver | null = null;
      if (modalRef.current) {
        resizeObserver = new ResizeObserver(() => {
          updateProgressBarPosition();
        });
        resizeObserver.observe(modalRef.current);
      }
      
      return () => {
        cancelAnimationFrame(animationFrameId);
        timeouts.forEach(timeout => clearTimeout(timeout));
        window.removeEventListener('resize', updateProgressBarPosition);
        window.removeEventListener('scroll', updateProgressBarPosition);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        setProgressBarStyle(null);
      };
    } else {
      setProgressBarStyle(null);
    }
  }, [modalProject]);

  // Track scroll progress for progress bar
  useEffect(() => {
    const modalContent = modalContentRef.current;
    if (!modalContent || !modalProject) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = modalContent;
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? scrollTop / totalScroll : 0;
      setScrollProgress(progress);
    };

    modalContent.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      modalContent.removeEventListener('scroll', handleScroll);
    };
  }, [modalProject]);

  // Update close button position based on modal and image position
  useEffect(() => {
    const updateButtonPosition = () => {
      if (modalRef.current && closeButtonRef.current) {
        const button = closeButtonRef.current;
        
        // Find the image element inside modal
        const imageElement = modalRef.current.querySelector('.modal-card-xheal-image') as HTMLImageElement;
        
        if (imageElement) {
          const imageRect = imageElement.getBoundingClientRect();
          // Position button near the right edge of the image, aligned with top
          // 24px offset from top and right edge
          button.style.top = `${imageRect.top + 24}px`;
          button.style.right = `${window.innerWidth - imageRect.right + 24}px`;
        } else {
          // Fallback to modal position if image not found
          const modalRect = modalRef.current.getBoundingClientRect();
          button.style.top = `${modalRect.top + 24}px`;
          button.style.right = `${window.innerWidth - modalRect.right + 24}px`;
        }
      }
    };

    if (modalProject) {
      // Multiple updates to ensure position is correct after DOM changes
      const timeouts: NodeJS.Timeout[] = [];
      
      // Immediate update
      updateButtonPosition();
      
      // Updates with delays to catch DOM changes
      timeouts.push(setTimeout(updateButtonPosition, 50));
      timeouts.push(setTimeout(updateButtonPosition, 100));
      timeouts.push(setTimeout(updateButtonPosition, 200));
      timeouts.push(setTimeout(updateButtonPosition, 300));
      
      // Wait for image to load, then update position
      const imageElement = modalRef.current?.querySelector('.modal-card-xheal-image') as HTMLImageElement;
      
      if (imageElement) {
        if (imageElement.complete) {
          // Image already loaded
          updateButtonPosition();
        } else {
          // Wait for image to load
          imageElement.addEventListener('load', updateButtonPosition, { once: true });
        }
      }
      
      window.addEventListener('resize', updateButtonPosition);
      window.addEventListener('scroll', updateButtonPosition);
      
      // Use MutationObserver to watch for image position changes
      const observer = new MutationObserver(() => {
        // Debounce the update
        setTimeout(updateButtonPosition, 10);
      });
      
      if (modalRef.current) {
        observer.observe(modalRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
          characterData: false
        });
      }
      
      // Use ResizeObserver to watch for size changes
      let resizeObserver: ResizeObserver | null = null;
      if (modalRef.current) {
        resizeObserver = new ResizeObserver(() => {
          updateButtonPosition();
        });
        resizeObserver.observe(modalRef.current);
      }
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
        window.removeEventListener('resize', updateButtonPosition);
        window.removeEventListener('scroll', updateButtonPosition);
        observer.disconnect();
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (imageElement) {
          imageElement.removeEventListener('load', updateButtonPosition);
        }
      };
    }
  }, [modalProject]);


  return (
    <>
      {/* Global scroll handler when in main content */}
      {isMainContentVisible && (
        <GlobalScrollHandler 
          rightPanelRef={rightPanelRef}
          modalProject={modalProject}
        />
      )}
      <motion.div
        ref={rightPanelRef}
        className="right-panel"
        layout
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
      <motion.div className="right-content" layout>
        {/* Liquid Glass Nav Bar at top */}
        <div className="top-nav-bar">
          <GlassSurface 
            className="nav-bar-content"
            blur={10}
            opacity={0.305}
            borderRadius={20}
            style={{
              background: 'rgba(112, 111, 111, 0.5)',
              border: '1.5px solid rgba(125, 125, 125, 0.67)',
              WebkitBackdropFilter: 'blur(15px) saturate(150%)',
              backdropFilter: 'blur(10px) saturate(180%)',
            }}
          >
            <div className="nav-bar-left">
              <div className="nav-avatar-name">
                <div className="nav-avatar">
                  <img 
                    src="/images/head.png" 
                    alt="Auria Zhang" 
                  />
                </div>
                <span className="nav-name">Auria Zhang</span>
              </div>
            </div>
            <div className="nav-bar-right">
              <span className="nav-about">About Me</span>
            </div>
          </GlassSurface>
        </div>
        
        {/* Oval Navigation Bar with integrated avatar */}
        <AnimatePresence mode="wait">
          {isNavOpen && (
            <motion.div
              ref={navRef}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                bottom: '2.5rem',
                left: '2.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '60px',
                padding: '0.5rem',
                paddingLeft: '0.5rem',
                paddingRight: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                zIndex: 100,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                willChange: 'transform, opacity'
              }}
            >
              {/* Avatar circle integrated in the nav bar */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={onCloseNav}
              >
                <img 
                  src="/images/head.png" 
                  alt="Auria Zhang" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%'
                  }}
                />
              </div>

              {/* Navigation items */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {navigationItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="compact-nav-item"
                    onClick={() => handleNavItemClick(item.id)}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '24px',
                      border: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'var(--text-color)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      opacity: 0
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
              
              {/* Close button */}
              <motion.button
                onClick={onCloseNav}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-color)',
                  flexShrink: 0
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {showPlayground ? (
          <motion.div className="content-section playground-section" layout>
            <h2>Arrow Style Playground</h2>
            <div className="playground-grid">
              {/* Style 1: Double Arrow */}
              <div className="playground-item">
                <p>Style 1: Double Arrow</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M7 13L12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 8L12 13L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 2: Single Arrow with Circle */}
              <div className="playground-item">
                <p>Style 2: Single Arrow with Circle</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" fill="none"/>
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 3: Chevron Down */}
              <div className="playground-item">
                <p>Style 3: Chevron Down</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 4: Arrow with Dots */}
              <div className="playground-item">
                <p>Style 4: Arrow with Dots</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="6" r="1.5" fill="currentColor" opacity="0.6"/>
                    <circle cx="12" cy="10" r="1.5" fill="currentColor" opacity="0.8"/>
                    <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 5: Minimal Arrow */}
              <div className="playground-item">
                <p>Style 5: Minimal Arrow</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 6: Bouncing Arrow */}
              <div className="playground-item">
                <p>Style 6: Bouncing Arrow</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ 
                    y: [0, 12, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 7: Arrow with Line */}
              <div className="playground-item">
                <p>Style 7: Arrow with Line</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="4" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 8: Filled Arrow */}
              <div className="playground-item">
                <p>Style 8: Filled Arrow</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.2"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 9: Triple Arrow */}
              <div className="playground-item">
                <p>Style 9: Triple Arrow</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M7 15L12 20L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                    <path d="M7 5L12 10L17 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                  </svg>
                </motion.div>
              </div>

              {/* Style 10: Arrow with Pulse */}
              <div className="playground-item">
                <p>Style 10: Arrow with Pulse</p>
                <motion.div 
                  className="scroll-indicator"
                  animate={{ 
                    y: [0, 10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      fill="none"
                      opacity="0.2"
                    />
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>
            </div>
            <button 
              onClick={() => setShowPlayground(false)}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 2rem',
                background: 'transparent',
                border: '2px solid #000',
                borderRadius: '50px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Close Playground
            </button>
          </motion.div>
        ) : (
          <motion.div className="content-section" layout>
            <ProjectCard
              project={projects[0]}
              selectedProject={selectedProject}
              onProjectClick={(id) => {
                if (rightPanelRef.current) {
                  setRightPanelScrollBeforeModal(rightPanelRef.current.scrollTop);
                }
                setModalProject(id);
              }}
            />
          </motion.div>
        )}
        {projects.slice(1).map((project, index) => (
          <motion.div key={project.id} className="content-section" layout>
            <ProjectCard
              project={project}
              selectedProject={selectedProject}
              onProjectClick={(id) => {
                if (rightPanelRef.current) {
                  setRightPanelScrollBeforeModal(rightPanelRef.current.scrollTop);
                }
                setModalProject(id);
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      {createPortal(
        <AnimatePresence>
          {modalProject && (
            <>
              {/* Backdrop with blur */}
              <motion.div
                className="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => {
                  setModalProject(null);
                  // Restore scroll position after a brief delay to ensure modal is closed
                  setTimeout(() => {
                    if (rightPanelRef.current && rightPanelScrollBeforeModal > 0) {
                      rightPanelRef.current.scrollTop = rightPanelScrollBeforeModal;
                    }
                  }, 100);
                }}
              />
              
              {/* Close button - positioned outside modal to avoid covering content */}
              <motion.button
                ref={closeButtonRef}
                className={`modal-close-button ${
                  modalProject === 'x-heal' ? 'modal-close-button-xheal' : 
                  modalProject === 'mushroommate' ? 'modal-close-button-mushroommate' : ''
                }`}
                onClick={() => {
                  setModalProject(null);
                  // Restore scroll position after a brief delay to ensure modal is closed
                  setTimeout(() => {
                    if (rightPanelRef.current && rightPanelScrollBeforeModal > 0) {
                      rightPanelRef.current.scrollTop = rightPanelScrollBeforeModal;
                    }
                  }, 100);
                }}
                aria-label="Close modal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  bounce: 0.5,
                  duration: 0.5,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
              
              {/* Scroll progress bar - positioned outside modal */}
              {progressBarStyle && (
                <motion.div
                  className={`modal-scroll-progress ${
                    modalProject === 'x-heal' ? 'modal-scroll-progress-xheal' : 
                    modalProject === 'mushroommate' ? 'modal-scroll-progress-mushroommate' : ''
                  }`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    bounce: 0.25,
                    duration: 0.5,
                    opacity: { duration: 0.3 },
                  }}
                  style={progressBarStyle}
                >
                  <motion.div
                    className={`modal-scroll-progress-bar ${
                      modalProject === 'x-heal' ? 'modal-scroll-progress-bar-xheal' : 
                      modalProject === 'mushroommate' ? 'modal-scroll-progress-bar-mushroommate' : ''
                    }`}
                    animate={{
                      scaleY: scrollProgress,
                    }}
                    style={{
                      transformOrigin: 'top',
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                      mass: 0.8,
                    }}
                  />
                </motion.div>
              )}
              
              {/* Modal content */}
              <motion.div
                ref={modalRef}
                className={`modal-container ${modalProject === 'x-heal' ? 'modal-container-xheal' : ''}`}
                initial={{ 
                  opacity: 0, 
                  scale: 0.85, 
                  x: "-50%", 
                  y: "-48%",
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: "-50%", 
                  y: "-50%",
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  x: "-50%", 
                  y: "-48%",
                }}
                transition={{
                  type: "spring",
                  bounce: 0.25,
                  duration: 0.6,
                  opacity: { duration: 0.3 },
                }}
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                }}
              >
                {(() => {
                  const project = projects.find(p => p.id === modalProject);
                  if (!project) return null;
                  
                  return (
                    <>
                      {/* Modal content */}
                      <div className="modal-content" ref={modalContentRef}>
                        {project.id === 'x-heal' ? (
                          <div className="modal-card modal-card-xheal">
                            <div className="modal-card-xheal-image-wrapper">
                              <img
                                src="/images/X1.png"
                                alt={project.name}
                                className="modal-card-xheal-image"
                                decoding="async"
                              />
                            </div>
                              <div className="modal-card-xheal-text">
                                <div className="modal-card-xheal-header">
                                  <h1 className="modal-card-xheal-title">
                                    X-Heal | ACL Rehab System
                                  </h1>
                                </div>
                              <div className="modal-card-xheal-main-content">
                                <p className="modal-card-xheal-description">
                                  A connected rehab system combining wearable sensors, real-time feedback, and clinician dashboards to improve post-surgery recovery.
                                </p>
                                <div className="modal-card-xheal-details">
                                  <div className="modal-card-xheal-section">
                                    <h3 className="modal-card-xheal-section-title">My Role</h3>
                                    <p className="modal-card-xheal-section-content">Lead UX Designer & Full-Stack Developer</p>
                                  </div>
                                  <div className="modal-card-xheal-section">
                                    <h3 className="modal-card-xheal-section-title">Highlights</h3>
                                    <ul className="modal-card-xheal-highlights">
                                      <li>UX Design</li>
                                      <li>React + Firebase</li>
                                      <li>BLE Integration</li>
                                      <li>IoT System Architecture</li>
                                      <li>Sponsored by T-Mobile x UW GIX</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="modal-card-xheal-images">
                              <img
                                src="/images/X1.2.png"
                                alt="X1.2"
                                className="modal-card-xheal-additional-image"
                                decoding="async"
                              />
                              <img
                                src="/images/X1.3.png"
                                alt="X1.3"
                                className="modal-card-xheal-additional-image"
                                decoding="async"
                              />
                            </div>
                          </div>
                        ) : project.id === 'mushroommate' ? (
                          <div className="modal-card modal-card-mushroommate">
                            <div className="modal-card-mushroommate-images">
                              <img
                                src="/images/M2.png"
                                alt="M2"
                                className="modal-card-mushroommate-image"
                                decoding="async"
                              />
                              <img
                                src="/images/M2.1.png"
                                alt="M2.1"
                                className="modal-card-mushroommate-image"
                                decoding="async"
                              />
                            </div>
                          </div>
                        ) : project.id === 'prelo' ? (
                          <div className="modal-card modal-card-prelo">
                            <div className="modal-card-prelo-images">
                              <img
                                src="/images/p1.png"
                                alt="Prelo"
                                className="modal-card-prelo-image"
                                decoding="async"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="modal-card">
                            <div className="modal-card-header">
                              <h3 className="modal-card-title">{project.name}</h3>
                            </div>
                            <div className="modal-card-body">
                              <p className="modal-card-description">{project.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      </motion.div>
    </>
  );
};

export default RightPanel;
