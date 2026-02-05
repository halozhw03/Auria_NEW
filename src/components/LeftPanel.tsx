import { motion } from 'framer-motion';
import './LeftPanel.css';

const LeftPanel = ({ onAvatarClick, isNavOpen }: { onAvatarClick: () => void; isNavOpen?: boolean }) => {
  return (
    <motion.div
      className="left-panel"
      layout
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    />
  );
};

export default LeftPanel;
