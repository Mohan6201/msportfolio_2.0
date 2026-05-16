import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';

const ResumeText = () => {
  return (
    <div className="flex flex-col items-center mt-[50px] md:mt-[100px]">
      <motion.h2
        initial={{ opacity: 0, x: -100, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 100,
          damping: 10,
          duration: 0.8
        }}
        className="text-4xl md:text-6xl text-cyan mb-6 md:mb-10"
      >
        Resume
      </motion.h2>
      <TypewriterText 
        text="Below is a preview of my resume. You can download a copy or view it directly in your browser."
        delay={0.5}
      />
    </div>
  );
};

export default ResumeText;