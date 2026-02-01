import { motion } from 'framer-motion';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import './App.css';

function App() {
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
      <LeftPanel />
      <RightPanel />
    </motion.div>
  );
}

export default App;
