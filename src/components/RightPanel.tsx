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
        {/* Placeholder content for scrollable area */}
        <div className="content-section">
          <h2>Portfolio Projects</h2>
          <p>Scroll to explore more content...</p>
        </div>
        <div className="content-section">
          <h2>Project 1</h2>
          <p>Content area for project showcase</p>
        </div>
        <div className="content-section">
          <h2>Project 2</h2>
          <p>Content area for project showcase</p>
        </div>
        <div className="content-section">
          <h2>Project 3</h2>
          <p>Content area for project showcase</p>
        </div>
        <div className="content-section">
          <h2>Project 4</h2>
          <p>Content area for project showcase</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RightPanel;
