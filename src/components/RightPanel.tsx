import { motion } from 'framer-motion';
import './RightPanel.css';

const RightPanel = () => {
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
          <h2>Selected Works</h2>
        </motion.div>
        <motion.div className="content-section" layout>
          <motion.div className="project-image-container" layout>
            <motion.img 
              src="/images/X-Heal_Hero.png" 
              alt="X-Heal" 
              className="project-hero-image"
              layout
            />
            <h3 className="project-name">X-Heal</h3>
            <p className="project-description">Dual-sensor loT platform for accurate at-home recovery and remote clinician monitoring.</p>
          </motion.div>
        </motion.div>
        <motion.div className="content-section" layout>
          <motion.div className="project-image-container" layout>
            <motion.img 
              src="/images/Prelo_hero.png" 
              alt="Prelo" 
              className="project-hero-image"
              layout
            />
            <h3 className="project-name">Prelo</h3>
            <p className="project-description">Know what you're ordering. When menus don't explain enough.</p>
          </motion.div>
        </motion.div>
        <motion.div className="content-section" layout>
          <motion.div className="project-image-container" layout>
            <motion.img 
              src="/images/mushroomate_hero.png" 
              alt="MushRoommate" 
              className="project-hero-image"
              layout
            />
            <h3 className="project-name">MushRoommate</h3>
            <p className="project-description">Sustainable home cultivation for affordable, year-round urban mushroom growing.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RightPanel;
