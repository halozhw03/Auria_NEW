import { motion } from 'framer-motion';
import './LeftPanel.css';

const LeftPanel = () => {
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
      <motion.div
        className="tagline-container"
        layout
      >
        <img 
          src="/images/sleeping_dog.png" 
          alt="Sleeping dog" 
          className="sleeping-dog"
        />
        <div className="tagline">
          Designing connected experiences where empathy meets execution.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LeftPanel;
