import { motion } from 'framer-motion';
import './RightPanel.css';

const RightPanel = () => {
  return (
    <motion.div
      className="right-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
    >
      <div className="right-content">
        <div className="content-section">
          <h2>Selected Works</h2>
        </div>
        <div className="content-section">
          <div className="project-image-container">
            <img src="/images/X-Heal_Hero.png" alt="X-Heal" className="project-hero-image" />
            <h3 className="project-name">X-Heal</h3>
            <p className="project-description">Dual-sensor loT platform for accurate at-home recovery and remote clinician monitoring.</p>
          </div>
        </div>
        <div className="content-section">
          <div className="project-image-container">
            <img src="/images/Prelo_hero.png" alt="Prelo" className="project-hero-image" />
            <h3 className="project-name">Prelo</h3>
            <p className="project-description">Know what you're ordering. When menus don't explain enough.</p>
          </div>
        </div>
        <div className="content-section">
          <div className="project-image-container">
            <img src="/images/mushroomate_hero.png" alt="MushRoommate" className="project-hero-image" />
            <h3 className="project-name">MushRoommate</h3>
            <p className="project-description">Sustainable home cultivation for affordable, year-round urban mushroom growing.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RightPanel;
