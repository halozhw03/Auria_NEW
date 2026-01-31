import { motion } from 'framer-motion';
import './LeftPanel.css';

const LeftPanel = () => {
  return (
    <motion.div
      className="left-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <motion.div
        className="tagline"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      >
        Designing connected experiences where empathy meets execution.
      </motion.div>
    </motion.div>
  );
};

export default LeftPanel;
