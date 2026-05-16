import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TypewriterText = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      // Typing complete - hide cursor after a small delay
      const completeTimeout = setTimeout(() => {
        setTypingComplete(true);
      }, 500); // 0.5s delay before hiding cursor
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="text-base md:text-lg text-center max-w-[600px] px-4"
    >
      {displayedText}
      {!typingComplete && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="ml-1"
        >
          |
        </motion.span>
      )}
    </motion.p>
  );
};

export default TypewriterText;