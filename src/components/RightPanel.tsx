import { useState } from 'react';
import { motion } from 'framer-motion';
import './RightPanel.css';

const RightPanel = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const cardVariants = {
    initial: {
      scale: 1,
    },
    hover: {
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    selected: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    selectedHover: {
      scale: 1.04,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
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
        {projects.map((project) => (
          <motion.div key={project.id} className="content-section" layout>
            <motion.div
              className={`project-image-container ${selectedProject === project.id ? 'selected' : ''}`}
              layout
              variants={cardVariants}
              initial="initial"
              animate={selectedProject === project.id ? 'selected' : 'initial'}
              whileHover={selectedProject === project.id ? 'selectedHover' : 'hover'}
              onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={project.image}
                alt={project.name}
                className="project-hero-image"
              />
              <h3 className="project-name">{project.name}</h3>
              <p className="project-description">{project.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default RightPanel;
