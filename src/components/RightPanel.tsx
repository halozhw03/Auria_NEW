import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import './RightPanel.css';

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

const RightPanel = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [modalProject, setModalProject] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [progressBarStyle, setProgressBarStyle] = useState<{ top: string; height: string; right: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

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
    <motion.div
      className="right-panel"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.div className="right-content" layout>
        <motion.div className="content-section" layout>
          <h2>Scroll to see my works</h2>
        </motion.div>
        {projects.map((project) => (
          <motion.div key={project.id} className="content-section" layout>
            <ProjectCard
              project={project}
              selectedProject={selectedProject}
              onProjectClick={(id) => setModalProject(id)}
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
                onClick={() => setModalProject(null)}
              />
              
              {/* Close button - positioned outside modal to avoid covering content */}
              <motion.button
                ref={closeButtonRef}
                className={`modal-close-button ${
                  modalProject === 'x-heal' ? 'modal-close-button-xheal' : 
                  modalProject === 'mushroommate' ? 'modal-close-button-mushroommate' : ''
                }`}
                onClick={() => setModalProject(null)}
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
  );
};

export default RightPanel;
